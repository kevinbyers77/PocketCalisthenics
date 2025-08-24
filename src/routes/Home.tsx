import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useProgram } from "../hooks/useProgram";
import { useLocalPref } from "../hooks/useLocalPref";

export default function Home() {
  const { data, totalWeeks, getDayNames, getDoneStamp } = useProgram();
  const [week, setWeek] = useLocalPref<number>("pc:lastWeek", 1);

  const weeks = useMemo(() => Array.from({ length: totalWeeks }, (_, i) => i + 1), [totalWeeks]);
  const dayNames = getDayNames(week);

  // Track done state per day title for the selected week
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>({});

  async function refreshDone() {
    const entries = await Promise.all(
      dayNames.map(async (title) => [title, !!(await getDoneStamp(week, title))] as const)
    );
    setDoneMap(Object.fromEntries(entries));
  }

  useEffect(() => {
    refreshDone();
    // Re-check when the tab regains focus or becomes visible (e.g., after marking/unmarking in Day)
    const onFocus = () => refreshDone();
    const onVis = () => !document.hidden && refreshDone();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week, totalWeeks, JSON.stringify(dayNames)]); // refresh when week/day list changes

  return (
    <div className="space-y-6">
      {/* Program title */}
      <h2 className="text-lg font-semibold text-gray-800">{data.program_name}</h2>

      {/* Week selector */}
      <div className="flex items-center space-x-2">
        <label htmlFor="week" className="text-sm font-medium text-gray-700">Week:</label>
        <select
          id="week"
          value={week}
          onChange={(e) => setWeek(parseInt(e.target.value))}
          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm focus:border-brand focus:ring-brand"
        >
          {weeks.map((w) => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>
      </div>

      {/* Day list */}
      <ul className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white shadow-sm">
        {dayNames.map((title, idx) => {
          const done = !!doneMap[title];
          return (
            <li key={title}>
              <Link
                to={`/day/${week}/${idx}`}
                className="flex items-center justify-between px-4 py-3 transition hover:bg-gray-50"
              >
                <span className={done ? "text-gray-400" : "text-gray-800"}>
                  {title}
                </span>
                {done ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    ✓ Done
                  </span>
                ) : (
                  <span className="text-gray-300">›</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Notes */}
      {data.session_notes && (
        <div className="rounded-2xl bg-white p-4 shadow-card border border-gray-100">
          <h3 className="mb-1 text-sm font-semibold text-gray-800">Session notes</h3>
          <p className="text-sm text-gray-600">{data.session_notes}</p>
        </div>
      )}
    </div>
  );
}
