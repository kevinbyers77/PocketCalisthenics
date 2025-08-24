import programJson from "./program.json";
import exerciseLibraryJson from "./exercise_library.json";
import type { WorkoutProgram, ExerciseLibrary, Exercise } from "./types";

export const program: WorkoutProgram = programJson as WorkoutProgram;
export const library: ExerciseLibrary = exerciseLibraryJson as ExerciseLibrary;

export const exerciseById: Record<string, Exercise> =
  Object.fromEntries(library.exercise_library.map(e => [e.id, e]));
