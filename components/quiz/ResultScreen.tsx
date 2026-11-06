'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, RotateCcw, ArrowRight, Award, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CrownBadge } from '@/components/ui/CrownBadge';
import { TactileButton } from '@/components/ui/TactileButton';
import { VictoryCard } from './VictoryCard';
import { MinecraftAvatar3D } from '@/components/avatar/MinecraftAvatar3D';
import { useUserStore } from '@/store/useUserStore';
import { playClickSound, playTrophyCelebration, playAvatarCry } from '@/lib/audioEngine';

interface ResultScreenProps {
  score: number;
  totalQuestions: number;
  xpEarned: number;
  level: number;
  isBoss: boolean;
  chapterName: string;
  studentName: string;
  subjectTitle: string;
  heartsRemaining: number;
  onContinue: () => void;
  onRetry: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  score,
  totalQuestions,
  xpEarned,
  level,
  isBoss,
  chapterName,
  studentName,
  subjectTitle,
  heartsRemaining,
  onContinue,
  onRetry
}) => {
  const user = useUserStore();
  const [showVictoryCard, setShowVictoryCard] = useState(false);
  const [displayedXp, setDisplayedXp] = useState(0);

  const accuracy = Math.round((score / Math.max(1, totalQuestions)) * 100);
  const isPassed = accuracy >= 75 && heartsRemaining > 0;

  // Star calculation
  const starsCount = accuracy === 100 ? 3 : accuracy >= 85 ? 2 : accuracy >= 75 ? 1 : 0;

  // Trigger celebration audio and visual reactions
  useEffect(() => {
    if (isPassed) {
      playTrophyCelebration();
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#3B82F6', '#FFD700', '#EC4899']
        });
      } catch {
        // Ignore confetti error
      }
    } else {
      playAvatarCry();
    }

    // Slot machine roll effect for XP
    let current = 0;
    const step = Math.max(1, Math.floor(xpEarned / 20));
    const timer = setInterval(() => {
      current += step;
      if (current >= xpEarned) {
        setDisplayedXp(xpEarned);
        clearInterval(timer);
      } else {
        setDisplayedXp(current);
      }
    }, 40);

    return () => clearInterval(timer);
  }, [accuracy, isBoss, isPassed, xpEarned]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090D16]/95 backdrop-blur-2xl select-none">
      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full max-w-[420px] rounded-3xl p-6 bg-[rgba(26,34,53,0.92)] border-t border-white/25 border-x border-b border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] text-center relative"
      >
        {/* 3D Minecraft Avatar Victory / Disappointment Celebration */}
        <div className="flex justify-center mb-1">
          <MinecraftAvatar3D
            customization={user.profile?.customAvatar}
            animation={isPassed ? 'victory' : 'cry'}
            size={135}
            showPedestal={false}
            interactive={false}
            speechText={isPassed ? '🏆 शानदार! JAC Board Victory!' : '😢 कोई बात नहीं! फिर से कोशिश करो!'}
          />
        </div>

        {/* Heading */}
        <h2 className="text-xl font-black text-white tracking-tight">
          {isPassed
            ? isBoss
              ? '👑 BOSS CONQUERED!'
              : 'Level Complete!'
            : 'Level Incomplete'}
        </h2>

        <p className="text-xs text-slate-300 mt-1 mb-4 font-medium">
          {isPassed
            ? isBoss
              ? `You earned the Chapter Crown for ${chapterName}!`
              : `Great job! You achieved ${accuracy}% accuracy.`
            : `You need at least 75% accuracy to unlock the next level.`}
        </p>

        {/* 3-Star Sequential Stamp */}
        <div className="flex items-center justify-center gap-3 my-4">
          {[1, 2, 3].map((starIdx) => {
            const hasStar = starIdx <= starsCount;
            return (
              <motion.div
                key={starIdx}
                initial={{ scale: 2.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.25 + starIdx * 0.25,
                  type: 'spring',
                  stiffness: 450,
                  damping: 18
                }}
                className={`
                  w-12 h-12 rounded-2xl flex items-center justify-center border-t border-x
                  ${hasStar
                    ? 'bg-gradient-to-b from-[#FBBF24] to-[#D97706] border-[#FEF08A] shadow-[0_6px_0_#92400E,0_0_18px_rgba(245,158,11,0.5)]'
                    : 'bg-slate-800/60 border-white/5 opacity-40 shadow-[0_3px_0_#0F172A]'}
                `}
              >
                <Star
                  className={`w-6 h-6 ${
                    hasStar ? 'text-slate-950 fill-slate-950 stroke-[2]' : 'text-slate-500 stroke-[1.5]'
                  }`}
                />
              </motion.div>
            );
          })}
        </div>

        {/* 2x2 Bento Stat Cards */}
        <div className="grid grid-cols-2 gap-2.5 my-5 text-left">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score</div>
            <div className="text-base font-black text-white mt-0.5">
              {score} / {totalQuestions}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accuracy</div>
            <div className={`text-base font-black mt-0.5 ${accuracy >= 75 ? 'text-emerald-400' : 'text-red-400'}`}>
              {accuracy}%
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 col-span-2 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">XP Awarded</div>
              <div className="text-xl font-black text-[#FBBF24] mt-0.5">
                +{displayedXp} XP
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Hearts Left</div>
              <div className="text-sm font-black text-red-300">
                ❤️ {heartsRemaining}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 mt-4">
          {isBoss && isPassed && (
            <TactileButton
              variant="gold"
              fullWidth
              size="md"
              onClick={() => {
                playClickSound();
                setShowVictoryCard(true);
              }}
              className="flex items-center justify-center gap-2 mb-2"
            >
              <span>VIEW ROYAL VICTORY CARD</span>
            </TactileButton>
          )}

          {isPassed ? (
            <TactileButton
              variant="emerald"
              fullWidth
              size="lg"
              onClick={() => {
                playClickSound();
                onContinue();
              }}
              className="flex items-center justify-center gap-2"
            >
              <span>CONTINUE TO PATH</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </TactileButton>
          ) : (
            <TactileButton
              variant="ruby"
              fullWidth
              size="lg"
              onClick={() => {
                playClickSound();
                onRetry();
              }}
              className="flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RETRY LEVEL (पुनः प्रयास)</span>
            </TactileButton>
          )}
        </div>
      </motion.div>

      {/* Shareable Victory Card Popup */}
      {showVictoryCard && (
        <VictoryCard
          studentName={studentName}
          chapterName={chapterName}
          subjectTitle={subjectTitle}
          xpEarned={xpEarned}
          accuracy={accuracy}
          onClose={() => setShowVictoryCard(false)}
        />
      )}
    </div>
  );
};
