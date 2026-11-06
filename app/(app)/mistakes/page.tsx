'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sparkles, CheckCircle2, ChevronRight, RotateCcw, Clock, AlertTriangle, Layers, BookOpen } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { Question } from '@/types/question';
import { SpacedMistakeItem } from '@/types/user';
import { fetchChapterQuestions } from '@/lib/questionLoader';
import { advanceMistakeRepetition } from '@/lib/firestore';
import { TactileButton } from '@/components/ui/TactileButton';
import { playClickSound, playCorrectSound, playWrongSound } from '@/lib/audioEngine';

export default function MistakesPage() {
  const { profile, removeMistake } = useUserStore();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'sci' | 'math' | 'sst' | 'hin' | 'eng'>('all');
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [activeBoxLevel, setActiveBoxLevel] = useState<number>(1);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  const mistakeIds = profile?.mistakes || [];
  const detailedMistakes = profile?.detailedMistakes || [];

  // Combine legacy and detailed mistakes into unified spaced repetition items
  const [items, setItems] = useState<Array<Question & { boxLevel: number; nextDue: string }>>([]);

  useEffect(() => {
    async function loadQuestions() {
      const list: Array<Question & { boxLevel: number; nextDue: string }> = [];

      // Check detailed mistakes
      detailedMistakes.forEach(dm => {
        list.push({
          i: dm.questionId,
          d: 3,
          q: dm.questionText,
          o: dm.options,
          a: dm.correctAnswer,
          e: dm.explanation,
          boxLevel: dm.boxLevel,
          nextDue: dm.nextReviewDue
        });
      });

      // Also ensure any legacy IDs are included
      const sciQ = await fetchChapterQuestions('/data/science/ch_01.json');
      mistakeIds.forEach(id => {
        if (!list.some(m => m.i === id)) {
          const match = sciQ.find(q => q.i === id);
          if (match) {
            list.push({ ...match, boxLevel: 1, nextDue: new Date().toISOString() });
          } else {
            list.push({
              i: id,
              d: 3,
              q: `Class 10 Core Mistake #${id}: Identify the correct NCERT concept.`,
              o: ['Accurate Verified Concept', 'Common Board Exam Trap', 'Formula Misapplication', 'Sign Inversion Error'],
              a: 0,
              e: 'NCERT Textbook formulation emphasizes precise sign convention.',
              boxLevel: 1,
              nextDue: new Date().toISOString()
            });
          }
        }
      });

      // Sort by Spaced Repetition priority: lowest box level (most recent mistakes) first
      list.sort((a, b) => a.boxLevel - b.boxLevel);
      setItems(list);
    }

    loadQuestions();
  }, [mistakeIds.length, detailedMistakes.length]);

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    playClickSound();
    setSelectedAnswer(idx);
  };

  const handleCheckAnswer = async (q: Question & { boxLevel: number }) => {
    if (selectedAnswer === null) return;
    setIsAnswerSubmitted(true);

    if (selectedAnswer === q.a) {
      playCorrectSound();
      setShowExplanation(true);
      if (profile) {
        await advanceMistakeRepetition(profile.uid, q.i);
        // Also remove from local list if mastered
        if (q.boxLevel >= 4) {
          removeMistake(q.i);
        }
      }
    } else {
      playWrongSound();
      setShowExplanation(true);
    }
  };

  const handleNextReview = () => {
    setActiveQuestion(null);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setIsAnswerSubmitted(false);
  };

  return (
    <div className="w-full max-w-[480px] mx-auto px-4 pt-4 pb-28 select-none space-y-4">
      {/* Header */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-red-950/40 via-[#141C2E] to-[#090D16] border border-red-500/30 shadow-[0_12px_32px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-red-400">
                Spaced Repetition Engine
              </span>
              <h1 className="text-xl font-black text-white">Smart Mistake Vault</h1>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-xs font-black text-red-300">
            {items.length} Missed
          </span>
        </div>

        <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
          Questions you missed in quizzes are automatically retained here using the <b>5-Box Leitner Spaced Repetition Algorithm</b>.
        </p>

        {/* 5-Box Leitner Visual Bar */}
        <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-5 gap-1.5 text-center">
          {[
            { box: 1, label: '1 Day', color: 'text-red-400' },
            { box: 2, label: '3 Days', color: 'text-orange-400' },
            { box: 3, label: '7 Days', color: 'text-amber-400' },
            { box: 4, label: '14 Days', color: 'text-cyan-400' },
            { box: 5, label: 'Mastered', color: 'text-emerald-400' }
          ].map(b => (
            <div key={b.box} className="p-1.5 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[9px] font-black block text-slate-400">Box {b.box}</span>
              <span className={`text-[10px] font-extrabold ${b.color}`}>{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ACTIVE QUESTION RETRY MODAL / CARD */}
      {activeQuestion ? (
        <div className="rounded-3xl p-5 bg-[rgba(20,29,48,0.95)] backdrop-blur-2xl border-2 border-amber-500/40 shadow-[0_16px_40px_rgba(0,0,0,0.7)] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
              Reviewing Leitner Box {activeBoxLevel}
            </span>
            <button
              onClick={handleNextReview}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close ✕
            </button>
          </div>

          <h3 className="text-sm sm:text-base font-black text-white leading-snug">
            {activeQuestion.q}
          </h3>

          {/* Options */}
          <div className="space-y-2 pt-1">
            {activeQuestion.o.map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === activeQuestion.a;

              let style = 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10';
              if (isAnswerSubmitted) {
                if (isCorrect) style = 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_12px_#10B981]';
                else if (isSelected) style = 'bg-red-600 border-red-400 text-white';
                else style = 'opacity-40 bg-white/5 border-transparent text-slate-400';
              } else if (isSelected) {
                style = 'bg-amber-500/20 border-amber-400 text-amber-300';
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswerSubmitted}
                  className={`w-full p-3 rounded-2xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${style}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-black/40 flex items-center justify-center text-[10px] font-black">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {isAnswerSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-white" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {showExplanation && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
              <span className="font-black block uppercase tracking-wider text-emerald-400">
                Reasoning & Concept Breakdown:
              </span>
              <p>{activeQuestion.e}</p>
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-2">
            {!isAnswerSubmitted ? (
              <TactileButton
                variant="gold"
                fullWidth
                disabled={selectedAnswer === null}
                onClick={() => handleCheckAnswer({ ...activeQuestion, boxLevel: activeBoxLevel })}
              >
                Verify Answer (जांचें)
              </TactileButton>
            ) : (
              <TactileButton
                variant="emerald"
                fullWidth
                onClick={handleNextReview}
              >
                Level Up & Next Question 🚀
              </TactileButton>
            )}
          </div>
        </div>
      ) : (
        /* MISTAKES LIST */
        <div className="space-y-2.5">
          {items.length === 0 ? (
            <div className="rounded-3xl p-8 bg-white/5 border border-white/10 text-center">
              <span className="text-4xl block mb-2">🎉</span>
              <h3 className="text-base font-black text-white">Vault 100% Cleared!</h3>
              <p className="text-xs text-slate-400 mt-1">
                You have mastered all your mistakes. Keep taking quizzes to find new areas to strengthen.
              </p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={item.i}
                className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[9px] font-black text-amber-300">
                      Box {item.boxLevel} • Leitner
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Question #{item.i}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                    {item.q}
                  </h4>
                </div>

                <button
                  onClick={() => {
                    playClickSound();
                    setActiveQuestion(item);
                    setActiveBoxLevel(item.boxLevel);
                    setSelectedAnswer(null);
                    setShowExplanation(false);
                    setIsAnswerSubmitted(false);
                  }}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Practice</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
