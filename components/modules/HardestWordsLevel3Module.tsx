'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Trophy,
  ArrowRight,
  RotateCcw,
  Volume2,
  Lock,
  Flame,
  Bookmark,
  BookmarkCheck,
  AlertTriangle,
  Timer,
  Zap
} from 'lucide-react';
import {
  playClickSound,
  playCorrectSound,
  playMinecraftLevelUp,
  playTimerHeartbeat,
  playComboMultiplier
} from '@/lib/audioEngine';

export interface HardWordLevel3Item {
  id: string;
  word: string;
  pronunciation: string;
  meaning_hindi: string;
  example: string;
  difficulty_level: 'Level 3 - Extreme';
  funFact?: string;
}

// 1. DATA PROCESSING (JSON STRUCTURE FOR LEVEL 3 - EXTREME)
export const PART_3_HARDEST_WORDS: HardWordLevel3Item[] = [
  {
    id: 'hw_extreme_01',
    word: 'Schadenfreude',
    pronunciation: 'SHAH-duhn-froy-duh (शा-डन-फ्रॉय-ड)',
    meaning_hindi: 'दूसरों के दुर्भाग्य या असफलता पर मन ही मन होने वाला गुप्त आनंद',
    example: 'Jab rival team exam mein fail hui, toh Rahul ko schadenfreude mehsoos hua.',
    difficulty_level: 'Level 3 - Extreme',
    funFact: 'Yeh ek German word hai jiska English mein koi single-word direct replacement nahi hai.'
  },
  {
    id: 'hw_extreme_02',
    word: 'Sesquipedalian',
    pronunciation: 'ses-kwih-pih-DAY-lee-uhn (सेस-क्वि-पि-डे-लियन)',
    meaning_hindi: 'लंबे-लंबे, भारी-भरकम शब्दों का उपयोग करने वाला व्यक्ति या भाषा',
    example: 'Shashi Tharoor apni sesquipedalian vocabulary ke liye pure desh mein mashhoor hain.',
    difficulty_level: 'Level 3 - Extreme',
    funFact: 'Is shabd ka literal Latin arth hota hai "dedh foot lamba shabd" (a foot and a half long).'
  },
  {
    id: 'hw_extreme_03',
    word: 'Surreptitious',
    pronunciation: 'sur-uhp-TISH-uhs (सर-प-टि-शस)',
    meaning_hindi: 'चोरी-छिपे या गुप्त रूप से किया जाने वाला कार्य',
    example: 'Usne exam hall mein surreptitious tareeqe se cheat slip nikaal li.',
    difficulty_level: 'Level 3 - Extreme',
    funFact: 'Clandestine aur Furtive iske sabse popular synonyms hain.'
  },
  {
    id: 'hw_extreme_04',
    word: 'Supercilious',
    pronunciation: 'soo-per-SIL-ee-uhs (सू-पर-सि-ली-अस)',
    meaning_hindi: 'घमंडी / दूसरों को अपने से हीन या नीचा समझने वाला',
    example: 'Naye rich banne ke baad uska attitude kaafi supercilious ho gaya hai.',
    difficulty_level: 'Level 3 - Extreme',
    funFact: 'Yeh Latin word "supercilium" (eyebrow) se aaya hai — jab log ghamand se bhawein chadhate hain.'
  },
  {
    id: 'hw_extreme_05',
    word: 'Defenestration',
    pronunciation: 'dee-fen-uh-STRAY-shuhn (डी-फेन-स्ट्रे-शन)',
    meaning_hindi: 'किसी व्यक्ति या वस्तु को खिड़की से बाहर फेंकने का कृत्य',
    example: 'Gusse mein aakar usne apne phone ka defenestration kar diya!',
    difficulty_level: 'Level 3 - Extreme',
    funFact: 'Prague ke Itihaas mein rajnaitik virodhiyon ko sach mein khidki se bahar phenk diya gaya tha.'
  }
];

interface HardestWordsLevel3Props {
  words?: HardWordLevel3Item[];
  onComplete?: (totalXp: number, vaultSavedCount: number) => void;
  onClose?: () => void;
}

export const HardestWordsLevel3Module: React.FC<HardestWordsLevel3Props> = ({
  words = PART_3_HARDEST_WORDS,
  onComplete,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [vaultSavedIds, setVaultSavedIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sbr_mistake_vault');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // Gamification Metrics
  const [earnedXp, setEarnedXp] = useState(0);
  const [showXpPopup, setShowXpPopup] = useState<string | null>(null);
  const [multiplier, setMultiplier] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showIntroBanner, setShowIntroBanner] = useState(true);

  // 15s Countdown Timer per Card
  const CARD_TIME_LIMIT = 15;
  const [timeLeft, setTimeLeft] = useState(CARD_TIME_LIMIT);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentWord = words[currentIndex];
  const isVaulted = vaultSavedIds.includes(currentWord.id);
  const progressPercent = Math.round(((currentIndex + (isRevealed ? 1 : 0)) / words.length) * 100);

  // Timer Tick Logic
  useEffect(() => {
    if (showIntroBanner || isRevealed || isCompleted) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTimeLeft(CARD_TIME_LIMIT);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        if (prev <= 5) {
          playTimerHeartbeat();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isRevealed, showIntroBanner, isCompleted]);

  // Flip & Reveal Handler
  const handleReveal = () => {
    if (!isRevealed) {
      if (timerRef.current) clearInterval(timerRef.current);
      playCorrectSound();
      setIsRevealed(true);

      if (!revealedIds.includes(currentWord.id)) {
        setRevealedIds(prev => [...prev, currentWord.id]);

        // Speed Bonus Logic: If solved before 15s runs out
        const hasSpeedBonus = timeLeft > 5;
        const currentBonusMultiplier = hasSpeedBonus ? 2 : 1;
        const xpAwarded = 25 * currentBonusMultiplier;

        setMultiplier(currentBonusMultiplier);
        setEarnedXp(prev => prev + xpAwarded);

        if (hasSpeedBonus) {
          playComboMultiplier(2);
          setShowXpPopup(`⚡ 2X SPEED BONUS! +${xpAwarded} XP`);
        } else {
          setShowXpPopup(`+${xpAwarded} XP`);
        }

        setTimeout(() => setShowXpPopup(null), 1600);
      }
    }
  };

  // Mistake Vault / Hard Bookmark Persistence
  const handleToggleVault = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();

    let updated: string[];
    if (isVaulted) {
      updated = vaultSavedIds.filter(id => id !== currentWord.id);
    } else {
      updated = [...vaultSavedIds, currentWord.id];
    }

    setVaultSavedIds(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sbr_mistake_vault', JSON.stringify(updated));
        // Ready for Firebase Cloud Firestore sync
        const event = new CustomEvent('sbr_vault_updated', {
          detail: { word: currentWord, isSaved: !isVaulted }
        });
        window.dispatchEvent(event);
      } catch (err) {
        console.warn('Vault storage error:', err);
      }
    }
  };

  // Next Word Navigation
  const handleNextWord = () => {
    playClickSound();
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsRevealed(false);
    } else {
      playMinecraftLevelUp();
      setIsCompleted(true);
      if (onComplete) onComplete(earnedXp, vaultSavedIds.length);
    }
  };

  // Web Speech Pronunciation
  const handlePronounce = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.rate = 0.8;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto min-h-[620px] bg-[#050811] border border-red-500/20 rounded-3xl p-5 flex flex-col justify-between overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95)] select-none">
      {/* Background Extreme Ambient Glows (Neon Emerald + Pulsing Crimson Hazard) */}
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-red-600/15 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-[#10B981]/15 blur-3xl pointer-events-none" />

      {/* INTRO MODAL: Extreme Level 3 Warning Banner */}
      <AnimatePresence>
        {showIntroBanner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="absolute inset-0 z-50 bg-[#050811]/98 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 via-[#10B981] to-[#B6FF40] p-0.5 shadow-[0_0_30px_rgba(239,68,68,0.4)] flex items-center justify-center mb-3">
              <div className="w-full h-full bg-[#050811] rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-400 animate-bounce" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/70 border border-red-500/40 text-[10px] font-black uppercase tracking-widest text-red-300 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
              <span>Extreme Difficulty Alert</span>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight">
              Part 3: The Hardest Words
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 max-w-[280px] leading-relaxed">
              15-second speed reading challenge active! Flip before time runs out for a <strong className="text-[#B6FF40]">2X Streak Multiplier</strong>.
            </p>

            <button
              onClick={() => {
                playClickSound();
                setShowIntroBanner(false);
              }}
              className="mt-6 w-full max-w-[220px] py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs tracking-wider uppercase shadow-[0_4px_0_#881337] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Accept Challenge</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER: Speed Timer, Progress & Vault Counter */}
      <div className="relative z-10 w-full space-y-2">
        <div className="flex items-center justify-between text-xs">
          {/* Difficulty Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950/60 border border-red-500/40">
            <Zap className="w-3 h-3 text-[#B6FF40]" />
            <span className="font-black text-red-300 text-[10px] tracking-wider uppercase">
              Level 3 &bull; Extreme
            </span>
          </div>

          {/* Speed Countdown Timer */}
          <div
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border transition-all ${
              timeLeft <= 5
                ? 'bg-red-950/90 border-red-500 text-red-300 animate-pulse'
                : 'bg-white/5 border-white/10 text-slate-300'
            }`}
          >
            <Timer className="w-3 h-3 text-[#B6FF40]" />
            <span className="text-[11px] font-black">{timeLeft}s Speed Clock</span>
          </div>

          {/* Total Accumulated XP */}
          <div className="flex items-center gap-1 text-[11px] font-black text-amber-400">
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            <span>+{earnedXp} XP</span>
          </div>
        </div>

        {/* Neon Emerald Gradient Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-950 border border-white/10 overflow-hidden relative">
          <motion.div
            className="h-full bg-gradient-to-r from-red-600 via-[#10B981] to-[#B6FF40] shadow-[0_0_12px_#B6FF40]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* MAIN CARD: Heavy Dark Glassmorphism */}
      {!isCompleted ? (
        <div className="relative z-10 my-auto py-2">
          <motion.div
            key={currentWord.id}
            initial={{ opacity: 0, y: 14, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25 }}
            onClick={handleReveal}
            className={`
              relative w-full rounded-3xl p-6 text-center cursor-pointer transition-all duration-300
              backdrop-blur-[20px] bg-[rgba(10,15,28,0.85)] border
              ${
                isRevealed
                  ? 'border-[#10B981]/50 shadow-[0_16px_40px_rgba(16,185,129,0.25),inset_0_0_25px_rgba(16,185,129,0.12)]'
                  : 'border-white/15 hover:border-red-500/40 shadow-[0_16px_40px_rgba(0,0,0,0.8)]'
              }
            `}
          >
            {/* XP Multiplier Floating Popup */}
            <AnimatePresence>
              {showXpPopup && (
                <motion.div
                  initial={{ opacity: 0, y: 0, scale: 0.5 }}
                  animate={{ opacity: 1, y: -50, scale: 1.15 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-[#B6FF40] text-slate-950 font-black text-xs shadow-[0_0_20px_#B6FF40] pointer-events-none z-30 tracking-wide"
                >
                  {showXpPopup}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Top Toolbar inside Card: Index & Mistake Vault Button */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400">
                Word {currentIndex + 1} of {words.length}
              </span>

              {/* Mistake Vault Bookmark Button */}
              <button
                onClick={handleToggleVault}
                title={isVaulted ? 'Saved in Mistake Vault' : 'Save to Mistake Vault'}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black transition-all ${
                  isVaulted
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50'
                    : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                {isVaulted ? (
                  <>
                    <BookmarkCheck className="w-3 h-3 text-amber-400" />
                    <span>In Vault</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3 h-3" />
                    <span>Save to Vault</span>
                  </>
                )}
              </button>
            </div>

            {/* The Hard Word */}
            <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-lg mt-1">
              {currentWord.word}
            </h3>

            {/* Phonetic Pronunciation & Audio Synthesis */}
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="text-xs font-semibold text-emerald-300 tracking-wide">
                {currentWord.pronunciation}
              </span>
              <button
                onClick={handlePronounce}
                title="Pronounce word"
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-200 transition-all active:scale-90"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#B6FF40]" />
              </button>
            </div>

            <div className="w-20 h-0.5 mx-auto bg-gradient-to-r from-transparent via-red-500/40 to-transparent my-3.5" />

            {/* Reveal Content Area */}
            <div className="min-h-[125px] flex flex-col justify-center">
              {isRevealed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-2 text-left bg-black/60 rounded-2xl p-3.5 border border-[#10B981]/30 backdrop-blur-md"
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
                      उदाहरण (Relatable Example):
                    </span>
                    <p className="text-xs text-slate-300 italic mt-0.5 leading-relaxed">
                      &ldquo;{currentWord.example}&rdquo;
                    </p>
                  </div>

                  {currentWord.funFact && (
                    <div className="pt-1 border-t border-white/10">
                      <p className="text-[10.5px] text-amber-300 font-medium">
                        💡 <span className="font-bold">Fact:</span> {currentWord.funFact}
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="py-4 flex flex-col items-center justify-center gap-1.5 text-slate-400 group">
                  <div className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-red-500/50 transition-all">
                    <Sparkles className="w-5 h-5 text-[#B6FF40]" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-200">
                    Tap to reveal Hindi meaning &amp; claim XP
                  </span>
                  {timeLeft > 0 && (
                    <span className="text-[9.5px] text-[#B6FF40] font-semibold">
                      Flip within {timeLeft}s for 2X Speed Bonus
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      ) : (
        /* LEVEL 3 VICTORY COMPLETION SCREEN */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 my-auto py-6 text-center space-y-4"
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-red-600 via-[#B6FF40] to-emerald-400 p-0.5 shadow-[0_0_40px_rgba(182,255,64,0.6)] flex items-center justify-center">
            <div className="w-full h-full bg-[#050811] rounded-3xl flex items-center justify-center">
              <Trophy className="w-10 h-10 text-[#B6FF40]" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-red-950/80 border border-red-500/40 text-[9px] font-black text-red-300 uppercase tracking-wider mb-1">
              <span>Extreme Level Conquered</span>
            </div>
            <h3 className="text-2xl font-black text-white">
              Part 3 Mastered!
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-[280px] mx-auto">
              You conquered the hardest words in English and earned +{earnedXp} XP!
            </p>
          </div>

          {/* Stats Bar */}
          <div className="inline-flex items-center gap-4 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-left">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">XP Gained</span>
              <span className="text-base font-black text-[#B6FF40]">+{earnedXp} XP</span>
            </div>
            <div className="w-px h-7 bg-white/15" />
            <div className="text-left">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">In Vault</span>
              <span className="text-base font-black text-amber-400">{vaultSavedIds.length} Saved</span>
            </div>
          </div>

          <div className="pt-1">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setIsRevealed(false);
                setIsCompleted(false);
              }}
              className="flex items-center justify-center gap-1.5 mx-auto text-xs font-bold text-slate-400 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay Extreme Drill</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* BOTTOM CONTROLS & STRICT STATE LOCKING */}
      <div className="relative z-10 pt-2">
        {!isCompleted ? (
          <button
            onClick={handleNextWord}
            disabled={!isRevealed}
            className={`
              w-full py-3.5 px-4 rounded-2xl font-black text-xs tracking-wider uppercase transition-all duration-200
              flex items-center justify-center gap-2
              ${
                isRevealed
                  ? 'bg-gradient-to-r from-emerald-600 to-[#10B981] hover:brightness-110 text-white shadow-[0_4px_0_#065F46] active:scale-95 cursor-pointer'
                  : 'bg-white/5 border border-white/10 text-slate-600 cursor-not-allowed'
              }
            `}
          >
            {isRevealed ? (
              <>
                <span>{currentIndex === words.length - 1 ? 'Finish Extreme Module' : 'Next Extreme Word'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Interact with Card to Unlock</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onClose}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#B6FF40] via-[#10B981] to-emerald-500 hover:brightness-110 text-slate-950 font-black text-xs tracking-wider uppercase shadow-[0_4px_0_#065F46] active:scale-95"
          >
            Claim Rewards &amp; Unlock Part 4
          </button>
        )}
      </div>
    </div>
  );
};
