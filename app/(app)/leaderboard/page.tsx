'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Trophy,
  Flame,
  Shield,
  Sparkles,
  Users,
  Share2,
  Bell,
  Clock,
  Lock,
  ChevronRight,
  Info
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { UserProfile } from '@/types/user';
import {
  subscribeGlobalLeaderboard,
  fetchUsersByUids,
  sendBuddyNudgeInCloud,
  normalizeUsername
} from '@/lib/socialService';
import { CrownBadge } from '@/components/ui/CrownBadge';
import {
  playClickSound,
  playOreUnlockFanfare,
  playDiamondChime,
  playLockRattle
} from '@/lib/audioEngine';
import {
  ORE_TIERS,
  getUserCurrentOreTier,
  getNextOreTier,
  OreTier
} from '@/types/ranking';
import { OreHierarchyModal } from '@/components/ranking/OreHierarchyModal';

export default function LeaderboardPage() {
  const { profile } = useUserStore();
  const [activeTab, setActiveTab] = useState<'ores' | 'buddies'>('ores');
  const [selectedOreId, setSelectedOreId] = useState<string>('coal');
  const [oreModalOpen, setOreModalOpen] = useState(false);
  const [remindedList, setRemindedList] = useState<Record<string, boolean>>({});
  const [dbUsers, setDbUsers] = useState<UserProfile[]>([]);
  const [buddyProfiles, setBuddyProfiles] = useState<UserProfile[]>([]);

  const userXp = profile?.xp ?? 0;
  const userStreak = profile?.streak ?? 0;
  const currentTier = getUserCurrentOreTier(userXp);
  const nextTier = getNextOreTier(userXp);

  // Real-time Global Firestore Leaderboard subscription
  useEffect(() => {
    const unsub = subscribeGlobalLeaderboard((users) => {
      setDbUsers(users);
    }, 50);
    return () => unsub();
  }, []);

  // Load real followed buddies from Firestore
  useEffect(() => {
    const uids = profile?.followingUids || profile?.connectedFriends || [];
    if (uids.length === 0) {
      setBuddyProfiles([]);
      return;
    }
    let cancelled = false;
    fetchUsersByUids(uids).then((list) => {
      if (!cancelled) setBuddyProfiles(list);
    });
    return () => {
      cancelled = true;
    };
  }, [profile?.followingUids, profile?.connectedFriends]);

  // Merge logged-in user if not yet returned in top 50, then rank by XP descending
  const mergedMap = new Map<string, UserProfile>();
  dbUsers.forEach((u) => mergedMap.set(u.uid, u));
  if (profile?.uid && !mergedMap.has(profile.uid)) {
    mergedMap.set(profile.uid, profile);
  }

  const scholars = Array.from(mergedMap.values())
    .sort((a, b) => (b.xp || 0) - (a.xp || 0))
    .map((u, index) => {
      const ore = getUserCurrentOreTier(u.xp || 0);
      return {
        id: u.uid,
        rank: index + 1,
        name: u.name || u.displayName || 'JAC Scholar',
        username: u.username || normalizeUsername(u.name, u.uid),
        xp: u.xp || 0,
        streak: u.streak || 0,
        avatarSvg: ore.iconSvg,
        photoURL: u.photoURL || '/assets/profile_photos/IMG_20261109_001512.png',
        oreTier: ore.name,
        isUser: Boolean(profile?.uid && u.uid === profile.uid),
      };
    });

  const buddiesList = buddyProfiles.map((b) => {
    const ore = getUserCurrentOreTier(b.xp || 0);
    return {
      id: b.uid,
      name: b.name || b.displayName || 'JAC Scholar',
      username: b.username || normalizeUsername(b.name, b.uid),
      days: b.streak || 0,
      xp: b.xp || 0,
      avatarSvg: ore.iconSvg,
      rig: b.customAvatar?.name || 'Scholar Wardrobe',
      ore: ore.name,
    };
  });

  const handleRemind = async (id: string) => {
    playClickSound();
    setRemindedList((prev) => ({ ...prev, [id]: true }));
    if (profile?.uid) {
      await sendBuddyNudgeInCloud(profile.uid, profile.name || 'Scholar', id);
    }
  };

  const isOreUnlocked = (tier: OreTier) => {
    return tier.unlockedByDefault || userXp >= tier.minXp;
  };

  return (
    <div className="w-full max-w-[480px] mx-auto px-4 pt-4 pb-44 select-none">
      {/* Header */}
      <div className="text-center mb-3">
        <button
          onClick={() => {
            playOreUnlockFanfare();
            setOreModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-widest mb-1.5 transition-all cursor-pointer"
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>MINECRAFT ORE-BASED RANKS</span>
          <Info className="w-3 h-3 text-amber-400" />
        </button>

        <h1 className="text-2xl font-black text-white tracking-tight">
          Hardcore Ore Hierarchy
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          10 Ancient Mineral Tiers. Only Coal is unlocked initially.
        </p>
      </div>

      {/* User's Current Mineral Rank Banner */}
      <div className="relative rounded-2xl p-3.5 bg-gradient-to-r from-[rgba(26,34,53,0.9)] to-[rgba(15,23,42,0.95)] backdrop-blur-xl border-2 border-amber-500/40 shadow-[0_8px_24px_rgba(0,0,0,0.5)] mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-12 h-12 rounded-xl bg-black/60 border border-amber-400/50 p-1 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Image
                src={currentTier.iconSvg}
                alt={currentTier.name}
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 block">
                YOUR UNLOCKED TIER
              </span>
              <h3 className="text-sm font-black text-white truncate">
                {currentTier.name} ({currentTier.title})
              </h3>
              <p className="text-[10px] text-slate-400 truncate">
                {userXp.toLocaleString()} XP earned
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              setOreModalOpen(true);
            }}
            className="flex items-center gap-1 py-1.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-black transition-all cursor-pointer shrink-0"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress to Next Ore */}
        {nextTier && (
          <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-slate-400">
                Next Lock: <span className="text-white">{nextTier.name}</span>
              </span>
              <span className="text-amber-400 font-mono">
                {Math.max(0, nextTier.minXp - userXp)} XP needed
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/60 border border-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500 shadow-[0_0_8px_#F59E0B]"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      ((userXp - currentTier.minXp) /
                        (nextTier.minXp - currentTier.minXp)) *
                        100
                    )
                  )}%`
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Segment Switcher: Ore Divisions vs Buddy Streaks */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 mb-4">
        <button
          onClick={() => {
            playClickSound();
            setActiveTab('ores');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'ores'
              ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          ⛏️ Ore Divisions
        </button>
        <button
          onClick={() => {
            playClickSound();
            setActiveTab('buddies');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'buddies'
              ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          👥 Study Buddies
        </button>
      </div>

      {/* HORIZONTAL ORE SHELF */}
      {activeTab === 'ores' && (
        <div className="mb-4">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Minecraft Ore Tier Strip
            </span>
            <span className="text-[9px] font-bold text-amber-400">
              Tap Ore to Inspect
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {ORE_TIERS.map(tier => {
              const unlocked = isOreUnlocked(tier);
              const isSelected = selectedOreId === tier.id;

              return (
                <button
                  key={tier.id}
                  onClick={() => {
                    if (unlocked) {
                      playClickSound();
                    } else {
                      playLockRattle();
                    }
                    setSelectedOreId(tier.id);
                  }}
                  className={`relative p-2.5 rounded-2xl border flex flex-col items-center gap-1 shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/25 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-105'
                      : unlocked
                      ? 'bg-white/5 border-white/10 hover:bg-white/10'
                      : 'bg-black/60 border-white/5 opacity-60 hover:opacity-80'
                  }`}
                  style={{ width: '84px' }}
                >
                  {/* Ore Icon / Locked Lock */}
                  <div className="relative w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center p-1">
                    {unlocked ? (
                      <Image
                        src={tier.iconSvg}
                        alt={tier.name}
                        width={28}
                        height={28}
                        className="object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <Lock className="w-4 h-4 text-slate-400 mb-0.5" />
                        <span className="text-[8px] font-mono text-slate-400">???</span>
                      </div>
                    )}
                  </div>

                  <span className="text-[9px] font-black text-white truncate w-full text-center">
                    {unlocked ? tier.name.split(' ')[0] : 'Locked'}
                  </span>
                  <span className="text-[8px] font-mono text-amber-300">
                    {tier.minXp} XP
                  </span>

                  {/* Locked padlock indicator */}
                  {!unlocked && (
                    <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-black/80 flex items-center justify-center">
                      <Lock className="w-2 h-2 text-red-400" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TOP 3 PODIUM (GOLD, SILVER, BRONZE ORES) */}
      {activeTab === 'ores' && scholars.length > 0 && (
        <div className="grid grid-cols-3 gap-2 items-end mb-5 pt-3">
          {/* Rank 2 */}
          <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
            {scholars[1] ? (
              <>
                <div className="relative w-12 h-12 rounded-xl bg-black/50 border border-slate-400/50 p-1 mb-1">
                  <Image
                    src={scholars[1].avatarSvg}
                    alt={scholars[1].name}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-300 text-black text-[10px] font-black flex items-center justify-center">
                    2
                  </span>
                </div>
                <h4 className="text-xs font-black text-white truncate max-w-[85px] text-center">
                  {scholars[1].name.split(' ')[0]}
                </h4>
                <span className="text-[10px] font-black text-amber-300 mt-0.5">
                  {scholars[1].xp} XP
                </span>
              </>
            ) : (
              <span className="text-[10px] text-slate-500 font-bold py-4">Rank #2 Open</span>
            )}
            <div className="w-full h-8 rounded-lg bg-slate-400/20 border border-slate-400/30 mt-2 flex items-center justify-center text-[10px] font-black text-slate-300">
              {scholars[1]?.oreTier?.split(' ')[0] || 'Silver'} Tier
            </div>
          </div>

          {/* Rank 1 (Gold/Diamond Spotlight) */}
          <div className="flex flex-col items-center p-3.5 rounded-2xl bg-amber-500/15 border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.35)] -translate-y-2">
            <div className="relative w-14 h-14 rounded-xl bg-black/60 border border-amber-400 p-1 mb-1 shadow-[0_0_15px_#F59E0B]">
              <Image
                src={scholars[0].avatarSvg}
                alt={scholars[0].name}
                width={48}
                height={48}
                className="object-contain"
              />
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-black text-xs font-black flex items-center justify-center shadow-md">
                👑
              </span>
            </div>
            <h4 className="text-xs font-black text-white truncate max-w-[95px] text-center">
              {scholars[0].name.split(' ')[0]}
            </h4>
            <span className="text-xs font-black text-amber-300 mt-0.5">
              {scholars[0].xp} XP
            </span>
            <div className="w-full h-11 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-black mt-2 flex items-center justify-center text-xs font-black shadow-[0_2px_8px_rgba(245,158,11,0.5)]">
              #1 Leader
            </div>
          </div>

          {/* Rank 3 */}
          <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
            {scholars[2] ? (
              <>
                <div className="relative w-12 h-12 rounded-xl bg-black/50 border border-amber-700/50 p-1 mb-1">
                  <Image
                    src={scholars[2].avatarSvg}
                    alt={scholars[2].name}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-700 text-white text-[10px] font-black flex items-center justify-center">
                    3
                  </span>
                </div>
                <h4 className="text-xs font-black text-white truncate max-w-[85px] text-center">
                  {scholars[2].name.split(' ')[0]}
                </h4>
                <span className="text-[10px] font-black text-amber-300 mt-0.5">
                  {scholars[2].xp} XP
                </span>
              </>
            ) : (
              <span className="text-[10px] text-slate-500 font-bold py-4">Rank #3 Open</span>
            )}
            <div className="w-full h-6 rounded-lg bg-amber-800/20 border border-amber-800/30 mt-2 flex items-center justify-center text-[10px] font-black text-amber-600">
              {scholars[2]?.oreTier?.split(' ')[0] || 'Bronze'} Tier
            </div>
          </div>
        </div>
      )}

      {/* SCHOLARS LEADERBOARD LIST */}
      {activeTab === 'ores' && (
        <div className="space-y-2">
          {scholars.map(scholar => (
            <div
              key={scholar.id}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                scholar.isUser
                  ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-5 text-center text-xs font-black text-slate-400">
                  {scholar.rank}
                </span>

                <div className="relative w-9 h-9 rounded-xl bg-black/50 border border-white/15 p-1 shrink-0">
                  <Image
                    src={scholar.avatarSvg}
                    alt={scholar.name}
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h5 className="text-xs font-black text-white truncate">
                      {scholar.name}
                    </h5>
                    {scholar.isUser && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-400 text-black">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <span className="text-amber-400 font-bold">@{scholar.username}</span>
                    <span>•</span>
                    <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
                    <span>{scholar.streak}d</span>
                    <span>•</span>
                    <span className="text-slate-300 font-semibold">{scholar.oreTier}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-black text-amber-300 font-mono">
                  {scholar.xp.toLocaleString()} XP
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STUDY BUDDIES TAB */}
      {activeTab === 'buddies' && (
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              Encourage followed buddies to keep their streak alive!
            </span>
            <span className="text-xs font-black text-amber-400">{buddiesList.length} Buddies</span>
          </div>

          {buddiesList.length === 0 ? (
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2.5">
              <p className="text-xs font-bold text-slate-300">
                You are not following any classmates yet!
              </p>
              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Find Buddies by @username</span>
              </Link>
            </div>
          ) : (
            buddiesList.map(buddy => (
              <div
                key={buddy.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-10 h-10 rounded-xl bg-black/50 border border-white/15 p-1 shrink-0">
                    <Image
                      src={buddy.avatarSvg}
                      alt={buddy.name}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-black text-white truncate">
                      {buddy.name}
                    </h5>
                    <p className="text-[10px] text-slate-400 truncate">
                      @{buddy.username} • <span className="text-amber-300">{buddy.ore}</span>
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="text-orange-400 font-bold">{buddy.days}d streak</span>
                      <span>•</span>
                      <span>{buddy.xp} XP</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRemind(buddy.id)}
                  disabled={remindedList[buddy.id]}
                  className={`py-1.5 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    remindedList[buddy.id]
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40 active:scale-95'
                  }`}
                >
                  {remindedList[buddy.id] ? 'Nudged ✓' : 'Nudge 🔔'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Ore Hierarchy Modal */}
      <OreHierarchyModal
        isOpen={oreModalOpen}
        userXp={userXp}
        onClose={() => setOreModalOpen(false)}
      />
    </div>
  );
}
