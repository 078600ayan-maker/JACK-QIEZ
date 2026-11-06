'use client';

import { Question } from '@/types/question';

export const BASE_REST_URL = 'https://igmgwqergzwbfqlyaufe.supabase.co/rest/v1';

export interface SupabaseQuestionRow {
  id: number;
  subject: string;
  chapter_id: string;
  language: 'hi' | 'en';
  difficulty: number;
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  exam_year?: number;
  marks?: number;
}

/**
 * Direct database filtering for Hindi and English media via Supabase REST API
 * https://igmgwqergzwbfqlyaufe.supabase.co/rest/v1/
 */
export async function fetchQuestionsByLanguage(
  subject: string,
  language: 'hi' | 'en' = 'hi',
  chapterId?: string
): Promise<Question[]> {
  const normalizedSubject = subject.toLowerCase().replace(/[^a-z]/g, '');

  try {
    let url = `${BASE_REST_URL}/questions?subject=eq.${normalizedSubject}&language=eq.${language}&select=*`;
    if (chapterId) {
      url += `&chapter_id=eq.${chapterId}`;
    }

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json'
      },
      next: { revalidate: 3600 }
    });

    if (response.ok) {
      const rows: SupabaseQuestionRow[] = await response.json();
      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map((r, idx) => ({
          i: r.id || idx + 1,
          d: (Math.min(5, Math.max(1, r.difficulty || 1)) as 1 | 2 | 3 | 4 | 5),
          q: r.question_text,
          o: r.options,
          a: r.correct_answer,
          e: r.explanation || ''
        }));
      }
    }
  } catch (err) {
    console.warn('Supabase fetch failed or network offline, falling back to pre-bundled local archive:', err);
  }

  // Graceful Offline / Local Fallback
  return fetchLocalFallbackQuestions(normalizedSubject, language, chapterId);
}

/**
 * Pre-bundled local offline loader for 100% offline uptime
 */
async function fetchLocalFallbackQuestions(
  subject: string,
  language: 'hi' | 'en',
  chapterId?: string
): Promise<Question[]> {
  const folderMap: Record<string, string> = {
    science: 'science',
    sci: 'science',
    math: 'math',
    mathematics: 'math',
    sst: 'social_science',
    socialscience: 'social_science',
    hindi: 'hindi',
    hin: 'hindi',
    english: 'english',
    eng: 'english'
  };

  const folder = folderMap[subject] || 'science';
  const ch = chapterId ? chapterId.replace(/[^0-9]/g, '').padStart(2, '0') : '01';

  try {
    // Check language specific directory first if English
    if (language === 'en') {
      const enRes = await fetch(`/data/${folder}_en/ch_${ch}.json`);
      if (enRes.ok) {
        const enData: Question[] = await enRes.json();
        if (Array.isArray(enData) && enData.length > 0) return enData;
      }
    }

    const res = await fetch(`/data/${folder}/ch_${ch}.json`);
    if (res.ok) {
      const data: Question[] = await res.json();
      return data;
    }
  } catch (e) {
    console.warn('Local fallback file read error:', e);
  }

  return [];
}
