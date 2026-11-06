'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, Shield, Share2, Users, Calendar, Award, Check, Bell, Sparkles } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { TactileButton } from '@/components/ui/TactileButton';
import { playClickSound } from '@/lib/audioEngine';

interface StreakDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StreakDashboardModal: React.FC<StreakDashboardModalProps> = ({
  isOpen,
  onClose
}) => {
  const { profile } = useUserStore();
  const [buddies, setBuddies] = useState([
    { id: '1', name: 'Rachel Sharma', days: 66, avatar: '🌸', lessons: 45, xp: 4500, questions: 124, reminded: false },
    { id: '2', name: 'Ellis Kumar', days: 33, avatar: '⛏️', lessons: 28, xp: 2900, questions: 88, reminded: false },
    { id: '3', name: 'Stephen Hansda', days: 11, avatar: '🕶️', lessons: 14, xp: 1200, questions: 42, reminded: true }
  ]);
  const [activeTab, setActiveTab] = useState<'streak' | 'buddy'>('buddy');

  if (!isOpen) return null;

  const streakDays = profile?.streak ?? 1;
  const isShieldActive = profile?.streakShieldActive ?? true;

  const handleRemind = (id: string) => {
    playClickSound();
    setBuddies(prev =>
      prev.map(b => (b.id === id ? { ...b, reminded: true } : b))
    );
  };

  const handleShareProgress = async () => {
    playClickSound();
    const shareText = `🔥 I'm on a ${streakDays}-day learning streak on Jack Quiz (Class 10 JAC)! Study with me: https://jackquiz.study/invite`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Jack Quiz Study Streak',
          text: shareText,
          url: 'https://jackquiz.study'
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      alert('Streak invite copied to clipboard! Share it with your friends on WhatsApp.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="relative w-full max-w-[480px] max-h-[92vh] rounded-3xl bg-gradient-to-b from-[#141E33] to-[#090D16] border-2 border-orange-500/50 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(249,115,22,0.25)] p-5 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <Flame className="w-5 h-5 fill-orange-400" />
              </span>
              <div>
                <h3 className="text-base font-black text-white">Daily Streak & Buddy Hub</h3>
                <span className="text-[10px] text-amber-400 font-bold">
                  {streakDays} Days Consistent Learning &bull; Jack Quiz
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Switcher: Buddy Streak vs 30-Day Radar */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-2xl border border-white/5 mb-3">
            <button
              onClick={() => {
                playClickSound();
                setActiveTab('buddy');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-black transition-all ${
                activeTab === 'buddy'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-lg shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🤝 Buddy Streak (Airlearn Reference)
            </button>
            <button
              onClick={() => {
                playClickSound();
                setActiveTab('streak');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-black transition-all ${
                activeTab === 'streak'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-lg shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📅 30-Day Activity Radar
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto space-y-3.5 no-scrollbar pr-0.5">
            {activeTab === 'buddy' ? (
              <>
                {/* Airlearn Section 1: Hero Dual Mascot & Big Flame */}
                <div className="rounded-3xl p-4 bg-gradient-to-b from-orange-500/15 via-[#10192A] to-transparent border border-orange-500/30 text-center relative overflow-hidden">
                  <div className="flex items-center justify-center gap-6 my-2">
                    {/* Avatar 1: You (Minecraft Voxel Rig) */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-400 p-1 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                        <Image
                          src="/avatars/steve.svg"
                          alt="You"
                          width={42}
                          height={42}
                          className="object-contain"
                        />
                      </div>
                      <span className="text-[10px] font-black text-amber-300 mt-1">You</span>
                    </div>

                    {/* Central Giant Flame with Streak Count */}
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                      className="relative flex flex-col items-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-300 flex items-center justify-center shadow-[0_0_30px_#F59E0B]">
                        <Flame className="w-9 h-9 fill-white text-white drop-shadow-md" />
                      </div>
                      <span className="text-xl font-black text-amber-300 mt-1 font-mono">{streakDays}</span>
                    </motion.div>

                    {/* Avatar 2: Rachel (Buddy Rig) */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-14 h-14 rounded-2xl bg-pink-500/20 border-2 border-pink-400 p-1 flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                        <Image
                          src="/avatars/alex.svg"
                          alt="Rachel"
                          width={42}
                          height={42}
                          className="object-contain"
                        />
                      </div>
                      <span className="text-[10px] font-black text-pink-300 mt-1">Rachel</span>
                    </div>
                  </div>

                  <h4 className="text-base font-black text-white mt-1">Buddy Streak</h4>
                  <p className="text-[11px] text-slate-300 font-medium">
                    Buddies who learn together, stay together!
                  </p>
                </div>

                {/* Airlearn Section 2: Invite a Buddy Avatars Row */}
                <div className="rounded-2xl p-3.5 bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-black text-white">
                      Invite a buddy, spark the streak!
                    </span>
                    <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">
                      +100 XP Bonus
                    </span>
                  </div>

                  {/* Avatars with streak tags + dashed invite circles */}
                  <div className="flex items-center justify-between px-2 py-1">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-lg">
                        🐾
                      </div>
                      <span className="text-[9px] text-amber-400 font-bold mt-1">🔥 66</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-pink-500/20 border border-pink-400 flex items-center justify-center text-lg">
                        🌸
                      </div>
                      <span className="text-[9px] text-amber-400 font-bold mt-1">🔥 33</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-lg">
                        🕶️
                      </div>
                      <span className="text-[9px] text-amber-400 font-bold mt-1">🔥 11</span>
                    </div>
                    {/* Dashed Invite Slots */}
                    <button
                      onClick={handleShareProgress}
                      className="w-10 h-10 rounded-full border-2 border-dashed border-white/30 hover:border-amber-400 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
                    >
                      <span className="text-base font-black">+</span>
                    </button>
                    <button
                      onClick={handleShareProgress}
                      className="w-10 h-10 rounded-full border-2 border-dashed border-white/30 hover:border-amber-400 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
                    >
                      <span className="text-base font-black">+</span>
                    </button>
                  </div>

                  <button
                    onClick={handleShareProgress}
                    className="w-full mt-3 py-2 px-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-300 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share invite link</span>
                  </button>
                </div>

                {/* Airlearn Section 3: Remind your buddy list */}
                <div className="rounded-2xl p-3.5 bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-300">
                      Remind your buddy, keep the streak alive!
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </div>

                  <div className="space-y-1.5">
                    {buddies.map(f => (
                      <div
                        key={f.id}
                        className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{f.avatar}</span>
                          <div>
                            <span className="font-bold text-white block">{f.name}</span>
                            <span className="text-[9px] text-amber-400 font-bold">🔥 {f.days} days streak</span>
                          </div>
                        </div>

                        {f.reminded ? (
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5">
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Reminder sent</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRemind(f.id)}
                            className="text-[10px] font-black text-amber-400 hover:text-amber-300 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 transition-all cursor-pointer"
                          >
                            Remind
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Airlearn Section 4: Achievements Comparison (You vs Rachel) */}
                <div className="rounded-2xl p-3.5 bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🐾</span>
                      <span className="text-[11px] font-black text-white">You</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-300 uppercase">Head-to-Head</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black text-white">Rachel</span>
                      <span className="text-sm">🌸</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-white/10">
                    <div className="p-1.5 rounded-lg bg-black/30">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Lessons</span>
                      <span className="text-xs font-black text-emerald-400">80</span>
                      <span className="text-[10px] text-slate-500 mx-1">vs</span>
                      <span className="text-xs font-black text-pink-400">45</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/30">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">XP</span>
                      <span className="text-xs font-black text-emerald-400">10.1K</span>
                      <span className="text-[10px] text-slate-500 mx-1">vs</span>
                      <span className="text-xs font-black text-pink-400">4500</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/30">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Questions</span>
                      <span className="text-xs font-black text-emerald-400">160</span>
                      <span className="text-[10px] text-slate-500 mx-1">vs</span>
                      <span className="text-xs font-black text-pink-400">124</span>
                    </div>
                  </div>
                </div>

                {/* Fun • Friendly • Free Bottom Pill */}
                <div className="flex items-center justify-center gap-3 text-[10px] font-bold text-slate-400 py-1">
                  <span>Fun</span>
                  <span>&bull;</span>
                  <span>Friendly</span>
                  <span>&bull;</span>
                  <span>Free</span>
                </div>
              </>
            ) : (
              <>
                {/* 30-Day Activity Radar Tab */}
                <div className="rounded-2xl p-4 bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-transparent border border-orange-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-orange-400 tracking-wider block">
                      CURRENT STREAK
                    </span>
                    <div className="text-3xl font-black text-white tracking-tight">
                      {streakDays} <span className="text-base text-amber-400">Days 🔥</span>
                    </div>
                    <span className="text-[11px] text-slate-300 mt-1 block">
                      Top 5% consistency in Class 10 JAC
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
                    <Shield className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                    <span className="text-[9px] font-black uppercase text-emerald-300 block">
                      {isShieldActive ? 'Shield Active' : 'Unprotected'}
                    </span>
                    <span className="text-[8px] text-slate-400">1 Freeze Ready</span>
                  </div>
                </div>

                <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      <span>30-Day Activity Radar</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      {streakDays} / 30 Days
                    </span>
                  </div>

                  <div className="grid grid-cols-10 gap-1.5 pt-1">
                    {Array.from({ length: 30 }).map((_, idx) => {
                      const dayNum = idx + 1;
                      const isCompleted = dayNum <= streakDays;
                      const isToday = dayNum === streakDays;

                      return (
                        <div
                          key={dayNum}
                          className={`
                            aspect-square rounded-lg flex items-center justify-center text-[9px] font-bold transition-all
                            ${isToday
                              ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-black shadow-[0_0_10px_#F59E0B] font-black scale-105'
                              : isCompleted
                              ? 'bg-emerald-500/80 text-white'
                              : 'bg-white/5 border border-white/5 text-slate-600'
                            }
                          `}
                        >
                          {dayNum}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bottom Glowing Invite & Share Progress Button */}
          <div className="pt-3 border-t border-white/10">
            <button
              onClick={handleShareProgress}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-black font-black text-xs flex items-center justify-center gap-2 shadow-[0_4px_0_#C2410C,0_0_20px_rgba(249,115,22,0.4)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Invite a Buddy / Share Progress 🔥</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
