'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Users,
  Flame,
  Trophy,
  Sparkles,
  LogIn,
  CheckCircle2,
  RefreshCw,
  Bell,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import {
  loginWithGoogleOneTap,
  subscribeLiveLeaderboard,
  LeaderboardScholarItem
} from '@/lib/firebaseAuthMultiplayer';
import { getUserCurrentOreTier } from '@/types/ranking';
import {
  playClickSound,
  playCorrectDing,
  playOreUnlockFanfare,
  triggerHapticTick
} from '@/lib/audioEngine';

export const LiveMultiplayerComparison: React.FC = () => {
  const { profile, initUser } = useUserStore();
  const [scholars, setScholars] = useState<LeaderboardScholarItem[]>([]);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [remindedList, setRemindedList] = useState<Record<string, boolean>>({});

  const userUid = profile?.uid || 'guest_user';
  const isGuest = userUid.startsWith('guest_');

  // Real-time Dual-Stream Multiplayer Listener
  useEffect(() => {
    const unsub = subscribeLiveLeaderboard(userUid, (updatedList) => {
      setScholars(updatedList);
    });
    return () => unsub();
  }, [userUid]);

  const handle1TapGoogleLogin = async () => {
    playClickSound();
    setIsSigningIn(true);
    try {
      const user = await loginWithGoogleOneTap();
      if (user) {
        await initUser(user.uid, user.displayName || 'Scholar', user.email || '');
        playOreUnlockFanfare();
      }
    } catch (err) {
      console.warn('Google One Tap Error:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleNudgeFriend = (uid: string) => {
    playClickSound();
    triggerHapticTick(20);
    setRemindedList(prev => ({ ...prev, [uid]: true }));
  };

  return (
    <div className="rounded-3xl p-4 bg-gradient-to-b from-[rgba(26,34,53,0.85)] via-[rgba(16,22,35,0.9)] to-[rgba(10,14,24,0.95)] backdrop-blur-2xl border-2 border-amber-500/30 shadow-[0_12px_36px_rgba(0,0,0,0.6)] select-none space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Users className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Real-Time Multiplayer Stream
            </h3>
            <p className="text-[10px] text-slate-400">
              Live Ore Rank & Daily Streak Comparison
            </p>
          </div>
        </div>

        {isGuest ? (
          <button
            onClick={handle1TapGoogleLogin}
            disabled={isSigningIn}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[10px] font-black shadow-[0_2px_8px_rgba(245,158,11,0.4)] active:scale-95 transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{isSigningIn ? 'Connecting...' : '1-Tap Google Sync'}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Synced 60 FPS</span>
          </div>
        )}
      </div>

      {/* Real-time Stream Scholar Cards */}
      <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar pr-0.5">
        {scholars.length > 0 ? (
          scholars.map((s, idx) => {
            const oreTier = getUserCurrentOreTier(s.oreRankScore);
            return (
              <div
                key={s.uid + idx}
                className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                  s.isSelf
                    ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Ore Rank Icon */}
                  <div className="relative w-9 h-9 rounded-xl bg-black/60 border border-white/15 p-1 shrink-0 flex items-center justify-center">
                    <Image
                      src={oreTier.iconSvg}
                      alt={oreTier.name}
                      width={26}
                      height={26}
                      className="object-contain"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-black text-white truncate">
                        {s.displayName}
                      </h4>
                      {s.isSelf && (
                        <span className="text-[8px] font-black px-1.5 py-0.2 rounded-full bg-amber-400 text-black">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="text-amber-300 font-bold">{oreTier.name}</span>
                      <span>•</span>
                      <div className="flex items-center gap-0.5 text-orange-400 font-bold">
                        <Flame className="w-3 h-3 fill-orange-400" />
                        <span>{s.currentStreak}d</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-xs font-black text-amber-300">
                    {s.oreRankScore.toLocaleString()} XP
                  </span>

                  {!s.isSelf && (
                    <button
                      onClick={() => handleNudgeFriend(s.uid)}
                      disabled={remindedList[s.uid]}
                      className={`p-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                        remindedList[s.uid]
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-white/10 hover:bg-white/15 border-white/15 text-slate-300'
                      }`}
                      title="Nudge study streak"
                    >
                      <Bell className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-xs text-slate-500">
            Connecting to live multiplayer comparison stream...
          </div>
        )}
      </div>
    </div>
  );
};
