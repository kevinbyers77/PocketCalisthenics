import { Link, useParams } from "react-router-dom";
import { useProgram } from "../hooks/useProgram";
import BigButton from "../components/BigButton";

export default function Day() {
  const params = useParams();
  const week = Number(params.week);
  const dayIndex = Number(params.dayIndex);
  const { getDayByIndex, markDone } = useProgram();

  const day = getDayByIndex(week, dayIndex);

  return (
    <main>
      <h2>Week {week} — {day.title}</h2>
      <p><b>Rounds:</b> {day.rounds} · <b>Work:</b> {day.workSec}s · <b>Rest:</b> {day.restSec}s</p>

      <ol>
        {day.exercises.map(ex => (
          <li key={ex.id} style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 600 }}>{ex.name}</div>
            <div style={{ opacity: 0.8 }}>{ex.description}</div>
          </li>
        ))}
      </ol>

      <div style={{ display: "grid", gap: 8 }}>
        <Link to={`/timer/${week}/${dayIndex}`}><BigButton>Start Workout</BigButton></Link>
        <BigButton onClick={() => markDone(week, day.title).then(()=>alert("Marked done."))}>Mark Done</BigButton>
        <Link to="/">Back</Link>
      </div>
    </main>
  );
}
