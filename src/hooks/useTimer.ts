import { useMemo, useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProgram } from "../hooks/useProgram";
import { useTimer } from "../hooks/useTimer";
import { mmss } from "../utils/time";
import ProgressBar from "../components/ProgressBar";
import BigButton from "../components/BigButton";

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

  // Build sequence (keep your original logic; add description on WORK)
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

  const { remaining, running, start, pause, reset } = useTimer(
    seg.seconds,
    () => {
      setIdx((i) => Math.min(i + 1, sequence.length - 1));
      if (navigator.vibrate) navigator.vibrate(120);
    }
  );

  // Ensure timer re-inits cleanly when segment changes and continue if running
  const wasRunningRef = useRef(false);
  useEffect(() => { wasRunningRef.current = running; }, [running]);
  useEffect(() => {
    reset(seg.seconds);
    if (wasRunningRef.current) start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seg.seconds]);

  // Totals (your ProgressBar = overall progress)
  const totalElapsed =
    sequence.slice(0, idx).reduce((a, s) => a + s.seconds, 0) +
    (seg.seconds - remaining);
  const total = sequence.reduce((a, s) => a + s.seconds, 0);

  // Per-segment progress for the ring
  const segPct = ((seg.seconds - remaining) / seg.seconds) * 100;

  const isWork = seg.kind === "work";
  const name = seg.exerciseName ?? (isWork ? "Work" : "Rest");
  const desc = seg.exerciseDesc ?? (isWork ? "" : "Breathe, shake out, and get ready.");

  // Phase colors
  const phaseBg = isWork ? "bg-green-50" : "bg-amber-50";
  const phasePill =
    "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium " +
    (isWork
      ? "text-green-800 bg-green-100 border border-green-200"
      : "text-amber-800 bg-amber-100 border border-amber-200");

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
    (navigator as any).vibrate?.(20);
    navigate("/");
  }

  // Circular ring dimensions
  const R = 120;                  // radius
  const C = 2 * Math.PI * R;      // circumference
  const offset = C * (1 - segPct / 100);

  return (
    <main
      className={`min-h-[calc(100vh-56px)] ${phaseBg} transition-colors duration-300 flex flex-col`}
      onClick={() => (running ? pause() : start())} // tap anywhere to toggle
    >
      {/* Exercise header */}
      <div className="mx-auto w-full max-w-screen-md px-4 pt-4">
        <span className={phasePill}>{isWork ? "WORK" : "REST"}</span>
        <h2 className="mt-2 text-2xl font-bold text-gray-900">{name}</h2>
        {desc && <p className="mt-1 text-base text-gray-700">{desc}</p>}
      </div>

      {/* Big timer + circular ring */}
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="relative">
          <svg width={(R + 16) * 2} height={(R + 16) * 2} className="block">
            <circle
              cx={R + 16}
              cy={R + 16}
              r={R}
              className="stroke-gray-200"
              strokeWidth="10"
              fill="none"
            />
            <circle
              cx={R + 16}
              cy={R + 16}
              r={R}
              stroke={isWork ? "#16a34a" : "#d97706"} // green-600 / amber-600
              strokeWidth="10"
              fill="none"
              strokeDasharray={C}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 120ms linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="select-none tabular-nums leading-none font-semibold text-gray-900"
                 style={{ fontSize: "min(20vw, 96px)" }}>
              {mmss(remaining)}
            </div>
          </div>
        </div>
      </div>

      {/* Overall progress + segment count */}
      <div className="mx-auto w-full max-w-screen-md px-4">
        <ProgressBar value={totalElapsed} max={total} />
        <div className="mt-2 text-sm text-gray-600">
          Segment {idx + 1}/{sequence.length}
        </div>
      </div>

      {/* Controls */}
      <div
        className="mx-auto w-full max-w-screen-md p-4 mt-2 grid grid-cols-2 gap-3"
        onClick={(e) => e.stopPropagation()} // prevent container tap from toggling
      >
        {running ? (
          <BigButton className="col-span-2" onClick={pause}>
            Pause
          </BigButton>
        ) : (
          <BigButton className="col-span-2" onClick={start}>
            Start
          </BigButton>
        )}

        <BigButton onClick={() => reset(seg.seconds)}>Reset</BigButton>
        <BigButton onClick={skip}>Skip</BigButton>

        <BigButton className="col-span-2" onClick={restartDay}>
          Restart
        </BigButton>

        {/* No Back link. Only show Mark Done at the true end. */}
        {idx === sequence.length - 1 && remaining === 0 && (
          <BigButton className="col-span-2" onClick={finish}>
            Mark Done
          </BigButton>
        )}
      </div>

      {/* SR announcements */}
      <div aria-live="polite" className="sr-only">
        {isWork ? "Work" : "Rest"} {mmss(remaining)}.
      </div>
    </main>
  );
}
