'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { TactileButton } from '@/components/ui/TactileButton';
import { MinecraftAvatar3D } from '@/components/avatar/MinecraftAvatar3D';

interface ExplanationDrawerProps {
  isOpen: boolean;
  isCorrect: boolean;
  explanation: string;
  onContinue: () => void;
}

export const ExplanationDrawer: React.FC<ExplanationDrawerProps> = ({
  isOpen,
  isCorrect,
  explanation,
  onContinue
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className={`
            fixed bottom-0 inset-x-0 mx-auto max-w-[480px] z-50 p-5 rounded-t-[28px]
            backdrop-blur-2xl border-t-2 shadow-[0_-12px_40px_rgba(0,0,0,0.85)]
            select-none
            ${isCorrect
              ? 'bg-[rgba(6,44,30,0.95)] border-[#10B981]'
              : 'bg-[rgba(55,14,14,0.95)] border-[#EF4444]'}
          `}
        >
          {/* Top Row: Octopops Mascot Talking + Feedback */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              {isCorrect ? (
                <div className="flex items-center gap-2 text-[#34D399]">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                  <span className="text-base font-black tracking-wide">Excellent! (शानदार!)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[#F87171]">
                  <XCircle className="w-6 h-6 stroke-[2.5]" />
                  <span className="text-base font-black tracking-wide">Incorrect! (गलत उत्तर)</span>
                </div>
              )}
            </div>

            {/* 3D Minecraft Avatar Reaction */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-12 h-12 rounded-xl bg-black/40 overflow-hidden flex items-center justify-center p-0.5 border border-white/10">
                <MinecraftAvatar3D animation={isCorrect ? 'cheer' : 'cry'} size={48} showPedestal={false} interactive={false} />
              </div>
              <span className="text-[9px] font-black uppercase text-amber-300">
                3D Rig
              </span>
            </div>
          </div>

          {/* Explanation text */}
          <p className="text-xs sm:text-sm font-medium text-slate-200 mb-4 leading-relaxed line-clamp-2">
            {explanation}
          </p>

          {/* Continue Button */}
          <TactileButton
            variant={isCorrect ? 'emerald' : 'ruby'}
            fullWidth
            size="md"
            onClick={onContinue}
            className="flex items-center justify-center gap-2 text-sm tracking-wide"
          >
            <span>CONTINUE</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </TactileButton>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
