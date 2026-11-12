import { UserProfile } from '@/types/user';

export type DayCellStatus = 'pre_join' | 'active' | 'missed' | 'upcoming';

export interface WeeklyDayCell {
  label: string; // Mon..Sun
  dateKey: string; // YYYY-MM-DD
  dayOfMonth: number;
  isToday: boolean;
  status: DayCellStatus;
}

export interface MonthlyDayCell {
  dayNum: number; // 1..30 (or 1..daysInMonth)
  dateKey: string; // YYYY-MM-DD
  isToday: boolean;
  status: DayCellStatus;
}

export interface StreakLevelInfo {
  level: number;
  title: string;
  badgeEmoji: string;
  colorClass: string;
  minDays: number;
  nextMilestone: number;
  progressPercent: number;
}

/**
 * Formats a Date into local YYYY-MM-DD string (timezone-safe for user's local midnight).
 */
export function toLocalDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Normalizes any ISO string or YYYY-MM-DD into a YYYY-MM-DD key, defaulting to today.
 */
export function normalizeDateKey(raw?: string | null, fallbackDate: Date = new Date()): string {
  if (!raw) return toLocalDateKey(fallbackDate);
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return toLocalDateKey(fallbackDate);
  return toLocalDateKey(parsed);
}

/**
 * Computes effective join date key.
 * For legacy accounts without `joinedAt` that already earned multi-day streaks, backdates cleanly
 * only by `(streak - 1)` days so their authentic streak continuity isn't broken; new accounts
 * strictly start from their exact join day!
 */
export function getEffectiveJoinDateKey(profile: UserProfile | null, now: Date = new Date()): string {
  if (profile?.joinedAt) {
    return normalizeDateKey(profile.joinedAt, now);
  }
  const todayKey = toLocalDateKey(now);
  const existingDates = Array.isArray(profile?.activeDates) ? profile.activeDates : [];
  if (existingDates.length > 0) {
    const sorted = [...existingDates].sort();
    return sorted[0];
  }
  const streak = profile?.streak || 0;
  if (streak > 1) {
    const back = new Date(now);
    back.setDate(back.getDate() - (streak - 1));
    return toLocalDateKey(back);
  }
  return todayKey;
}

/**
 * Returns complete set of active YYYY-MM-DD keys for a user, always preserving real history
 * and treating today as active once signed in / studying.
 */
export function getResolvedActiveDates(
  profile: UserProfile | null,
  now: Date = new Date()
): Set<string> {
  const todayKey = toLocalDateKey(now);
  const set = new Set<string>(Array.isArray(profile?.activeDates) ? profile.activeDates : []);
  if (profile?.lastActive) {
    set.add(normalizeDateKey(profile.lastActive, now));
  }
  // Signed-in session today counts toward today's daily sign-in flame
  if (profile?.uid) {
    set.add(todayKey);
  }
  // Respect joinedAt boundary: strip any synthetic dates prior to join date if explicit joinedAt exists
  if (profile?.joinedAt) {
    const joinKey = normalizeDateKey(profile.joinedAt, now);
    for (const key of Array.from(set)) {
      if (key < joinKey) {
        set.delete(key);
      }
    }
  }
  return set;
}

/**
 * Duolingo-style consecutive streak calculator from activeDates backwards from today.
 */
export function calculateConsecutiveStreak(
  activeDates: Set<string>,
  now: Date = new Date()
): number {
  let count = 0;
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  while (activeDates.has(toLocalDateKey(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return Math.max(1, count);
}

/**
 * Records today's YYYY-MM-DD into `activeDates`, recalculates streak & longestStreak cleanly.
 */
export function markTodayActiveOnProfile(
  profile: UserProfile,
  now: Date = new Date()
): UserProfile {
  const todayKey = toLocalDateKey(now);
  const joinKey = profile.joinedAt ? normalizeDateKey(profile.joinedAt, now) : todayKey;
  const activeSet = getResolvedActiveDates({ ...profile, joinedAt: joinKey }, now);
  activeSet.add(todayKey);

  const sortedDates = Array.from(activeSet).sort();
  const computedStreak = calculateConsecutiveStreak(activeSet, now);
  const longestStreak = Math.max(profile.longestStreak || 1, computedStreak, profile.streak || 1);

  return {
    ...profile,
    joinedAt: profile.joinedAt || new Date(now).toISOString(),
    lastActive: todayKey,
    activeDates: sortedDates,
    streak: computedStreak,
    currentStreak: computedStreak,
    longestStreak,
    streakFreezes: profile.streakFreezes ?? 1,
    streakShieldActive: (profile.streakFreezes ?? 1) > 0,
  };
}

/**
 * Builds the 7-day Monday -> Sunday strip following strict Duolingo pre-join rules:
 * - Days strictly before `joinDateKey` are marked `'pre_join'` (crossed out / inactive)
 *   e.g. Join on Saturday -> Mon..Fri are all `'pre_join'`, Sat starts active!
 *   e.g. Join on Sunday -> Mon..Sat are all `'pre_join'`, Sun starts active!
 * - Days from `joinDateKey` up to today: `'active'` 🔥 if active, else `'missed'` ✕
 * - Days after today: `'upcoming'`
 */
export function buildWeeklyStreakStrip(
  profile: UserProfile | null,
  now: Date = new Date()
): WeeklyDayCell[] {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayKey = toLocalDateKey(now);
  const joinKey = getEffectiveJoinDateKey(profile, now);
  const activeDates = getResolvedActiveDates(profile, now);

  // Compute Monday of current week (0=Mon .. 6=Sun)
  const jsDay = now.getDay();
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);

  return labels.map((label, idx) => {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + idx);
    const dateKey = toLocalDateKey(d);
    const isToday = dateKey === todayKey;

    let status: DayCellStatus = 'upcoming';
    if (dateKey < joinKey) {
      status = 'pre_join';
    } else if (dateKey > todayKey) {
      status = 'upcoming';
    } else if (activeDates.has(dateKey) || isToday) {
      status = 'active';
    } else {
      status = 'missed';
    }

    return {
      label,
      dateKey,
      dayOfMonth: d.getDate(),
      isToday,
      status,
    };
  });
}

/**
 * Builds the 30-day Monthly Calendar Grid (days 1..daysInMonth of current month, min 30):
 * - If user starts on the 25th, Days 1..24 are `'pre_join'` (crossed out!),
 *   while Days 25, 26, 27... display active flames as user maintains streak!
 */
export function buildMonthlyStreakMatrix(
  profile: UserProfile | null,
  now: Date = new Date()
): MonthlyDayCell[] {
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = Math.max(30, new Date(year, month + 1, 0).getDate());
  const todayKey = toLocalDateKey(now);
  const joinKey = getEffectiveJoinDateKey(profile, now);
  const activeDates = getResolvedActiveDates(profile, now);

  const cells: MonthlyDayCell[] = [];
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum += 1) {
    const d = new Date(year, month, dayNum);
    const dateKey = toLocalDateKey(d);
    const isToday = dateKey === todayKey;

    let status: DayCellStatus = 'upcoming';
    if (dateKey < joinKey) {
      status = 'pre_join';
    } else if (dateKey > todayKey) {
      status = 'upcoming';
    } else if (activeDates.has(dateKey) || isToday) {
      status = 'active';
    } else {
      status = 'missed';
    }

    cells.push({
      dayNum,
      dateKey,
      isToday,
      status,
    });
  }
  return cells;
}

/**
 * Duolingo-style Streak League & Milestone Progression System.
 */
export function getDuolingoStreakLevel(streakDays: number): StreakLevelInfo {
  const s = Math.max(1, streakDays || 1);
  if (s >= 30) {
    return {
      level: 5,
      title: 'Obsidian Streak Legend',
      badgeEmoji: '👑',
      colorClass: 'from-purple-500 to-amber-400 text-purple-300',
      minDays: 30,
      nextMilestone: 60,
      progressPercent: Math.min(100, Math.round(((s - 30) / 30) * 100)),
    };
  }
  if (s >= 14) {
    return {
      level: 4,
      title: 'Emerald Fortnight',
      badgeEmoji: '💎',
      colorClass: 'from-emerald-400 to-cyan-400 text-emerald-300',
      minDays: 14,
      nextMilestone: 30,
      progressPercent: Math.min(100, Math.round(((s - 14) / 16) * 100)),
    };
  }
  if (s >= 7) {
    return {
      level: 3,
      title: 'Gold Week Warrior',
      badgeEmoji: '🏆',
      colorClass: 'from-amber-400 to-yellow-300 text-amber-300',
      minDays: 7,
      nextMilestone: 14,
      progressPercent: Math.min(100, Math.round(((s - 7) / 7) * 100)),
    };
  }
  if (s >= 3) {
    return {
      level: 2,
      title: 'Blaze Runner',
      badgeEmoji: '🔥',
      colorClass: 'from-orange-500 to-amber-400 text-orange-300',
      minDays: 3,
      nextMilestone: 7,
      progressPercent: Math.min(100, Math.round(((s - 3) / 4) * 100)),
    };
  }
  return {
    level: 1,
    title: 'Kindling Spark',
    badgeEmoji: '⚡',
    colorClass: 'from-sky-400 to-orange-400 text-sky-300',
    minDays: 1,
    nextMilestone: 3,
    progressPercent: Math.min(100, Math.round((s / 3) * 100)),
  };
}
