/**
 * Centralized Gemini API Key Pool & Round-Robin Load Balancer
 * Supports 10 Google AI Studio API Keys for 100+ concurrent users with instant failover on 429/timeouts.
 */

// 10 API Key Slots (Bindings via env variables or direct key insertion)
export const GEMINI_API_KEYS: string[] = [
  process.env.GEMINI_KEY_1 || process.env.NEXT_PUBLIC_GEMINI_KEY_1 || '',
  process.env.GEMINI_KEY_2 || process.env.NEXT_PUBLIC_GEMINI_KEY_2 || '',
  process.env.GEMINI_KEY_3 || process.env.NEXT_PUBLIC_GEMINI_KEY_3 || '',
  process.env.GEMINI_KEY_4 || process.env.NEXT_PUBLIC_GEMINI_KEY_4 || '',
  process.env.GEMINI_KEY_5 || process.env.NEXT_PUBLIC_GEMINI_KEY_5 || '',
  process.env.GEMINI_KEY_6 || process.env.NEXT_PUBLIC_GEMINI_KEY_6 || '',
  process.env.GEMINI_KEY_7 || process.env.NEXT_PUBLIC_GEMINI_KEY_7 || '',
  process.env.GEMINI_KEY_8 || process.env.NEXT_PUBLIC_GEMINI_KEY_8 || '',
  process.env.GEMINI_KEY_9 || process.env.NEXT_PUBLIC_GEMINI_KEY_9 || '',
  process.env.GEMINI_KEY_10 || process.env.NEXT_PUBLIC_GEMINI_KEY_10 || '',
].map(k => k.trim());

// Key health tracker
interface KeyStatus {
  key: string;
  index: number;
  failsCount: number;
  lastUsed: number;
  cooldownUntil: number;
}

let keyStatuses: KeyStatus[] = GEMINI_API_KEYS.map((key, index) => ({
  key,
  index,
  failsCount: 0,
  lastUsed: 0,
  cooldownUntil: 0
}));

let currentRoundRobinIndex = 0;

/**
 * Get the next healthy API key using round-robin distribution with instant failover
 */
export function getNextGeminiKey(): { key: string; index: number } | null {
  const now = Date.now();
  const total = keyStatuses.length;

  for (let i = 0; i < total; i++) {
    const idx = (currentRoundRobinIndex + i) % total;
    const item = keyStatuses[idx];

    // Check if key is configured and not in cooldown
    if (item.key && item.key.startsWith('AIzaSy') && now > item.cooldownUntil) {
      currentRoundRobinIndex = (idx + 1) % total;
      item.lastUsed = now;
      return { key: item.key, index: item.index };
    }
  }

  // Fallback: Return any available configured key
  const available = keyStatuses.find(k => k.key && k.key.startsWith('AIzaSy'));
  return available ? { key: available.key, index: available.index } : null;
}

/**
 * Report key rate limit or failure to trigger instant failover and cooling
 */
export function reportKeyFailure(index: number, statusCode?: number) {
  if (index >= 0 && index < keyStatuses.length) {
    const item = keyStatuses[index];
    item.failsCount += 1;
    // Cool down for 60 seconds on rate limit (429) or 15 seconds on general network error
    const cooldownMs = statusCode === 429 ? 60000 : 15000;
    item.cooldownUntil = Date.now() + cooldownMs;
    console.warn(`[GeminiKeyManager] Key #${index + 1} marked on cooldown for ${cooldownMs / 1000}s (status: ${statusCode})`);
  }
}

/**
 * Report key success
 */
export function reportKeySuccess(index: number) {
  if (index >= 0 && index < keyStatuses.length) {
    keyStatuses[index].failsCount = 0;
    keyStatuses[index].cooldownUntil = 0;
  }
}

/**
 * User AI Call Credits Tracker (5 Credits per Day, Resets at Midnight IST)
 */
export interface UserCallCreditStatus {
  date: string;
  creditsLeft: number;
  totalPerDay: number;
}

export function getUserDailyCallCredits(): UserCallCreditStatus {
  if (typeof window === 'undefined') {
    return { date: '', creditsLeft: 5, totalPerDay: 5 };
  }

  // Get current date string in IST (Indian Standard Time)
  const istDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const storageKey = 'jack_quiz_daily_ai_credits';

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed: UserCallCreditStatus = JSON.parse(raw);
      if (parsed.date === istDate) {
        return parsed;
      }
    }
  } catch {}

  // New day or first time: initialize with 5 credits
  const initial: UserCallCreditStatus = {
    date: istDate,
    creditsLeft: 5,
    totalPerDay: 5
  };

  try {
    localStorage.setItem(storageKey, JSON.stringify(initial));
  } catch {}

  return initial;
}

export function deductUserDailyCallCredit(): number {
  if (typeof window === 'undefined') return 5;
  const status = getUserDailyCallCredits();
  const nextCredits = Math.max(0, status.creditsLeft - 1);
  const updated: UserCallCreditStatus = {
    ...status,
    creditsLeft: nextCredits
  };
  try {
    localStorage.setItem('jack_quiz_daily_ai_credits', JSON.stringify(updated));
  } catch {}
  return nextCredits;
}
