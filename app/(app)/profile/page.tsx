'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Trophy, Award, Heart, ExternalLink, Calendar, Users, LogOut, Sparkles, Palette } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { CrownBadge } from '@/components/ui/CrownBadge';
import { TactileButton } from '@/components/ui/TactileButton';
import { MinecraftAvatar3D } from '@/components/avatar/MinecraftAvatar3D';
import { AvatarCustomizerModal } from '@/components/avatar/AvatarCustomizerModal';
import { CHARACTER_PRESETS, AvatarCustomization } from '@/types/avatar';
import { getUserCurrentOreTier } from '@/types/ranking';
import { playClickSound, playAvatarCheer } from '@/lib/audioEngine';
import Image from 'next/image';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, refillHearts, updateCustomAvatar } = useUserStore();
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  const name = profile?.name || 'Royal Scholar';
  const email = profile?.email || 'scholar@studybuddy.royal';
  const xp = profile?.xp || 280;
  const streak = profile?.streak || 7;
  const hearts = profile?.hearts ?? 5;

  const currentOre = getUserCurrentOreTier(xp);
  const activeAvatarCustom =
    profile?.customAvatar || CHARACTER_PRESETS[0].defaultCustomization;

  const crownsWon = Object.values(profile?.progress || {}).filter(lvl => lvl >= 5).length;
  const scores = Object.values(profile?.levelScores || {});
  const avgAccuracy = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 88;

  const handleRefill = () => {
    playClickSound();
    refillHearts();
  };

  const handleLogout = () => {
    playClickSound();
    router.push('/login');
  };

  return (
    <div className="w-full max-w-[480px] mx-auto px-4 pt-3 pb-28 select-none">
      {/* CREATOR ATTRIBUTION & YOUTUBE BAR */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-white/10 mb-4 shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-2">
          <span className="text-sm">👑</span>
          <div>
            <div className="text-[11px] font-black text-white tracking-wide">
              Created by <span className="text-[#FBBF24]">Ayan Ali</span>
            </div>
            <div className="text-[9px] text-slate-400 font-semibold">
              Jack Quiz: Royal 3D Study Ecosystem
            </div>
          </div>
        </div>

        {/* Exact YouTube Button */}
        <a
          href="https://youtube.com/@jack_quiz?si=fT6w3HfWnB5a_oSl"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playClickSound()}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-[0_0_12px_rgba(239,68,68,0.4)] active:scale-95 transition-all"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <span>YouTube</span>
          <ExternalLink className="w-3 h-3 text-red-200" />
        </a>
      </div>

      {/* 3D Glass Profile Hero Card with 3D Avatar */}
      <div className="relative rounded-3xl p-6 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#090D16] border-t-2 border-white/25 border-x border-b border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.7)] overflow-hidden mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CrownBadge size="sm" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FBBF24]">
              ROYAL SCHOLAR IDENTITY
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-400">
            CLASS 10 JAC
          </span>
        </div>

        <div className="flex items-center justify-between my-2">
          <div className="flex-1 min-w-0 pr-2">
            <h2 className="text-xl font-black text-white tracking-tight truncate">
              {name}
            </h2>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {email}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
                <Image
                  src={currentOre.iconSvg}
                  alt={currentOre.name}
                  width={14}
                  height={14}
                  className="object-contain"
                />
                <span>{currentOre.name} Tier</span>
              </span>
              <button
                onClick={() => {
                  playClickSound();
                  setAvatarModalOpen(true);
                }}
                className="flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white cursor-pointer active:scale-95 transition-all"
              >
                <Palette className="w-3 h-3 text-amber-400" />
                <span>Customize (50+)</span>
              </button>
            </div>
          </div>

          {/* Minecraft 3D Avatar Rig Display */}
          <div
            onClick={() => {
              playClickSound();
              setAvatarModalOpen(true);
            }}
            className="shrink-0 flex flex-col items-center cursor-pointer group"
          >
            <div className="w-24 h-24 rounded-2xl bg-black/40 border-2 border-amber-400/30 overflow-hidden flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:scale-105 transition-transform">
              <MinecraftAvatar3D
                customization={activeAvatarCustom}
                animation="idle"
                size={96}
                showPedestal={false}
                interactive={false}
              />
            </div>
            <span className="text-[9px] font-black text-amber-300 mt-1 tracking-wider uppercase text-center max-w-[90px] truncate">
              {activeAvatarCustom.name}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/10">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">TOTAL SCORE</span>
            <div className="text-xl font-black text-white tracking-tight">
              {xp.toLocaleString()} <span className="text-xs text-[#FBBF24]">XP</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">LIFETIME RANK</span>
            <div className="text-sm font-black text-emerald-400 tracking-tight">
              Top 1% in India
            </div>
          </div>
        </div>
      </div>

      {/* 30-DAY STREAK CALENDAR WIDGET */}
      <div className="p-4 rounded-3xl bg-[rgba(30,41,59,0.65)] backdrop-blur-xl border border-white/10 mb-5 shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[#F59E0B]">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-wider text-white">30-Day Study Streak Radar</span>
          </div>
          <span className="text-xs font-black text-amber-300">{streak} Days Active</span>
        </div>

        {/* 30-Day Dot Grid */}
        <div className="grid grid-cols-10 gap-1.5 pt-1">
          {Array.from({ length: 30 }).map((_, idx) => {
            const isCompleted = idx < streak;
            const isToday = idx === streak - 1;

            return (
              <div
                key={idx}
                className={`
                  aspect-square rounded-lg flex items-center justify-center text-[8px] font-bold transition-all
                  ${isToday
                    ? 'bg-[#F59E0B] text-slate-950 shadow-[0_0_8px_#F59E0B] scale-110'
                    : isCompleted
                    ? 'bg-emerald-500/80 text-white'
                    : 'bg-white/5 border border-white/5 text-slate-600'}
                `}
                title={`Day ${idx + 1}`}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* DUO-BUDDY STATS WIDGET (Airlearn Inspired, Royal Dark Upgraded) */}
      <div className="p-4 rounded-3xl bg-[rgba(30,41,59,0.65)] backdrop-blur-xl border border-white/10 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-indigo-400">
            <Users className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-wider text-white">Duo-Buddy Synergy Stats</span>
          </div>
          <span className="text-[10px] font-bold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-500/30">
            Active Pairing
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
            <div className="text-[9px] text-slate-400 font-bold uppercase">Study Time</div>
            <div className="text-sm font-black text-white mt-0.5">14.2 Hrs</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
            <div className="text-[9px] text-slate-400 font-bold uppercase">Questions</div>
            <div className="text-sm font-black text-emerald-400 mt-0.5">328 Qs</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
            <div className="text-[9px] text-slate-400 font-bold uppercase">Duo XP Boost</div>
            <div className="text-sm font-black text-amber-300 mt-0.5">+450 XP</div>
          </div>
        </div>
      </div>

      {/* 4-Box Bento Grid for Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="p-4 rounded-2xl bg-[rgba(30,41,59,0.65)] border border-white/10">
          <div className="flex items-center justify-between text-[#F59E0B] mb-2">
            <Flame className="w-5 h-5 fill-[#F59E0B]" />
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">Flame</span>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{streak} Days</div>
          <div className="text-[11px] font-bold text-slate-400 mt-0.5">Daily Streak</div>
        </div>

        <div className="p-4 rounded-2xl bg-[rgba(30,41,59,0.65)] border border-white/10">
          <div className="flex items-center justify-between text-[#FBBF24] mb-2">
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">XP Power</span>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{xp}</div>
          <div className="text-[11px] font-bold text-slate-400 mt-0.5">Total XP Earned</div>
        </div>

        <div className="p-4 rounded-2xl bg-[rgba(30,41,59,0.65)] border border-white/10">
          <div className="flex items-center justify-between text-[#10B981] mb-2">
            <Award className="w-5 h-5" />
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Rate</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 tracking-tight">{avgAccuracy}%</div>
          <div className="text-[11px] font-bold text-slate-400 mt-0.5">Overall Accuracy</div>
        </div>

        <div className="p-4 rounded-2xl bg-[rgba(30,41,59,0.65)] border border-white/10">
          <div className="flex items-center justify-between text-[#F59E0B] mb-2">
            <CrownBadge size="sm" />
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">Boss Clears</span>
          </div>
          <div className="text-2xl font-black text-amber-300 tracking-tight">{crownsWon} 👑</div>
          <div className="text-[11px] font-bold text-slate-400 mt-0.5">Chapter Crowns</div>
        </div>
      </div>

      {/* Hearts Recovery Card */}
      <div className="p-4 rounded-2xl bg-[rgba(30,41,59,0.65)] border border-white/10 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-950/50 border border-red-500/30 flex items-center justify-center text-red-400">
            <Heart className="w-5 h-5 fill-red-500" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Hearts Status: {hearts} / 5</div>
            <div className="text-[10px] text-slate-400">Refill instantly to practice anytime</div>
          </div>
        </div>

        {hearts < 5 ? (
          <TactileButton variant="ruby" size="sm" onClick={handleRefill}>
            Refill (5)
          </TactileButton>
        ) : (
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/30">
            Full
          </span>
        )}
      </div>

      {/* Account Actions */}
      <div className="space-y-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-400 hover:text-white transition-all active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          <span>Switch Account or Sign Out</span>
        </button>
      </div>

      {/* Minecraft 3D Avatar Customizer Modal (50+ Attributes) */}
      <AvatarCustomizerModal
        isOpen={avatarModalOpen}
        initialCustomization={activeAvatarCustom}
        onSave={(newCustom) => {
          updateCustomAvatar(newCustom);
          playAvatarCheer();
        }}
        onClose={() => setAvatarModalOpen(false)}
      />
    </div>
  );
}
