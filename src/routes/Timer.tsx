import { useMemo, useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProgram } from "../hooks/useProgram";
import { useTimer } from "../hooks/useTimer";
import { mmss } from "../utils/time";
import ProgressBar from "../components/ProgressBar";
import BigButton from "../components/BigButton";
import CircularTimer from "../components/CircularTimer";

type Segment = {
  kind: "work" | "rest";
  seconds: number;
  exerciseName?: string;
  exerciseDesc?: string;
};

export default function Timer() {
  const { week, dayIndex } = useParams();
  const navigate = useNavigate();
  const w = Number(week);
  const d = Number(dayIndex);

  const { getDayByIndex, markDone } = useProgram();
  const day = getDayByIndex(w, d);

  // Build sequence [work, (rest?)] × rounds
  const sequence = useMemo<Segment[]>(() => {
    const segs: Segment[] = [];
    for (let r = 0; r < day.rounds; r++) {
      day.exercises.forEach((ex, i) => {
        segs.push({
          kind: "work",
          seconds: day.workSec,
          exerciseName: ex.name,
          exerciseDesc: ex.description,
        });
        const isLastOfAll = r === day.rounds - 1 && i === day.exercises.length - 1;
        if (!isLastOfAll) segs.push({ kind: "rest", seconds: day.restSec });
      });
    }
    return segs;
  }, [day]);

  const [idx, setIdx] = useState(0);
  const seg = sequence[idx];

  // Auto-start next segment after onDone
  const autoStartNextRef = useRef(false);
  const { remaining, running, start, pause, reset } = useTimer(seg.seconds, () => {
    autoStartNextRef.current = true;
    setIdx((i) => Math.min(i + 1, sequence.length - 1));
    if (navigator.vibrate) navigator.vibrate(150);
  });

  // Reset when index changes; start automatically if we just finished previous segment
  useEffect(() => {
    reset(seg.seconds);
    if (autoStartNextRef.current) {
      start();
      autoStartNextRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  // Overall progress bar
  const totalElapsed =
    sequence.slice(0, idx).reduce((a, s) => a + s.seconds, 0) +
    (seg.seconds - remaining);
  const total = sequence.reduce((a, s) => a + s.seconds, 0);

  const isWork = seg.kind === "work";
  const currentName = seg.exerciseName ?? (isWork ? "Work" : "Rest");
  const currentDesc =
    seg.exerciseDesc ?? (isWork ? "" : "Breathe, shake out, and get ready.");

  // Find the next WORK segment for the "Up Next" card
  const nextWork = useMemo(() => {
    for (let i = idx + 1; i < sequence.length; i++) {
      if (sequence[i].kind === "work") {
        return {
          name: sequence[i].exerciseName,
          desc: sequence[i].exerciseDesc,
        };
      }
    }
    return null;
  }, [idx, sequence]);

  // Visual tokens
  const phaseBg = isWork ? "bg-green-50" : "bg-amber-50";
  const pill =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium " +
    (isWork
      ? "text-green-800 bg-green-100 border-green-200"
      : "text-amber-800 bg-amber-100 border-amber-200");

  function skip() {
    setIdx((i) => Math.min(i + 1, sequence.length - 1));
    pause();
  }
  function restartDay() {
    setIdx(0);
    pause();
    reset(sequence[0].seconds);
  }
  async function finish() {
    await markDone(w, day.title);
    (navigator as any).vibrate?.(15);
    navigate("/");
  }

  return (
    <main
      className={`${phaseBg} min-h-[calc(100vh-56px)] grid`}
      style={{ gridTemplateRows: "auto auto 1fr auto" }} // header | cards | timer | controls
    >
      {/* Header */}
      <div className="mx-auto w-full max-w-screen-md px-4 pt-4">
        <span className={pill}>{isWork ? "WORK" : "REST"}</span>
      </div>

      {/* Two-card stack — fixed footprint so the timer never shifts */}
      <div
        className="mx-auto w-full max-w-screen-md px-4 mt-2 space-y-3"
        style={{ minHeight: 220 }} // reserve space for both cards + gap
      >
        {/* Current card */}
        <div className="rounded-xl border border-gray-200 bg-white/80 px-4 py-3 shadow-sm">
          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Current
          </div>
          <div className="mt-0.5 text-xl font-semibold text-gray-900">
            {currentName}
          </div>
          {/* Reserve ~2 lines, hide overflow to keep height stable */}
          <div className="mt-0.5 text-[15px] leading-6 h-[48px] overflow-hidden text-gray-700">
            {currentDesc}
          </div>
        </div>

        {/* Up Next card (or invisible placeholder of same height) */}
        {nextWork ? (
          <div className="rounded-xl border border-gray-200 bg-white/70 px-4 py-3 shadow-sm">
            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Up Next
            </div>
            <div className="mt-0.5 text-sm font-medium text-gray-900">
              {nextWork.name}
            </div>
            <div className="mt-0.5 text-sm leading-5 h-[40px] overflow-hidden text-gray-600">
              {nextWork.desc}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-transparent px-4 py-3 opacity-0 select-none min-h-[84px]" />
        )}
      </div>

      {/* Timer row — stays centered since cards row has fixed height */}
      <div className="flex items-center justify-center px-4">
        <CircularTimer
          remaining={remaining}
          total={seg.seconds}
          phase={isWork ? "work" : "rest"}
          size={240}
        />
      </div>

      {/* Progress + controls */}
      <div className="mx-auto w-full max-w-screen-md px-4 pb-4">
        <ProgressBar value={totalElapsed} max={total} />
        <div className="mt-2 text-center text-sm text-gray-600">
          Segment {idx + 1}/{sequence.length}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3">
          {running ? (
            <BigButton className="w-full" onClick={pause}>
              Pause
            </BigButton>
          ) : (
            <BigButton className="w-full" onClick={start}>
              Start
            </BigButton>
          )}

          <div className="grid grid-cols-3 gap-3">
            <BigButton onClick={() => reset(seg.seconds)}>Reset</BigButton>
            <BigButton onClick={skip}>Skip</BigButton>
            <BigButton onClick={restartDay}>Restart</BigButton>
          </div>

          {idx === sequence.length - 1 && remaining === 0 && (
            <BigButton className="w-full" onClick={finish}>
              Mark Done
            </BigButton>
          )}
        </div>
      </div>

      {/* A11y live region */}
      <div aria-live="polite" className="sr-only">
        {isWork ? "Work" : "Rest"} {mmss(remaining)}.
      </div>
    </main>
  );
}
