'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Volume2, VolumeX, Sparkles, Flame, Eye, EyeOff, Music, HelpCircle, CheckCircle2, ChevronDown, RotateCcw, PhoneCall } from 'lucide-react';
import { useQuizStore } from '@/store/useQuizStore';
import { useUserStore } from '@/store/useUserStore';
import { CircularTimer } from './CircularTimer';
import { OptionBar } from './OptionBar';
import { ResultScreen } from './ResultScreen';
import { DuolingoOctopus3D, DuolingoEmotionState } from '@/components/mascot/DuolingoOctopus3D';
import { MinecraftAvatar3D } from '@/components/avatar/MinecraftAvatar3D';
import { AvatarAnimationState } from '@/types/avatar';
import { LiveCallModal } from '@/components/ai-calling/LiveCallModal';
import { BilingualLanguageToggle } from '@/components/ui/BilingualLanguageToggle';
import { fetchQuestionsByLanguage } from '@/lib/supabaseClient';
import { getQuestionsForLevel } from '@/lib/questionLoader';
import { getJackVoice } from '@/lib/jackVoiceSynthesizer';
import { getChapterPredictionProbability } from '@/lib/jacPredictiveEngine';
import {
  setSoundMuted,
  getSoundMuted,
  playClickSound,
  playCorrectSound,
  playWrongSound,
  triggerHapticTick,
  toggleLofiAmbient,
  isLofiAmbientPlaying
} from '@/lib/audioEngine';
import { recordSpacedMistake } from '@/lib/firestore';

export const QuizTheater: React.FC = () => {
  const router = useRouter();
  const quiz = useQuizStore();
  const user = useUserStore();

  const [isMuted, setIsMuted] = useState(false);
  const [isLofiOn, setIsLofiOn] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [avatarAnim, setAvatarAnim] = useState<AvatarAnimationState>('idle');
  const [avatarSpeech, setAvatarSpeech] = useState<string>('🤔 ध्यान से सोचो...');
  const [showExplanationDrawer, setShowExplanationDrawer] = useState(false);

  // Sound toggle
  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    setSoundMuted(next);
    getJackVoice().setMuted(next);
    playClickSound();
  };

  // Lo-Fi Ambient toggle
  const handleToggleLofi = () => {
    playClickSound();
    const playing = toggleLofiAmbient();
    setIsLofiOn(playing);
  };

  const userLang = user.profile?.languagePreference || 'hi';

  // Live dynamic language switch when user toggles [HINDI] / [ENGLISH] in Quiz Theater
  const prevLangRef = React.useRef(userLang);
  useEffect(() => {
    if (prevLangRef.current === userLang) return;
    prevLangRef.current = userLang;

    async function handleLanguageSwitch() {
      if (!quiz.subjectId || !quiz.chapterId) return;
      try {
        const chNumMatch = quiz.chapterId.match(/\d+/);
        const chNum = chNumMatch ? chNumMatch[0].padStart(2, '0') : '01';
        const refreshed = await fetchQuestionsByLanguage(quiz.subjectId, userLang, `ch_${chNum}`);
        if (refreshed && refreshed.length > 0) {
          const levelQ = getQuestionsForLevel(refreshed, quiz.level);
          quiz.updateQuestions(levelQ.length > 0 ? levelQ : refreshed);
        }
      } catch (err) {
        console.warn('Language switch fetch error:', err);
      }
    }

    handleLanguageSwitch();
  }, [userLang, quiz.subjectId, quiz.chapterId, quiz.level]);

  // Exit quiz
  const handleExit = () => {
    playClickSound();
    router.push('/path');
  };

  // Timer Tick
  useEffect(() => {
    if (!quiz.isTimerActive) return;
    const interval = setInterval(() => {
      quiz.tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [quiz]);

  // Sync to Firestore & Spaced Repetition on Finish
  useEffect(() => {
    if (quiz.isFinished && user.profile) {
      const accuracy = Math.round((quiz.scoreCount / Math.max(1, quiz.questions.length)) * 100);
      user.recordLevelCompletion({
        chId: quiz.chapterId,
        level: quiz.level,
        scorePercent: accuracy,
        earnedXp: quiz.earnedXp,
        newMistakeIds: quiz.mistakeIdsInSession,
        remainingHearts: quiz.hearts
      });
    }
  }, [quiz.isFinished]);

  // Handle Avatar Reactions on Answer Submission & Hinglish Motivational Speech
  useEffect(() => {
    if (quiz.isAnswerSubmitted) {
      if (quiz.isCorrect) {
        setAvatarAnim('cheer');
        setAvatarSpeech('🎉 शाबाश! बिल्कुल सही जवाब!');
        if (!isMuted) {
          if (quiz.comboStreak >= 3) {
            getJackVoice().cheerMotivational('streak');
          } else {
            getJackVoice().cheerMotivational('correct');
          }
        }
      } else {
        setAvatarAnim('cry');
        setAvatarSpeech('😢 कोई बात नहीं! Vault में सेव हो गया!');
        setShowExplanationDrawer(true);

        // Auto-save into Spaced Repetition engine
        const currentQ = quiz.questions[quiz.currentIndex];
        if (currentQ && user.profile) {
          recordSpacedMistake(user.profile.uid, {
            questionId: currentQ.i,
            subjectId: quiz.subjectId,
            chapterId: quiz.chapterId,
            questionText: currentQ.q,
            options: currentQ.o,
            correctAnswer: currentQ.a,
            userWrongAnswer: quiz.selectedOption ?? 0,
            explanation: currentQ.e || ''
          });
        }
      }
    } else {
      setAvatarAnim('idle');
      setAvatarSpeech('🤔 ध्यान से सोचो...');
      setShowExplanationDrawer(false);
    }
  }, [quiz.isAnswerSubmitted, quiz.isCorrect, quiz.currentIndex]);

  const currentQ = quiz.questions[quiz.currentIndex];
  const progressRatio = quiz.questions.length > 0
    ? (quiz.currentIndex / quiz.questions.length) * 100
    : 0;

  // Read question aloud strictly in selected language
  useEffect(() => {
    if (currentQ && !quiz.isAnswerSubmitted && !isMuted) {
      getJackVoice().speakQuestion(currentQ.q, user.profile?.languagePreference || 'hi');
    }
  }, [quiz.currentIndex, user.profile?.languagePreference, isMuted, currentQ]);

  const currentPrediction = getChapterPredictionProbability(
    quiz.subjectId,
    quiz.currentIndex + 1,
    2026
  );

  if (!currentQ && !quiz.isFinished) {
    return (
      <div className="flex items-center justify-center h-[100dvh] bg-[#090D16] text-white">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-400">Loading Quiz Theater...</p>
        </div>
      </div>
    );
  }

  if (quiz.isFinished) {
    return (
      <ResultScreen
        score={quiz.scoreCount}
        totalQuestions={quiz.questions.length}
        xpEarned={quiz.earnedXp}
        level={quiz.level}
        isBoss={quiz.isBossLevel}
        chapterName={quiz.chapterName || 'Chapter Quiz'}
        studentName={user.profile?.name || 'Scholar'}
        subjectTitle={quiz.subjectId.toUpperCase()}
        heartsRemaining={quiz.hearts}
        onContinue={() => router.push('/path')}
        onRetry={() => quiz.restartQuiz()}
      />
    );
  }

  return (
    <div className="relative flex flex-col justify-between h-[100dvh] max-h-[100dvh] bg-[#090D16] overflow-hidden select-none">
      {/* 1. TOP STATUS HUD (Can be hidden in Zen Mode) */}
      {!zenMode ? (
        <header className="px-4 pt-3 pb-1 shrink-0 z-30">
          <div className="flex items-center justify-between gap-3">
            {/* Close / Exit Button */}
            <button
              onClick={handleExit}
              aria-label="Exit Quiz"
              className="p-2 rounded-full bg-white/10 hover:bg-white/15 text-slate-300 active:scale-95 transition-all cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Liquid Progress Bar */}
            <div className="flex-1 relative h-3 rounded-full bg-slate-800/80 p-0.5 border border-white/10 overflow-visible">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#10B981] to-[#34D399] relative"
                initial={{ width: 0 }}
                animate={{ width: `${progressRatio}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              >
                <div className="absolute inset-x-0 top-0 h-[2px] bg-white/40 rounded-full" />
              </motion.div>
            </div>

            {/* Lo-Fi Ambient Engine Toggle */}
            <button
              onClick={handleToggleLofi}
              title="Lo-Fi Ambient Beats"
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isLofiOn
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                  : 'bg-white/10 border-white/10 text-slate-400'
              }`}
            >
              <Music className="w-4 h-4" />
            </button>

            {/* Zen Focus Mode Toggle */}
            <button
              onClick={() => {
                playClickSound();
                setZenMode(true);
              }}
              title="Zen Focus Mode"
              className="p-2 rounded-full bg-white/10 hover:bg-white/15 text-slate-300 active:scale-95 transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Hearts Display */}
            <div className="flex items-center gap-1 py-1 px-2.5 rounded-full bg-red-950/40 border border-red-500/30">
              <Heart className="w-4 h-4 text-[#EF4444] fill-[#EF4444] drop-shadow-[0_0_6px_#EF4444]" />
              <span className="text-xs font-black text-red-200">{quiz.hearts}</span>
            </div>
          </div>

          {/* Sub-Header: Circular Timer + Combo Streak + 50:50 */}
          <div className="flex items-center justify-between mt-2 px-1">
            <div>
              {quiz.initialTimerSeconds > 0 ? (
                <CircularTimer
                  secondsLeft={quiz.timerSeconds}
                  totalSeconds={quiz.initialTimerSeconds}
                />
              ) : (
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  Untimed Practice
                </span>
              )}
            </div>

            {/* Streak Combo Badge */}
            {quiz.comboStreak > 1 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1 py-0.5 px-2.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-bounce" />
                <span className="text-[11px] font-black text-amber-300">
                  {quiz.comboStreak}x COMBO
                </span>
              </motion.div>
            )}

            <div className="flex items-center gap-1.5">
              {/* Bilingual Switcher: [HINDI] / [ENGLISH] */}
              <BilingualLanguageToggle size="sm" />

              {/* Live Doubt Call with Delhi Study Buddy */}
              <button
                onClick={() => {
                  playClickSound();
                  setCallModalOpen(true);
                }}
                title="Ask Delhi Study Buddy for Hint"
                className="flex items-center gap-1 py-1 px-2.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-[10px] font-black transition-all cursor-pointer"
              >
                <PhoneCall className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Call Buddy</span>
              </button>

              {/* 50:50 Lifeline */}
              <button
                onClick={() => quiz.useFiftyFifty()}
                disabled={quiz.isAnswerSubmitted || quiz.eliminatedOptions.length > 0}
                className="flex items-center gap-1 py-1 px-2.5 rounded-full bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-400/30 disabled:opacity-40 transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-indigo-300" />
                <span className="text-[10px] font-black text-indigo-200">50:50</span>
              </button>
            </div>
          </div>
        </header>
      ) : (
        /* ZEN FOCUS MINIMAL HEADER */
        <header className="px-4 pt-3 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
              ZEN FOCUS MODE
            </span>
            {quiz.initialTimerSeconds > 0 && (
              <span className="text-xs font-mono font-bold text-white">
                {quiz.timerSeconds}s
              </span>
            )}
          </div>
          <button
            onClick={() => {
              playClickSound();
              setZenMode(false);
            }}
            className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white px-2 py-1 rounded-full bg-white/10"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Exit Zen</span>
          </button>
        </header>
      )}

      {/* 2. QUESTION & OPTIONS THEATER (ZERO SCROLL) */}
      <main className="flex-1 flex flex-col justify-center px-3 sm:px-4 py-1 z-20 overflow-hidden relative">
        {/* Floating 3D Duolingo Octopus Bot Companion (Zero Box, 100% Transparent Alpha) */}
        {!zenMode && (
          <div className="absolute top-0 right-1 sm:right-3 z-30 pointer-events-none select-none">
            <DuolingoOctopus3D
              emotion={
                !quiz.isAnswerSubmitted
                  ? 'thinking'
                  : quiz.isCorrect
                  ? quiz.comboStreak >= 3
                    ? 'streak'
                    : 'happy'
                  : 'sad'
              }
              streakCount={quiz.comboStreak}
              size={85}
              showBubble={false}
              interactive={false}
            />
          </div>
        )}

        {/* Question Glass Card */}
        <motion.div
          key={quiz.currentIndex}
          initial={{ opacity: 0, y: 15 }}
          animate={{
            opacity: 1,
            y: 0,
            x: quiz.isAnswerSubmitted && quiz.isCorrect === false ? [-10, 10, -6, 6, 0] : 0
          }}
          transition={{ duration: 0.25 }}
          className="relative max-w-xl mx-auto w-full rounded-2xl p-3 sm:p-4 md:p-5 bg-[rgba(30,41,59,0.7)] backdrop-blur-2xl border-t border-white/20 border-x border-b border-white/5 shadow-[0_12px_32px_rgba(0,0,0,0.5)] mb-2 sm:mb-3"
        >
          {/* Question Meta Header with 10-Year Teacher Predictive Probability */}
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#F59E0B]">
                Question {quiz.currentIndex + 1} of {quiz.questions.length}
              </span>
              <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[9px] font-black text-emerald-300">
                {currentPrediction.recommendationTag} ({currentPrediction.probabilityPercent}% Recurrence)
              </span>
            </div>

            {/* Visual Difficulty Dots */}
            <div className="flex items-center gap-1" title={`Difficulty Level ${currentQ?.d || 1}`}>
              {[1, 2, 3, 4, 5].map((dot) => (
                <div
                  key={dot}
                  className={`w-1.5 h-1.5 rounded-full ${
                    dot <= (currentQ?.d || 1)
                      ? 'bg-[#F59E0B] shadow-[0_0_4px_#F59E0B]'
                      : 'bg-white/15'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Question Text */}
          <h2 className="text-xs sm:text-sm md:text-base font-bold text-white tracking-wide leading-snug sm:leading-relaxed">
            {currentQ?.q}
          </h2>
        </motion.div>

        {/* 4 Full-Width Tactile Option Cards */}
        <div className="flex flex-col gap-2 sm:gap-2.5 max-w-xl mx-auto w-full">
          {currentQ?.o.map((optionText, index) => {
            const isEliminated = quiz.eliminatedOptions.includes(index);
            const isSelected = quiz.selectedOption === index;
            const isCorrectAnswer = index === currentQ.a;

            return (
              <OptionBar
                key={index}
                label={String.fromCharCode(65 + index)}
                text={optionText}
                index={index}
                isSelected={isSelected}
                isEliminated={isEliminated}
                isAnswerSubmitted={quiz.isAnswerSubmitted}
                isCorrectAnswer={isCorrectAnswer}
                onSelect={() => {
                  triggerHapticTick();
                  quiz.selectOption(index);
                }}
              />
            );
          })}
        </div>
      </main>

      {/* 3. POST-QUIZ REASONING & CHECK/NEXT FOOTER */}
      <footer className="px-3 sm:px-4 py-2 sm:py-3 shrink-0 z-30 border-t border-white/5 bg-[rgba(9,13,22,0.92)] backdrop-blur-xl">
        {/* Post-Quiz Reasoning Drawer (Shows on wrong answer or question clear) */}
        {showExplanationDrawer && currentQ && (
          <div className="max-w-xl mx-auto mb-2 p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-red-950/40 to-slate-900 border border-red-500/30 text-xs space-y-1 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-400 font-black uppercase text-[10px]">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>10-Year JAC Examiner Breakdown:</span>
              </div>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-500/30">
                Saved in Mistake Vault ✓
              </span>
            </div>
            <p className="text-slate-200 leading-relaxed font-medium text-[11px] sm:text-xs">{currentQ.e}</p>
          </div>
        )}

        <div className="max-w-xl mx-auto w-full flex items-center gap-2 sm:gap-3">
          {!quiz.isAnswerSubmitted ? (
            <button
              onClick={() => quiz.submitAnswer()}
              disabled={quiz.selectedOption === null}
              className={`w-full py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase transition-all shadow-[0_4px_0_#065F46] active:translate-y-0.5 active:shadow-[0_1px_0_#065F46] cursor-pointer ${
                quiz.selectedOption !== null
                  ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white hover:brightness-110 shadow-[0_4px_0_#065F46,0_0_16px_rgba(16,185,129,0.3)]'
                  : 'bg-white/10 border border-white/10 text-slate-500 opacity-50 cursor-not-allowed shadow-none'
              }`}
            >
              Check Answer (उत्तर जांचें)
            </button>
          ) : (
            <button
              onClick={() => quiz.nextQuestion()}
              className="w-full py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-[0_4px_0_#B45309,0_0_16px_rgba(245,158,11,0.4)] hover:brightness-110 active:translate-y-0.5 active:shadow-[0_1px_0_#B45309] transition-all cursor-pointer"
            >
              Continue (आगे बढ़ें) 🚀
            </button>
          )}
        </div>
      </footer>

      {/* Elsa-Style In-Quiz Live Doubt Calling Modal */}
      <LiveCallModal
        isOpen={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        studentName={user.profile?.name || 'Scholar'}
        currentSubject={quiz.chapterName || 'Class 10 JAC Board'}
      />
    </div>
  );
};
