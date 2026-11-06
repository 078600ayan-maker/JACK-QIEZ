'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '@/store/useToastStore';

export const DynamicToast: React.FC = () => {
  const { visible, message, subtext, icon } = useToastStore();

  return (
    <div className="fixed top-3 inset-x-0 flex justify-center z-50 pointer-events-none px-4">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: -40, scale: 0.85, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -30, scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            className="pointer-events-auto flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#0D121F]/90 backdrop-blur-xl border border-[#F59E0B]/40 shadow-[0_8px_24px_rgba(0,0,0,0.6),0_0_16px_rgba(245,158,11,0.25)]"
          >
            <span className="text-xl animate-bounce">{icon}</span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white tracking-wide">{message}</span>
              {subtext && <span className="text-[10px] text-[#FBBF24]/80 font-medium">{subtext}</span>}
            </div>
            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-ping ml-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
