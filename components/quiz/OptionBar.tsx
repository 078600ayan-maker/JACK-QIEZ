'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface OptionBarProps {
  label: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
  index: number;
  isSelected: boolean;
  isEliminated: boolean;
  isAnswerSubmitted: boolean;
  isCorrectAnswer: boolean;
  onSelect: () => void;
}

export const OptionBar: React.FC<OptionBarProps> = ({
  label,
  text,
  index,
  isSelected,
  isEliminated,
  isAnswerSubmitted,
  isCorrectAnswer,
  onSelect
}) => {
  // Determine state styles
  let cardStyles = 'bg-[rgba(30,41,59,0.65)] border-white/10 text-slate-200';
  let keycapStyles = 'bg-white/10 text-slate-300 border-white/20';
  let shadowStyle = '0 5px 0 #090D16';

  if (isEliminated) {
    cardStyles = 'opacity-25 scale-95 pointer-events-none bg-slate-900/40 border-transparent text-slate-500';
    keycapStyles = 'bg-slate-800 text-slate-600 border-transparent';
    shadowStyle = 'none';
  } else if (!isAnswerSubmitted) {
    if (isSelected) {
      cardStyles = 'bg-[#1E293B] border-[#F59E0B] text-white shadow-[0_0_16px_rgba(245,158,11,0.3)]';
      keycapStyles = 'bg-[#F59E0B] text-slate-950 font-black border-[#FBBF24]';
      shadowStyle = '0 5px 0 #B45309';
    } else {
      cardStyles = 'bg-[rgba(30,41,59,0.7)] border-white/10 hover:border-white/25 text-slate-200';
    }
  } else {
    // Answer submitted
    if (isCorrectAnswer) {
      cardStyles = 'bg-emerald-950/80 border-[#10B981] text-emerald-100 shadow-[0_0_24px_rgba(16,185,129,0.5)]';
      keycapStyles = 'bg-[#10B981] text-white font-black border-[#34D399]';
      shadowStyle = '0 5px 0 #047857';
    } else if (isSelected && !isCorrectAnswer) {
      cardStyles = 'bg-red-950/80 border-[#EF4444] text-red-100 shadow-[0_0_24px_rgba(239,68,68,0.5)]';
      keycapStyles = 'bg-[#EF4444] text-white font-black border-[#F87171]';
      shadowStyle = '0 5px 0 #991B1B';
    } else {
      cardStyles = 'opacity-40 bg-slate-900/60 border-white/5 text-slate-400';
      shadowStyle = '0 2px 0 #090D16';
    }
  }

  // Animation variants for Staggered Cascade
  return (
    <motion.button
      initial={{ opacity: 0, y: 15 }}
      animate={{
        opacity: isEliminated ? 0.25 : 1,
        y: 0,
        scale: isAnswerSubmitted && isCorrectAnswer ? 1.02 : 1
      }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      whileTap={!isAnswerSubmitted && !isEliminated ? { y: 4 } : {}}
      onClick={onSelect}
      disabled={isAnswerSubmitted || isEliminated}
      className={`
        w-full flex items-center justify-between p-3.5 rounded-[16px]
        border-t border-x border-b
        backdrop-blur-xl transition-all duration-150 select-none
        ${cardStyles}
      `}
      style={{
        boxShadow: shadowStyle
      }}
    >
      <div className="flex items-center gap-3.5 flex-1 pr-2">
        {/* 3D Keycap [A], [B], [C], [D] */}
        <div
          className={`
            w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black
            border-t border-x border-b shadow-[0_2px_0_rgba(0,0,0,0.4)]
            shrink-0 transition-colors duration-150
            ${keycapStyles}
          `}
        >
          {label}
        </div>

        {/* Option Text */}
        <span className="text-left text-sm font-semibold leading-relaxed tracking-wide">
          {text}
        </span>
      </div>

      {/* Answer Icon Check/X */}
      {isAnswerSubmitted && (
        <div className="shrink-0 pl-1">
          {isCorrectAnswer ? (
            <div className="w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center text-white shadow-[0_0_8px_#10B981]">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          ) : isSelected ? (
            <div className="w-6 h-6 rounded-full bg-[#EF4444] flex items-center justify-center text-white shadow-[0_0_8px_#EF4444]">
              <X className="w-4 h-4 stroke-[3]" />
            </div>
          ) : null}
        </div>
      )}
    </motion.button>
  );
};
