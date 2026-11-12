'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Flame, Trophy, CheckCircle2, AlertCircle, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { TactileButton } from '@/components/ui/TactileButton';
import { useUserStore } from '@/store/useUserStore';
import { playClickSound, playCorrectSound, playWrongSound, playVictorySound } from '@/lib/audioEngine';
import { getSubjectRandomDrillQuestions, DrillQuestionItem } from '@/lib/randomizerEngine';
import { syncSpeedDrillToFirebase } from '@/lib/firestore';

interface SpeedDrillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DRILL_SUBJECTS = [
  { id: 'sci', title: 'Science (विज्ञान)', desc: 'Physics • Chemistry • Biology', icon: '🔬', color: '#10B981', border: '#10B981' },
  { id: 'math', title: 'Mathematics (गणित)', desc: 'Algebra • Geometry • Trig', icon: '📐', color: '#3B82F6', border: '#3B82F6' },
  { id: 'sst', title: 'Social Science (SST)', desc: 'History • Geography • Civics • Eco', icon: '🌍', color: '#F59E0B', border: '#F59E0B' },
  { id: 'hin', title: 'Hindi (हिंदी)', desc: 'Kshitij • Kritika • Vyakaran', icon: '📖', color: '#EC4899', border: '#EC4899' },
  { id: 'eng', title: 'English (अंग्रेजी)', desc: 'First Flight • Footprints • Grammar', icon: '🔤', color: '#8B5CF6', border: '#8B5CF6' }
];

export const SpeedDrillModal: React.FC<SpeedDrillModalProps> = ({ isOpen, onClose }) => {
  const { profile } = useUserStore();

  const [selectedSubject, setSelectedSubject] = useState<typeof DRILL_SUBJECTS[0] | null>(null);
  const [questions, setQuestions] = useState<DrillQuestionItem[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [timeLeft, setTimeLeft] = useState(60);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isSyncingFirebase, setIsSyncingFirebase] = useState(false);

  // Reset state when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setSelectedSubject(null);
      setQuestions([]);
      setTimeLeft(60);
      setCurrentIndex(0);
      setScore(0);
      setStreak(0);
      setSelectedOption(null);
      setIsFinished(false);
      setIsSyncingFirebase(false);
    }
  }, [isOpen]);

  // Handle subject selection & question randomization
  const handleSelectSubject = async (sub: typeof DRILL_SUBJECTS[0]) => {
    playClickSound();
    setSelectedSubject(sub);
    setLoadingQuestions(true);

    try {
      const lang = profile?.languagePreference === 'en' ? 'en' : 'hi';
      const randomizedQs = await getSubjectRandomDrillQuestions(sub.id, 25, lang);
      setQuestions(randomizedQs);
      setTimeLeft(60);
      setCurrentIndex(0);
      setScore(0);
      setStreak(0);
      setSelectedOption(null);
    } catch (e) {
      console.error('Failed to load randomized questions:', e);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Finish Speed Drill & sync to Firebase
  const handleFinish = useCallback(async () => {
    setIsFinished(true);
    playVictorySound();

    if (!profile || !selectedSubject) return;

    setIsSyncingFirebase(true);
    const accuracy = questions.length > 0 ? Math.round((score / Math.max(1, currentIndex + 1)) * 100) : 0;
    const earnedXp = 50 + score * 15;

    try {
      await syncSpeedDrillToFirebase(profile.uid, {
        id: `drill_${Date.now()}`,
        timestamp: new Date().toISOString(),
        subjectId: selectedSubject.id,
        subjectTitle: selectedSubject.title,
        score,
        totalAnswered: currentIndex + 1,
        accuracy,
        earnedXp
      });
    } catch (err) {
      console.warn('Speed drill Firebase sync warning:', err);
    } finally {
      setIsSyncingFirebase(false);
    }
  }, [profile, selectedSubject, score, currentIndex, questions.length]);

  // 60-Second Countdown Timer
  useEffect(() => {
    if (!selectedSubject || questions.length === 0 || isFinished) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedSubject, questions.length, isFinished, handleFinish]);

  // Handle Option Click
  const handleAnswer = (optionIdx: number) => {
    if (selectedOption !== null || isFinished) return;
    setSelectedOption(optionIdx);

    const q = questions[currentIndex];
    const isCorrect = optionIdx === q.answer;

    if (isCorrect) {
      playCorrectSound();
      setScore(s => s + 1);
      setStreak(st => st + 1);
    } else {
      playWrongSound();
      setStreak(0);
    }

    // Auto-advance in 340ms for lightning rapid response
    setTimeout(() => {
      setSelectedOption(null);
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(i => i + 1);
      } else {
        handleFinish();
      }
    }, 340);
  };

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="relative w-full max-w-[460px] max-h-[90vh] rounded-3xl bg-gradient-to-b from-[#141E33] to-[#090D16] border-2 border-[#F59E0B]/50 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(245,158,11,0.2)] p-5 flex flex-col overflow-hidden"
        >
          {/* Top Modal Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-amber-500/20 text-[#F59E0B]">
                <Zap className="w-5 h-5 fill-[#F59E0B]" />
              </span>
              <div>
                <h3 className="text-sm font-black text-white tracking-wide uppercase">
                  60s Rapid Fire Speed Drill
                </h3>
                <span className="text-[10px] text-amber-400 font-bold">
                  {selectedSubject ? selectedSubject.title : 'Choose a Subject to Randomize'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* VIEW 1: 5-SUBJECT SELECTION */}
          {!selectedSubject ? (
            <div className="space-y-3 py-1">
              <div className="text-center pb-2">
                <span className="text-xs font-bold text-slate-300">
                  Select a Class 10 subject. Questions will be drawn 100% randomly from all chapters!
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {DRILL_SUBJECTS.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => handleSelectSubject(sub)}
                    className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.3)] group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl group-hover:scale-110 transition-transform">
                        {sub.icon}
                      </span>
                      <div className="text-left">
                        <h4 className="text-xs sm:text-sm font-black text-white">{sub.title}</h4>
                        <p className="text-[10px] text-slate-400">{sub.desc}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          ) : loadingQuestions ? (
            /* Loading Spinner */
            <div className="py-16 flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mb-3" />
              <span className="text-xs font-bold text-slate-300">
                Randomizing All Chapters from {selectedSubject.title}...
              </span>
            </div>
          ) : !isFinished ? (
            /* VIEW 2: ACTIVE 60S DRILL */
            <>
              {/* Dynamic HUD */}
              <div className="flex items-center justify-between mb-3 px-1">
                {/* Timer Capsule */}
                <div
                  className={`flex items-center gap-1 px-3 py-1 rounded-full border ${
                    timeLeft <= 10
                      ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  }`}
                >
                  <span className="text-xs font-mono font-black">{timeLeft}s</span>
                </div>

                {/* Fire Combo */}
                <div className="flex items-center gap-1 text-xs font-black text-orange-400">
                  <Flame className="w-4 h-4 fill-orange-400 animate-bounce" />
                  <span>{streak}x COMBO</span>
                </div>

                {/* Score */}
                <div className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  Score: {score}
                </div>
              </div>

              {/* Question Text */}
              <div className="min-h-[70px] mb-3 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center">
                <h4 className="text-sm sm:text-base font-black text-white leading-snug">
                  {currentQ?.question}
                </h4>
              </div>

              {/* 4 Tactile Option Keys */}
              <div className="grid grid-cols-1 gap-2 mb-2">
                {currentQ?.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.answer;

                  let btnStyle = 'bg-white/10 border-white/15 text-white hover:bg-white/15';
                  if (selectedOption !== null) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_15px_#10B981]';
                    } else if (isSelected) {
                      btnStyle = 'bg-red-600 border-red-400 text-white';
                    } else {
                      btnStyle = 'opacity-40 bg-white/5 border-transparent text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(idx)}
                      disabled={selectedOption !== null}
                      className={`
                        w-full p-2.5 rounded-2xl border text-left text-xs font-bold flex items-center justify-between
                        transition-all duration-150 active:scale-[0.98] shadow-[0_3px_0_rgba(0,0,0,0.4)] cursor-pointer
                        ${btnStyle}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-lg bg-black/40 flex items-center justify-center text-[10px] font-black text-slate-300">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {selectedOption !== null && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* VIEW 3: VICTORY & FIREBASE SYNC SUMMARY */
            <div className="py-4 text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-[0_0_30px_rgba(245,158,11,0.6)]">
                <div className="w-full h-full bg-[#090D16] rounded-2xl flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
                </div>
              </div>

              <h4 className="text-lg font-black text-white">SPEED DRILL COMPLETE!</h4>
              <p className="text-xs text-slate-300 mt-1">
                Subject: <span className="text-amber-400 font-bold">{selectedSubject.title}</span>
              </p>

              {/* Stats Box */}
              <div className="my-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-around">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">SCORE</span>
                  <span className="text-lg font-black text-white">{score} Qs</span>
                </div>
                <div className="w-[1px] h-8 bg-white/10" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">EARNED XP</span>
                  <span className="text-lg font-black text-amber-400">+{50 + score * 15} XP</span>
                </div>
                <div className="w-[1px] h-8 bg-white/10" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">FIREBASE SYNC</span>
                  <span className="text-xs font-black text-emerald-400">
                    {isSyncingFirebase ? 'Syncing...' : 'Synced ✓'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleSelectSubject(selectedSubject)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-black text-white flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Drill</span>
                </button>
                <button
                  onClick={() => {
                    playClickSound();
                    setSelectedSubject(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-black text-black cursor-pointer"
                >
                  Other Subjects
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
