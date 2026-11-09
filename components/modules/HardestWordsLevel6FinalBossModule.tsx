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
  Share2,
  ExternalLink,
  Zap,
  Timer,
  AlertOctagon
} from 'lucide-react';
import {
  playClickSound,
  playCorrectSound,
  playMinecraftLevelUp,
  playAvatarJump,
  playAvatarCheer,
  playTimerHeartbeat,
  playComboMultiplier,
  playOreUnlockFanfare,
  playTrophyCelebration
} from '@/lib/audioEngine';
import { getUserCurrentOreTier, ORE_TIERS } from '@/types/ranking';

export interface HardWordLevel6BossItem {
  id: string;
  word: string;
  pronunciation: string;
  meaning_hindi: string;
  example: string;
  difficulty_level: 'Level 6 - Ultimate Boss';
  xp_reward: 200;
  is_vaulted?: boolean;
  funTrivia?: string;
}

// 1. DATA PROCESSING (JSON STRUCTURE FOR LEVEL 6 - ULTIMATE BOSS)
export const PART_6_HARDEST_WORDS: HardWordLevel6BossItem[] = [
  {
    id: 'hw_boss_final_01',
    word: 'Floccinaucinihilipilification',
    pronunciation: 'flok-si-naw-si-ny-hil-i-pil-i-fi-KAY-shuhn (फ़्लोक्सी-नॉसी-निहिली-पिलि-फिके-शन)',
    meaning_hindi: 'किसी भी वस्तु, विचार या प्रयास को पूरी तरह व्यर्थ अथवा महत्वहीन समझने की आदत',
    example: 'Padhai ko lekar aisi floccinaucinihilipilification chhod do, Class 10 Board exam paas hain!',
    difficulty_level: 'Level 6 - Ultimate Boss',
    xp_reward: 200,
    funTrivia: '29 अक्षरों का यह शब्द 4 लैटिन शब्दों (flocci, nauci, nihili, pili) से मिलकर बना है, जिनका अर्थ होता है "तिनके बराबर"!'
  },
  {
    id: 'hw_boss_final_02',
    word: 'Pneumonoultramicroscopicsilicovolcanoconiosis',
    pronunciation: 'nyoo-muh-noh-ul-truh-my-kruh-SKOP-ik-SIL-ih-koh-vol-KAY-noh-koh-nee-OH-sis (न्यूमोनो-अल्ट्रा-माइक्रोस्कोपिक-सिलिको-वॉल्केनो-कोनियोसिस)',
    meaning_hindi: 'ज्वालामुखीय राख और अति-सूक्ष्म सिलिका कणों के फेफड़ों में जाने से होने वाली बीमारी',
    example: 'Mining areas mein bina safety mask kaam karne se yeh bimari ho sakti hai.',
    difficulty_level: 'Level 6 - Ultimate Boss',
    xp_reward: 200,
    funTrivia: '45 अक्षरों का यह शब्द इंग्लिश डिक्शनरी का सबसे लंबा औपचारिक शब्द माना जाता है!'
  },
  {
    id: 'hw_boss_final_03',
    word: 'Circumlocution',
    pronunciation: 'sur-kuhm-loh-KYOO-shuhn (सर-कम-लो-क्यू-शन)',
    meaning_hindi: 'बात को सीधे न कहकर जलेबी की तरह घुमा-फिराकर या अप्रत्यक्ष रूप से कहना',
    example: 'Answer sheet mein circumlocution mat karo, point-to-point sidha answer likho taaki full marks milein.',
    difficulty_level: 'Level 6 - Ultimate Boss',
    xp_reward: 200,
    funTrivia: 'Latin "circum" (around) + "loqui" (to speak) se bana hai.'
  },
  {
    id: 'hw_boss_final_04',
    word: 'Pseudopseudohypoparathyroidism',
    pronunciation: 'soo-doh-soo-doh-hy-poh-pair-uh-THY-royd-iz-uhm (स्यूडो-स्यूडो-हाइपो-पैरा-थायराइडिज़म)',
    meaning_hindi: 'एक दुर्लभ अनुवांशिक विकार जिसमें शारीरिक लक्षण तो होते हैं पर कैल्शियम का स्तर सामान्य रहता है',
    example: 'Medical science ke sabse lambe technical shabdon mein iska naam liya jaata hai.',
    difficulty_level: 'Level 6 - Ultimate Boss',
    xp_reward: 200,
    funTrivia: '30 अक्षरों का यह मेडिकल शब्द साइंस क्विज़ में अक्सर पूछा जाता है.'
  },
  {
    id: 'hw_boss_final_05',
    word: 'Sesquipedalianism',
    pronunciation: 'ses-kwih-pih-DAY-lee-uh-niz-uhm (सेस-क्वि-पि-डे-लियनिज्म)',
    meaning_hindi: 'बातचीत या लेखन में बहुत लंबे और भारी-भरकम शब्दों का अत्यधिक उपयोग करने की शैली',
    example: 'Jack Board ke Part 6 ko clear karne ke baad tumhara sesquipedalianism level 100 ho chuka hai!',
    difficulty_level: 'Level 6 - Ultimate Boss',
    xp_reward: 200,
    funTrivia: 'Roman kavi Horace ne sabse pehle is shabdh ka upyog vyangya ke roop mein kiya tha.'
  }
];

export interface FinalBossCompletionPayload {
  userId: string;
  totalXP: number;
  currentStreak: number;
  mistakeVault: HardWordLevel6BossItem[];
  achievedTier: string;
  completedAt: string;
}

// 5. FIREBASE BACKEND SYNC FUNCTION
export async function syncToFirestore(payload: FinalBossCompletionPayload) {
  if (typeof window === 'undefined') return;
  try {
    const { doc, writeBatch, increment, arrayUnion } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase');

    const batch = writeBatch(db);
    const userRef = doc(db, 'users', payload.userId);

    batch.update(userRef, {
      xp: increment(payload.totalXP),
      streak: increment(1),
      tier15Unlocked: true,
      currentTierId: 'bedrock_scholar_tier15',
      mistakeVault: arrayUnion(...payload.mistakeVault),
      ultimateBossCompletedAt: payload.completedAt
    });

    await batch.commit();
    console.log('🏆 Ultimate Boss Grand Finale committed to Firestore!');
  } catch (err) {
    console.warn('⚠️ Firestore Sync fallback to local storage:', err);
    localStorage.setItem(`sbr_ultimate_boss_${payload.userId}`, JSON.stringify(payload));
  }
}

interface HardestWordsLevel6FinalBossProps {
  words?: HardWordLevel6BossItem[];
  currentStudentXp?: number;
  currentStreak?: number;
  userId?: string;
  appUrl?: string;
  onComplete?: (payload: FinalBossCompletionPayload) => void;
  onClose?: () => void;
}

export const HardestWordsLevel6FinalBossModule: React.FC<HardestWordsLevel6FinalBossProps> = ({
  words = PART_6_HARDEST_WORDS,
  currentStudentXp = 5000,
  currentStreak = 14,
  userId = 'scholar_ayan_01',
  appUrl = 'https://jackquiz.com',
  onComplete,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [avatarVictorySpin, setAvatarVictorySpin] = useState(false);

  // No-Mercy 10-Second Countdown Timer
  const COUNTDOWN_SECONDS = 10;
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_SECONDS);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Gamification Metrics
  const [accumulatedBossXp, setAccumulatedBossXp] = useState(0);
  const [showXpPopup, setShowXpPopup] = useState<string | null>(null);
  const [isGrandFinaleConquered, setIsGrandFinaleConquered] = useState(false);
  const [showIntroBanner, setShowIntroBanner] = useState(true);

  // Mistake Vault Collection
  const [mistakeVault, setMistakeVault] = useState<HardWordLevel6BossItem[]>([]);

  const currentWord = words[currentIndex];
  const isVaulted = mistakeVault.some(w => w.id === currentWord.id);
  const progressPercent = Math.round(((currentIndex + (isAcknowledged ? 1 : 0)) / words.length) * 100);

  const finalTotalXp = currentStudentXp + accumulatedBossXp;

  // Countdown timer logic
  useEffect(() => {
    if (showIntroBanner || isRevealed || isGrandFinaleConquered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTimeLeft(COUNTDOWN_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeoutNoMercy();
          return 0;
        }
        if (prev <= 4) playTimerHeartbeat();
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isRevealed, showIntroBanner, isGrandFinaleConquered]);

  // No-Mercy Timeout: Automatically routes to Mistake Vault
  const handleTimeoutNoMercy = () => {
    if (!mistakeVault.some(w => w.id === currentWord.id)) {
      setMistakeVault(prev => [...prev, { ...currentWord, is_vaulted: true }]);
    }
  };

  // Step 1: Reveal Meaning
  const handleReveal = () => {
    if (!isRevealed) {
      if (timerRef.current) clearInterval(timerRef.current);
      playCorrectSound();
      setIsRevealed(true);

      const achievedSpeedBonus = timeLeft >= 5;
      const baseReward = currentWord.xp_reward;
      const bonus = achievedSpeedBonus ? 100 : 0;
      const totalWordXp = baseReward + bonus;

      if (!revealedIds.includes(currentWord.id)) {
        setRevealedIds(prev => [...prev, currentWord.id]);
        setAccumulatedBossXp(prev => prev + totalWordXp);

        if (achievedSpeedBonus) {
          playComboMultiplier(4);
          setShowXpPopup(`⚡ ULTIMATE COMBO! +${totalWordXp} XP`);
        } else {
          setShowXpPopup(`👑 +${totalWordXp} BOSS XP`);
        }

        setTimeout(() => setShowXpPopup(null), 1800);
      }
    }
  };

  // Step 2: Acknowledge & Trigger 3D Avatar Glow
  const handleAcknowledge = () => {
    if (!isAcknowledged) {
      playAvatarJump();
      playAvatarCheer();
      setIsAcknowledged(true);
      setAvatarVictorySpin(true);
      setTimeout(() => setAvatarVictorySpin(false), 1200);
    }
  };

  // Manual Vault Bookmark
  const handleToggleVault = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();

    if (isVaulted) {
      setMistakeVault(prev => prev.filter(w => w.id !== currentWord.id));
    } else {
      setMistakeVault(prev => [...prev, { ...currentWord, is_vaulted: true }]);
    }
  };

  // Step 3: Advance or Trigger Grand Victory
  const handleNextWord = () => {
    playClickSound();
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsRevealed(false);
      setIsAcknowledged(false);
    } else {
      // GRAND FINALE CONQUERED!
      playOreUnlockFanfare();
      playTrophyCelebration();
      setIsGrandFinaleConquered(true);
      setAvatarVictorySpin(true);

      const payload: FinalBossCompletionPayload = {
        userId,
        totalXP: finalTotalXp,
        currentStreak: currentStreak + 1,
        mistakeVault,
        achievedTier: 'Tier 15: Bedrock Grandmaster',
        completedAt: new Date().toISOString()
      };

      syncToFirestore(payload);
      if (onComplete) onComplete(payload);
    }
  };

  // 4. WHATSAPP SHARE GENERATOR
  const handleShareToWhatsApp = () => {
    playClickSound();
    const shareMessage = `I just defeated the Ultimate Boss Level on Jack Board! 🏆 I reached Tier 15 with ${finalTotalXp} XP and a ${currentStreak + 1} day streak. Can you beat my score? Try it here: ${appUrl} #JackQuiz`;
    const encodedUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(encodedUrl, '_blank');
  };

  const handlePronounce = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.rate = 0.7;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto min-h-[680px] bg-[#020409] border-2 border-[#B6FF40] rounded-3xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-[0_0_80px_rgba(182,255,64,0.3)] select-none">
      {/* Intense Breathing Neon Ambient Glows */}
      <div className="absolute -top-36 -left-36 w-96 h-96 rounded-full bg-[#10B981]/25 blur-[110px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-36 -right-36 w-96 h-96 rounded-full bg-[#B6FF40]/30 blur-[120px] pointer-events-none animate-pulse" />

      {/* INTRO BANNER: Ultimate Boss Finale */}
      <AnimatePresence>
        {showIntroBanner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="absolute inset-0 z-50 bg-[#020409]/98 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-22 h-22 rounded-3xl bg-gradient-to-tr from-[#10B981] via-[#B6FF40] to-amber-300 p-1 shadow-[0_0_50px_rgba(182,255,64,0.7)] flex items-center justify-center mb-4">
              <div className="w-full h-full bg-[#020409] rounded-[22px] flex items-center justify-center">
                <Crown className="w-12 h-12 text-[#B6FF40] animate-bounce" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#B6FF40]/15 border border-[#B6FF40]/50 text-[10px] font-black uppercase tracking-widest text-[#B6FF40] mb-2">
              <AlertOctagon className="w-3.5 h-3.5 text-[#B6FF40]" />
              <span>Final Grand Finale &bull; Tier 15 Ascension</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Part 6: Ultimate Boss
            </h2>
            <p className="text-xs text-slate-300 mt-2 max-w-[320px] leading-relaxed">
              The longest words in human history. Earn <strong className="text-[#B6FF40]">+200 XP per word</strong>. No-mercy 10-second timer active.
            </p>

            <button
              onClick={() => { playClickSound(); setShowIntroBanner(false); }}
              className="mt-6 w-full max-w-[260px] py-4 rounded-2xl bg-gradient-to-r from-[#10B981] via-[#B6FF40] to-emerald-400 text-slate-950 font-black text-xs tracking-wider uppercase shadow-[0_5px_0_#064E3B] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Begin Final Boss Battle</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER: Tier 15 Status & 10s Speed Bar */}
      <div className="relative z-10 w-full space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 px-3 py-1 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-base">👑</span>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Target Ascension
              </span>
              <span className="text-[11px] font-black text-[#B6FF40]">
                Tier 15: Bedrock Champion
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
              timeLeft <= 4 ? 'bg-red-950/90 border-red-500 text-red-300 animate-pulse' : 'bg-white/5 border-white/10 text-slate-300'
            }`}>
              <Timer className="w-3.5 h-3.5 text-[#B6FF40]" />
              <span className="text-xs font-black">{timeLeft}s No-Mercy Clock</span>
            </div>

            <span className="text-xs font-black text-amber-400 flex items-center gap-1">
              <Flame className="w-4 h-4 fill-amber-400" />
              {finalTotalXp} XP
            </span>
          </div>
        </div>

        {/* Pulsing Breathing Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-950 border border-white/10 overflow-hidden relative">
          <motion.div
            className="h-full bg-gradient-to-r from-[#059669] via-[#10B981] to-[#B6FF40] shadow-[0_0_20px_#B6FF40]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* CENTER: 3D AVATAR COMPANION + ULTRA-FROSTED FLASHCARD */}
      {!isGrandFinaleConquered ? (
        <div className="relative z-10 my-auto py-2 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* 3D AVATAR REACTION STAGE (4 Cols) */}
          <div className="md:col-span-4 flex flex-row md:flex-col items-center justify-between md:justify-center p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <div
              className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#10B981] via-[#B6FF40] to-yellow-400 p-1 flex items-center justify-center shadow-[0_0_30px_rgba(182,255,64,0.45)] transition-transform duration-1000 ${
                avatarVictorySpin ? 'rotate-[360deg] scale-110' : ''
              }`}
            >
              <div className="w-full h-full bg-[#020409] rounded-xl flex items-center justify-center text-4xl">
                {avatarVictorySpin ? '🏆' : isAcknowledged ? '👑' : isRevealed ? '🔥' : '🤖'}
              </div>
            </div>

            <div className="text-left md:text-center mt-0 md:mt-2">
              <span className="text-[11px] font-black text-white block">
                Jack Genie (Buddy)
              </span>
              <span className="text-[9px] text-[#B6FF40] font-bold block">
                {avatarVictorySpin ? '360° Victory Spin!' : isAcknowledged ? 'Boss Word Slain!' : 'Focus! Ultimate Boss!'}
              </span>
            </div>

            <div className="mt-0 md:mt-2 px-2.5 py-0.5 rounded-full bg-[#B6FF40]/15 border border-[#B6FF40]/40 text-[9px] font-black text-[#B6FF40]">
              +200 XP Boss
            </div>
          </div>

          {/* ULTRA-FROSTED FLASHCARD (8 Cols) */}
          <div className="md:col-span-8">
            <motion.div
              key={currentWord.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                backdropFilter: 'blur(40px)',
                background: 'rgba(16, 185, 129, 0.06)'
              }}
              className={`
                relative w-full rounded-3xl p-5 sm:p-6 text-center transition-all duration-300 border-2
                ${isAcknowledged
                  ? 'border-[#B6FF40] shadow-[0_0_40px_rgba(182,255,64,0.4),inset_0_0_20px_rgba(182,255,64,0.2)]'
                  : 'border-[#B6FF40]/50 shadow-[0_20px_60px_rgba(0,0,0,0.9)]'}
              `}
            >
              {/* Floating XP Multiplier Popup */}
              <AnimatePresence>
                {showXpPopup && (
                  <motion.div
                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                    animate={{ opacity: 1, y: -50, scale: 1.2 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-300 via-[#B6FF40] to-emerald-400 text-slate-950 font-black text-xs shadow-[0_0_30px_#B6FF40] pointer-events-none z-30"
                  >
                    {showXpPopup}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Index & Mistake Vault Bookmark Button */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400">
                  Ultimate Boss {currentIndex + 1} of {words.length}
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
                      <span>Save Hard</span>
                    </>
                  )}
                </button>
              </div>

              {/* The Hard Word with Intense Text-Shadow Glow */}
              <h3
                style={{ textShadow: '0 0 25px rgba(182,255,64,0.5), 0 2px 6px rgba(0,0,0,0.9)' }}
                className="text-xl sm:text-2xl font-black text-white tracking-tight break-words leading-snug"
              >
                {currentWord.word}
              </h3>

              {/* Phonetic Pronunciation & Voice Trigger */}
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

              <div className="w-20 h-0.5 mx-auto bg-gradient-to-r from-transparent via-[#B6FF40]/50 to-transparent my-3.5" />

              {/* TWO-STEP REVEAL & ACKNOWLEDGE AREA */}
              <div className="min-h-[140px] flex flex-col justify-center">
                {isRevealed ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-2 text-left bg-black/70 rounded-2xl p-4 border border-[#B6FF40]/40 backdrop-blur-md"
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
                        उदाहरण (Example):
                      </span>
                      <p className="text-xs text-slate-300 italic mt-0.5 leading-relaxed">
                        &ldquo;{currentWord.example}&rdquo;
                      </p>
                    </div>

                    {currentWord.funTrivia && (
                      <div className="pt-1 border-t border-white/10">
                        <p className="text-[10.5px] text-amber-300 font-medium">
                          📜 <span className="font-bold">Trivia:</span> {currentWord.funTrivia}
                        </p>
                      </div>
                    )}

                    {!isAcknowledged && (
                      <button
                        onClick={handleAcknowledge}
                        className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#B6FF40] to-[#10B981] hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_3px_0_#065F46] flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4 text-slate-950" />
                        <span>Acknowledge &amp; Trigger Avatar Spin (+200 XP)</span>
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <button
                    onClick={handleReveal}
                    className="py-5 px-4 rounded-2xl bg-white/5 border border-white/15 hover:border-[#B6FF40]/60 flex flex-col items-center justify-center gap-2 group transition-all"
                  >
                    <div className="w-11 h-11 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center group-hover:scale-110 group-hover:border-[#B6FF40] transition-all">
                      <Sparkles className="w-5 h-5 text-[#B6FF40]" />
                    </div>
                    <span className="text-xs font-black text-slate-200">
                      Step 1: Tap to Reveal Hindi Meaning
                    </span>
                    {timeLeft >= 5 && (
                      <span className="text-[10px] text-[#B6FF40] font-bold">
                        ⚡ Flip within {timeLeft - 5}s for Ultimate Combo (+100 XP Bonus)
                      </span>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        /* =========================================================================
           GRAND FINALE VICTORY SCREEN & WHATSAPP SHARING CARD
           ========================================================================= */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 my-auto py-5 text-center space-y-4"
        >
          {/* 3D Golden Laurel Trophy */}
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-[#10B981] via-[#B6FF40] to-yellow-300 p-1 shadow-[0_0_60px_rgba(182,255,64,0.7)] flex items-center justify-center">
            <div className="w-full h-full bg-[#020409] rounded-[22px] flex items-center justify-center">
              <Trophy className="w-14 h-14 text-[#B6FF40] animate-bounce" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#B6FF40]/20 border border-[#B6FF40]/50 text-[10px] font-black text-[#B6FF40] uppercase tracking-widest mb-1.5">
              <span>🏆 6-PART SERIES CONQUERED!</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-white">
              Tier 15: Bedrock Scholar
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-[320px] mx-auto">
              You defeated all 6 parts of the Hardest Words in the English language and reached the pinnacle of Jack Board!
            </p>
          </div>

          {/* DYNAMIC SCORE CARD / CERTIFICATE UI */}
          <div className="p-4 rounded-3xl bg-white/5 border border-white/15 max-w-[380px] mx-auto text-left space-y-2.5 backdrop-blur-2xl shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Scholar Name</span>
              <span className="text-xs font-black text-white">{userId}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Final Total XP</span>
              <span className="text-xs font-black text-[#B6FF40]">+{finalTotalXp} XP</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Active Streak</span>
              <span className="text-xs font-black text-amber-400">🔥 {currentStreak + 1} Days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Final Rank Unlocked</span>
              <span className="text-xs font-black text-emerald-400">Tier 15 (Grandmaster)</span>
            </div>
          </div>

          {/* 4. WHATSAPP VIRAL SHARE BUTTON */}
          <div className="pt-2">
            <button
              onClick={handleShareToWhatsApp}
              className="w-full max-w-[380px] mx-auto py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:brightness-110 text-white font-black text-xs tracking-wider uppercase shadow-[0_4px_0_#075E54] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {/* WhatsApp Icon */}
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
              </svg>
              <span>Share Score Card to WhatsApp</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* STRICT NO-MERCY STATE LOCKING BOTTOM BAR */}
      <div className="relative z-10 pt-2">
        {!isGrandFinaleConquered ? (
          <button
            onClick={handleNextWord}
            disabled={!isAcknowledged}
            className={`
              w-full py-4 px-4 rounded-2xl font-black text-xs tracking-wider uppercase transition-all duration-200
              flex items-center justify-center gap-2
              ${isAcknowledged
                ? 'bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#34D399] hover:to-[#10B981] text-white shadow-[0_4px_0_#064E3B] active:scale-95 cursor-pointer'
                : 'bg-white/5 border border-white/10 text-slate-600 cursor-not-allowed'}
            `}
          >
            {isAcknowledged ? (
              <>
                <span>{currentIndex === words.length - 1 ? 'Conquer Grand Finale' : 'Next Boss Word'}</span>
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
            className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-[#B6FF40] via-[#10B981] to-emerald-400 hover:brightness-110 text-slate-950 font-black text-xs tracking-wider uppercase shadow-[0_4px_0_#064E3B] active:scale-95"
          >
            Claim Grandmaster Crown &amp; Return to Lobby
          </button>
        )}
      </div>
    </div>
  );
};
