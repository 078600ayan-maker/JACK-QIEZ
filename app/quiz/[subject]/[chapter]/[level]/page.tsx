'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Manifest } from '@/types/manifest';
import { fetchChapterQuestions, getQuestionsForLevel } from '@/lib/questionLoader';
import { fetchQuestionsByLanguage } from '@/lib/supabaseClient';
import { useQuizStore } from '@/store/useQuizStore';
import { useUserStore } from '@/store/useUserStore';
import { QuizTheater } from '@/components/quiz/QuizTheater';

function QuizPageContent() {
  const params = useParams();
  const router = useRouter();
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

        // 1. Load Manifest to resolve chapter file and name
        const res = await fetch('/data/manifest.json');
        if (!res.ok) throw new Error('Manifest not found');
        const manifest: Manifest = await res.json();

        const subjectMeta = manifest.subjects.find(s => s.id === subjectId);
        if (!subjectMeta) throw new Error(`Subject ${subjectId} not found`);

        const chapterMeta = subjectMeta.chapters.find(c => c.chId === chapterId);
        if (!chapterMeta) throw new Error(`Chapter ${chapterId} not found`);

        // 2. Bilingual Fetch: Query Supabase filtered by 'language' ('hi' or 'en') with offline fallback
        let allQuestions = await fetchQuestionsByLanguage(subjectMeta.id, userLang, chapterMeta.chId);
        if (!allQuestions || allQuestions.length === 0) {
          allQuestions = await fetchChapterQuestions(chapterMeta.file);
        }

        if (!allQuestions || allQuestions.length === 0) {
          throw new Error('No questions found for this chapter');
        }

        // 3. Filter and slice questions for this level
        const levelQuestions = getQuestionsForLevel(allQuestions, levelNum);

        // 4. Initialize Quiz in store
        startQuiz({
          questions: levelQuestions,
          level: levelNum,
          chapterId: chapterMeta.chId,
          chapterName: chapterMeta.name,
          subjectId: subjectMeta.id,
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
  }, [subjectId, chapterId, levelNum, startQuiz, userHearts, userLang]);

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
