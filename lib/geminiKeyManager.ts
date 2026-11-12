/**
 * Centralized Multi-Provider AI API Key Pool & Round-Robin Load Balancer
 * Supports up to 10 hidden server-side API keys across Google Gemini AND
 * any OpenAI-compatible AI provider (Groq, OpenRouter, OpenAI, Mistral, Together, Cerebras, DeepSeek, Fireworks)
 * with instant failover on rate-limits (429) or auth errors.
 */

export type AIProviderKind =
  | 'gemini'
  | 'groq'
  | 'openrouter'
  | 'openai'
  | 'mistral'
  | 'together'
  | 'cerebras'
  | 'deepseek'
  | 'fireworks'
  | 'cohere'
  | 'zhipu'
  | 'kilo'
  | 'llm7';

export interface ProviderSlot {
  key: string;
  provider: AIProviderKind;
  model: string;
  endpoint: string;
  index: number;
  failsCount: number;
  lastUsed: number;
  cooldownUntil: number;
}

const PROVIDER_DEFAULTS: Record<AIProviderKind, { endpoint: string; model: string; label: string }> = {
  gemini: {
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    model: 'gemini-2.5-flash',
    label: 'Google Gemini',
  },
  groq: {
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    label: 'Groq LPU',
  },
  openrouter: {
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'google/gemini-2.0-flash-001',
    label: 'OpenRouter',
  },
  openai: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    label: 'OpenAI',
  },
  mistral: {
    endpoint: 'https://api.mistral.ai/v1/chat/completions',
    model: 'mistral-small-latest',
    label: 'Mistral AI',
  },
  together: {
    endpoint: 'https://api.together.xyz/v1/chat/completions',
    model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    label: 'Together AI',
  },
  cerebras: {
    endpoint: 'https://api.cerebras.ai/v1/chat/completions',
    model: 'llama-3.3-70b',
    label: 'Cerebras',
  },
  deepseek: {
    endpoint: 'https://api.deepseek.com/chat/completions',
    model: 'deepseek-chat',
    label: 'DeepSeek',
  },
  fireworks: {
    endpoint: 'https://api.fireworks.ai/inference/v1/chat/completions',
    model: 'accounts/fireworks/models/llama-v3p3-70b-instruct',
    label: 'Fireworks AI',
  },
  cohere: {
    endpoint: 'https://api.cohere.ai/compatibility/v1/chat/completions',
    model: 'command-a-03-2025',
    label: 'Cohere',
  },
  zhipu: {
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    model: 'glm-4-flash',
    label: 'Zhipu GLM',
  },
  kilo: {
    endpoint: 'https://api.kilo.ai/api/gateway/chat/completions',
    model: 'google/gemini-2.0-flash-001',
    label: 'Kilo Gateway',
  },
  llm7: {
    endpoint: 'https://api.llm7.io/v1/chat/completions',
    model: 'default',
    label: 'LLM7 AI',
  },
};

export function detectProviderFromRaw(rawEntry: string): { provider: AIProviderKind; key: string } {
  const trimmed = rawEntry.trim();
  const colonIdx = trimmed.indexOf(':');
  if (colonIdx > 1 && colonIdx < 16) {
    const prefix = trimmed.slice(0, colonIdx).toLowerCase() as AIProviderKind;
    if (prefix in PROVIDER_DEFAULTS) {
      return { provider: prefix, key: trimmed.slice(colonIdx + 1).trim() };
    }
  }
  if (trimmed.startsWith('AIzaSy')) return { provider: 'gemini', key: trimmed };
  if (trimmed.startsWith('gsk_')) return { provider: 'groq', key: trimmed };
  if (trimmed.startsWith('mstrl_')) return { provider: 'mistral', key: trimmed };
  if (trimmed.startsWith('sk-or-')) return { provider: 'openrouter', key: trimmed };
  if (trimmed.startsWith('cohere_')) return { provider: 'cohere', key: trimmed };
  if (trimmed.startsWith('eyJ')) return { provider: 'kilo', key: trimmed };
  if (/^[a-f0-9]{32}\.[A-Za-z0-9]+$/.test(trimmed)) return { provider: 'zhipu', key: trimmed };
  if (trimmed.endsWith('==') && trimmed.length > 60) return { provider: 'llm7', key: trimmed };
  if (trimmed.startsWith('csk-')) return { provider: 'cerebras', key: trimmed };
  if (trimmed.startsWith('fw_')) return { provider: 'fireworks', key: trimmed };
  if (trimmed.startsWith('sk-')) return { provider: 'openai', key: trimmed };
  return { provider: 'gemini', key: trimmed };
}

function collectServerEnvKeys(): string[] {
  // Server-only secret env slots (never exposed to browser bundle)
  const rawSlots = [
    process.env.AI_KEY_1 || process.env.GEMINI_KEY_1 || '',
    process.env.AI_KEY_2 || process.env.GEMINI_KEY_2 || '',
    process.env.AI_KEY_3 || process.env.GEMINI_KEY_3 || '',
    process.env.AI_KEY_4 || process.env.GEMINI_KEY_4 || '',
    process.env.AI_KEY_5 || process.env.GEMINI_KEY_5 || '',
    process.env.AI_KEY_6 || process.env.GEMINI_KEY_6 || '',
    process.env.AI_KEY_7 || process.env.GEMINI_KEY_7 || '',
    process.env.AI_KEY_8 || process.env.GEMINI_KEY_8 || '',
    process.env.AI_KEY_9 || process.env.GEMINI_KEY_9 || '',
    process.env.AI_KEY_10 || process.env.GEMINI_KEY_10 || '',
    process.env.GEMINI_API_KEY || '',
    process.env.GROQ_API_KEY ? `groq:${process.env.GROQ_API_KEY}` : '',
    process.env.OPENROUTER_API_KEY ? `openrouter:${process.env.OPENROUTER_API_KEY}` : '',
    process.env.OPENAI_API_KEY ? `openai:${process.env.OPENAI_API_KEY}` : '',
    process.env.MISTRAL_API_KEY ? `mistral:${process.env.MISTRAL_API_KEY}` : '',
    process.env.TOGETHER_API_KEY ? `together:${process.env.TOGETHER_API_KEY}` : '',
    process.env.CEREBRAS_API_KEY ? `cerebras:${process.env.CEREBRAS_API_KEY}` : '',
    process.env.DEEPSEEK_API_KEY ? `deepseek:${process.env.DEEPSEEK_API_KEY}` : '',
    process.env.FIREWORKS_API_KEY ? `fireworks:${process.env.FIREWORKS_API_KEY}` : '',
    process.env.COHERE_API_KEY ? `cohere:${process.env.COHERE_API_KEY}` : '',
    process.env.ZHIPU_API_KEY ? `zhipu:${process.env.ZHIPU_API_KEY}` : '',
    process.env.KILO_API_KEY ? `kilo:${process.env.KILO_API_KEY}` : '',
    process.env.LLM7_API_KEY ? `llm7:${process.env.LLM7_API_KEY}` : '',
  ];

  // Also support comma-separated AI_PROVIDER_KEYS or GEMINI_API_KEYS
  const csvExtra = (process.env.AI_PROVIDER_KEYS || process.env.GEMINI_API_KEYS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return Array.from(new Set([...rawSlots, ...csvExtra].map((k) => k.trim()).filter(Boolean))).slice(0, 10);
}

// Legacy export preserved for backwards compatibility
export const GEMINI_API_KEYS: string[] = [];

const keyStatuses: ProviderSlot[] = collectServerEnvKeys().map((raw, index) => {
  const { provider, key } = detectProviderFromRaw(raw);
  const meta = PROVIDER_DEFAULTS[provider];
  return {
    key,
    provider,
    model: meta.model,
    endpoint: meta.endpoint,
    index,
    failsCount: 0,
    lastUsed: 0,
    cooldownUntil: 0,
  };
});

let currentRoundRobinIndex = 0;

export function buildSlotsWithRuntimeKeys(runtimeKeys: string[] = []): ProviderSlot[] {
  const validRuntime = runtimeKeys
    .map((k) => k.trim())
    .filter((k) => k.length >= 12)
    .slice(0, 10)
    .map((raw, idx) => {
      const { provider, key } = detectProviderFromRaw(raw);
      const meta = PROVIDER_DEFAULTS[provider];
      return {
        key,
        provider,
        model: meta.model,
        endpoint: meta.endpoint,
        index: 100 + idx,
        failsCount: 0,
        lastUsed: 0,
        cooldownUntil: 0,
      };
    });

  return [...keyStatuses, ...validRuntime].slice(0, 10);
}

export function getProviderLabel(provider: AIProviderKind): string {
  return PROVIDER_DEFAULTS[provider]?.label || 'AI Engine';
}

/**
 * Get the next healthy API key from server pool using round-robin + cooldown failover
 */
export function getNextGeminiKey(): { key: string; index: number; provider: AIProviderKind; model: string; endpoint: string } | null {
  const now = Date.now();
  const total = keyStatuses.length;
  if (total === 0) return null;

  for (let i = 0; i < total; i++) {
    const idx = (currentRoundRobinIndex + i) % total;
    const item = keyStatuses[idx];

    if (item.key && item.key.length >= 12 && now > item.cooldownUntil) {
      currentRoundRobinIndex = (idx + 1) % total;
      item.lastUsed = now;
      return {
        key: item.key,
        index: item.index,
        provider: item.provider,
        model: item.model,
        endpoint: item.endpoint,
      };
    }
  }

  const available = keyStatuses.find((k) => k.key && k.key.length >= 12);
  return available
    ? {
        key: available.key,
        index: available.index,
        provider: available.provider,
        model: available.model,
        endpoint: available.endpoint,
      }
    : null;
}

export function reportKeyFailure(index: number, statusCode?: number) {
  if (index >= 0 && index < keyStatuses.length) {
    const item = keyStatuses[index];
    item.failsCount += 1;
    const cooldownMs = statusCode === 429 ? 60000 : 15000;
    item.cooldownUntil = Date.now() + cooldownMs;
    console.warn(`[AIKeyManager] Slot #${index + 1} (${item.provider}) cooled down for ${cooldownMs / 1000}s (status: ${statusCode})`);
  }
}

export function reportKeySuccess(index: number) {
  if (index >= 0 && index < keyStatuses.length) {
    keyStatuses[index].failsCount = 0;
    keyStatuses[index].cooldownUntil = 0;
  }
}

export function getServerPoolSummary(): { configuredCount: number; providers: string[] } {
  return {
    configuredCount: keyStatuses.length,
    providers: Array.from(new Set(keyStatuses.map((s) => getProviderLabel(s.provider)))),
  };
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

  const initial: UserCallCreditStatus = {
    date: istDate,
    creditsLeft: 5,
    totalPerDay: 5,
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
    creditsLeft: nextCredits,
  };
  try {
    localStorage.setItem('jack_quiz_daily_ai_credits', JSON.stringify(updated));
  } catch {}
  return nextCredits;
}
