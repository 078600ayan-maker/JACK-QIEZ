'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Manifest } from '@/types/manifest';
import { fetchChapterQuestions, getQuestionsForLevel } from '@/lib/questionLoader';
import { fetchQuestionsByLanguage } from '@/lib/supabaseClient';
import { useQuizStore } from '@/store/useQuizStore';
import { useUserStore } from '@/store/useUserStore';
import { QuizTheater } from '@/components/quiz/QuizTheater';
import { seededShuffleArray } from '@/lib/matchIntegrity';

function QuizPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const seedParam = searchParams?.get('seed');
  const subjectId = (params?.subject as string) || 'sci';
  const chapterId = (params?.chapter as string) || 'sci_ch01';
  const levelNum = parseInt((params?.level as string) || '1', 10) || 1;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const startQuiz = useQuizStore(s => s.startQuiz);
  const userHearts = useUserStore(s => s.profile?.hearts ?? 5);
  const userLang = useUserStore(s => s.profile?.languagePreference ?? 'hi');

  useEffect(() => {
    async function initQuizSession() {
      try {
        setLoading(true);

        // 1. Normalize Subject & Chapter IDs
        const normSubj = (raw: string) => {
          const s = raw.toLowerCase().replace(/[^a-z]/g, '');
          if (s.startsWith('math')) return 'math';
          if (s.startsWith('sci')) return 'sci';
          if (s.startsWith('sst') || s.includes('social')) return 'sst';
          if (s.startsWith('hin')) return 'hin';
          if (s.startsWith('eng')) return 'eng';
          return s;
        };

        const targetSubjId = normSubj(subjectId);
        const chNumMatch = chapterId.match(/\d+/);
        const chNum = chNumMatch ? parseInt(chNumMatch[0], 10) : 1;
        const chNumStr = String(chNum).padStart(2, '0');
        const folderMap: Record<string, string> = {
          sci: 'science',
          math: 'math',
          sst: 'social_science',
          hin: 'hindi',
          eng: 'english'
        };
        const resolvedFolder = folderMap[targetSubjId] || 'science';
        const langFolder = userLang === 'en' ? `${resolvedFolder}_en` : resolvedFolder;

        // Load Manifest to resolve chapter file and name
        let subjectTitle = subjectId;
        let chapterName = `Chapter ${chNum}`;
        let chapterFile = `/data/${langFolder}/ch_${chNumStr}.json`;

        try {
          const res = await fetch('/data/manifest.json');
          if (res.ok) {
            const manifest: Manifest = await res.json();
            const subjectMeta = manifest.subjects.find(
              s => s.id === targetSubjId || s.id === subjectId || normSubj(s.id) === targetSubjId
            );
            if (subjectMeta) {
              subjectTitle = subjectMeta.title;
              const chMeta = subjectMeta.chapters.find(
                c => c.chId === chapterId ||
                     c.num === chNum ||
                     c.chId.endsWith(`ch${chNumStr}`) ||
                     c.file.includes(`ch_${chNumStr}.json`)
              );
              if (chMeta) {
                chapterName = chMeta.name;
                chapterFile = userLang === 'en'
                  ? `/data/${resolvedFolder}_en/ch_${chNumStr}.json`
                  : chMeta.file;
              }
            }
          }
        } catch (e) {
          console.warn('Manifest load error, continuing with fallback:', e);
        }

        // 2. Bilingual Fetch: Query Supabase or local offline files
        let allQuestions = await fetchQuestionsByLanguage(targetSubjId, userLang, `ch_${chNumStr}`);
        if (!allQuestions || allQuestions.length === 0) {
          allQuestions = await fetchChapterQuestions(chapterFile);
        }

        if (!allQuestions || allQuestions.length === 0) {
          // Additional fallback directly to public data
          const fallbackRes = await fetch(`/data/${langFolder}/ch_${chNumStr}.json`);
          if (fallbackRes.ok) {
            allQuestions = await fallbackRes.json();
          }
        }

        if (!allQuestions || allQuestions.length === 0) {
          throw new Error(`No questions found for ${subjectTitle} Chapter ${chNum}`);
        }

        // 3. Filter and slice questions for this level (deterministic order if duel seed provided)
        const levelQuestions = getQuestionsForLevel(allQuestions, levelNum);
        const baseList = levelQuestions.length > 0 ? levelQuestions : allQuestions.slice(0, 30);
        const parsedSeed = seedParam ? parseInt(seedParam, 10) : NaN;
        const finalQuestions = !Number.isNaN(parsedSeed) && parsedSeed > 0
          ? seededShuffleArray(baseList, parsedSeed)
          : baseList;

        // 4. Initialize Quiz in store with all 30 questions
        startQuiz({
          questions: finalQuestions,
          level: levelNum,
          chapterId: `${targetSubjId}_ch${chNumStr}`,
          chapterName,
          subjectId: targetSubjId,
          userHearts
        });

        setLoading(false);
      } catch (err: any) {
        console.error('Quiz init error:', err);
        setError(err.message || 'Failed to initialize quiz');
        setLoading(false);
      }
    }

    if (subjectId && chapterId && levelNum) {
      initQuizSession();
    }
  }, [subjectId, chapterId, levelNum, startQuiz, userHearts, userLang, seedParam]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-[#090D16] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#10B981] border-t-transparent animate-spin" />
          <span className="text-xs font-bold text-slate-400">Assembling Duolingo Quiz Theater...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-[#090D16] text-white p-6 text-center">
        <div className="max-w-[340px] p-6 rounded-3xl bg-red-950/40 border border-red-500/30">
          <h2 className="text-base font-bold text-red-300 mb-2">Quiz Load Error</h2>
          <p className="text-xs text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/path')}
            className="px-4 py-2 rounded-xl bg-white/10 text-xs font-bold text-white hover:bg-white/20"
          >
            Return to Path
          </button>
        </div>
      </div>
    );
  }

  return <QuizTheater />;
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[100dvh] bg-[#090D16] text-white">
          <div className="w-10 h-10 rounded-full border-2 border-[#10B981] border-t-transparent animate-spin" />
        </div>
      }
    >
      <QuizPageContent />
    </Suspense>
  );
}
