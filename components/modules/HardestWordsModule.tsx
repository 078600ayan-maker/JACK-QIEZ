'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, ArrowRight, RotateCcw, Volume2, CheckCircle2, Lock, Flame } from 'lucide-react';
import { playClickSound, playCorrectSound, playMinecraftLevelUp } from '@/lib/audioEngine';

export interface HardWordItem {
  id: string;
  word: string;
  pronunciation: string;
  meaning_hindi: string;
  example: string;
  difficulty_level: 'Level 2 - Hard';
  audioHint?: string;
}

// 1. DATA PROCESSING (JSON STRUCTURE)
export const PART_2_HARDEST_WORDS: HardWordItem[] = [
  {
    id: 'hw_01',
    word: 'Ubiquitous',
    pronunciation: 'yoo-BIK-wih-tuhs (यू-बिक-वि-टस)',
    meaning_hindi: 'सर्वव्यापी / जो हर जगह मौजूद हो',
    example: 'Aaj kal smartphone har insaan ke haath mein ubiquitous ho chuka hai.',
    difficulty_level: 'Level 2 - Hard'
  },
  {
    id: 'hw_02',
    word: 'Cacophony',
    pronunciation: 'kuh-KOF-uh-nee (क-कॉफ़-नी)',
    meaning_hindi: 'कर्णकटु ध्वनि / कानों को चुभने वाला शोर',
    example: 'Market ki cacophony mein mujhe phone ki ring sunai hi nahi di.',
    difficulty_level: 'Level 2 - Hard'
  },
  {
    id: 'hw_03',
    word: 'Pernicious',
    pronunciation: 'per-NISH-uhs (पर-निश-स)',
    meaning_hindi: 'अत्यंत हानिकारक / घातक (अप्रत्यक्ष रूप से)',
    example: 'Late night phone scroll karne ki aadat health ke liye pernicious hoti hai.',
    difficulty_level: 'Level 2 - Hard'
  },
  {
    id: 'hw_04',
    word: 'Obfuscate',
    pronunciation: 'OB-fuh-skayt (ऑब-फस-केट)',
    meaning_hindi: 'अस्पष्ट करना / बात को जानबूझकर उलझाना',
    example: 'Sach ko obfuscate mat karo, seedhe-seedhe batao kya hua tha.',
    difficulty_level: 'Level 2 - Hard'
  },
  {
    id: 'hw_05',
    word: 'Ephemeral',
    pronunciation: 'ih-FEM-er-uhl (इ-फेम-रल)',
    meaning_hindi: 'क्षणिक / बहुत कम समय तक रहने वाला',
    example: 'Social media ka fame ephemeral hota hai, par knowledge permanent rehti hai.',
    difficulty_level: 'Level 2 - Hard'
  }
];

interface HardestWordsModuleProps {
  words?: HardWordItem[];
  onComplete?: (totalXpEarned: number) => void;
  onClose?: () => void;
}

export const HardestWordsModule: React.FC<HardestWordsModuleProps> = ({
  words = PART_2_HARDEST_WORDS,
  onComplete,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [earnedXp, setEarnedXp] = useState(0);
  const [showXpPopup, setShowXpPopup] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showIntroBanner, setShowIntroBanner] = useState(true);

  const currentWord = words[currentIndex];
  const progressPercent = Math.round(((currentIndex + (isRevealed ? 1 : 0)) / words.length) * 100);

  const handleReveal = () => {
    if (!isRevealed) {
      playCorrectSound();
      setIsRevealed(true);
      if (!revealedIds.includes(currentWord.id)) {
        setRevealedIds(prev => [...prev, currentWord.id]);
        setEarnedXp(prev => prev + 20);
        setShowXpPopup(true);
        setTimeout(() => setShowXpPopup(false), 1400);
      }
    }
  };

  const handleNextWord = () => {
    playClickSound();
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsRevealed(false);
    } else {
      playMinecraftLevelUp();
      setIsCompleted(true);
      if (onComplete) onComplete(earnedXp);
    }
  };

  const handlePronounce = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.rate = 0.85;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto min-h-[580px] bg-[#090D16] border border-white/10 rounded-3xl p-5 flex flex-col justify-between overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] select-none">
      {/* Background Neon Emerald Radial Glows */}
      <div className="absolute -top-16 -left-16 w-52 h-52 rounded-full bg-[#10B981]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-52 h-52 rounded-full bg-[#B6FF40]/10 blur-3xl pointer-events-none" />

      {/* Level-Up Intro Banner Overlay */}
      <AnimatePresence>
        {showIntroBanner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="absolute inset-0 z-50 bg-[#090D16]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#10B981] to-[#B6FF40] p-0.5 shadow-[0_0_25px_rgba(182,255,64,0.4)] flex items-center justify-center mb-4">
              <div className="w-full h-full bg-[#090D16] rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-[#B6FF40] animate-pulse" />
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 text-[10px] font-black uppercase tracking-widest text-[#B6FF40] mb-2">
              Vocabulary Expansion
            </span>

            <h2 className="text-2xl font-black text-white tracking-tight">
              Level 2 Unlocked
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-[260px] leading-relaxed">
              Master the top hardest words with correct pronunciation, Hindi meanings &amp; earn +20 XP per word.
            </p>

            <button
              onClick={() => { playClickSound(); setShowIntroBanner(false); }}
              className="mt-6 w-full max-w-[220px] py-3 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#34D399] hover:to-[#10B981] text-white font-black text-xs tracking-wide shadow-[0_4px_0_#064E3B] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Begin Challenge</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER: Progress Bar & Level Tag */}
      <div className="relative z-10 w-full space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#B6FF40] animate-ping" />
            <span className="font-black text-[#B6FF40] text-[11px] tracking-wider uppercase">
              Part 2: Hardest Words
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-400">
              {currentIndex + 1} / {words.length}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-black text-amber-400">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>+{earnedXp} XP</span>
            </span>
          </div>
        </div>

        {/* Neon Green Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-900 border border-white/10 overflow-hidden relative">
          <motion.div
            className="h-full bg-gradient-to-r from-[#059669] via-[#10B981] to-[#B6FF40] shadow-[0_0_12px_#B6FF40]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* MAIN CONTENT: Glassmorphic Word Card */}
      {!isCompleted ? (
        <div className="relative z-10 my-auto py-4">
          <motion.div
            key={currentWord.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            onClick={handleReveal}
            className={`
              relative w-full rounded-3xl p-6 text-center cursor-pointer transition-all duration-300
              backdrop-blur-2xl bg-[rgba(16,22,38,0.75)] border
              ${isRevealed 
                ? 'border-[#10B981]/50 shadow-[0_12px_36px_rgba(16,185,129,0.25),inset_0_0_20px_rgba(16,185,129,0.1)]' 
                : 'border-white/15 hover:border-white/30 shadow-[0_12px_36px_rgba(0,0,0,0.6)]'}
            `}
          >
            {/* XP Floating Badge Animation */}
            <AnimatePresence>
              {showXpPopup && (
                <motion.div
                  initial={{ opacity: 0, y: 0, scale: 0.5 }}
                  animate={{ opacity: 1, y: -45, scale: 1.2 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-[#B6FF40] text-slate-950 font-black text-xs shadow-[0_0_15px_#B6FF40] pointer-events-none z-30"
                >
                  ⚡ +20 XP EARNED!
                </motion.div>
              )}
            </AnimatePresence>

            {/* Word Badge */}
            <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[9px] font-black text-[#B6FF40] uppercase tracking-wider mb-3">
              <span>{currentWord.difficulty_level}</span>
            </div>

            {/* The Hard Word */}
            <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-md">
              {currentWord.word}
            </h3>

            {/* Pronunciation & Speaker Button */}
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="text-xs font-semibold text-emerald-300 tracking-wide">
                {currentWord.pronunciation}
              </span>
              <button
                onClick={handlePronounce}
                title="Listen to pronunciation"
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-200 transition-all active:scale-90"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#B6FF40]" />
              </button>
            </div>

            {/* Divider */}
            <div className="w-16 h-0.5 mx-auto bg-gradient-to-r from-transparent via-white/20 to-transparent my-4" />

            {/* REVEAL AREA (Hindi Meaning & Example) */}
            <div className="min-h-[110px] flex flex-col justify-center">
              {isRevealed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2 text-left bg-black/40 rounded-2xl p-3.5 border border-[#10B981]/30"
                >
                  <div>
                    <span className="text-[10px] font-black text-[#B6FF40] uppercase tracking-wider block">
                      हिंदी अर्थ:
                    </span>
                    <p className="text-sm font-bold text-white mt-0.5 leading-snug">
                      {currentWord.meaning_hindi}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      उदाहरण (Daily Example):
                    </span>
                    <p className="text-xs text-slate-300 italic mt-0.5 leading-relaxed">
                      &ldquo;{currentWord.example}&rdquo;
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="py-4 flex flex-col items-center justify-center gap-1.5 text-slate-400 group">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-[#B6FF40]/50 transition-all">
                    <Sparkles className="w-5 h-5 text-[#B6FF40]" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-300">
                    Tap card to reveal Hindi meaning &amp; earn +20 XP
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      ) : (
        /* VICTORY COMPLETION SCREEN */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 my-auto py-6 text-center space-y-4"
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-[#10B981] via-[#B6FF40] to-emerald-400 p-0.5 shadow-[0_0_35px_rgba(182,255,64,0.5)] flex items-center justify-center">
            <div className="w-full h-full bg-[#090D16] rounded-3xl flex items-center justify-center">
              <Trophy className="w-10 h-10 text-[#B6FF40]" />
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-black text-white">
              Part 2 Mastered!
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              You conquered all {words.length} hardest words and unlocked +{earnedXp} XP!
            </p>
          </div>

          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-left">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">XP Gained</span>
              <span className="text-base font-black text-[#B6FF40]">+{earnedXp} XP</span>
            </div>
            <div className="w-px h-7 bg-white/15" />
            <div className="text-left">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Accuracy</span>
              <span className="text-base font-black text-emerald-400">100%</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setIsRevealed(false);
                setIsCompleted(false);
              }}
              className="flex items-center justify-center gap-1.5 mx-auto text-xs font-bold text-slate-400 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Review Part 2 Words</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* BOTTOM CONTROLS & STATE LOCKING */}
      <div className="relative z-10 pt-2">
        {!isCompleted ? (
          <button
            onClick={handleNextWord}
            disabled={!isRevealed}
            className={`
              w-full py-3.5 px-4 rounded-2xl font-black text-xs tracking-wider uppercase transition-all duration-200
              flex items-center justify-center gap-2
              ${isRevealed
                ? 'bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#34D399] hover:to-[#10B981] text-white shadow-[0_4px_0_#064E3B] active:scale-95 cursor-pointer'
                : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'}
            `}
          >
            {isRevealed ? (
              <>
                <span>{currentIndex === words.length - 1 ? 'Finish Module' : 'Next Word'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Tap Card to Unlock Next</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onClose}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#B6FF40] to-[#10B981] hover:brightness-110 text-slate-950 font-black text-xs tracking-wider uppercase shadow-[0_4px_0_#065F46] active:scale-95"
          >
            Claim Rewards &amp; Continue
          </button>
        )}
      </div>
    </div>
  );
};
