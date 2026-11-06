'use client';

import React, { useState } from 'react';
import { Flame, Heart, ChevronDown } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { SubjectSelectorModal } from './SubjectSelectorModal';
import { playClickSound } from '@/lib/audioEngine';

interface PathHUDProps {
  subjects: Array<{ id: string; title: string; themeColor: string; totalChapters: number }>;
}

export const PathHUD: React.FC<PathHUDProps> = ({ subjects }) => {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const { profile, activeSubjectId } = useUserStore();

  const currentSubject = subjects.find(s => s.id === activeSubjectId) || subjects[0];

  return (
    <>
      <header className="sticky top-3 z-30 px-3 w-full max-w-[480px] mx-auto select-none">
        <div className="flex items-center justify-between py-2 px-3.5 rounded-[999px] bg-[rgba(20,27,45,0.75)] backdrop-blur-[20px] backdrop-saturate-[180%] border-t border-white/25 border-x border-b border-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
          {/* Left: Subject Switcher Pill */}
          <button
            onClick={() => {
              playClickSound();
              setSelectorOpen(true);
            }}
            className="flex items-center gap-1.5 py-1 px-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 transition-all duration-150 active:scale-95"
          >
            <span
              className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]"
              style={{ backgroundColor: currentSubject?.themeColor || '#10B981', color: currentSubject?.themeColor || '#10B981' }}
            />
            <span className="text-xs font-bold text-white max-w-[95px] truncate">
              {currentSubject?.title.split(' ')[0] || 'Subject'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Center: Streak Flame & XP Counter */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B] drop-shadow-[0_0_6px_#F59E0B]" />
              <span className="text-xs font-black text-amber-300">
                {profile?.streak ?? 1}
              </span>
            </div>

            <div className="w-[1px] h-3 bg-white/15" />

            <div className="flex items-center gap-1">
              <span className="text-[10px] font-black text-[#FBBF24] tracking-wider">XP</span>
              <span className="text-xs font-black text-white">
                {profile?.xp ?? 0}
              </span>
            </div>
          </div>

          {/* Right: Hearts Counter */}
          <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-red-950/40 border border-red-500/20">
            <Heart className="w-4 h-4 text-[#EF4444] fill-[#EF4444] drop-shadow-[0_0_6px_#EF4444]" />
            <span className="text-xs font-black text-red-200">
              {profile?.hearts ?? 5}
            </span>
          </div>
        </div>
      </header>

      {/* Subject Switcher Modal */}
      {selectorOpen && (
        <SubjectSelectorModal
          subjects={subjects}
          onClose={() => setSelectorOpen(false)}
        />
      )}
    </>
  );
};
