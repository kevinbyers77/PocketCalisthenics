export interface Exercise {
  id: string;
  name: string;
  description: string;
}
export interface ExerciseLibrary {
  exercise_library: Exercise[];
}
export type WorkoutDay = Record<string, string[]>;
export interface WorkoutWeek {
  week: number;
  work_sec: number;
  rest_sec: number;
  rounds: number;
  days: WorkoutDay;
}
export interface WorkoutProgram {
  program_name: string;
  session_notes: string;
  rest_days_per_week: number;
  weeks: WorkoutWeek[];
}

export interface ResolvedExercise extends Exercise {}
export interface ResolvedDay {
  dayName: string;
  exercises: ResolvedExercise[];
  work_sec: number;
  rest_sec: number;
  rounds: number;
}
export interface ResolvedWeek {
  week: number;
  days: ResolvedDay[];
  work_sec: number;
  rest_sec: number;
  rounds: number;
}