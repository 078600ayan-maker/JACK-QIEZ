'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, CheckCircle2, Lock, Sparkles, BookOpen, Layers } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChapterMeta, SubjectMeta } from '@/types/manifest';
import { useUserStore } from '@/store/useUserStore';
import { playClickSound } from '@/lib/audioEngine';

interface SubjectChapterDrawerProps {
  subject: SubjectMeta | null;
  isOpen: boolean;
  onClose: () => void;
}

// Category mapping per subject (aligned 100% with 69 verified chapters)
const SYLLABUS_CATEGORIES: Record<string, Array<{ name: string; icon: string; range: number[] }>> = {
  sci: [
    { name: 'All Modules (13)', icon: '🔬', range: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] },
    { name: 'Chemistry (रसायन)', icon: '⚗️', range: [1, 2, 3, 4, 5] },
    { name: 'Biology (जीव विज्ञान)', icon: '🧬', range: [6, 7, 8, 9] },
    { name: 'Physics (भौतिकी)', icon: '⚡', range: [10, 11, 12, 13] }
  ],
  math: [
    { name: 'All Modules (14)', icon: '📐', range: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
    { name: 'Number & Algebra', icon: '🔢', range: [1, 2, 3, 4, 5] },
    { name: 'Geometry (ज्यामिति)', icon: '📏', range: [6, 7, 10] },
    { name: 'Trigonometry', icon: '📐', range: [8, 9] },
    { name: 'Mensuration (क्षेत्रमिति)', icon: '📦', range: [11, 12] },
    { name: 'Stats & Prob', icon: '📊', range: [13, 14] }
  ],
  sst: [
    { name: 'All Modules (14)', icon: '🌍', range: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
    { name: 'History (इतिहास)', icon: '🏛️', range: [1, 2, 3, 4] },
    { name: 'Geography (भूगोल)', icon: '🗺️', range: [5, 6, 7, 8] },
    { name: 'Civics (नागरिक शास्त्र)', icon: '⚖️', range: [9, 10, 11] },
    { name: 'Economics (अर्थशास्त्र)', icon: '📈', range: [12, 13, 14] }
  ],
  hin: [
    { name: 'All Modules (14)', icon: '📖', range: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
    { name: 'Kshitij Kavya (काव्य)', icon: '📘', range: [1, 2, 3, 4, 5, 6] },
    { name: 'Kshitij Gadya (गद्य)', icon: '📗', range: [7, 8, 9, 10, 11, 12] },
    { name: 'Kritika (कृतिका)', icon: '✍️', range: [13, 14] }
  ],
  eng: [
    { name: 'All Modules (14)', icon: '🔤', range: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
    { name: 'First Flight', icon: '🦅', range: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
    { name: 'Footprints & Grammar', icon: '👣', range: [10, 11, 12, 13, 14] }
  ]
};

export const SubjectChapterDrawer: React.FC<SubjectChapterDrawerProps> = ({
  subject,
  isOpen,
  onClose
}) => {
  const router = useRouter();
  const { profile, setActiveSubjectId } = useUserStore();
  const [activeCategoryIdx, setActiveCategoryIdx] = useState(0);

  React.useEffect(() => {
    setActiveCategoryIdx(0);
  }, [subject?.id, isOpen]);

  if (!isOpen || !subject) return null;

  const categories = SYLLABUS_CATEGORIES[subject.id] || [
    { name: 'All Modules', icon: '📚', range: subject.chapters.map(c => c.num) }
  ];

  const currentCategory = categories[activeCategoryIdx] || categories[0];
  const filteredChapters = subject.chapters.filter(ch =>
    currentCategory.range.includes(ch.num)
  );

  const handleStartChapter = (chId: string, levelNum: number) => {
    playClickSound();
    setActiveSubjectId(subject.id);
    onClose();
    router.push(`/quiz/${subject.id}/${chId}/${levelNum}`);
  };

  const handleOpenWindingPath = () => {
    playClickSound();
    setActiveSubjectId(subject.id);
    onClose();
    router.push('/path');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="relative w-full max-w-[480px] max-h-[88vh] rounded-t-3xl sm:rounded-3xl bg-gradient-to-b from-[#141C2E] to-[#090D16] border-t-2 border-white/20 sm:border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col select-none overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className="w-3.5 h-3.5 rounded-full shadow-[0_0_10px_currentColor]"
                style={{ backgroundColor: subject.themeColor, color: subject.themeColor }}
              />
              <div>
                <h3 className="text-base font-black text-white">{subject.title}</h3>
                <span className="text-[10px] text-slate-400 font-bold">
                  Class 10 Syllabus • {subject.totalChapters} Chapters • 5 Levels each
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick S-Curve Path CTA */}
          <div className="px-4 pt-3 pb-1">
            <button
              onClick={handleOpenWindingPath}
              className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-500/30 flex items-center justify-between text-xs font-bold text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Launch Interactive S-Curve 3D Map</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Categorization Filter Pills (Physics, Chemistry, Biology, etc.) */}
          <div className="px-4 py-2 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {categories.map((cat, idx) => {
              const isActive = activeCategoryIdx === idx;
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    playClickSound();
                    setActiveCategoryIdx(idx);
                  }}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Chapter List Scroll View */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
            {filteredChapters.map((ch) => {
              const userLevel = profile?.progress?.[ch.chId] ?? 0;
              const isCompleted = userLevel >= 5;

              return (
                <div
                  key={ch.chId}
                  className="rounded-2xl p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-black/40 flex items-center justify-center text-[10px] font-black text-slate-300 shrink-0">
                        {ch.num}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                        {ch.name}
                      </h4>
                    </div>

                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0 ml-2">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Mastered</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 shrink-0 ml-2">
                        {userLevel}/5 Levels
                      </span>
                    )}
                  </div>

                  {/* 5 Tier Mini Level Nodes Bar */}
                  <div className="grid grid-cols-5 gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((lvl) => {
                      const isUnlocked = lvl <= userLevel + 1;
                      const isDone = lvl <= userLevel;
                      const isBoss = lvl === 5;

                      return (
                        <button
                          key={lvl}
                          disabled={!isUnlocked}
                          onClick={() => handleStartChapter(ch.chId, lvl)}
                          className={`
                            py-1.5 rounded-xl text-[10px] font-black flex flex-col items-center justify-center transition-all cursor-pointer
                            ${isDone
                              ? 'bg-emerald-600/30 border border-emerald-500/50 text-emerald-300'
                              : isUnlocked
                              ? isBoss
                                ? 'bg-amber-500/30 border border-amber-400/80 text-amber-300 animate-pulse'
                                : 'bg-white/15 border border-white/20 text-white hover:scale-105 active:scale-95'
                              : 'bg-white/5 border border-white/5 text-slate-600 opacity-50 cursor-not-allowed'
                            }
                          `}
                        >
                          {isBoss ? (
                            <span>👑 Boss</span>
                          ) : isDone ? (
                            <span>Lvl {lvl} ✓</span>
                          ) : isUnlocked ? (
                            <span>Lvl {lvl}</span>
                          ) : (
                            <Lock className="w-3 h-3 text-slate-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
