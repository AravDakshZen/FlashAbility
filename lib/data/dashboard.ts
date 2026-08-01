import type {
  Achievement,
  Course,
  CourseCategory,
  LeaderboardEntry,
  WeeklyActivity,
} from "@/lib/types/dashboard";

/**
 * Static demo data for the learning dashboard.
 * In production these values would come from Supabase tables.
 */

export const categories: CourseCategory[] = [
  "Speech",
  "Vocabulary",
  "Phonics",
  "Language",
  "Grammar",
  "Communication",
];

export const difficulties = ["Beginner", "Intermediate", "Advanced"] as const;

export const courses: Course[] = [
  {
    slug: "first-words",
    name: "First Words",
    description:
      "Build a core vocabulary of everyday nouns and actions with audio reinforcement and picture cues.",
    category: "Vocabulary",
    difficulty: "Beginner",
    duration: 120,
    lessons: [
      { id: "fw-1", title: "Family", minutes: 10, progress: 100, completed: true, locked: false },
      { id: "fw-2", title: "Body parts", minutes: 10, progress: 100, completed: true, locked: false },
      { id: "fw-3", title: "Food & drink", minutes: 12, progress: 100, completed: true, locked: false },
      { id: "fw-4", title: "Clothing", minutes: 12, progress: 80, completed: false, locked: false },
      { id: "fw-5", title: "Animals", minutes: 12, progress: 60, completed: false, locked: false },
      { id: "fw-6", title: "Around the house", minutes: 15, progress: 0, completed: false, locked: false },
      { id: "fw-7", title: "At school", minutes: 15, progress: 0, completed: false, locked: false },
      { id: "fw-8", title: "Outside", minutes: 15, progress: 0, completed: false, locked: false },
    ],
    progress: 55,
    enrolled: true,
    completed: false,
  },
  {
    slug: "phonics-foundations",
    name: "Phonics Foundations",
    description:
      "Learn letter–sound relationships through systematic, multisensory practice designed for emerging readers.",
    category: "Phonics",
    difficulty: "Beginner",
    duration: 90,
    lessons: [
      { id: "pf-1", title: "Short vowel sounds", minutes: 10, progress: 100, completed: true, locked: false },
      { id: "pf-2", title: "Consonant blends", minutes: 12, progress: 100, completed: true, locked: false },
      { id: "pf-3", title: "Digraphs: sh, ch, th", minutes: 12, progress: 100, completed: true, locked: false },
      { id: "pf-4", title: "Long vowel patterns", minutes: 12, progress: 100, completed: true, locked: false },
      { id: "pf-5", title: "Silent e", minutes: 12, progress: 100, completed: true, locked: false },
      { id: "pf-6", title: "R-controlled vowels", minutes: 12, progress: 100, completed: true, locked: false },
    ],
    progress: 100,
    enrolled: true,
    completed: true,
  },
  {
    slug: "pronunciation-practice",
    name: "Pronunciation Practice",
    description:
      "Target articulation and clarity with modeled speech, visual cues, and instant feedback on every attempt.",
    category: "Speech",
    difficulty: "Intermediate",
    duration: 150,
    lessons: [
      { id: "pp-1", title: "The /r/ sound", minutes: 12, progress: 100, completed: true, locked: false },
      { id: "pp-2", title: "The /l/ sound", minutes: 12, progress: 100, completed: true, locked: false },
      { id: "pp-3", title: "The /s/ sound", minutes: 12, progress: 90, completed: false, locked: false },
      { id: "pp-4", title: "The /th/ sound", minutes: 12, progress: 0, completed: false, locked: false },
      { id: "pp-5", title: "Minimal pairs", minutes: 15, progress: 0, completed: false, locked: false },
      { id: "pp-6", title: "Word stress", minutes: 15, progress: 0, completed: false, locked: false },
    ],
    progress: 48,
    enrolled: true,
    completed: false,
  },
  {
    slug: "everyday-conversation",
    name: "Everyday Conversation",
    description:
      "Practice turn-taking, greetings, and functional exchanges that make daily interactions smoother and more confident.",
    category: "Communication",
    difficulty: "Intermediate",
    duration: 180,
    lessons: [
      { id: "ec-1", title: "Greetings & farewells", minutes: 12, progress: 100, completed: true, locked: false },
      { id: "ec-2", title: "Making requests", minutes: 15, progress: 40, completed: false, locked: false },
      { id: "ec-3", title: "Asking for help", minutes: 15, progress: 0, completed: false, locked: false },
      { id: "ec-4", title: "Expressing feelings", minutes: 15, progress: 0, completed: false, locked: false },
      { id: "ec-5", title: "Small talk", minutes: 15, progress: 0, completed: false, locked: false },
    ],
    progress: 28,
    enrolled: true,
    completed: false,
  },
  {
    slug: "sentence-building",
    name: "Sentence Building",
    description:
      "Move from single words to complete sentences with scaffolded grammar, word order, and picture support.",
    category: "Language",
    difficulty: "Intermediate",
    duration: 200,
    lessons: [
      { id: "sb-1", title: "Subject + verb", minutes: 12, progress: 100, completed: true, locked: false },
      { id: "sb-2", title: "Adding objects", minutes: 12, progress: 30, completed: false, locked: false },
      { id: "sb-3", title: "Using adjectives", minutes: 15, progress: 0, completed: false, locked: false },
      { id: "sb-4", title: "Questions", minutes: 15, progress: 0, completed: false, locked: false },
    ],
    progress: 35,
    enrolled: true,
    completed: false,
  },
  {
    slug: "action-verbs",
    name: "Action Verbs",
    description:
      "Master high-frequency action words used across school, home, and play through interactive flashcard drills.",
    category: "Vocabulary",
    difficulty: "Beginner",
    duration: 90,
    lessons: [
      { id: "av-1", title: "Movement verbs", minutes: 10, progress: 100, completed: true, locked: false },
      { id: "av-2", title: "Daily routine verbs", minutes: 12, progress: 20, completed: false, locked: false },
      { id: "av-3", title: "Playground verbs", minutes: 12, progress: 0, completed: false, locked: false },
    ],
    progress: 40,
    enrolled: true,
    completed: false,
  },
  {
    slug: "advanced-communication",
    name: "Advanced Communication",
    description:
      "Develop narrative skills, opinions, and complex exchanges for older learners building toward independence.",
    category: "Communication",
    difficulty: "Advanced",
    duration: 240,
    lessons: [
      { id: "ac-1", title: "Telling stories", minutes: 20, progress: 0, completed: false, locked: true },
      { id: "ac-2", title: "Giving opinions", minutes: 20, progress: 0, completed: false, locked: true },
      { id: "ac-3", title: "Persuasion basics", minutes: 20, progress: 0, completed: false, locked: true },
    ],
    progress: 0,
    enrolled: false,
    completed: false,
  },
  {
    slug: "grammar-essentials",
    name: "Grammar Essentials",
    description:
      "Reinforce core grammar patterns — plurals, tenses, and articles — with clear, accessible explanations.",
    category: "Grammar",
    difficulty: "Intermediate",
    duration: 160,
    lessons: [
      { id: "ge-1", title: "Plurals", minutes: 12, progress: 0, completed: false, locked: true },
      { id: "ge-2", title: "Past tense", minutes: 15, progress: 0, completed: false, locked: true },
      { id: "ge-3", title: "Articles", minutes: 12, progress: 0, completed: false, locked: true },
    ],
    progress: 0,
    enrolled: false,
    completed: false,
  },
  {
    slug: "listening-skills",
    name: "Listening Skills",
    description:
      "Sharpen auditory comprehension through structured listening exercises with captions and visual support.",
    category: "Speech",
    difficulty: "Advanced",
    duration: 180,
    lessons: [
      { id: "ls-1", title: "Following directions", minutes: 15, progress: 0, completed: false, locked: true },
      { id: "ls-2", title: "Understanding stories", minutes: 20, progress: 0, completed: false, locked: true },
    ],
    progress: 0,
    enrolled: false,
    completed: false,
  },
];

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((course) => course.slug === slug);
}

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "Maya Krishnan", initials: "MK", stars: 142, badges: 12, coursesCompleted: 9, points: 4820 },
  { rank: 2, name: "Arjun Patel", initials: "AP", stars: 128, badges: 10, coursesCompleted: 8, points: 4415 },
  { rank: 3, name: "Sara Ahmed", initials: "SA", stars: 117, badges: 9, coursesCompleted: 7, points: 4020 },
  { rank: 4, name: "Dev Sharma", initials: "DS", stars: 104, badges: 8, coursesCompleted: 6, points: 3610 },
  { rank: 5, name: "You", initials: "Y", isCurrentUser: true, stars: 96, badges: 7, coursesCompleted: 5, points: 3180 },
  { rank: 6, name: "Lina Roy", initials: "LR", stars: 89, badges: 6, coursesCompleted: 4, points: 2945 },
  { rank: 7, name: "Kabir Singh", initials: "KS", stars: 81, badges: 5, coursesCompleted: 4, points: 2700 },
  { rank: 8, name: "Priya Nair", initials: "PN", stars: 74, badges: 5, coursesCompleted: 3, points: 2440 },
];

export const achievements: Achievement[] = [
  {
    id: "first-steps",
    name: "First Steps",
    description: "Complete your first lesson.",
    unlocked: true,
    earnedAt: "2026-05-12",
  },
  {
    id: "course-completion",
    name: "Course Completion",
    description: "Finish your first full course.",
    unlocked: true,
    earnedAt: "2026-06-03",
  },
  {
    id: "perfect-score",
    name: "Perfect Score",
    description: "Score 100% on any lesson.",
    unlocked: true,
    earnedAt: "2026-06-18",
  },
  {
    id: "consistency",
    name: "Consistency",
    description: "Practice 7 days in a row.",
    unlocked: true,
    earnedAt: "2026-07-21",
  },
  {
    id: "fast-learner",
    name: "Fast Learner",
    description: "Complete 5 lessons in one day.",
    unlocked: false,
  },
  {
    id: "communication-expert",
    name: "Communication Expert",
    description: "Complete every advanced course.",
    unlocked: false,
  },
];

export const weeklyActivity: WeeklyActivity[] = [
  { day: "Mon", minutes: 25 },
  { day: "Tue", minutes: 40 },
  { day: "Wed", minutes: 15 },
  { day: "Thu", minutes: 55 },
  { day: "Fri", minutes: 30 },
  { day: "Sat", minutes: 65 },
  { day: "Sun", minutes: 45 },
];

export const dashboardStats = {
  coursesCompleted: 5,
  coursesInProgress: 3,
  learningHours: 42,
  streak: 12,
  overallCompletion: 64,
  badgesEarned: 4,
  stars: 96,
  points: 3180,
};
