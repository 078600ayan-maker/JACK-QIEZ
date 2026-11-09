import { Question } from '@/types/question';

const CACHE_VERSION = 3;
const CACHE_PREFIX = 'sbr_cache_v3_';

export async function fetchChapterQuestions(filePath: string): Promise<Question[]> {
  const cacheKey = `${CACHE_PREFIX}${filePath}`;

  // 1. Try LocalStorage Cache
  if (typeof window !== 'undefined') {
    try {
      const cachedStr = localStorage.getItem(cacheKey);
      if (cachedStr) {
        const parsed = JSON.parse(cachedStr);
        if (parsed.v === CACHE_VERSION && Array.isArray(parsed.data) && parsed.data.length >= 30) {
          return parsed.data;
        }
      }
    } catch {
      // Fall through to fetch if localStorage read fails
    }
  }

  // 2. Fetch from static JSON with no-cache for instant refresh
  try {
    const res = await fetch(filePath);
    if (!res.ok) {
      throw new Error(`Failed to load questions from ${filePath}: ${res.statusText}`);
    }
    const data: Question[] = await res.json();

    // 3. Save to LocalStorage if full question set
    if (typeof window !== 'undefined' && Array.isArray(data) && data.length >= 30) {
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
 * Filter and prepare unique, non-repeating questions for a given level (1 to 5).
 * Each chapter has 30 questions total divided cleanly into 5 levels (6 unique questions per level).
 */
export function getQuestionsForLevel(allQuestions: Question[], level: number): Question[] {
  if (!allQuestions || allQuestions.length === 0) return [];

  const targetLevel = Math.min(Math.max(level, 1), 5);
  const QUESTIONS_PER_LEVEL = 6;

  // 1. Try to slice 6 distinct, sequential questions for each level (Zero repetition)
  const startIndex = (targetLevel - 1) * QUESTIONS_PER_LEVEL;
  const endIndex = startIndex + QUESTIONS_PER_LEVEL;

  // If chapter has at least 30 questions, assign exactly 6 unique questions per level
  if (allQuestions.length >= 30) {
    const levelSlice = allQuestions.slice(startIndex, endIndex);
    if (levelSlice.length > 0) {
      return levelSlice;
    }
  }

  // 2. Fallback: match difficulty, avoiding cross-level duplicate overlaps
  const targetDiff = targetLevel;
  const exactDiff = allQuestions.filter(q => q.d === targetDiff);
  if (exactDiff.length >= QUESTIONS_PER_LEVEL) {
    return exactDiff.slice(0, QUESTIONS_PER_LEVEL);
  }

  // 3. Fallback: even distribution across the entire question pool
  const poolSize = allQuestions.length;
  const step = Math.max(1, Math.floor(poolSize / 5));
  const dynamicStart = (targetLevel - 1) * step;
  const dynamicSlice = allQuestions.slice(dynamicStart, dynamicStart + QUESTIONS_PER_LEVEL);

  if (dynamicSlice.length > 0) {
    return dynamicSlice;
  }

  return allQuestions.slice(0, Math.min(allQuestions.length, QUESTIONS_PER_LEVEL));
}
