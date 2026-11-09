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
  Crown,
  CheckCircle2,
  Zap,
  Timer,
  ShieldAlert
} from 'lucide-react';
import {
  playClickSound,
  playCorrectSound,
  playMinecraftLevelUp,
  playAvatarJump,
  playAvatarCheer,
  playTimerHeartbeat,
  playComboMultiplier,
  playOreUnlockFanfare
} from '@/lib/audioEngine';
import { getUserCurrentOreTier, getNextOreTier } from '@/types/ranking';

export interface HardWordLevel5EliteItem {
  id: string;
  word: string;
  pronunciation: string;
  meaning_hindi: string;
  example: string;
  difficulty_level: 'Level 5 - Elite Mastery';
  xp_reward: 100;
  is_vaulted: boolean;
  etymologyHint?: string;
}

// 1. DATA PROCESSING (JSON STRUCTURE FOR LEVEL 5 - ELITE MASTERY)
export const PART_5_HARDEST_WORDS: HardWordLevel5EliteItem[] = [
  {
    id: 'hw_elite_01',
    word: 'Ineffable',
    pronunciation: 'in-EF-uh-buhl (इन-एफ़-अ-बल)',
    meaning_hindi: 'अकथनीय / अवर्णनीय (जिसे शब्दों में बयां न किया जा सके)',
    example: 'Board exams mein 98% aane par jo khushi hui, woh sach mein ineffable thi!',
    difficulty_level: 'Level 5 - Elite Mastery',
    xp_reward: 100,
    is_vaulted: false,
    etymologyHint: 'Latin "ineffabilis" se bana hai — jiska arth hai jise bol kar vyakt na kiya ja sake.'
  },
  {
    id: 'hw_elite_02',
    word: 'Pusillanimous',
    pronunciation: 'pyoo-sih-LAN-ih-muhs (प्यू-सि-लैन-इ-मस)',
    meaning_hindi: 'कायर / डरपोक / साहस एवं आत्मविश्वास की कमी वाला',
    example: 'Tough maths numericals dekh kar pusillanimous mat bano, formula lagao aur solve karo!',
    difficulty_level: 'Level 5 - Elite Mastery',
    xp_reward: 100,
    is_vaulted: false,
    etymologyHint: 'Latin "pusillus" (chhota) + "animus" (atma/spirit) — arthath chhoti aatma wala.'
  },
  {
    id: 'hw_elite_03',
    word: 'Mellifluous',
    pronunciation: 'meh-LIF-loo-uhs (मे-लिफ-लू-अस)',
    meaning_hindi: 'अत्यंत मधुर / कानों में रस घोलने वाली सुरीली आवाज',
    example: 'Study karte waqt background mein bajne wala lo-fi music kitna mellifluous lagta hai.',
    difficulty_level: 'Level 5 - Elite Mastery',
    xp_reward: 100,
    is_vaulted: false,
    etymologyHint: 'Latin "mel" (honey/shahad) + "fluere" (to flow/bahna) — shahad ki tarah meetha.'
  },
  {
    id: 'hw_elite_04',
    word: 'Verisimilitude',
    pronunciation: 'vair-uh-sih-MIL-uh-tood (वेर-अ-सि-मिल-अ-ट्यूड)',
    meaning_hindi: 'यथार्थता / सत्यता का आभास (वास्तविक होने का सच्चा अनुभव)',
    example: 'Jack Board ke mock tests student ko final board exam hall ka poora verisimilitude dete hain.',
    difficulty_level: 'Level 5 - Elite Mastery',
    xp_reward: 100,
    is_vaulted: false,
    etymologyHint: 'Latin "verus" (true/satya) + "similis" (similar/samaan).'
  },
  {
    id: 'hw_elite_05',
    word: 'Serendipity',
    pronunciation: 'sair-uhn-DIP-ih-tee (सेर-न-डिप-इ-टी)',
    meaning_hindi: 'अप्रत्याशित सौभाग्य / अचानक अकारण ही कोई शुभ व मूल्यवान चीज मिल जाना',
    example: 'Subah revision mein dekha wahi question board exam mein 5-mark ka aana shuddh serendipity hai!',
    difficulty_level: 'Level 5 - Elite Mastery',
    xp_reward: 100,
    is_vaulted: false,
    etymologyHint: 'Persian katha "The Three Princes of Serendip" se nikla mashhoor shabdh.'
  }
];

export interface EliteSessionState {
  userId: string;
  totalXP: number;
  currentStreak: number;
  failedWords: HardWordLevel5EliteItem[];
  mistakeVault: HardWordLevel5EliteItem[];
  perfectStreakBonus: number;
  completedAt: string;
}

// 4. FIREBASE CLOUD FIRESTORE BATCH-WRITE HELPER
export async function syncToFirestore(userId: string, sessionData: EliteSessionState) {
  if (typeof window === 'undefined') return;
  try {
    const { doc, writeBatch, increment, arrayUnion } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase');

    const batch = writeBatch(db);
    const userRef = doc(db, 'users', userId);

    batch.update(userRef, {
      xp: increment(sessionData.totalXP),
      streak: increment(1),
      eliteLevel5Completed: true,
      mistakeVault: arrayUnion(...sessionData.mistakeVault),
      lastSessionSync: sessionData.completedAt
    });

    await batch.commit();
    console.log('✅ Firestore Batch Sync Successful for User:', userId);
  } catch (err) {
    console.warn('⚠️ Firestore Sync fallback to localStorage:', err);
    localStorage.setItem(`sbr_offline_sync_${userId}`, JSON.stringify(sessionData));
  }
}

interface HardestWordsLevel5EliteProps {
  words?: HardWordLevel5EliteItem[];
  currentStudentXp?: number;
  currentStreak?: number;
  userId?: string;
  onComplete?: (sessionData: EliteSessionState) => void;
  onClose?: () => void;
}

export const HardestWordsLevel5EliteModule: React.FC<HardestWordsLevel5EliteProps> = ({
  words = PART_5_HARDEST_WORDS,
  currentStudentXp = 2500,
  currentStreak = 7,
  userId = 'scholar_jack_01',
  onComplete,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [avatarSpinning, setAvatarSpinning] = useState(false);

  // 10-Second Countdown Speed Ring
  const COUNTDOWN_TOTAL = 10;
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_TOTAL);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Gamification & Session State
  const [accumulatedSessionXp, setAccumulatedSessionXp] = useState(0);
  const [perfectBonusCount, setPerfectBonusCount] = useState(0);
  const [floatingBonusText, setFloatingBonusText] = useState<string | null>(null);
  const [isMastered, setIsMastered] = useState(false);
  const [showIntroBanner, setShowIntroBanner] = useState(true);

  // 3D Card Hover Perspective coordinates
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Mistake Vault Collection
  const [vaultCollection, setVaultCollection] = useState<HardWordLevel5EliteItem[]>([]);
  const [failedWords, setFailedWords] = useState<HardWordLevel5EliteItem[]>([]);

  const currentWord = words[currentIndex];
  const isVaulted = vaultCollection.some(w => w.id === currentWord.id);
  const progressPercent = Math.round(((currentIndex + (isAcknowledged ? 1 : 0)) / words.length) * 100);

  // Dynamic 15-Tier XP Ring
  const runningTotalXp = currentStudentXp + accumulatedSessionXp;
  const currentOre = getUserCurrentOreTier(runningTotalXp);
  const nextOre = getNextOreTier(runningTotalXp);
  const tierProgressPercent = Math.min(
    100,
    Math.round(((runningTotalXp - currentOre.minXp) / ((nextOre?.minXp || currentOre.minXp + 5000) - currentOre.minXp)) * 100)
  );

  // Timer Tick Logic (10s countdown ring)
  useEffect(() => {
    if (showIntroBanner || isRevealed || isMastered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTimeLeft(COUNTDOWN_TOTAL);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          // Auto-route to Mistake Vault if countdown expires
          handleAutoVaultTimeout();
          return 0;
        }
        if (prev <= 4) playTimerHeartbeat();
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isRevealed, showIntroBanner, isMastered]);

  // Timeout auto-vault handler
  const handleAutoVaultTimeout = () => {
    if (!vaultCollection.some(w => w.id === currentWord.id)) {
      setVaultCollection(prev => [...prev, { ...currentWord, is_vaulted: true }]);
      setFailedWords(prev => [...prev, currentWord]);
    }
  };

  // Card 3D Hover Tilt Physics
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Step 1: Reveal Meaning with Perfect Streak Multiplier
  const handleReveal = () => {
    if (!isRevealed) {
      if (timerRef.current) clearInterval(timerRef.current);
      playCorrectSound();
      setIsRevealed(true);

      // Speed & Accuracy Multiplier Check (within 5 seconds)
      const achievedSpeedMultiplier = timeLeft >= 5;
      const baseReward = currentWord.xp_reward;
      const bonus = achievedSpeedMultiplier ? 50 : 0;
      const totalReward = baseReward + bonus;

      if (!revealedIds.includes(currentWord.id)) {
        setRevealedIds(prev => [...prev, currentWord.id]);
        setAccumulatedSessionXp(prev => prev + totalReward);

        if (achievedSpeedMultiplier) {
          playComboMultiplier(3);
          setPerfectBonusCount(prev => prev + 1);
          setFloatingBonusText(`⚡ PERFECT STREAK! +${totalReward} XP`);
        } else {
          setFloatingBonusText(`+${totalReward} XP`);
        }

        setTimeout(() => setFloatingBonusText(null), 1800);
      }
    }
  };

  // Step 2: Acknowledge & 3D Avatar Glow-up / Spin Trigger
  const handleAcknowledge = () => {
    if (!isAcknowledged) {
      playAvatarJump();
      playAvatarCheer();
      setIsAcknowledged(true);

      // Trigger 360-degree CSS 3D avatar spin & particle glow
      setAvatarSpinning(true);
      setTimeout(() => setAvatarSpinning(false), 1200);
    }
  };

  // Manual Mistake Vault Bookmark Toggle
  const handleToggleVault = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();

    if (isVaulted) {
      setVaultCollection(prev => prev.filter(w => w.id !== currentWord.id));
    } else {
      setVaultCollection(prev => [...prev, { ...currentWord, is_vaulted: true }]);
    }
  };

  // Step 3: Advance to Next Elite Word
  const handleNextWord = () => {
    playClickSound();
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsRevealed(false);
      setIsAcknowledged(false);
    } else {
      playOreUnlockFanfare();
      setIsMastered(true);

      const sessionData: EliteSessionState = {
        userId,
        totalXP: accumulatedSessionXp,
        currentStreak: currentStreak + 1,
        failedWords,
        mistakeVault: vaultCollection,
        perfectStreakBonus: perfectBonusCount * 50,
        completedAt: new Date().toISOString()
      };

      syncToFirestore(userId, sessionData);
      if (onComplete) onComplete(sessionData);
    }
  };

  const handlePronounce = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.rate = 0.75;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto min-h-[660px] bg-[#03060E] border-2 border-[#10B981]/50 rounded-3xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-[0_0_60px_rgba(16,185,129,0.2)] select-none">
      {/* Background Deep Space Glowing Orbs */}
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#059669]/20 blur-[90px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[#B6FF40]/20 blur-[100px] pointer-events-none" />

      {/* INTRO BANNER: Elite Mastery */}
      <AnimatePresence>
        {showIntroBanner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="absolute inset-0 z-50 bg-[#03060E]/98 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#059669] via-[#10B981] to-[#B6FF40] p-1 shadow-[0_0_40px_rgba(182,255,64,0.5)] flex items-center justify-center mb-4">
              <div className="w-full h-full bg-[#03060E] rounded-[22px] flex items-center justify-center">
                <Crown className="w-10 h-10 text-[#B6FF40] animate-bounce" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#10B981]/20 border border-[#B6FF40]/50 text-[10px] font-black uppercase tracking-widest text-[#B6FF40] mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#B6FF40]" />
              <span>Elite Mastery Phase &bull; Class 9 &amp; 10</span>
            </div>

            <h2 className="text-3xl font-black text-white tracking-tight">
              Part 5: Elite Vocabulary
            </h2>
            <p className="text-xs text-slate-300 mt-2 max-w-[320px] leading-relaxed">
              Earn <strong className="text-[#B6FF40]">+100 XP per word</strong>. Complete within 5 seconds for the <span className="text-amber-400 font-bold">Perfect Streak +50 XP Multiplier</span>!
            </p>

            <button
              onClick={() => { playClickSound(); setShowIntroBanner(false); }}
              className="mt-6 w-full max-w-[240px] py-3.5 rounded-2xl bg-gradient-to-r from-[#10B981] via-[#B6FF40] to-emerald-400 text-slate-950 font-black text-xs tracking-wider uppercase shadow-[0_4px_0_#064E3B] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Commence Elite Drill</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER: 15-Tier Dynamic Progress Ring & Stats */}
      <div className="relative z-10 w-full space-y-2">
        <div className="flex items-center justify-between text-xs">
          {/* Dynamic Circular SVG Progress Ring */}
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/10"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#B6FF40]"
                  strokeDasharray={`${tierProgressPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[10px] font-black text-[#B6FF40]">
                {tierProgressPercent}%
              </span>
            </div>

            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Rank Ascension ({currentOre.name})
              </span>
              <span className="text-xs font-black text-white">
                Next: <span className="text-[#B6FF40]">{nextOre?.name || 'Max Tier'}</span>
              </span>
            </div>
          </div>

          {/* 10s Countdown Clock Badge */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
                timeLeft <= 4
                  ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse'
                  : 'bg-white/5 border-white/10 text-slate-300'
              }`}
            >
              <Timer className="w-3.5 h-3.5 text-[#B6FF40]" />
              <span className="text-xs font-black">{timeLeft}s Speed Ring</span>
            </div>

            <span className="text-xs font-black text-amber-400 flex items-center gap-1">
              <Flame className="w-4 h-4 fill-amber-400" />
              {runningTotalXp} XP
            </span>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-950 border border-white/10 overflow-hidden relative">
          <motion.div
            className="h-full bg-gradient-to-r from-[#059669] via-[#10B981] to-[#B6FF40] shadow-[0_0_15px_#B6FF40]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* CENTER: 3D AVATAR STAGE + CSS 3D TILT FLASHCARD */}
      {!isMastered ? (
        <div className="relative z-10 my-auto py-2 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* THREE.JS / CSS 3D STUDY BUDDY AVATAR CONTAINER (4 Cols on MD) */}
          <div className="md:col-span-4 flex flex-row md:flex-col items-center justify-between md:justify-center p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            {/* 3D Animated Avatar Box with 360 Spin */}
            <div
              className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#059669] to-[#B6FF40] p-1 flex items-center justify-center shadow-[0_0_25px_rgba(182,255,64,0.35)] transition-transform duration-1000 ${
                avatarSpinning ? 'rotate-[360deg] scale-110' : ''
              }`}
            >
              <div className="w-full h-full bg-[#03060E] rounded-xl flex items-center justify-center text-4xl">
                {avatarSpinning ? '🌟' : isAcknowledged ? '👑' : isRevealed ? '💡' : '🤖'}
              </div>
            </div>

            <div className="text-left md:text-center mt-0 md:mt-2">
              <span className="text-[11px] font-black text-white block">
                Jack Genie (Buddy)
              </span>
              <span className="text-[9px] text-[#B6FF40] font-bold block">
                {avatarSpinning ? '360° Glow-Up Active!' : isAcknowledged ? 'Word Mastered!' : 'Listening closely...'}
              </span>
            </div>

            <div className="mt-0 md:mt-2 px-2.5 py-0.5 rounded-full bg-[#B6FF40]/10 border border-[#B6FF40]/30 text-[9px] font-black text-[#B6FF40]">
              +100 XP Elite
            </div>
          </div>

          {/* ULTRA-FROSTED GLASS CARD WITH 3D CSS PERSPECTIVE TILT (8 Cols on MD) */}
          <div className="md:col-span-8 perspective-1000">
            <motion.div
              key={currentWord.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `perspective(1000px) rotateX(${mousePos.y}deg) rotateY(${mousePos.x}deg)`,
                backdropFilter: 'blur(30px)',
                background: 'rgba(16, 185, 129, 0.05)'
              }}
              className={`
                relative w-full rounded-3xl p-5 sm:p-6 text-center transition-all duration-200 border
                ${isAcknowledged
                  ? 'border-[#B6FF40] shadow-[0_0_35px_rgba(182,255,64,0.35),inset_0_0_20px_rgba(182,255,64,0.15)]'
                  : 'border-[#B6FF40]/40 shadow-[0_20px_50px_rgba(0,0,0,0.85)]'}
              `}
            >
              {/* Floating Multiplier Popup */}
              <AnimatePresence>
                {floatingBonusText && (
                  <motion.div
                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                    animate={{ opacity: 1, y: -50, scale: 1.15 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#B6FF40] to-[#10B981] text-slate-950 font-black text-xs shadow-[0_0_25px_#B6FF40] pointer-events-none z-30"
                  >
                    {floatingBonusText}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Index & Mistake Vault Bookmark Button */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400">
                  Elite Word {currentIndex + 1} of {words.length}
                </span>

                <button
                  onClick={handleToggleVault}
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
                      <span>Mark Hard</span>
                    </>
                  )}
                </button>
              </div>

              {/* The Hard Word with Neon Pop Text-Shadow */}
              <h3
                style={{ textShadow: '0 0 20px rgba(182,255,64,0.4), 0 2px 4px rgba(0,0,0,0.8)' }}
                className="text-2xl sm:text-3xl font-black text-white tracking-tight break-words"
              >
                {currentWord.word}
              </h3>

              {/* Pronunciation & Voice Trigger */}
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

              <div className="w-20 h-0.5 mx-auto bg-gradient-to-r from-transparent via-[#B6FF40]/40 to-transparent my-3.5" />

              {/* TWO-STEP REVEAL & ACKNOWLEDGE AREA */}
              <div className="min-h-[140px] flex flex-col justify-center">
                {isRevealed ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-2 text-left bg-black/60 rounded-2xl p-4 border border-[#B6FF40]/30 backdrop-blur-md"
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
                        छात्र-जीवन उदाहरण:
                      </span>
                      <p className="text-xs text-slate-300 italic mt-0.5 leading-relaxed">
                        &ldquo;{currentWord.example}&rdquo;
                      </p>
                    </div>

                    {currentWord.etymologyHint && (
                      <div className="pt-1 border-t border-white/10">
                        <p className="text-[10.5px] text-amber-300 font-medium">
                          📜 <span className="font-bold">Etymology:</span> {currentWord.etymologyHint}
                        </p>
                      </div>
                    )}

                    {!isAcknowledged && (
                      <button
                        onClick={handleAcknowledge}
                        className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#B6FF40] to-[#10B981] hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_3px_0_#065F46] flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4 text-slate-950" />
                        <span>Acknowledge &amp; Trigger Avatar Spin</span>
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <button
                    onClick={handleReveal}
                    className="py-5 px-4 rounded-2xl bg-white/5 border border-white/15 hover:border-[#B6FF40]/50 flex flex-col items-center justify-center gap-2 group transition-all"
                  >
                    <div className="w-11 h-11 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center group-hover:scale-110 group-hover:border-[#B6FF40] transition-all">
                      <Sparkles className="w-5 h-5 text-[#B6FF40]" />
                    </div>
                    <span className="text-xs font-black text-slate-200">
                      Step 1: Tap to Reveal Hindi Meaning
                    </span>
                    {timeLeft >= 5 && (
                      <span className="text-[10px] text-[#B6FF40] font-bold">
                        ⚡ Flip within {timeLeft - 5}s for Perfect Streak (+50 XP)
                      </span>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        /* LEVEL 5 ELITE VICTORY SCREEN */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 my-auto py-6 text-center space-y-4"
        >
          <div className="w-22 h-22 mx-auto rounded-3xl bg-gradient-to-tr from-[#059669] via-[#B6FF40] to-amber-300 p-1 shadow-[0_0_50px_rgba(182,255,64,0.6)] flex items-center justify-center">
            <div className="w-full h-full bg-[#03060E] rounded-[22px] flex items-center justify-center">
              <Trophy className="w-12 h-12 text-[#B6FF40] animate-bounce" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B6FF40]/15 border border-[#B6FF40]/40 text-[10px] font-black text-[#B6FF40] uppercase tracking-widest mb-1.5">
              <span>🌟 Elite Mastery Achieved!</span>
            </div>
            <h3 className="text-3xl font-black text-white">Part 5 Conquered</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-[300px] mx-auto">
              You mastered the hardest vocabulary tier, earned <strong className="text-[#B6FF40]">+{accumulatedSessionXp} Elite XP</strong>, and prepared your sync with Firebase Firestore!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 max-w-[360px] mx-auto text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total XP Gained</span>
              <span className="text-xs font-black text-[#B6FF40]">+{accumulatedSessionXp} XP</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Perfect Speed Bonuses</span>
              <span className="text-xs font-black text-amber-400">{perfectBonusCount} Multipliers</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Saved in Mistake Vault</span>
              <span className="text-xs font-bold text-white">{vaultCollection.length} Words</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* STRICT STATE LOCKING NEXT BUTTON */}
      <div className="relative z-10 pt-2">
        {!isMastered ? (
          <button
            onClick={handleNextWord}
            disabled={!isAcknowledged}
            className={`
              w-full py-3.5 px-4 rounded-2xl font-black text-xs tracking-wider uppercase transition-all duration-200
              flex items-center justify-center gap-2
              ${isAcknowledged
                ? 'bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#34D399] hover:to-[#10B981] text-white shadow-[0_4px_0_#064E3B] active:scale-95 cursor-pointer'
                : 'bg-white/5 border border-white/10 text-slate-600 cursor-not-allowed'}
            `}
          >
            {isAcknowledged ? (
              <>
                <span>{currentIndex === words.length - 1 ? 'Complete Elite Module' : 'Next Elite Word'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Reveal &amp; Acknowledge to Unlock Next</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onClose}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#B6FF40] via-[#10B981] to-emerald-400 hover:brightness-110 text-slate-950 font-black text-xs tracking-wider uppercase shadow-[0_4px_0_#064E3B] active:scale-95"
          >
            Sync to Firestore &amp; Unlock Grand Finale (Part 6)
          </button>
        )}
      </div>
    </div>
  );
};
