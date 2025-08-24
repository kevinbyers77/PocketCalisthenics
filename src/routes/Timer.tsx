import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProgram } from "../hooks/useProgram";
import { useTimer } from "../hooks/useTimer";
import { mmss } from "../utils/time";
import ProgressBar from "../components/ProgressBar";
import BigButton from "../components/BigButton";

type Segment = { kind: "work" | "rest"; seconds: number; exerciseName?: string };

export default function Timer() {
  const { week, dayIndex } = useParams();
  const w = Number(week), d = Number(dayIndex);
  const { getDayByIndex, markDone } = useProgram();
  const day = getDayByIndex(w, d);

  // Build sequence: for each round, iterate all exercises (work), then rest after each except last in round.
  const sequence = useMemo<Segment[]>(() => {
    const segs: Segment[] = [];
    for (let r = 0; r < day.rounds; r++) {
      day.exercises.forEach((ex, i) => {
        segs.push({ kind: "work", seconds: day.workSec, exerciseName: ex.name });
        // rest after each exercise except the very last exercise of the final round
        const isLast = r === day.rounds - 1 && i === day.exercises.length - 1;
        if (!isLast) segs.push({ kind: "rest", seconds: day.restSec });
      });
    }
    return segs;
  }, [day]);

  const [idx, setIdx] = useState(0);
  const seg = sequence[idx];
  const { remaining, running, start, pause, reset } = useTimer(seg.seconds, () => {
    setIdx(i => Math.min(i + 1, sequence.length - 1));
    if (navigator.vibrate) navigator.vibrate(150);
  });

  const totalElapsed = sequence.slice(0, idx).reduce((a, s) => a + s.seconds, 0) + (seg.seconds - remaining);
  const total = sequence.reduce((a, s) => a + s.seconds, 0);

  const finish = async () => {
    await markDone(w, day.title);
    alert("Workout complete! Marked done.");
  };

  return (
    <main>
      <h2>Week {w} — {day.title}</h2>
      <p style={{ marginTop: -8 }}>
        Segment {idx + 1}/{sequence.length} · {seg.kind.toUpperCase()} {seg.exerciseName ? `— ${seg.exerciseName}` : ""}
      </p>

      <div style={{ fontSize: 64, textAlign: "center", margin: "24px 0" }}>{mmss(remaining)}</div>
      <ProgressBar value={totalElapsed} max={total} />
      <div style={{ height: 8 }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        {!running ? <BigButton onClick={start}>Start</BigButton> : <BigButton onClick={pause}>Pause</BigButton>}
        <BigButton onClick={() => reset(seg.seconds)}>Reset</BigButton>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <BigButton onClick={() => setIdx(i => Math.min(i + 1, sequence.length - 1))}>Skip</BigButton>
        <BigButton onClick={() => { setIdx(0); reset(sequence[0].seconds); }}>Restart</BigButton>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
        <Link to={`/day/${w}/${d}`}>Back</Link>
        {idx === sequence.length - 1 && remaining === 0 && (
          <BigButton onClick={finish}>Mark Done</BigButton>
        )}
      </div>
    </main>
  );
}
