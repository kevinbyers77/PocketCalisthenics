import { useMemo } from "react";
import program from "../data/program.json";
import lib from "../data/exercise_library.json";
import localforage from "localforage";

type Exercise = { id: string; name: string; description: string };
type ExerciseLib = { exercise_library: Exercise[] };
type ProgramWeek = {
  week: number;
  work_sec: number;
  rest_sec: number;
  rounds: number;
  days: Record<string, string[]>;
};
type Program = {
  program_name: string;
  session_notes: string;
  rest_days_per_week: number;
  weeks: ProgramWeek[];
};

const EX_DONE_KEY = (w: number, title: string) => `pc:done:w${w}:${title}`;

export function useProgram() {
  const data = program as Program;
  const library = (lib as ExerciseLib).exercise_library;
  const byId = useMemo(() => {
    const m = new Map<string, Exercise>();
    library.forEach(e => m.set(e.id, e));
    return m;
  }, [library]);

  const getWeek = (w: number) => data.weeks.find(x => x.week === w)!;
  const totalWeeks = data.weeks.length;

  const getDayNames = (w: number) => Object.keys(getWeek(w).days);
  const getDayByIndex = (w: number, dayIndex: number) => {
    const week = getWeek(w);
    const titles = Object.keys(week.days);
    const title = titles[dayIndex];
    const ids = week.days[title];
    const exercises = ids.map(id => byId.get(id)).filter(Boolean) as Exercise[];
    return { title, exercises, workSec: week.work_sec, restSec: week.rest_sec, rounds: week.rounds };
  };

  const markDone = async (w: number, title: string) =>
    localforage.setItem(EX_DONE_KEY(w, title), new Date().toISOString());

  const getDoneStamp = async (w: number, title: string) =>
    (await localforage.getItem<string>(EX_DONE_KEY(w, title))) ?? null;

  return { data, totalWeeks, getDayNames, getDayByIndex, markDone, getDoneStamp };
}
