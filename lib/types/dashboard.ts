export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type CourseCategory =
  | "Speech"
  | "Vocabulary"
  | "Phonics"
  | "Language"
  | "Grammar"
  | "Communication";

export type Lesson = {
  id: string;
  title: string;
  /** Estimated duration in minutes. */
  minutes: number;
  /** 0-100. */
  progress: number;
  completed: boolean;
  locked: boolean;
};

export type Course = {
  slug: string;
  name: string;
  description: string;
  category: CourseCategory;
  difficulty: Difficulty;
  /** Estimated total duration in minutes. */
  duration: number;
  lessons: Lesson[];
  /** 0-100 overall completion. */
  progress: number;
  enrolled: boolean;
  completed: boolean;
};

export type LeaderboardEntry = {
  rank: number;
  name: string;
  initials: string;
  isCurrentUser?: boolean;
  stars: number;
  badges: number;
  coursesCompleted: number;
  points: number;
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  /** ISO date when earned. */
  earnedAt?: string;
};

export type WeeklyActivity = {
  day: string;
  /** Minutes practiced that day. */
  minutes: number;
};

export type StatCard = {
  id: string;
  label: string;
  value: string;
  helper: string;
  /** -1 means no delta shown. */
  delta?: number;
};
