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

  // Build [work, rest] × rounds, including name/desc for work segments
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

  // Flag to auto-start the next segment after onDone fires
  const autoStartNextRef = useRef(false);

  const { remaining, running, start, pause, reset } = useTimer(
    seg.seconds,
    () => {
      autoStartNextRef.current = true;
      setIdx(i => Math.min(i + 1, sequence.length - 1));
      if (navigator.vibrate) navigator.vibrate(150);
    }
  );

  // Reset on EVERY segment change (important when two segments have same seconds)
  useEffect(() => {
    reset(seg.seconds);
    if (autoStartNextRef.current) {
      start();
      autoStartNextRef.current = false;
    }
  }, [idx]); // ← key fix

  // Overall progress (for your horizontal bar)
  const totalElapsed =
    sequence.slice(0, idx).reduce((a, s) => a + s.seconds, 0) +
    (seg.seconds - remaining);
  const total = sequence.reduce((a, s) => a + s.seconds, 0);

  const isWork = seg.kind === "work";
  const currentName = seg.exerciseName ?? (isWork ? "Work" : "Rest");
  const currentDesc =
    seg.exerciseDesc ?? (isWork ? "" : "Breathe, shake out, and get ready.");

  // Find the next WORK exercise (for REST “Up next” panel)
  const nextWork = useMemo(() => {
    for (let i = idx + 1; i < sequence.length; i++) {
      const s = sequence[i];
      if (s.kind === "work") return { name: s.exerciseName, desc: s.exerciseDesc };
    }
    return null;
  }, [idx, sequence]);

  // Styling tokens
  const phaseBg = isWork ? "bg-green-50" : "bg-amber-50";
  const phasePill =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium " +
    (isWork
      ? "text-green-800 bg-green-100 border-green-200"
      : "text-amber-800 bg-amber-100 border-amber-200");

  function skip() {
    setIdx(i => Math.min(i + 1, sequence.length - 1));
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
      className={`${phaseBg} min-h-[calc(100vh-56px)] grid transition-colors duration-300`}
      style={{ gridTemplateRows: "auto 1fr auto" }}
    >
      {/* Row 1: header (can grow freely, no clipping) */}
      <div className="mx-auto w-full max-w-screen-md px-4 pt-4">
        <span className={phasePill}>{isWork ? "WORK" : "REST"}</span>

        <h2 className="mt-2 text-center text-2xl font-semibold text-gray-900">
          {currentName}
        </h2>

        {currentDesc && (
          <p className="mx-auto mt-1 max-w-prose text-center text-[15px] leading-6 text-gray-700">
            {currentDesc}
          </p>
        )}
      </div>

      {/* Row 2: timer (stays centered vertically within this row) */}
      <div className="flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3 w-full max-w-screen-md">
          <CircularTimer
            remaining={remaining}
            total={seg.seconds}
            phase={isWork ? "work" : "rest"}
            size={240}
          />

          {/* Up next (only during REST, if another work segment exists) */}
          {!isWork && nextWork && (
            <div className="mt-1 w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 shadow-sm">
              <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Up next
              </div>
              <div className="mt-0.5 text-sm font-medium text-gray-900">
                {nextWork.name}
              </div>
              {nextWork.desc && (
                <div className="mt-0.5 text-sm text-gray-600">
                  {nextWork.desc}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: progress + controls */}
      <div className="mx-auto w-full max-w-screen-md px-4 pb-4">
        {/* Overall progress + segment count */}
        <ProgressBar value={totalElapsed} max={total} />
        <div className="mt-2 text-center text-sm text-gray-600">
          Segment {idx + 1}/{sequence.length}
        </div>

        {/* Controls */}
        <div className="mt-3 grid grid-cols-1 gap-3">
          {running ? (
            <BigButton className="w-full" onClick={pause}>Pause</BigButton>
          ) : (
            <BigButton className="w-full" onClick={start}>Start</BigButton>
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

      {/* SR live region */}
      <div aria-live="polite" className="sr-only">
        {isWork ? "Work" : "Rest"} {mmss(remaining)}.
      </div>
    </main>
  );
}
