'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Check, Zap, Sparkles, ShieldAlert } from 'lucide-react';
import { CrownBadge } from '@/components/ui/CrownBadge';
import { playClickSound } from '@/lib/audioEngine';

interface LevelNodeProps {
  level: number; // 1 to 5
  isUnlocked: boolean;
  isCompleted: boolean;
  isActive: boolean; // current next level to play
  scorePercent?: number;
  onClick: () => void;
}

export const LevelNode: React.FC<LevelNodeProps> = ({
  level,
  isUnlocked,
  isCompleted,
  isActive,
  scorePercent,
  onClick
}) => {
  const isBoss = level === 5;

  // Level visual configuration
  const config = {
    1: {
      name: 'Bronze',
      gradient: 'from-[#CD7F32] via-[#B87333] to-[#8B4513]',
      border: 'border-[#F4A460]/40',
      shadow: '#663300',
      icon: Zap
    },
    2: {
      name: 'Silver',
      gradient: 'from-[#E2E8F0] via-[#CBD5E1] to-[#94A3B8]',
      border: 'border-white/50',
      shadow: '#475569',
      icon: Sparkles
    },
    3: {
      name: 'Gold',
      gradient: 'from-[#FDE047] via-[#F59E0B] to-[#D97706]',
      border: 'border-[#FEF08A]/60',
      shadow: '#92400E',
      icon: Zap
    },
    4: {
      name: 'Platinum',
      gradient: 'from-[#F1F5F9] via-[#E2E8F0] to-[#64748B]',
      border: 'border-[#38BDF8]/60',
      shadow: '#0F172A',
      icon: Sparkles
    },
    5: {
      name: 'Diamond Hex-Shield',
      gradient: 'from-[#1E1B4B] via-[#4C1D95] to-[#831843]',
      border: 'border-[#F59E0B]',
      shadow: '#311042',
      icon: ShieldAlert
    }
  }[level as 1 | 2 | 3 | 4 | 5];

  const handleClick = () => {
    if (!isUnlocked) return;
    playClickSound();
    onClick();
  };

  const Icon = config.icon;

  return (
    <div className="relative flex flex-col items-center justify-center select-none my-2">
      {/* Floating "START +20 XP" Tooltip on Active Node */}
      {isActive && isUnlocked && (
        <motion.div
          animate={{ y: [-4, 2, -4] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="absolute -top-10 z-20 pointer-events-none"
        >
          <div className="relative px-3 py-1 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-[10px] font-black text-slate-950 uppercase tracking-widest shadow-[0_4px_14px_rgba(245,158,11,0.5)] border border-[#FEF08A]/80 flex items-center gap-1">
            <span>START</span>
            <span className="text-[9px] bg-slate-950/20 px-1 py-0.5 rounded-full">+20 XP</span>
            {/* Tooltip Downward Beak */}
            <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#D97706]" />
          </div>
        </motion.div>
      )}

      {/* Orbiting Golden Ring for Active Level */}
      {isActive && isUnlocked && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 9, ease: 'linear' }}
          className="absolute w-[94px] h-[94px] rounded-full border-2 border-dashed border-[#F59E0B]/80 pointer-events-none shadow-[0_0_15px_rgba(245,158,11,0.4)]"
        />
      )}

      {/* The 72px 3D Tactile Node */}
      <motion.button
        animate={isActive && isUnlocked ? { y: [-3, 3, -3] } : {}}
        transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
        whileTap={isUnlocked ? { scale: 0.94, y: 3 } : {}}
        onClick={handleClick}
        disabled={!isUnlocked}
        aria-label={`Level ${level}: ${config.name}`}
        className={`
          relative flex items-center justify-center
          ${isBoss ? 'w-[78px] h-[78px] rounded-[24px] rotate-0' : 'w-[72px] h-[72px] rounded-full'}
          bg-gradient-to-b ${config.gradient}
          border-t-2 ${config.border}
          border-x border-b border-black/30
          transition-all duration-150
          ${isUnlocked
            ? 'cursor-pointer active:translate-y-[4px]'
            : 'opacity-55 filter grayscale-[0.8] cursor-not-allowed'}
        `}
        style={{
          boxShadow: isUnlocked
            ? `0 6px 0 ${config.shadow}, 0 10px 22px rgba(0,0,0,0.5), inset 0 2px 2px rgba(255,255,255,0.4)`
            : `0 4px 0 #1E293B, inset 0 1px 1px rgba(255,255,255,0.1)`
        }}
      >
        {/* Specular Highlight Arc */}
        <div className="absolute inset-x-2 top-1.5 h-4 bg-white/25 rounded-t-full pointer-events-none blur-[0.5px]" />

        {/* Node Content */}
        {isCompleted ? (
          <div className="flex flex-col items-center">
            {isBoss ? (
              <CrownBadge size="md" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-950/40 border border-white/20 flex items-center justify-center text-white">
                <Check className="w-5 h-5 stroke-[3] text-emerald-300" />
              </div>
            )}
            {scorePercent !== undefined && (
              <span className="text-[9px] font-black text-amber-200 mt-0.5">
                {scorePercent}%
              </span>
            )}
          </div>
        ) : !isUnlocked ? (
          <div className="w-7 h-7 rounded-full bg-slate-900/60 flex items-center justify-center text-slate-400">
            <Lock className="w-4 h-4" />
          </div>
        ) : isBoss ? (
          <div className="flex flex-col items-center">
            <CrownBadge size="sm" />
            <span className="text-[9px] font-black text-amber-300 tracking-tighter uppercase mt-0.5">
              BOSS
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Icon className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            <span className="text-[10px] font-black text-slate-950">
              L{level}
            </span>
          </div>
        )}
      </motion.button>

      {/* Label under node */}
      <div className="mt-1.5 text-center">
        <span className={`text-[10px] font-bold tracking-tight ${isUnlocked ? 'text-slate-300' : 'text-slate-500'}`}>
          {isBoss ? '👑 Boss Crown' : `Level ${level}`}
        </span>
      </div>
    </div>
  );
};
