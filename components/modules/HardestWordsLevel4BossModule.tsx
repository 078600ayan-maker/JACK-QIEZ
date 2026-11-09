'use client';

import React, { useState } from 'react';
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
  Swords,
  ChevronRight
} from 'lucide-react';
import {
  playClickSound,
  playCorrectSound,
  playMinecraftLevelUp,
  playAvatarJump,
  playAvatarCheer,
  playOreUnlockFanfare
} from '@/lib/audioEngine';
import { getUserCurrentOreTier, getNextOreTier, ORE_TIERS } from '@/types/ranking';

export interface HardWordLevel4BossItem {
  id: string;
  word: string;
  pronunciation: string;
  meaning_hindi: string;
  example: string;
  difficulty_level: 'Level 4 - Boss Phase';
  xp_reward: 50;
  bossChallengeNote?: string;
}

// 1. DATA PROCESSING (JSON STRUCTURE FOR LEVEL 4 - BOSS PHASE)
export const PART_4_HARDEST_WORDS: HardWordLevel4BossItem[] = [
  {
    id: 'hw_boss_01',
    word: 'Antidisestablishmentarianism',
    pronunciation: 'an-tee-dis-es-tab-lish-muhn-TAIR-ee-uh-niz-uhm (ऐन्टी-डिस-एस्टैब्लिश-मेन-टेरि-यनिज़म)',
    meaning_hindi: 'स्थापित राज्य-प्रणाली या चर्च की आधिकारिक मान्यता को समाप्त करने का विरोध',
    example: '19th century British politics mein antidisestablishmentarianism ek bada mudda tha.',
    difficulty_level: 'Level 4 - Boss Phase',
    xp_reward: 50,
    bossChallengeNote: '28 अक्षरों का यह शब्द दुनिया के सबसे लंबे औपचारिक राजनीतिक शब्दों में से एक है!'
  },
  {
    id: 'hw_boss_02',
    word: 'Grandiloquent',
    pronunciation: 'gran-DIL-uh-kwuhnt (ग्रैन-डिल-अ-क्वंट)',
    meaning_hindi: 'आडंबरपूर्ण / दिखावटी और भारी-भरकम शैली में बोलने वाला',
    example: 'Uski grandiloquent bhashan-shaili ne sabhi ko prabhavit toh kiya, par baat kisi ke samajh nahi aayi.',
    difficulty_level: 'Level 4 - Boss Phase',
    xp_reward: 50,
    bossChallengeNote: 'Bombastic aur Pompous iske sabse pramukh synonyms hain.'
  },
  {
    id: 'hw_boss_03',
    word: 'Perspicacious',
    pronunciation: 'per-spih-KAY-shuhs (पर्स-पि-के-शस)',
    meaning_hindi: 'कुशाग्रबुद्धि / सूक्ष्मदर्शी (जो स्थिति को तुरंत गहराई से भांप ले)',
    example: 'JAC Board toppers hamesha questions ke pattern ko lekar perspicacious hote hain.',
    difficulty_level: 'Level 4 - Boss Phase',
    xp_reward: 50,
    bossChallengeNote: 'Latin "perspicere" se bana hai, jiska arth hota hai "aar-paar dekhna".'
  },
  {
    id: 'hw_boss_04',
    word: 'Magnanimous',
    pronunciation: 'mag-NAN-uh-muhs (मैग-नैन-इ-मस)',
    meaning_hindi: 'अत्यंत उदार, विशाल हृदय वाला एवं क्षमाशील',
    example: 'Match haarne ke bawajood usne magnanimous ban kar jeetne wali team ko gale lagaya.',
    difficulty_level: 'Level 4 - Boss Phase',
    xp_reward: 50,
    bossChallengeNote: 'Great-souled (Maha-aatma) iska literal Latin anuvaad hai.'
  },
  {
    id: 'hw_boss_05',
    word: 'Pulchritudinous',
    pronunciation: 'puhl-kruh-TOOD-ih-nuhs (पल-क्रू-टुड-इ-नस)',
    meaning_hindi: 'अतुलनीय रूप से सुंदर / अत्यंत मनमोहक',
    example: 'Kashmir ki vaadiyon ka nazara sach mein pulchritudinous tha.',
    difficulty_level: 'Level 4 - Boss Phase',
    xp_reward: 50,
    bossChallengeNote: 'Sunne mein ajeeb lagta hai, par iska arth sirf "Breathtakingly Beautiful" hota hai!'
  }
];

export interface BossModuleCompletionPayload {
  totalXpEarned: number;
  newTotalXp: number;
  streakIncrement: number;
  vaultedWordIds: string[];
  completedAt: string;
}

interface HardestWordsLevel4BossProps {
  words?: HardWordLevel4BossItem[];
  currentStudentXp?: number;
  currentStreak?: number;
  onComplete?: (payload: BossModuleCompletionPayload) => void;
  onClose?: () => void;
}

export const HardestWordsLevel4BossModule: React.FC<HardestWordsLevel4BossProps> = ({
  words = PART_4_HARDEST_WORDS,
  currentStudentXp = 1200,
  currentStreak = 7,
  onComplete,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Two-Step State Locking: isRevealed -> isAcknowledged -> Next unlocks
  const [isRevealed, setIsRevealed] = useState(false);
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  
  // Avatar Reactions: 'idle' | 'reading' | 'success' | 'celebrate'
  const [avatarReaction, setAvatarReaction] = useState<'idle' | 'reading' | 'success' | 'celebrate'>('idle');

  // Mistake Vault Storage
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

  const [earnedXp, setEarnedXp] = useState(0);
  const [showXpPopup, setShowXpPopup] = useState<string | null>(null);
  const [isBossConquered, setIsBossConquered] = useState(false);
  const [showRankUpModal, setShowRankUpModal] = useState(false);
  const [showIntroBanner, setShowIntroBanner] = useState(true);

  const currentWord = words[currentIndex];
  const isVaulted = vaultSavedIds.includes(currentWord.id);
  const progressPercent = Math.round(((currentIndex + (isAcknowledged ? 1 : 0)) / words.length) * 100);

  // Dynamic Rank Computation
  const calculatedTotalXp = currentStudentXp + earnedXp;
  const currentOre = getUserCurrentOreTier(calculatedTotalXp);
  const nextOre = getNextOreTier(calculatedTotalXp);

  // Step 1: Reveal Meaning
  const handleRevealMeaning = () => {
    if (!isRevealed) {
      playCorrectSound();
      setIsRevealed(true);
      setAvatarReaction('reading');
    }
  };

  // Step 2: Acknowledge & Claim +50 XP
  const handleAcknowledge = () => {
    if (!isAcknowledged) {
      playAvatarJump();
      setAvatarReaction('success');
      setIsAcknowledged(true);

      if (!revealedIds.includes(currentWord.id)) {
        setRevealedIds(prev => [...prev, currentWord.id]);
        const xpBoost = currentWord.xp_reward;
        setEarnedXp(prev => prev + xpBoost);
        setShowXpPopup(`👑 +${xpBoost} BOSS XP!`);
        setTimeout(() => setShowXpPopup(null), 1800);
      }
    }
  };

  // Bookmark to Mistake Vault
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
        window.dispatchEvent(
          new CustomEvent('sbr_vault_updated', {
            detail: { word: currentWord, isSaved: !isVaulted }
          })
        );
      } catch (err) {
        console.warn('Vault error:', err);
      }
    }
  };

  // Step 3: Advance to Next Boss Word
  const handleNextWord = () => {
    playClickSound();
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsRevealed(false);
      setIsAcknowledged(false);
      setAvatarReaction('idle');
    } else {
      // Boss Conquered!
      playOreUnlockFanfare();
      playAvatarCheer();
      setIsBossConquered(true);
      setShowRankUpModal(true);

      const payload: BossModuleCompletionPayload = {
        totalXpEarned: earnedXp + currentWord.xp_reward,
        newTotalXp: calculatedTotalXp,
        streakIncrement: 1,
        vaultedWordIds: vaultSavedIds,
        completedAt: new Date().toISOString()
      };

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('sbr_boss_completed', { detail: payload })
        );
      }

      if (onComplete) onComplete(payload);
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
    <div className="relative w-full max-w-lg mx-auto min-h-[640px] bg-[#050811] border-2 border-[#B6FF40]/40 rounded-3xl p-5 flex flex-col justify-between overflow-hidden shadow-[0_0_50px_rgba(182,255,64,0.15)] select-none">
      {/* Background Neon Emerald & Gold Boss Ambient Glows */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#10B981]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#B6FF40]/20 blur-3xl pointer-events-none animate-pulse" />

      {/* LEVEL 4 BOSS PHASE INTRO OVERLAY */}
      <AnimatePresence>
        {showIntroBanner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="absolute inset-0 z-50 bg-[#050811]/98 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-[#10B981] via-[#B6FF40] to-yellow-400 p-0.5 shadow-[0_0_40px_rgba(182,255,64,0.5)] flex items-center justify-center mb-4">
              <div className="w-full h-full bg-[#050811] rounded-3xl flex items-center justify-center">
                <Crown className="w-9 h-9 text-[#B6FF40] animate-bounce" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#B6FF40]/10 border border-[#B6FF40]/40 text-[10px] font-black uppercase tracking-widest text-[#B6FF40] mb-2">
              <Swords className="w-3.5 h-3.5 text-[#B6FF40]" />
              <span>Boss Phase &bull; High Stakes</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Level 4: Master Tier
            </h2>
            <p className="text-xs text-slate-300 mt-2 max-w-[300px] leading-relaxed">
              Master the longest, most sophisticated words in English. Earn massive <strong className="text-[#B6FF40]">+50 XP per word</strong> and trigger your 15-tier rank ascension!
            </p>

            <button
              onClick={() => { playClickSound(); setShowIntroBanner(false); }}
              className="mt-6 w-full max-w-[240px] py-3.5 rounded-2xl bg-gradient-to-r from-[#10B981] via-[#B6FF40] to-emerald-400 text-slate-950 font-black text-xs tracking-wider uppercase shadow-[0_4px_0_#064E3B] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Enter Boss Arena</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP STATUS BAR: 15-Tier Rank Progression & XP Accumulator */}
      <div className="relative z-10 w-full space-y-2">
        <div className="flex items-center justify-between text-xs">
          {/* Current Rank Badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-base">💎</span>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                {currentOre.title}
              </span>
              <span className="text-[11px] font-black text-[#B6FF40]">
                {currentOre.name}
              </span>
            </div>
          </div>

          {/* XP Accumulator & Streak */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Total XP
              </span>
              <span className="text-xs font-black text-amber-400 flex items-center gap-1 justify-end">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                {calculatedTotalXp} XP
              </span>
            </div>
          </div>
        </div>

        {/* Pulsing Neon Emerald Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-950 border border-white/10 overflow-hidden relative">
          <motion.div
            className="h-full bg-gradient-to-r from-[#059669] via-[#10B981] to-[#B6FF40] shadow-[0_0_15px_#B6FF40]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* MAIN CONTAINER: Avatar Reaction Panel + Heavy Frosted Glass Card */}
      {!isBossConquered ? (
        <div className="relative z-10 my-auto py-2">
          {/* AVATAR REACTION UI HEADER */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              {/* Blocky Mascot Reaction Box */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#10B981] to-[#B6FF40] p-0.5 flex items-center justify-center shadow-[0_0_12px_rgba(182,255,64,0.3)]">
                <div className="w-full h-full bg-[#050811] rounded-[10px] flex items-center justify-center text-sm">
                  {avatarReaction === 'idle' && '🤖'}
                  {avatarReaction === 'reading' && '🧐'}
                  {avatarReaction === 'success' && '🔥'}
                  {avatarReaction === 'celebrate' && '👑'}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black text-white block leading-tight">
                  Jack Genie Companion
                </span>
                <span className="text-[9px] text-[#B6FF40] font-bold">
                  {avatarReaction === 'idle' && 'Standing by for Boss Word...'}
                  {avatarReaction === 'reading' && 'Analyzing syllables with you...'}
                  {avatarReaction === 'success' && 'Boss Word Mastered! ⚡'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#B6FF40]/10 border border-[#B6FF40]/30 text-[10px] font-black text-[#B6FF40]">
              <Crown className="w-3 h-3 text-[#B6FF40]" />
              <span>+{currentWord.xp_reward} XP</span>
            </div>
          </div>

          {/* ULTRA-FROSTED GLASS CARD */}
          <motion.div
            key={currentWord.id}
            initial={{ opacity: 0, y: 14, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14 }}
            className={`
              relative w-full rounded-3xl p-6 text-center transition-all duration-300
              backdrop-blur-[24px] bg-[rgba(8,14,26,0.9)] border
              ${isAcknowledged
                ? 'border-[#B6FF40] shadow-[0_0_35px_rgba(182,255,64,0.35),inset_0_0_20px_rgba(182,255,64,0.15)]'
                : 'border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.85)]'}
            `}
          >
            {/* XP Floating Pop */}
            <AnimatePresence>
              {showXpPopup && (
                <motion.div
                  initial={{ opacity: 0, y: 0, scale: 0.5 }}
                  animate={{ opacity: 1, y: -50, scale: 1.2 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-400 via-[#B6FF40] to-emerald-400 text-slate-950 font-black text-xs shadow-[0_0_25px_#B6FF40] pointer-events-none z-30"
                >
                  {showXpPopup}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Word Index & Vault Bookmark */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400">
                Boss Word {currentIndex + 1} of {words.length}
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
                    <span>Save to Vault</span>
                  </>
                )}
              </button>
            </div>

            {/* The Hard Word */}
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md break-words">
              {currentWord.word}
            </h3>

            {/* Phonetic Pronunciation & Audio */}
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
                      उदाहरण (Example):
                    </span>
                    <p className="text-xs text-slate-300 italic mt-0.5 leading-relaxed">
                      &ldquo;{currentWord.example}&rdquo;
                    </p>
                  </div>

                  {currentWord.bossChallengeNote && (
                    <div className="pt-1 border-t border-white/10">
                      <p className="text-[10.5px] text-amber-300 font-medium">
                        👑 <span className="font-bold">Boss Note:</span> {currentWord.bossChallengeNote}
                      </p>
                    </div>
                  )}

                  {/* Step 2: Acknowledge Button */}
                  {!isAcknowledged && (
                    <button
                      onClick={handleAcknowledge}
                      className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#B6FF40] to-[#10B981] hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_3px_0_#065F46] flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      <span>Acknowledge &amp; Claim +50 XP</span>
                    </button>
                  )}
                </motion.div>
              ) : (
                <button
                  onClick={handleRevealMeaning}
                  className="py-5 px-4 rounded-2xl bg-white/5 border border-white/15 hover:border-[#B6FF40]/50 flex flex-col items-center justify-center gap-2 group transition-all"
                >
                  <div className="w-11 h-11 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center group-hover:scale-110 group-hover:border-[#B6FF40] transition-all">
                    <Sparkles className="w-5 h-5 text-[#B6FF40]" />
                  </div>
                  <span className="text-xs font-black text-slate-200">
                    Step 1: Tap to Reveal Hindi Meaning
                  </span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      ) : (
        /* MINECRAFT-INSPIRED 15-TIER RANK UP MODAL */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 my-auto py-6 text-center space-y-4"
        >
          <div className="w-22 h-22 mx-auto rounded-3xl bg-gradient-to-tr from-[#10B981] via-[#B6FF40] to-amber-300 p-1 shadow-[0_0_50px_rgba(182,255,64,0.6)] flex items-center justify-center">
            <div className="w-full h-full bg-[#050811] rounded-[22px] flex items-center justify-center">
              <Trophy className="w-12 h-12 text-[#B6FF40] animate-bounce" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B6FF40]/15 border border-[#B6FF40]/40 text-[10px] font-black text-[#B6FF40] uppercase tracking-widest mb-1.5">
              <span>👑 Boss Phase Overcome!</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Scholar Rank Ascended
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-[280px] mx-auto">
              You defeated Level 4 and unlocked <strong className="text-[#B6FF40]">+{earnedXp} Boss XP</strong>.
            </p>
          </div>

          {/* Minecraft Ore Progression Card */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 max-w-[340px] mx-auto text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Ore Tier</span>
              <span className="text-xs font-black text-[#B6FF40]">{currentOre.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Title Earned</span>
              <span className="text-xs font-black text-white">{currentOre.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Cosmetic Reward</span>
              <span className="text-xs font-bold text-emerald-400">{currentOre.cosmeticReward}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* BOTTOM CONTROLS & STATE LOCKING */}
      <div className="relative z-10 pt-2">
        {!isBossConquered ? (
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
                <span>{currentIndex === words.length - 1 ? 'Conquer Boss Phase' : 'Next Boss Word'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Reveal &amp; Acknowledge to Unlock</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onClose}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#B6FF40] via-[#10B981] to-emerald-400 hover:brightness-110 text-slate-950 font-black text-xs tracking-wider uppercase shadow-[0_4px_0_#065F46] active:scale-95"
          >
            Equip Rank &amp; Advance to Part 5
          </button>
        )}
      </div>
    </div>
  );
};
