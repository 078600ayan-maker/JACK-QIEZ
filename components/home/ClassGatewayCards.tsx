'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles, BookOpen, Compass, Award, CheckCircle, ChevronRight, Zap, FileText, PenTool } from 'lucide-react';
import { SubjectMeta } from '@/types/manifest';
import { SubjectChapterDrawer } from './SubjectChapterDrawer';
import { StudyResourceModal } from '@/components/content/StudyResourceModal';
import { playClickSound } from '@/lib/audioEngine';
import { useUserStore } from '@/store/useUserStore';

interface ClassGatewayCardsProps {
  subjects: SubjectMeta[];
}

export const ClassGatewayCards: React.FC<ClassGatewayCardsProps> = ({ subjects }) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectMeta | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [resourceMode, setResourceMode] = useState<'notes' | 'practice'>('notes');
  const { profile } = useUserStore();

  const handleOpenSubject = (sub: SubjectMeta) => {
    playClickSound();
    setSelectedSubject(sub);
    setDrawerOpen(true);
  };

  // Subject icons and subtitles mapping
  const subjectMetaInfo: Record<string, { icon: string; subtitle: string }> = {
    sci: { icon: '🔬', subtitle: 'Physics • Chemistry • Biology' },
    math: { icon: '📐', subtitle: 'Algebra • Geometry • Trig' },
    sst: { icon: '🌍', subtitle: 'History • Geo • Civics • Eco' },
    hin: { icon: '📖', subtitle: 'Kshitij • Kritika • Grammar' },
    eng: { icon: '🔤', subtitle: 'First Flight • Footprints' }
  };

  return (
    <div className="w-full space-y-4 select-none">
      {/* =========================================================================
          BENTO CARD 1: CLASS 10 (ACTIVE • UNLOCKED) WITH 5-SUBJECT INNER GRID
          ========================================================================= */}
      <div className="relative rounded-3xl p-5 bg-gradient-to-b from-[rgba(20,29,48,0.9)] to-[rgba(10,14,24,0.95)] backdrop-blur-2xl border-2 border-[#10B981] shadow-[0_0_25px_rgba(16,185,129,0.25),0_16px_40px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Glow ambient background accent */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header & Status */}
        <div className="relative flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-emerald-500/20 text-[#10B981] border border-emerald-500/30">
              <Sparkles className="w-5 h-5 fill-[#10B981]" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white tracking-tight">CLASS 10</h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[#80FF44] shadow-[0_0_10px_rgba(128,255,68,0.3)]">
                  ACTIVE • UNLOCKED
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-400">
                JAC Board 2026 Examination Master Syllabus
              </p>
            </div>
          </div>
        </div>

        {/* Unlocked Subjects Label */}
        <div className="flex items-center justify-between pt-1 pb-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
            5 Core Subjects (Tap to Open Chapters)
          </span>
          <span className="text-[10px] font-bold text-emerald-400">
            69 Chapters Unlocked
          </span>
        </div>

        {/* 5-Subject Polished Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {subjects.map((sub) => {
            const info = subjectMetaInfo[sub.id] || { icon: '📚', subtitle: 'Full Curriculum' };

            // Calculate user progress in this subject
            const completedCount = sub.chapters.filter(
              ch => (profile?.progress?.[ch.chId] ?? 0) >= 5
            ).length;
            const progressPercent = Math.round((completedCount / Math.max(1, sub.totalChapters)) * 100);

            return (
              <button
                key={sub.id}
                onClick={() => handleOpenSubject(sub)}
                className="group relative text-left p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-white/10 hover:border-white/25 transition-all duration-150 shadow-[0_4px_12px_rgba(0,0,0,0.3)] cursor-pointer overflow-hidden"
              >
                {/* Subject Theme Indicator Bar */}
                <div
                  className="absolute top-0 left-0 bottom-0 w-1.5 rounded-l-2xl"
                  style={{ backgroundColor: sub.themeColor }}
                />

                <div className="pl-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">
                      {info.icon}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-black text-white truncate">
                        {sub.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {info.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2 text-right">
                    <span className="text-[11px] font-black text-white">
                      {sub.totalChapters} Ch
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors ml-auto mt-0.5" />
                  </div>
                </div>

                {/* Progress Mini Bar */}
                <div className="mt-2.5 pl-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-black/40 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(8, progressPercent)}%`,
                        backgroundColor: sub.themeColor
                      }}
                    />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-slate-400">
                    {progressPercent}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          EQUAL 50/50 DUAL ACTION BUTTONS: [📄 NOTES] & [✍️ PRACTICE QUESTIONS]
          ========================================================================= */}
      <div className="grid grid-cols-2 gap-3 py-1">
        {/* Left: Notes Button */}
        <button
          onClick={() => {
            playClickSound();
            setResourceMode('notes');
            setResourceModalOpen(true);
          }}
          className="group relative flex items-center justify-center gap-2.5 py-3.5 px-3 rounded-2xl bg-gradient-to-b from-[#1C253D] via-[#141B2D] to-[#0E1424] border-2 border-amber-400/40 hover:border-amber-400 shadow-[0_8px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(245,158,11,0.15)] active:scale-[0.98] transition-all cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
            <FileText className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-left min-w-0">
            <span className="text-xs sm:text-sm font-black text-white leading-tight block truncate">
              📄 Notes
            </span>
            <span className="text-[9px] font-bold text-amber-300 block truncate">
              Chapter-wise PDFs
            </span>
          </div>
        </button>

        {/* Right: Practice Questions Button */}
        <button
          onClick={() => {
            playClickSound();
            setResourceMode('practice');
            setResourceModalOpen(true);
          }}
          className="group relative flex items-center justify-center gap-2.5 py-3.5 px-3 rounded-2xl bg-gradient-to-b from-[#1C253D] via-[#141B2D] to-[#0E1424] border-2 border-blue-400/40 hover:border-blue-400 shadow-[0_8px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(59,130,246,0.15)] active:scale-[0.98] transition-all cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
            <PenTool className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-left min-w-0">
            <span className="text-xs sm:text-sm font-black text-white leading-tight block truncate">
              ✍️ Practice
            </span>
            <span className="text-[9px] font-bold text-blue-300 block truncate">
              Question Bank
            </span>
          </div>
        </button>
      </div>

      {/* =========================================================================
          BENTO CARD 2: CLASS 9 (LOCKED • COMING SOON)
          ========================================================================= */}
      <div className="relative rounded-3xl p-4 bg-[rgba(16,21,34,0.6)] backdrop-blur-md border border-white/5 opacity-70 hover:opacity-85 transition-opacity shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-2xl bg-white/5 text-slate-500 border border-white/5">
              <Lock className="w-5 h-5 text-slate-400" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-300">CLASS 9</h3>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  LOCKED • COMING SOON
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Foundation Syllabus & Class 9 Question Bank in Production
              </p>
            </div>
          </div>
          <Lock className="w-4 h-4 text-slate-500 shrink-0" />
        </div>
      </div>

      {/* =========================================================================
          BENTO CARD 3: CLASS 8 (LOCKED • COMING SOON)
          ========================================================================= */}
      <div className="relative rounded-3xl p-4 bg-[rgba(16,21,34,0.6)] backdrop-blur-md border border-white/5 opacity-70 hover:opacity-85 transition-opacity shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-2xl bg-white/5 text-slate-500 border border-white/5">
              <Lock className="w-5 h-5 text-slate-400" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-300">CLASS 8</h3>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  LOCKED • COMING SOON
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Middle School Board Foundation & Mental Ability Drill
              </p>
            </div>
          </div>
          <Lock className="w-4 h-4 text-slate-500 shrink-0" />
        </div>
      </div>

      {/* Deep Chapter Drawer Modal */}
      <SubjectChapterDrawer
        subject={selectedSubject}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Chapter-wise Study Notes & Practice Questions Modal */}
      <StudyResourceModal
        isOpen={resourceModalOpen}
        mode={resourceMode}
        onClose={() => setResourceModalOpen(false)}
      />
    </div>
  );
};
