'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Lock, CheckCircle2, Sparkles, HelpCircle, Shield, Award, ChevronRight, Zap } from 'lucide-react';
import { OreTier, ORE_TIERS, getUserCurrentOreTier, getNextOreTier } from '@/types/ranking';
import { playClickSound, playLockRattle, playOreUnlockFanfare, playDiamondChime, playMysteriousTreasureGlow } from '@/lib/audioEngine';

interface OreHierarchyModalProps {
  isOpen: boolean;
  userXp: number;
  onClose: () => void;
}

export const OreHierarchyModal: React.FC<OreHierarchyModalProps> = ({
  isOpen,
  userXp,
  onClose
}) => {
  const currentTier = getUserCurrentOreTier(userXp);
  const nextTier = getNextOreTier(userXp);
  const [inspectedTier, setInspectedTier] = useState<OreTier>(currentTier);

  if (!isOpen) return null;

  const isTierUnlocked = (tier: OreTier) => {
    return tier.unlockedByDefault || userXp >= tier.minXp;
  };

  const handleInspect = (tier: OreTier) => {
    const unlocked = isTierUnlocked(tier);
    if (unlocked) {
      if (tier.id === 'diamond' || tier.id === 'emerald') {
        playDiamondChime();
      } else {
        playOreUnlockFanfare();
      }
    } else {
      playLockRattle();
      playMysteriousTreasureGlow();
    }
    setInspectedTier(tier);
  };

  const inspectedUnlocked = isTierUnlocked(inspectedTier);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="relative w-full max-w-[480px] max-h-[92vh] rounded-3xl bg-gradient-to-b from-[#141C2E] via-[#0D1424] to-[#090D16] border-2 border-amber-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/5">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Sparkles className="w-5 h-5 fill-amber-400" />
              </span>
              <div>
                <h2 className="text-base font-black text-white tracking-tight">
                  Hardcore Ore-Based Ranks
                </h2>
                <p className="text-[10px] font-semibold text-slate-400">
                  Minecraft 10-Tier Mineral Hierarchy • Locked Relics
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Rank Banner & XP Progress */}
          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border-b border-white/10 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="relative w-9 h-9 rounded-xl bg-black/60 border border-amber-400/50 p-1 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                  <Image
                    src={currentTier.iconSvg}
                    alt={currentTier.name}
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 block">
                    YOUR CURRENT MINERAL TIER
                  </span>
                  <h3 className="text-sm font-black text-white">
                    {currentTier.name} ({currentTier.title})
                  </h3>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-black text-amber-300 font-mono">
                  {userXp.toLocaleString()} XP
                </span>
              </div>
            </div>

            {/* Progress to Next Ore */}
            {nextTier ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span>Next: {nextTier.name}</span>
                  <span className="text-amber-400">
                    {Math.max(0, nextTier.minXp - userXp)} XP needed
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/60 border border-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500 shadow-[0_0_8px_#F59E0B]"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          ((userXp - currentTier.minXp) /
                            (nextTier.minXp - currentTier.minXp)) *
                            100
                        )
                      )}%`
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-[10px] font-black text-emerald-400 text-center py-1">
                👑 MAX RANK ACHIEVED: IMMORTAL NETHERITE GOD!
              </div>
            )}
          </div>

          {/* Detailed Inspector Card */}
          <div className="p-4 bg-black/40 border-b border-white/10 shrink-0">
            <div className="flex items-start gap-3.5">
              {/* Ore Icon / Locked Mystery Box */}
              <div
                className={`relative w-16 h-16 rounded-2xl border-2 flex items-center justify-center shrink-0 overflow-hidden ${
                  inspectedUnlocked
                    ? 'bg-black/60 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                    : 'bg-black/90 border-slate-700'
                }`}
                style={{
                  borderColor: inspectedUnlocked ? inspectedTier.badgeBorder : '#334155'
                }}
              >
                {inspectedUnlocked ? (
                  <Image
                    src={inspectedTier.iconSvg}
                    alt={inspectedTier.name}
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                ) : (
                  /* Mysterious Hidden Treasure State */
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-black to-black opacity-80" />
                    <Lock className="w-6 h-6 text-amber-400/80 mb-0.5 z-10" />
                    <span className="text-[9px] font-black text-slate-400 font-mono z-10">
                      ???
                    </span>
                  </div>
                )}
              </div>

              {/* Inspected Lore & Perks */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-white truncate">
                    {inspectedUnlocked ? inspectedTier.name : 'Mysterious Locked Relic'}
                  </h4>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      inspectedUnlocked
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-red-500/20 text-red-300 border-red-500/40'
                    }`}
                  >
                    {inspectedUnlocked ? 'UNLOCKED' : 'LOCKED'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  {inspectedUnlocked
                    ? inspectedTier.lore
                    : `Hidden underground treasure. Unlocks automatically when your Jack Quiz scholarship reaches ${inspectedTier.minXp.toLocaleString()} XP.`}
                </p>

                {/* Rewards Unlocked */}
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                  <span className="font-bold text-slate-400">
                    Tier Cosmetic: <span className="text-amber-300">{inspectedUnlocked ? inspectedTier.cosmeticReward : '??? Classified'}</span>
                  </span>
                  <span className="font-mono font-bold text-amber-400">
                    {inspectedTier.minXp.toLocaleString()} XP
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 10-Tier Ore Shelf (Vertical Scrollable) */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
              All 10 Minecraft Mineral Divisions
            </span>

            {ORE_TIERS.map(tier => {
              const unlocked = isTierUnlocked(tier);
              const isSelected = inspectedTier.id === tier.id;
              const isCurrent = currentTier.id === tier.id;

              return (
                <button
                  key={tier.id}
                  onClick={() => handleInspect(tier)}
                  className={`w-full text-left p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                      : unlocked
                      ? 'bg-white/5 border-white/10 hover:bg-white/10'
                      : 'bg-black/40 border-white/5 opacity-70 hover:opacity-90'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Ore Icon / Padlock */}
                    <div
                      className={`relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        unlocked
                          ? 'bg-black/50 border-white/20'
                          : 'bg-black/80 border-slate-700'
                      }`}
                    >
                      {unlocked ? (
                        <Image
                          src={tier.iconSvg}
                          alt={tier.name}
                          width={26}
                          height={26}
                          className="object-contain"
                        />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h5 className="text-xs font-black text-white truncate">
                          {unlocked ? tier.name : 'Hidden Relic (???)'}
                        </h5>
                        {isCurrent && (
                          <span className="text-[8px] font-black px-1.5 py-0.2 rounded-full bg-amber-400 text-black">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-slate-400 truncate">
                        {unlocked ? tier.title : `Requires ${tier.minXp.toLocaleString()} XP`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[10px] font-bold text-amber-300">
                      {tier.minXp} XP
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-white/10 bg-white/5 flex items-center justify-between shrink-0">
            <span className="text-[10px] font-semibold text-slate-400">
              Only Coal Ore unlocked initially. Conquer quizzes to promote!
            </span>
            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="py-1.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
