/**
 * Gamification ledger — stars, points, levels, and badges.
 *
 * Stored in localStorage under "eflash:rewards" so progress survives
 * refreshes without any backend. All functions are client-safe.
 */

export interface SessionRecord {
  deckId: string;
  deckTitle: string;
  correct: number;
  total: number;
  stars: number;
  points: number;
  date: string;
}

export interface Badge {
  id: string;
  label: string;
  description: string;
  earnedAt: string;
}

export interface RewardState {
  stars: number;
  points: number;
  bestStreak: number;
  sessions: SessionRecord[];
  badges: Badge[];
}

const STORAGE_KEY = "eflash:rewards";

const EMPTY_STATE: RewardState = {
  stars: 0,
  points: 0,
  bestStreak: 0,
  sessions: [],
  badges: [],
};

/** Server-safe snapshot (empty state) for useSyncExternalStore SSR. */
export function getRewardsServerSnapshot(): RewardState {
  return EMPTY_STATE;
}

/** External-store plumbing so client components can react to reward changes. */
const listeners = new Set<() => void>();

export function subscribeRewards(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

let snapshot: RewardState | null = null;

/** Cached snapshot for useSyncExternalStore — stable object identity. */
export function getRewardsSnapshot(): RewardState {
  if (!snapshot) snapshot = loadRewards();
  return snapshot;
}

function notify(): void {
  for (const listener of listeners) listener();
}

export function loadRewards(): RewardState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as Partial<RewardState>;
    return { ...EMPTY_STATE, ...parsed };
  } catch {
    return EMPTY_STATE;
  }
}

function persist(state: RewardState): RewardState {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable (private mode) — progress is session-only.
    }
  }
  snapshot = state;
  notify();
  return state;
}

export function addStars(n: number): RewardState {
  const state = loadRewards();
  state.stars = Math.max(0, state.stars + n);
  return persist(state);
}

export function addPoints(n: number): RewardState {
  const state = loadRewards();
  state.points = Math.max(0, state.points + n);
  return persist(state);
}

export function loadStars(): number {
  return loadRewards().stars;
}

export function loadPoints(): number {
  return loadRewards().points;
}

/** Point thresholds and titles for learner levels. */
const LEVELS = [
  { min: 0, title: "Star Learner" },
  { min: 200, title: "Word Explorer" },
  { min: 500, title: "Sound Builder" },
  { min: 1000, title: "Sentence Star" },
  { min: 1800, title: "Speech Champion" },
  { min: 3000, title: "Communication Hero" },
] as const;

export interface LevelInfo {
  level: number;
  title: string;
  nextTitle: string | null;
  pointsIntoLevel: number;
  pointsForNext: number | null;
  progress: number; // 0..1
}

export function levelFromPoints(points: number): LevelInfo {
  let level = 1;
  let title: string = LEVELS[0].title;
  let nextTitle: string | null = LEVELS[1]?.title ?? null;
  let floor = 0;

  for (let i = 0; i < LEVELS.length; i++) {
    if (points >= LEVELS[i].min) {
      level = i + 1;
      title = LEVELS[i].title;
      floor = LEVELS[i].min;
      nextTitle = LEVELS[i + 1]?.title ?? null;
    }
  }

  const ceil = nextTitle
    ? LEVELS[level]?.min ?? floor + 200
    : floor;
  const pointsIntoLevel = points - floor;
  const pointsForNext = nextTitle ? ceil - points : null;
  const progress = nextTitle
    ? Math.min(1, pointsIntoLevel / Math.max(1, ceil - floor))
    : 1;

  return { level, title, nextTitle, pointsIntoLevel, pointsForNext, progress };
}

const BADGE_DEFS = [
  { id: "first-practice", label: "First Practice", description: "Completed your first practice session" },
  { id: "star-10", label: "10 Stars", description: "Earned 10 stars in total" },
  { id: "star-50", label: "50 Stars", description: "Earned 50 stars in total" },
  { id: "decks-3", label: "Explorer", description: "Practiced 3 different decks" },
  { id: "accuracy-90", label: "Sharpshooter", description: "Got 90%+ correct across sessions (min 10 answers)" },
  { id: "streak-5", label: "On Fire", description: "Reached a 5-streak of correct answers" },
] as const;

export type BadgeId = (typeof BADGE_DEFS)[number]["id"];

/** Re-evaluates badges after a session; returns newly earned badges. */
export function recordSession(
  record: SessionRecord,
  bestStreak: number
): { state: RewardState; newBadges: Badge[] } {
  const state = loadRewards();
  state.sessions = [...state.sessions, record];
  state.stars += record.stars;
  state.points += record.points;
  state.bestStreak = Math.max(state.bestStreak, bestStreak);

  const totalAnswers = state.sessions.reduce((s, r) => s + r.total, 0);
  const totalCorrect = state.sessions.reduce((s, r) => s + r.correct, 0);
  const accuracy = totalAnswers > 0 ? totalCorrect / totalAnswers : 0;
  const uniqueDecks = new Set(state.sessions.map((s) => s.deckId)).size;

  const earned: Record<BadgeId, boolean> = {
    "first-practice": state.sessions.length >= 1,
    "star-10": state.stars >= 10,
    "star-50": state.stars >= 50,
    "decks-3": uniqueDecks >= 3,
    "accuracy-90": totalAnswers >= 10 && accuracy >= 0.9,
    "streak-5": state.bestStreak >= 5,
  };

  const owned = new Set(state.badges.map((b) => b.id));
  const newBadges: Badge[] = [];

  for (const def of BADGE_DEFS) {
    if (earned[def.id] && !owned.has(def.id)) {
      newBadges.push({
        id: def.id,
        label: def.label,
        description: def.description,
        earnedAt: new Date().toISOString(),
      });
    }
  }

  state.badges = [...state.badges, ...newBadges];
  persist(state);
  return { state, newBadges };
}
