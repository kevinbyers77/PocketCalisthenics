import type { ResolvedDay } from "./types";

export interface TimedSegment {
  type: "work" | "rest";
  exercise?: string;
  description?: string;
  seconds: number;
}

export function buildTimedSequence(day: ResolvedDay): TimedSegment[] {
  const seq: TimedSegment[] = [];
  for (let r = 0; r < day.rounds; r++) {
    day.exercises.forEach(ex => {
      seq.push({ type: "work", exercise: ex.name, description: ex.description, seconds: day.work_sec });
      seq.push({ type: "rest", seconds: day.rest_sec });
    });
  }
  return seq;
}
