import { Link } from "react-router-dom";
import { useProgram } from "../hooks/useProgram";
import { useLocalPref } from "../hooks/useLocalPref";

export default function Home() {
  const { data, totalWeeks, getDayNames, getDoneStamp } = useProgram();
  const [week, setWeek] = useLocalPref<number>("pc:lastWeek", 1);

  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);
  const dayNames = getDayNames(week);

  return (
    <main>
      <p style={{ marginTop: -8 }}>{data.program_name}</p>

      <label>
        Week:&nbsp;
        <select value={week} onChange={e => setWeek(parseInt(e.target.value))}>
          {weeks.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
      </label>

      <ul style={{ listStyle: "none", padding: 0, marginTop: 16 }}>
        {dayNames.map((name, idx) => (
          <DayRow key={name} week={week} dayIndex={idx} title={name} getDoneStamp={getDoneStamp} />
        ))}
      </ul>
    </main>
  );
}

function DayRow({ week, dayIndex, title, getDoneStamp }:
  { week: number; dayIndex: number; title: string; getDoneStamp: (w:number,t:string)=>Promise<string|null> }) {

  const [stamp, setStamp] = useLocalPref<string | null>(`pc:cache:done:${week}:${title}`, null);
  // lazy-load the real stamp (so Home doesn't block render)
  if (stamp === null) getDoneStamp(week, title).then(s => s && setStamp(s));

  return (
    <li style={{ padding: "10px 0", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between" }}>
      <Link to={`/day/${week}/${dayIndex}`} style={{ textDecoration: "none" }}>{title}</Link>
      <span style={{ opacity: 0.7 }}>{stamp ? "✅" : ""}</span>
    </li>
  );
}
