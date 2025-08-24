import { z } from "zod";
import type { WorkoutProgram, ExerciseLibrary } from "./types";

const ExerciseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1)
});
const ExerciseLibrarySchema = z.object({
  exercise_library: z.array(ExerciseSchema).min(1)
});
const WeekSchema = z.object({
  week: z.number().int().positive(),
  work_sec: z.number().int().positive(),
  rest_sec: z.number().int().nonnegative(),
  rounds: z.number().int().positive(),
  days: z.record(z.array(z.string().min(1)))
});
const ProgramSchema = z.object({
  program_name: z.string().min(1),
  session_notes: z.string(),
  rest_days_per_week: z.number().int().nonnegative(),
  weeks: z.array(WeekSchema).min(1)
});

export function validateLibrary(json: unknown): ExerciseLibrary {
  return ExerciseLibrarySchema.parse(json);
}
export function validateProgram(json: unknown): WorkoutProgram {
  return ProgramSchema.parse(json);
}
