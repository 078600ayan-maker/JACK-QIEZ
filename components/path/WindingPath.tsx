'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Target, Award, Users, Sparkles, Shield, Lock } from 'lucide-react';
import { ChapterMeta } from '@/types/manifest';
import { LevelNode } from './LevelNode';
import { CrownBadge } from '@/components/ui/CrownBadge';
import { isLevelUnlocked, isLevelCompleted } from '@/lib/lockState';
import { useUserStore } from '@/store/useUserStore';
import { playClickSound, playVictorySound } from '@/lib/audioEngine';
import { TactileButton } from '@/components/ui/TactileButton';

interface WindingPathProps {
  chapters: ChapterMeta[];
  subjectId: string;
}

export const WindingPath: React.FC<WindingPathProps> = ({ chapters, subjectId }) => {
  const router = useRouter();
  const { profile } = useUserStore();

  const [introModal, setIntroModal] = useState<{
    chId: string;
    chName: string;
    chNum: number;
    level: number;
  } | null>(null);

  const progressState = {
    progress: profile?.progress || {},
    levelScores: profile?.levelScores || {}
  };

  // Node X offsets for S-Curve: center -> left-offset -> center -> right-offset -> center
  const xOffsets = [0, -68, 0, 68, 0];

  const handleNodeClick = (ch: ChapterMeta, level: number) => {
    playClickSound();
    setIntroModal({
      chId: ch.chId,
      chName: ch.name,
      chNum: ch.num,
      level
    });
  };

  const handleLaunchQuiz = () => {
    if (!introModal) return;
    playClickSound();
    router.push(`/quiz/${subjectId}/${introModal.chId}/${introModal.level}`);
  };

  // Ghost online players mock distribution
  const ghostPlayers: Record<string, { name: string; avatar: string }> = {
    '1': { name: 'Ellis', avatar: '⛏️' },
    '3': { name: 'Rachel', avatar: '🌸' },
    '5': { name: 'Aarav', avatar: '👑' }
  };

  return (
    <div className="w-full max-w-[480px] mx-auto px-4 pb-28 pt-2 select-none relative z-10">
      {chapters.map((ch) => {
        const completedLevelsInCh = [1, 2, 3, 4, 5].filter(lvl =>
          isLevelCompleted(ch.chId, lvl, progressState)
        ).length;
        const isChapterMastered = completedLevelsInCh >= 5;

        return (
          <section key={ch.chId} className="my-8 relative">
            {/* Sticky 3D Chapter Banner Card */}
            <div className="sticky top-16 z-20 mb-8 mx-auto">
              <div className="relative rounded-2xl p-4 bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border-t border-white/20 border-x border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex items-center justify-between">
                <div className="flex-1 pr-3">
                  <div className="text-[10px] font-black uppercase tracking-wider text-[#F59E0B] flex items-center gap-1.5">
                    <span>CHAPTER {ch.num}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-500" />
                    <span className="text-slate-400 font-medium">Class 10 JAC</span>
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-tight mt-0.5 leading-snug line-clamp-1">
                    {ch.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-400">Mastery</div>
                    <div className="text-xs font-black text-[#FBBF24]">
                      {completedLevelsInCh}/5 ★
                    </div>
                  </div>
                  {isChapterMastered && <CrownBadge size="sm" />}
                </div>
              </div>
            </div>

            {/* S-Curve Nodes & SVG Connector */}
            <div className="relative flex flex-col items-center justify-center my-4 py-2">
              {/* Vertical SVG S-Curve Path Behind Nodes */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ overflow: 'visible' }}
              >
                <defs>
                  <linearGradient id={`pathGlow-${ch.chId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="50%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>

                {/* S-Curve connecting lines */}
                {[1, 2, 3, 4].map((fromLvl) => {
                  const toLvl = fromLvl + 1;
                  const fromUnlocked = isLevelUnlocked(ch.chId, fromLvl, ch.num, subjectId, progressState);
                  const toUnlocked = isLevelUnlocked(ch.chId, toLvl, ch.num, subjectId, progressState);
                  const isLineActive = fromUnlocked && toUnlocked;

                  const y1 = (fromLvl - 1) * 110 + 44;
                  const x1 = 240 + xOffsets[fromLvl - 1];
                  const y2 = (toLvl - 1) * 110 + 44;
                  const x2 = 240 + xOffsets[toLvl - 1];

                  return (
                    <g key={`path-${fromLvl}-${toLvl}`}>
                      {/* Underlying dashed grey path */}
                      <path
                        d={`M ${x1} ${y1} C ${x1} ${(y1 + y2) / 2}, ${x2} ${(y1 + y2) / 2}, ${x2} ${y2}`}
                        stroke="rgba(255, 255, 255, 0.12)"
                        strokeWidth="8"
                        strokeDasharray="6 8"
                        fill="none"
                        strokeLinecap="round"
                      />

                      {/* Neon glowing active line */}
                      {isLineActive && (
                        <path
                          d={`M ${x1} ${y1} C ${x1} ${(y1 + y2) / 2}, ${x2} ${(y1 + y2) / 2}, ${x2} ${y2}`}
                          stroke={`url(#pathGlow-${ch.chId})`}
                          strokeWidth="6"
                          fill="none"
                          strokeLinecap="round"
                          style={{
                            filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))'
                          }}
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* 5 Level Nodes rendered with S-Curve offsets */}
              {[1, 2, 3, 4, 5].map((lvl, index) => {
                const unlocked = isLevelUnlocked(ch.chId, lvl, ch.num, subjectId, progressState);
                const completed = isLevelCompleted(ch.chId, lvl, progressState);
                const score = progressState.levelScores?.[`${ch.chId}_lvl${lvl}`];
                const isActive = unlocked && !completed;
                const ghost = ghostPlayers[String(lvl)];

                return (
                  <div
                    key={`${ch.chId}-lvl-${lvl}`}
                    className="relative w-full flex items-center justify-center my-3"
                    style={{
                      transform: `translateX(${xOffsets[index]}px)`
                    }}
                  >
                    {/* Ghost Multiplayer Online Companion Pill */}
                    {ghost && unlocked && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full bg-blue-950/70 border border-blue-400/40 text-[9px] font-black text-cyan-200 flex items-center gap-1 shadow-[0_0_10px_rgba(56,189,248,0.3)] animate-pulse pointer-events-none">
                        <span>{ghost.avatar}</span>
                        <span>{ghost.name} online</span>
                      </div>
                    )}

                    <LevelNode
                      level={lvl}
                      isUnlocked={unlocked}
                      isCompleted={completed}
                      isActive={isActive}
                      scorePercent={score}
                      onClick={() => handleNodeClick(ch, lvl)}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* CINEMATIC CHAPTER INTRO MODAL */}
      <AnimatePresence>
        {introModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 30 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="relative w-full max-w-[420px] rounded-3xl bg-gradient-to-b from-[#141E33] to-[#090D16] border-2 border-amber-500/50 shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-5 select-none overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-amber-500/20 text-[#F59E0B]">
                    <Sparkles className="w-5 h-5 fill-[#F59E0B]" />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wide">
                      Chapter {introModal.chNum} • Level {introModal.level}
                    </h3>
                    <span className="text-[10px] text-amber-400 font-bold">
                      {introModal.level === 5 ? '👑 Hex-Shield Boss Challenge' : `Tier ${introModal.level} Quiz`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIntroModal(null)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title & Scope */}
              <div className="mb-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center text-3xl mb-2 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                  {introModal.level === 5 ? '👑' : '🎯'}
                </div>
                <h4 className="text-base font-black text-white leading-snug">
                  {introModal.chName}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  10 Questions • Passing Gate: ≥ 75% Score
                </p>
              </div>

              {/* Rules / Rewards */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">REWARD</span>
                  <span className="text-sm font-black text-amber-300">+20 to +100 XP</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">PASS GATE</span>
                  <span className="text-sm font-black text-emerald-400">≥ 75% Score</span>
                </div>
              </div>

              {/* Action Button */}
              <TactileButton
                variant="gold"
                fullWidth
                size="lg"
                onClick={handleLaunchQuiz}
              >
                Launch Level {introModal.level} 🚀
              </TactileButton>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
