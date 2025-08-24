import type { ResolvedWeek, ResolvedDay, WorkoutWeek, ResolvedExercise } from "./types";
import { exerciseById } from "./data";

const missingExercise = (id: string): ResolvedExercise => ({
  id,
  name: `⚠ Missing exercise: ${id}`,
  description: "This exercise ID was not found in the library."
});

export function resolveExerciseIds(ids: string[]): ResolvedExercise[] {
  return ids.map(id => (exerciseById[id] ?? missingExercise(id)));
}

export function resolveWeek(week: WorkoutWeek): ResolvedWeek {
  const days: ResolvedDay[] = Object.entries(week.days).map(([dayName, idList]) => ({
    dayName,
    exercises: resolveExerciseIds(idList),
    work_sec: week.work_sec,
    rest_sec: week.rest_sec,
    rounds: week.rounds
  }));
  return { week: week.week, days, work_sec: week.work_sec, rest_sec: week.rest_sec, rounds: week.rounds };
}

export function resolveAllWeeks(weeks: WorkoutWeek[]): ResolvedWeek[] {
  return weeks.map(resolveWeek);
}
