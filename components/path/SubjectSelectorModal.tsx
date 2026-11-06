'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { playClickSound } from '@/lib/audioEngine';

interface SubjectItem {
  id: string;
  title: string;
  themeColor: string;
  totalChapters: number;
}

interface SubjectSelectorModalProps {
  subjects: SubjectItem[];
  onClose: () => void;
}

export const SubjectSelectorModal: React.FC<SubjectSelectorModalProps> = ({ subjects, onClose }) => {
  const { activeSubjectId, setActiveSubjectId, profile } = useUserStore();

  const handleSelect = (id: string) => {
    playClickSound();
    setActiveSubjectId(id);
    onClose();
  };

  // Calculate completed chapters per subject
  const getCompletedChapters = (subId: string, total: number) => {
    if (!profile?.progress) return 0;
    let count = 0;
    for (let i = 1; i <= total; i++) {
      const numPad = String(i).padStart(2, '0');
      const key = `${subId}_ch${numPad}`;
      if ((profile.progress[key] || 0) >= 5) {
        count++;
      }
    }
    return count;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="w-full max-w-[420px] rounded-3xl bg-[rgba(16,22,36,0.92)] backdrop-blur-2xl border-t border-white/20 border-x border-b border-white/10 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-white/10">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-lg">📚</span> Choose Subject (विषय चुनें)
            </h2>
            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/15 text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Subject List */}
          <div className="space-y-2.5">
            {subjects.map((sub) => {
              const isSelected = sub.id === activeSubjectId;
              const completed = getCompletedChapters(sub.id, sub.totalChapters);
              const progressRatio = completed / sub.totalChapters;
              const circumference = 2 * Math.PI * 14; // r=14

              return (
                <button
                  key={sub.id}
                  onClick={() => handleSelect(sub.id)}
                  className={`
                    w-full flex items-center justify-between p-3.5 rounded-2xl
                    border transition-all duration-150
                    ${isSelected
                      ? 'bg-white/12 border-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                      : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full shadow-[0_0_10px_currentColor]"
                      style={{ backgroundColor: sub.themeColor, color: sub.themeColor }}
                    />
                    <div className="text-left">
                      <div className="text-sm font-bold text-white tracking-wide">{sub.title}</div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {sub.totalChapters} NCERT Chapters
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Chapter Progress Ring */}
                    <div className="relative w-8 h-8 flex items-center justify-center">
                      <svg className="w-8 h-8 -rotate-90">
                        <circle
                          cx="16"
                          cy="16"
                          r="12"
                          stroke="rgba(255,255,255,0.12)"
                          strokeWidth="2.5"
                          fill="transparent"
                        />
                        <circle
                          cx="16"
                          cy="16"
                          r="12"
                          stroke={sub.themeColor}
                          strokeWidth="2.5"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 12}
                          strokeDashoffset={2 * Math.PI * 12 * (1 - progressRatio)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-[8px] font-black text-white">
                        {completed}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center text-white">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
