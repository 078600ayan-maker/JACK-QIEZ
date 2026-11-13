'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Zap,
  Flame,
  Trophy,
  Sparkles,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  Music,
  Download,
  Award,
  CheckCircle2,
  WifiOff,
  Palette,
  ArrowRight,
  PhoneCall
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { Manifest, SubjectMeta } from '@/types/manifest';
import { MinecraftAvatar3D } from '@/components/avatar/MinecraftAvatar3D';
import { MinecraftVoxelCharacter } from '@/components/avatar/MinecraftVoxelCharacter';
import { autoHealAppCache } from '@/lib/cacheSanitizer';
import { AvatarCustomizerModal } from '@/components/avatar/AvatarCustomizerModal';
import { ProfilePhotoModal } from '@/components/profile/ProfilePhotoModal';
import { AvatarAnimationState, AvatarCustomization, CHARACTER_PRESETS } from '@/types/avatar';
import { ClassGatewayCards } from '@/components/home/ClassGatewayCards';
import { SpeedDrillModal } from '@/components/home/SpeedDrillModal';
import { StreakDashboardModal } from '@/components/streak/StreakDashboardModal';
import { ProgressReportModal } from '@/components/report/ProgressReportModal';
import { LiveCallModal } from '@/components/ai-calling/LiveCallModal';
import { BilingualLanguageToggle } from '@/components/ui/BilingualLanguageToggle';
import { LiveMultiplayerComparison } from '@/components/multiplayer/LiveMultiplayerComparison';
import { DualArenaHeroSection } from '@/components/arena/DualArenaHeroSection';
import { HardestWordsModule } from '@/components/modules/HardestWordsModule';
import { HardestWordsLevel3Module } from '@/components/modules/HardestWordsLevel3Module';
import { HardestWordsLevel4BossModule } from '@/components/modules/HardestWordsLevel4BossModule';
import { HardestWordsLevel5EliteModule } from '@/components/modules/HardestWordsLevel5EliteModule';
import { HardestWordsLevel6FinalBossModule } from '@/components/modules/HardestWordsLevel6FinalBossModule';
import {
  playClickSound,
  toggleLofiAmbient,
  playWelcomeRoutine,
  playAvatarJump,
  playAvatarCheer
} from '@/lib/audioEngine';
import { getUserCurrentOreTier } from '@/types/ranking';

export default function HomeLobbyPage() {
  const { profile, updateCustomAvatar, updateProfilePhoto } = useUserStore();
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [drillOpen, setDrillOpen] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [streakModalOpen, setStreakModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [dpModalOpen, setDpModalOpen] = useState(false);
  const [isLofiPlaying, setIsLofiPlaying] = useState(false);
  const [offlineCached, setOfflineCached] = useState(false);
  const [cachingProgress, setCachingProgress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatarAnim, setAvatarAnim] = useState<AvatarAnimationState>('idle');
  const [activeHardWordLevel, setActiveHardWordLevel] = useState<number | null>(null);

  const userName = profile?.name ? profile.name.split(' ')[0] : 'Scholar';
  const userXp = profile?.xp ?? 280;
  const userStreak = profile?.streak ?? 7;
  const currentOreTier = getUserCurrentOreTier(userXp);

  const activeAvatarCustom =
    profile?.customAvatar || CHARACTER_PRESETS[0].defaultCustomization;

  // Trigger Welcome Routine on Launch
  useEffect(() => {
    let triggered = false;
    const handleFirstInteraction = () => {
      if (!triggered) {
        triggered = true;
        playWelcomeRoutine(userName);
      }
      window.removeEventListener('click', handleFirstInteraction);
    };

    // Attempt immediately, or latch to first click for browser audio security
    try {
      playWelcomeRoutine(userName);
    } catch {
      window.addEventListener('click', handleFirstInteraction, { once: true });
    }

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
    };
  }, [userName]);

  useEffect(() => {
    autoHealAppCache();
    async function loadData() {
      try {
        const res = await fetch('/data/manifest.json');
        if (res.ok) {
          const data: Manifest = await res.json();
          setManifest(data);
        }
      } catch (err) {
        console.error('Failed to load manifest.json in lobby', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 1-Click Offline Pre-Caching of all chapter databases
  const handlePreCacheOffline = async () => {
    playClickSound();
    setCachingProgress(true);

    try {
      const folders = ['science', 'math', 'social_science', 'hindi', 'english'];
      const maxChapters = [13, 14, 14, 14, 14];
      const useEn = profile?.languagePreference === 'en';

      for (let f = 0; f < folders.length; f++) {
        const folder = useEn ? `${folders[f]}_en` : folders[f];
        const count = maxChapters[f];
        for (let c = 1; c <= count; c++) {
          const chStr = String(c).padStart(2, '0');
          const res = await fetch(`/data/${folder}/ch_${chStr}.json`);
          if (res.ok) {
            const data = await res.json();
            try {
              localStorage.setItem(`sbr_cache_v5_/data/${folder}/ch_${chStr}.json`, JSON.stringify({ v: 5, data }));
            } catch {
              // quota limits
            }
          }
        }
      }
      setOfflineCached(true);
      alert('⚡ Offline Database Pre-Cached! You can now study all 69 chapters (10,350+ Q&A) without internet.');
    } catch (err) {
      console.warn('Offline cache error:', err);
    } finally {
      setCachingProgress(false);
    }
  };

  const handleToggleLofi = () => {
    playClickSound();
    const active = toggleLofiAmbient();
    setIsLofiPlaying(active);
  };

  const handleSaveAvatar = (newCustom: AvatarCustomization) => {
    updateCustomAvatar(newCustom);
    setAvatarAnim('cheer');
    setTimeout(() => setAvatarAnim('idle'), 2400);
  };

  return (
    <div className="w-full max-w-[480px] mx-auto px-4 pt-3 pb-44 select-none space-y-4">
      {/* =========================================================================
          1. TOP HUD: DYNAMIC "WELCOME BACK, [USER NAME]" & GLOWING 60S SPEED DRILL
          ========================================================================= */}
      <header className="sticky top-2 z-30 w-full rounded-2xl bg-[rgba(20,27,45,0.85)] backdrop-blur-[20px] backdrop-saturate-[180%] border-t border-white/25 border-x border-b border-white/10 p-3 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Dynamic Greeting with Active Profile Photo (Links directly to Student Profile) */}
          <Link
            href="/profile"
            onClick={() => playClickSound()}
            className="flex items-center gap-2.5 min-w-0 group cursor-pointer"
            title="Open Student Profile & Follow Status"
          >
            <div
              className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.5)] shrink-0 border-2 border-amber-400 bg-slate-900 p-0.5 group-hover:scale-105 active:scale-95 transition-all"
            >
              <img
                src={profile?.photoURL || '/assets/profile_photos/IMG_20261109_001512.png'}
                alt="Scholar DP"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/profile_photos/IMG_20261109_001512.png';
                }}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider group-hover:text-amber-300 transition-colors">
                Welcome back,
              </span>
              <h2 className="text-sm font-black text-white group-hover:text-amber-300 truncate leading-tight transition-colors">
                {userName}! 👋
              </h2>
            </div>
          </Link>

          {/* Right: Quick Action Controls & Compact 60s Speed Drill */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Live AI Voice Call Button (Sleek Micro-Pill) */}
            <button
              onClick={() => {
                playClickSound();
                setCallModalOpen(true);
              }}
              title="Call Delhi Study Buddy"
              className="flex items-center gap-1 py-1 px-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 font-black text-[10px] shadow-[0_0_12px_rgba(16,185,129,0.25)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <PhoneCall className="w-3 h-3 text-emerald-400 animate-bounce" />
              <span>Call Buddy</span>
            </button>

            {/* Glowing 60s Rapid Drill Button (Sleek Micro-Pill) */}
            <button
              onClick={() => {
                playClickSound();
                setDrillOpen(true);
              }}
              className="group relative flex items-center gap-1 py-1 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-[10px] shadow-[0_3px_0_#B45309,0_0_15px_rgba(245,158,11,0.4)] hover:brightness-110 active:translate-y-0.5 active:shadow-[0_1px_0_#B45309] transition-all cursor-pointer"
            >
              <Zap className="w-3 h-3 fill-black text-black group-hover:scale-110 transition-transform" />
              <span className="uppercase tracking-tight">60s Drill</span>
            </button>
          </div>
        </div>

        {/* Mini Stats Bar with Clickable Daily Streak Flame & Mineral Tier */}
        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/10 text-xs">
          {/* Daily Streak Micro-Badge */}
          <button
            onClick={() => {
              playClickSound();
              setStreakModalOpen(true);
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 transition-all cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400 drop-shadow-[0_0_6px_#FB923C]" />
            <span className="font-black text-amber-300 text-[10px]">{userStreak}d</span>
          </button>

          {/* Minecraft Ore Tier Badge (Compact: Mineral Icon + Name, No 'Ranking' or 'Tier' text) */}
          <Link
            href="/leaderboard"
            onClick={() => playClickSound()}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 border border-amber-400/30 hover:border-amber-400 transition-all"
          >
            <Image
              src={currentOreTier.iconSvg}
              alt={currentOreTier.name}
              width={13}
              height={13}
              className="object-contain"
            />
            <span className="text-[10px] font-black text-amber-300">
              {currentOreTier.name.split(' ')[0]}
            </span>
          </Link>

          {/* Bilingual Language Switcher */}
          <BilingualLanguageToggle size="sm" />
        </div>
      </header>

      {/* =========================================================================
          CREATOR ATTRIBUTION & LIVE ONLINE STATUS BANNER
          ========================================================================= */}
      <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[rgba(26,34,53,0.7)] backdrop-blur-md border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-2">
          <span className="text-xs">👑</span>
          <span className="text-[10px] font-black text-white">
            Created by <span className="text-[#FBBF24]">Ayan Ali</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Online Server Pill */}
          <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-xl text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ONLINE SERVER</span>
          </div>

          {/* Official YouTube Channel */}
          <a
            href="https://youtube.com/@jack_quiz?si=fT6w3HfWnB5a_oSl"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playClickSound()}
            className="flex items-center gap-1.5 py-1 px-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold shadow-[0_0_10px_rgba(239,68,68,0.4)] active:scale-95 transition-all"
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span>@jack_quiz</span>
            <ExternalLink className="w-2.5 h-2.5 text-red-200" />
          </a>
        </div>
      </div>

      {/* =========================================================================
          2. 3D OCTOPUS BOT & COMPANION HERO ENGINE (DUOLINGO EMOTIONS • 60 FPS)
          ========================================================================= */}
      <section className="relative rounded-3xl p-4 bg-gradient-to-b from-[rgba(26,34,53,0.85)] via-[rgba(16,22,35,0.92)] to-[rgba(10,14,24,0.98)] backdrop-blur-2xl border-2 border-emerald-500/40 shadow-[0_12px_36px_rgba(0,0,0,0.65),0_0_20px_rgba(16,185,129,0.15)] flex flex-col items-center justify-center overflow-hidden">
        {/* Glow ambient background accent */}
        <div className="absolute top-0 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Control Bar on Avatar Card */}
        <div className="w-full flex items-center justify-between mb-2 z-10">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[10px] font-black">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>3D Scholar Avatar</span>
          </div>

          <button
            onClick={() => {
              playClickSound();
              setAvatarModalOpen(true);
            }}
            className="flex items-center gap-1.5 py-1 px-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[10px] font-black shadow-[0_2px_8px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Palette className="w-3 h-3 text-black" />
            <span>AI Avatar</span><span className="px-1.5 py-0.2 rounded bg-black/20 text-[8px] font-mono font-black">v1.1</span>
          </button>
        </div>

        {/* Dynamic 3D Minecraft Avatar */}
        <MinecraftVoxelCharacter
          skinPath={activeAvatarCustom.skinPath || '/skins/boy/skullwar.png'}
          mode="hero"
          size={250}
          animation={avatarAnim as any}
          showPedestal={true}
          pedestalType="diamond"
          showSecondLayer={true}
          interactive={true}
          onClick={() => {
            playAvatarCheer();
            setAvatarAnim('cheer');
            setTimeout(() => setAvatarAnim('idle'), 2200);
          }}
        />

        {/* Interactive Avatar Mood / Poke Bar */}
        <div className="w-full flex items-center justify-center gap-2 mt-2 z-10">
          <button
            onClick={() => {
              playAvatarJump();
              setAvatarAnim('cheer');
              setTimeout(() => setAvatarAnim('idle'), 2000);
            }}
            className="py-1 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-[10px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            👋 Tap to Wave
          </button>

          <span className="text-[9px] font-mono text-slate-400">
            • Drag to Spin 360° •
          </span>
        </div>
      </section>

      {/* =========================================================================
          DUAL ARENA ARCHITECTURE: STUDY FRIEND ARENA & FUN ARENA 2D
          ========================================================================= */}
      <section>
        <DualArenaHeroSection />
      </section>

      {/* =========================================================================
          REAL-TIME MULTIPLAYER STREAM (DUAL-STREAM FRIEND COMPARISON & 1-TAP SYNC)
          ========================================================================= */}
      <section>
        <LiveMultiplayerComparison />
      </section>

      {/* =========================================================================
          3. HARDEST WORDS VOCABULARY ARENA (PARTS 1 TO 6)
          ========================================================================= */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 font-black text-xs">⚡</span>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Hardest Words Series (Parts 1-6)
            </h3>
          </div>
          <span className="text-[10px] font-black text-[#B6FF40] px-2 py-0.5 rounded-full bg-[#B6FF40]/10 border border-[#B6FF40]/30 animate-pulse">
            NEW MASTER ARENA
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { level: 2, name: 'Part 2', title: 'Hard', xp: '+20 XP', color: '#10B981' },
            { level: 3, name: 'Part 3', title: 'Extreme', xp: '+25 XP', color: '#EF4444' },
            { level: 4, name: 'Part 4', title: 'Boss Phase', xp: '+50 XP', color: '#F59E0B' },
            { level: 5, name: 'Part 5', title: 'Elite Mastery', xp: '+100 XP', color: '#8B5CF6' },
            { level: 6, name: 'Part 6', title: 'Ultimate Boss', xp: '+200 XP', color: '#B6FF40' }
          ].map((item) => (
            <button
              key={item.level}
              onClick={() => {
                playClickSound();
                setActiveHardWordLevel(item.level);
              }}
              className="p-3 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 border border-white/15 hover:border-[#B6FF40]/60 transition-all text-left group cursor-pointer shadow-lg active:scale-95 flex flex-col justify-between"
            >
              <div>
                <span className="text-[9px] font-mono font-black text-slate-400 block uppercase">
                  {item.name}
                </span>
                <span className="text-xs font-black text-white group-hover:text-[#B6FF40] transition-colors block mt-0.5">
                  {item.title}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[9px] font-black text-amber-400">
                  {item.xp}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-[#B6FF40] transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* =========================================================================
          4. DEEP SUBJECTS DIRECT SHORTCUT (5 CORE SUBJECTS)
          ========================================================================= */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
            Class 10 Subject Categorization
          </h3>
          <Link
            href="/subjects"
            onClick={() => playClickSound()}
            className="flex items-center gap-1 text-[11px] font-black text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 5 Subjects Quick Horizontal Strip */}
        <div className="grid grid-cols-5 gap-2">
          {[
            { id: 'math', name: 'Math', svg: '/subjects/math.svg' },
            { id: 'science', name: 'Science', svg: '/subjects/science.svg' },
            { id: 'english', name: 'English', svg: '/subjects/english.svg' },
            { id: 'sst', name: 'SST', svg: '/subjects/sst.svg' },
            { id: 'hindi', name: 'Hindi', svg: '/subjects/hindi.svg' }
          ].map(s => (
            <Link
              key={s.id}
              href="/subjects"
              onClick={() => playClickSound()}
              className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center gap-1.5 transition-all group hover:scale-105 active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
            >
              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-black/40 p-0.5">
                <Image
                  src={s.svg}
                  alt={s.name}
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <span className="text-[10px] font-black text-slate-300 group-hover:text-white truncate">
                {s.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================================================
          4. CLASS SELECTION GATEWAY (CLASS 10 UNLOCKED + CLASS 9/8 LOCKED)
          ========================================================================= */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
            Class Selection Gateway
          </h3>
          <span className="text-[10px] font-bold text-slate-400">
            JAC Board Ecosystem
          </span>
        </div>

        {manifest ? (
          <ClassGatewayCards subjects={manifest.subjects} />
        ) : (
          <div className="h-48 rounded-3xl bg-white/5 animate-pulse flex items-center justify-center">
            <span className="text-xs text-slate-500">Loading Classes...</span>
          </div>
        )}
      </section>

      {/* =========================================================================
          MODALS & DASHBOARDS
          ========================================================================= */}
      {/* Student Profile DP Modal (10 Canonical Characters, Underline on Select, Save) */}
      <ProfilePhotoModal
        isOpen={dpModalOpen}
        currentPhoto={profile?.photoURL}
        onSave={(photo) => {
          updateProfilePhoto(photo);
          setDpModalOpen(false);
        }}
        onClose={() => setDpModalOpen(false)}
      />

      {/* Minecraft 3D Avatar Customizer Modal */}
      <AvatarCustomizerModal
        isOpen={avatarModalOpen}
        initialCustomization={activeAvatarCustom}
        onSave={handleSaveAvatar}
        onClose={() => setAvatarModalOpen(false)}
      />

      {/* Live AI Voice Call Modal */}
      <LiveCallModal
        isOpen={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        studentName={userName}
        currentSubject="Science & Mathematics"
      />

      {/* 60s Speed Drill Modal */}
      <SpeedDrillModal
        isOpen={drillOpen}
        onClose={() => setDrillOpen(false)}
      />

      {/* Daily Streak Dashboard Modal */}
      <StreakDashboardModal
        isOpen={streakModalOpen}
        onClose={() => setStreakModalOpen(false)}
      />

      {/* Progress Report Modal */}
      <ProgressReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />

      {/* Hardest Words Interactive Vocabulary Modals (Parts 1 to 6) */}
      {activeHardWordLevel && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
          <div className="relative w-full max-w-lg">
            <button
              onClick={() => setActiveHardWordLevel(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white text-xs font-black px-3.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer shadow-md"
            >
              ✕ Close Arena
            </button>
            {activeHardWordLevel === 2 && (
              <HardestWordsModule onClose={() => setActiveHardWordLevel(null)} />
            )}
            {activeHardWordLevel === 3 && (
              <HardestWordsLevel3Module onClose={() => setActiveHardWordLevel(null)} />
            )}
            {activeHardWordLevel === 4 && (
              <HardestWordsLevel4BossModule onClose={() => setActiveHardWordLevel(null)} />
            )}
            {activeHardWordLevel === 5 && (
              <HardestWordsLevel5EliteModule onClose={() => setActiveHardWordLevel(null)} />
            )}
            {activeHardWordLevel === 6 && (
              <HardestWordsLevel6FinalBossModule onClose={() => setActiveHardWordLevel(null)} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
