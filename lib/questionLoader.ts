import { Question } from '@/types/question';

const CACHE_VERSION = 1;
const CACHE_PREFIX = 'sbr_cache_';

export async function fetchChapterQuestions(filePath: string): Promise<Question[]> {
  const cacheKey = `${CACHE_PREFIX}${filePath}`;

  // 1. Try LocalStorage Cache
  if (typeof window !== 'undefined') {
    try {
      const cachedStr = localStorage.getItem(cacheKey);
      if (cachedStr) {
        const parsed = JSON.parse(cachedStr);
        if (parsed.v === CACHE_VERSION && Array.isArray(parsed.data)) {
          return parsed.data;
        }
      }
    } catch {
      // Fall through to fetch if localStorage read fails
    }
  }

  // 2. Fetch from static JSON
  try {
    const res = await fetch(filePath, { cache: 'force-cache' });
    if (!res.ok) {
      throw new Error(`Failed to load questions from ${filePath}: ${res.statusText}`);
    }
    const data: Question[] = await res.json();

    // 3. Save to LocalStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ v: CACHE_VERSION, data }));
      } catch {
        // Handle storage quota exceeded gracefully
      }
    }

    return data;
  } catch (err) {
    console.error(`Error loading chapter questions from ${filePath}`, err);
    return [];
  }
}

/**
 * Filter and prepare questions for a given level (1 to 5)
 */
export function getQuestionsForLevel(allQuestions: Question[], level: number): Question[] {
  if (!allQuestions || allQuestions.length === 0) return [];

  // Match target difficulty, then fall back to surrounding if needed
  const targetDiff = Math.min(Math.max(level, 1), 5);
  
  // Primary pool: exact difficulty match
  const primary = allQuestions.filter(q => q.d === targetDiff);
  
  // Secondary pool: adjacent difficulties
  const secondary = allQuestions.filter(q => Math.abs(q.d - targetDiff) === 1);
  const remaining = allQuestions.filter(q => q.d !== targetDiff && Math.abs(q.d - targetDiff) > 1);

  const combined = [...primary, ...secondary, ...remaining];

  // Desired question count based on level:
  // L1: 10, L2: 12, L3: 12, L4: 12, L5: 15
  const countNeeded = level === 1 ? 10 : level === 5 ? 15 : 12;

  // Return up to countNeeded, or all available if fewer
  return combined.slice(0, Math.min(combined.length, countNeeded));
}
