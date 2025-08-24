import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useProgram } from "../hooks/useProgram";
import BigButton from "../components/BigButton";

export default function Day() {
  const params = useParams();
  const week = Number(params.week);
  const dayIndex = Number(params.dayIndex);

  const { getDayByIndex, markDone } = useProgram();
  const day = getDayByIndex(week, dayIndex);

  const [toast, setToast] = useState<string | null>(null);

  async function onMarkDone() {
    try {
      await markDone(week, day.title);
      // subtle haptic, if supported
      (navigator as any).vibrate?.(15);
      setToast("Saved ✓");
      window.setTimeout(() => setToast(null), 1600);
    } catch (err) {
      console.error(err);
      setToast("Something went wrong");
      window.setTimeout(() => setToast(null), 1800);
    }
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

        <BigButton onClick={onMarkDone}>Mark Done</BigButton>

        <Link to="/" className="text-brand hover:underline justify-self-start">
          Back
        </Link>
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-xl bg-emerald-600 px-4 py-2 text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
