import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useProgram } from "../hooks/useProgram";
import BigButton from "../components/BigButton";

export default function Day() {
  const params = useParams();
  const navigate = useNavigate();

  const week = Number(params.week);
  const dayIndex = Number(params.dayIndex);

  const { getDayByIndex, markDone, unmarkDone, getDoneStamp } = useProgram();
  const day = getDayByIndex(week, dayIndex);

  const [isDone, setIsDone] = useState(false);

  // Check if this day is already marked as done
  useEffect(() => {
    getDoneStamp(week, day.title).then((stamp) => {
      setIsDone(!!stamp);
    });
  }, [week, day.title, getDoneStamp]);

  async function handleMarkDone() {
    await markDone(week, day.title);
    (navigator as any).vibrate?.(15);
    navigate("/"); // Go back home after marking
  }

  async function handleUnmarkDone() {
    await unmarkDone(week, day.title);
    (navigator as any).vibrate?.(15);
    setIsDone(false); // stay on page, so they can re-mark if wanted
  }

  return (
    <div className="space-y-5">
      {/* Title & meta */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Week {week} — {day.title}
        </h2>
        <p className="mt-1 text-gray-800">
          <b className="font-semibold">Rounds:</b> {day.rounds}
          {" · "}
          <b className="font-semibold">Work:</b> {day.workSec}s
          {" · "}
          <b className="font-semibold">Rest:</b> {day.restSec}s
        </p>
      </div>

      {/* Exercise list */}
      <ol className="space-y-3">
        {day.exercises.map((ex) => (
          <li
            key={ex.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="font-semibold text-gray-900">{ex.name}</div>
            <div className="mt-1 text-gray-600">{ex.description}</div>
          </li>
        ))}
      </ol>

      {/* Actions */}
      <div className="grid gap-3">
        <Link to={`/timer/${week}/${dayIndex}`}>
          <BigButton>Start Workout</BigButton>
        </Link>

        {isDone ? (
          <BigButton onClick={handleUnmarkDone} className="bg-red-600 hover:bg-red-700">
            Unmark Done
          </BigButton>
        ) : (
          <BigButton onClick={handleMarkDone}>Mark Done</BigButton>
        )}

        <Link to="/" className="text-brand hover:underline justify-self-start">
          Back
        </Link>
      </div>
    </div>
  );
}
