import { Link } from "react-router-dom";
import { useProgram } from "../hooks/useProgram";
import { useLocalPref } from "../hooks/useLocalPref";

export default function Home() {
  const { data, totalWeeks, getDayNames, getDoneStamp } = useProgram();
  const [week, setWeek] = useLocalPref<number>("pc:lastWeek", 1);

  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);
  const dayNames = getDayNames(week);

  return (
    <div className="space-y-6">
      {/* Program title */}
      <h2 className="text-lg font-semibold text-gray-800">{data.program_name}</h2>

      {/* Week selector */}
      <div className="flex items-center space-x-2">
        <label htmlFor="week" className="text-sm font-medium text-gray-700">
          Week:
        </label>
        <select
          id="week"
          value={week}
          onChange={(e) => setWeek(parseInt(e.target.value))}
          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm focus:border-brand focus:ring-brand"
        >
          {weeks.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
      </div>

      {/* Day list */}
      <ul className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white shadow-sm">
        {dayNames.map((name, idx) => (
          <DayRow
            key={name}
            week={week}
            dayIndex={idx}
            title={name}
            getDoneStamp={getDoneStamp}
          />
        ))}
      </ul>
    </div>
  );
}

function DayRow({
  week,
  dayIndex,
  title,
  getDoneStamp,
}: {
  week: number;
  dayIndex: number;
  title: string;
  getDoneStamp: (w: number, t: string) => Promise<string | null>;
}) {
  const [stamp, setStamp] = useLocalPref<string | null>(
    `pc:cache:done:${week}:${title}`,
    null
  );

  if (stamp === null) getDoneStamp(week, title).then((s) => s && setStamp(s));

  return (
    <li>
      <Link
        to={`/day/${week}/${dayIndex}`}
        className="flex items-center justify-between px-4 py-3 transition hover:bg-gray-50"
      >
        <span className="text-gray-800">{title}</span>
        {stamp && <span className="text-green-500">✅</span>}
      </Link>
    </li>
  );
}
