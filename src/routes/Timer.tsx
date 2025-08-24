import { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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

  // Build sequence: for each round, iterate all exercises (work), then rest after each except last in round.
  // Keep your original timing logic, but include the exercise description for WORK segments.
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
      if (navigator.vibrate) navigator.vibrate(150);
    }
  );

  const totalElapsed =
    sequence.slice(0, idx).reduce((a, s) => a + s.seconds, 0) +
    (seg.seconds - remaining);
  const total = sequence.reduce((a, s) => a + s.seconds, 0);

  const isWork = seg.kind === "work";
  const currentName = seg.exerciseName ?? (isWork ? "Work" : "Rest");
  const currentDesc =
    seg.exerciseDesc ?? (isWork ? "" : "Breathe, shake out, and get ready.");

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
    (navigator as any).vibrate?.(15);
    navigate("/"); // go back home after marking done
  }

  return (
    <main
      className={`min-h-[calc(100vh-56px)] ${phaseBg} flex flex-col`}
      onClick={() => (running ? pause() : start())} // tap anywhere to toggle
    >
      {/* Header info: ONLY current exercise name & description above timer */}
      <div className="mx-auto w-full max-w-screen-md px-4 pt-4">
        <span className={phasePill}>{isWork ? "WORK" : "REST"}</span>

        <h2 className="mt-2 text-2xl font-semibold text-gray-900">
          {currentName}
        </h2>
        {currentDesc && (
          <p className="mt-1 text-base text-gray-700">{currentDesc}</p>
        )}

        {/* Small meta line remains helpful (segment count) */}
        <p className="mt-2 text-sm text-gray-600">
          Segment {idx + 1}/{sequence.length}
        </p>
      </div>

      {/* Big timer */}
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="select-none tabular-nums text-[20vw] leading-none font-semibold text-gray-900">
          {mmss(remaining)}
        </div>
      </div>

      {/* Segmented progress (uses your existing ProgressBar) */}
      <div className="mx-auto w-full max-w-screen-md px-4">
        <ProgressBar value={totalElapsed} max={total} />
      </div>

      {/* Controls */}
      <div className="mx-auto w-full max-w-screen-md p-4 mt-2 grid grid-cols-2 gap-3"
           onClick={(e) => e.stopPropagation()} // prevent tap-to-toggle when pressing buttons
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

        <div className="col-span-2 mt-2 flex items-center gap-4">
          <Link to={`/day/${w}/${d}`} className="text-brand hover:underline">
            Back
          </Link>

          {/* Show Mark Done only when the very last segment just finished */}
          {idx === sequence.length - 1 && remaining === 0 && (
            <BigButton onClick={finish}>Mark Done</BigButton>
          )}
        </div>
      </div>

      {/* Screen reader announcements */}
      <div aria-live="polite" className="sr-only">
        {isWork ? "Work" : "Rest"} {mmss(remaining)}.
      </div>
    </main>
  );
}
