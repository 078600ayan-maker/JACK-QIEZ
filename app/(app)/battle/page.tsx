'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Swords,
  Bot,
  Globe2,
  Users,
  Flame,
  Gift,
  Share2,
  Trophy,
  ShieldAlert,
  Sparkles,
  Zap,
  ArrowRight,
  Eye,
  CheckCircle2,
  Copy,
  Clock,
  RotateCcw
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { UserProfile } from '@/types/user';
import {
  subscribeGlobalLeaderboard,
  createDuelRoom,
  joinDuelRoomByPin,
  subscribeDuelRoom,
  subscribeOpenDuelRooms,
  sendDuelTauntInCloud,
  claimDailyGiftInCloud,
  fetchUsersByUids,
  normalizeUsername,
  DuelRoom
} from '@/lib/socialService';
import { playClickSound } from '@/lib/audioEngine';
import { TactileButton } from '@/components/ui/TactileButton';
import { triggerHaptic } from '@/lib/haptics';

interface BattleScholarCard {
  uid: string;
  name: string;
  username: string;
  xp: number;
  streak: number;
  photoURL: string;
  title: string;
  pin?: string;
}

export default function BattleHubPage() {
  const { profile, setProfile } = useUserStore();
  const [activeTab, setActiveTab] = useState<'matchmaking' | 'social' | 'trophies'>('matchmaking');

  // Real Firestore Battle State
  const [dbScholars, setDbScholars] = useState<UserProfile[]>([]);
  const [friendProfiles, setFriendProfiles] = useState<UserProfile[]>([]);
  const [openRooms, setOpenRooms] = useState<DuelRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<DuelRoom | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [roomError, setRoomError] = useState<string | null>(null);
  const [roomBusy, setRoomBusy] = useState(false);

  const [isSearchingMatch, setIsSearchingMatch] = useState(false);
  const [matchedOpponent, setMatchedOpponent] = useState<BattleScholarCard | null>(null);
  const [showRevengeModal, setShowRevengeModal] = useState(false);
  const [showSpectateModal, setShowSpectateModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [tauntSent, setTauntSent] = useState<string | null>(null);
  const [equippedTitle, setEquippedTitle] = useState<string>('Royal Grandmaster (Class 10)');

  const username = profile?.username || 'scholar';
  const streak = profile?.streak ?? 0;
  const xp = profile?.xp ?? 0;
  const today = new Date().toISOString().split('T')[0];
  const [giftClaimed, setGiftClaimed] = useState(profile?.lastGiftClaimDate === today);

  useEffect(() => {
    setGiftClaimed(profile?.lastGiftClaimDate === today);
  }, [profile?.lastGiftClaimDate, today]);

  // Live Firestore Global Scholars + Active Duel Rooms
  useEffect(() => {
    const unsubUsers = subscribeGlobalLeaderboard((users) => {
      setDbScholars(users);
    }, 50);
    const unsubRooms = subscribeOpenDuelRooms((rooms) => {
      setOpenRooms(rooms);
    }, 10);
    return () => {
      unsubUsers();
      unsubRooms();
    };
  }, []);

  // Live Friend Profiles for Co-op Quests
  useEffect(() => {
    const uids = profile?.followingUids || profile?.connectedFriends || [];
    if (uids.length === 0) {
      setFriendProfiles([]);
      return;
    }
    let cancelled = false;
    fetchUsersByUids(uids).then((list) => {
      if (!cancelled) setFriendProfiles(list);
    });
    return () => {
      cancelled = true;
    };
  }, [profile?.followingUids, profile?.connectedFriends]);

  // Subscribe to hosted/joined PIN room updates in real time
  useEffect(() => {
    if (!activeRoom?.pin) return;
    const unsub = subscribeDuelRoom(activeRoom.pin, (room) => {
      if (!room) return;
      setActiveRoom(room);
      if (room.guestUid && room.hostUid === profile?.uid) {
        setMatchedOpponent({
          uid: room.guestUid,
          name: room.guestName || 'Challenger',
          username: room.guestUsername || 'challenger',
          xp: room.guestXp || 0,
          streak: 1,
          photoURL: room.guestPhoto || '/assets/profile_photos/classic_character_1.png',
          title: 'Joined via PIN',
          pin: room.pin
        });
      }
    });
    return () => unsub();
  }, [activeRoom?.pin, profile?.uid]);

  const realOpponentsPool: BattleScholarCard[] = dbScholars
    .filter((u) => u.uid !== profile?.uid)
    .map((u) => ({
      uid: u.uid,
      name: u.name || u.displayName || 'JAC Scholar',
      username: u.username || normalizeUsername(u.name, u.uid),
      xp: u.xp || 0,
      streak: u.streak || 0,
      photoURL: u.photoURL || '/assets/profile_photos/IMG_20261109_001512.png',
      title: u.role || 'JAC Class 10 Scholar'
    }));

  // Global Matchmaking using real Firestore scholars
  const handleAutoMatch = () => {
    playClickSound();
    triggerHaptic();
    setRoomError(null);
    setIsSearchingMatch(true);
    setMatchedOpponent(null);

    setTimeout(() => {
      setIsSearchingMatch(false);
      if (realOpponentsPool.length === 0) {
        setRoomError('No other registered scholars online yet. Create a 4-digit PIN room to invite a friend!');
        return;
      }
      // Prefer nearest XP scholar or random among closest 5
      const sortedByGap = [...realOpponentsPool].sort(
        (a, b) => Math.abs(a.xp - xp) - Math.abs(b.xp - xp)
      );
      const candidates = sortedByGap.slice(0, Math.min(5, sortedByGap.length));
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      setMatchedOpponent(chosen);
    }, 600);
  };

  const handleCreatePinRoom = async () => {
    if (!profile?.uid || roomBusy) return;
    playClickSound();
    triggerHaptic();
    setRoomBusy(true);
    setRoomError(null);
    try {
      const room = await createDuelRoom(profile, 'sci', 'Science & JAC Board');
      setRoomCode(room.pin);
      setActiveRoom(room);
    } catch {
      setRoomError('Failed to create cloud duel room. Check network.');
    } finally {
      setRoomBusy(false);
    }
  };

  const handleJoinPinRoom = async () => {
    if (!profile?.uid || !roomCode.trim() || roomBusy) return;
    playClickSound();
    triggerHaptic();
    setRoomBusy(true);
    setRoomError(null);
    try {
      const res = await joinDuelRoomByPin(roomCode.trim(), profile);
      if (!res.ok || !res.room) {
        setRoomError(res.error || 'Room not found.');
        return;
      }
      setActiveRoom(res.room);
      const isHostSelf = res.room.hostUid === profile.uid;
      if (!isHostSelf) {
        setMatchedOpponent({
          uid: res.room.hostUid,
          name: res.room.hostName,
          username: res.room.hostUsername,
          xp: res.room.hostXp,
          streak: 1,
          photoURL: res.room.hostPhoto,
          title: 'Room Host',
          pin: res.room.pin
        });
      }
    } finally {
      setRoomBusy(false);
    }
  };

  const handleCopyLink = () => {
    playClickSound();
    triggerHaptic();
    navigator.clipboard?.writeText(`https://jackquiz.app/@${username}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleClaimDailyGift = async () => {
    playClickSound();
    triggerHaptic();
    if (!profile?.uid || giftClaimed) return;
    const res = await claimDailyGiftInCloud(profile.uid);
    setGiftClaimed(true);
    if (res.claimed) {
      setProfile({
        ...profile,
        xp: (profile.xp || 0) + res.xpBonus,
        hearts: 5,
        lastGiftClaimDate: today
      });
    }
  };

  const sendTaunt = async (emoji: string, label: string) => {
    playClickSound();
    triggerHaptic();
    setTauntSent(`${emoji} ${label}`);
    if (activeRoom?.pin && profile?.uid) {
      await sendDuelTauntInCloud(activeRoom.pin, profile.uid, profile.name || 'Scholar', emoji, label);
    }
    setTimeout(() => setTauntSent(null), 2500);
  };

  // Compute Co-op Friends Quest Progress strictly from real Firestore profiles
  const ownCompletedLevels = Object.values(profile?.progress || {}).reduce((acc, v) => acc + (v || 0), 0);
  const friendCompletedLevels = friendProfiles.reduce(
    (sum, f) => sum + Object.values(f.progress || {}).reduce((acc, v) => acc + (v || 0), 0),
    0
  );
  const totalCoopLevels = Math.min(25, ownCompletedLevels + friendCompletedLevels);
  const coopPercent = Math.round((totalCoopLevels / 25) * 100);

  // Compute user global rank from live Firestore directory
  const sortedScholars = [...dbScholars].sort((a, b) => (b.xp || 0) - (a.xp || 0));
  const myRankIndex = sortedScholars.findIndex((u) => u.uid === profile?.uid);
  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : 999;

  return (
    <div className="w-full max-w-[480px] mx-auto px-4 pt-3 pb-36 select-none">
      {/* HEADER HERO */}
      <div className="relative rounded-3xl p-5 bg-gradient-to-br from-[#162032] via-[#0D1525] to-[#080D18] border-t-2 border-emerald-400/40 border-x border-b border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.8)] overflow-hidden mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Swords className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
              FRIENDS &amp; BATTLE ARENA
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[9px] font-black text-emerald-300 animate-pulse">
            LIVE v2.2
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">
              1v1 Royal Duel <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-400">
                Challenge Scholars
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 mt-1">
              Class 10 Live Matchmaking &bull; Earn XP, Trophies &amp; Tiers
            </p>
          </div>

          {/* 3D Octopops Avatar Widget */}
          <div className="relative w-16 h-16 shrink-0 rounded-2xl overflow-hidden border border-emerald-500/30 bg-emerald-950/40 shadow-[0_0_15px_rgba(16,185,129,0.25)] flex items-center justify-center">
            <iframe
              src="/mascot-widget.html"
              className="w-16 h-16 border-0 bg-transparent pointer-events-none"
              style={{ background: 'transparent' }}
              sandbox="allow-scripts"
              title="Octopops Arena Mascot"
            />
          </div>
        </div>

        {/* Win Streak Flame VFX banner if streak >= 5 */}
        {streak >= 5 && (
          <div className="mt-3.5 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-950/80 to-red-950/80 border border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
            <span className="text-[10px] font-black tracking-wide">
              WIN STREAK FLAME ACTIVE &bull; {streak} WINS IN A ROW! 🔥
            </span>
          </div>
        )}
      </div>

      {/* ARENA NAVIGATION PILLS */}
      <div className="flex items-center gap-2 mb-4 bg-white/5 p-1 rounded-2xl border border-white/10">
        <button
          onClick={() => { playClickSound(); setActiveTab('matchmaking'); }}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'matchmaking'
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          ⚔️ Duel Hub
        </button>
        <button
          onClick={() => { playClickSound(); setActiveTab('social'); }}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'social'
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          👥 Social &amp; Gifts
        </button>
        <button
          onClick={() => { playClickSound(); setActiveTab('trophies'); }}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'trophies'
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🏆 3D Trophy Shelf
        </button>
      </div>

      {/* =========================================================================
          TAB 1: MATCHMAKING & BATTLE ENGINE
          ========================================================================= */}
      {activeTab === 'matchmaking' && (
        <div className="space-y-4">
          {/* 1. Global Auto-Match Card */}
          <div className="p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-black text-white">Global Auto-Match</h3>
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Real Scholars Only
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Instantly pair with active Class 10 JAC students ranked near your XP level.
            </p>

            {isSearchingMatch ? (
              <div className="py-4 text-center space-y-2">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                  Scanning JAC Matchmaking Servers...
                </p>
                <p className="text-[10px] text-slate-400">Searching players with isRealUser: true</p>
              </div>
            ) : matchedOpponent ? (
              <div className="p-3 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={matchedOpponent.photoURL}
                      alt={matchedOpponent.name}
                      className="w-10 h-10 rounded-full border-2 border-emerald-400 object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-black text-white">{matchedOpponent.name}</h4>
                      <p className="text-[10px] text-emerald-400 font-bold">
                        @{matchedOpponent.username} &bull; {matchedOpponent.xp} XP
                      </p>
                    </div>
                  </div>
                  <span className="text-xs">⚔️</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/quiz/sci/sci_ch01/1?mode=duel&opponent=${encodeURIComponent(matchedOpponent.name)}`}
                    className="flex-1"
                  >
                    <TactileButton variant="emerald" fullWidth size="sm" className="font-black text-xs py-2">
                      ⚔️ Start 1v1 Battle with {matchedOpponent.name}!
                    </TactileButton>
                  </Link>
                  <button
                    onClick={() => setMatchedOpponent(null)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 text-[10px] font-bold text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <TactileButton
                variant="emerald"
                fullWidth
                size="md"
                onClick={handleAutoMatch}
                className="font-black text-xs py-3 shadow-[0_4px_0_#065F46]"
              >
                ⚡ Instant Matchmaking
              </TactileButton>
            )}
          </div>

          {/* 2. 1v1 Friend Duel Room Card (Real Firestore PIN Lobby) */}
          <div className="p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-white">4-Digit PIN Friend Lobby</h3>
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Cloud Synced
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Create a 4-digit PIN room in Firestore or enter a friend&apos;s PIN to clash live.
            </p>

            {roomError && (
              <div className="mb-2.5 p-2 rounded-xl bg-red-500/15 border border-red-400/40 text-[11px] font-bold text-red-200">
                {roomError}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter 4-Digit Room PIN (e.g. 4829)"
                  maxLength={6}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white placeholder:text-slate-500 uppercase tracking-widest focus:outline-none focus:border-amber-400/50"
                />
                <TactileButton
                  variant="gold"
                  size="sm"
                  disabled={!roomCode.trim() || roomBusy}
                  onClick={handleJoinPinRoom}
                  className="font-black text-xs px-4"
                >
                  {roomBusy ? 'Joining...' : 'Join PIN'}
                </TactileButton>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleCreatePinRoom}
                  disabled={roomBusy}
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <span>🎲 Create Cloud Room PIN</span>
                </button>

                {activeRoom ? (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    Room #{activeRoom.pin} • {activeRoom.status === 'active' ? 'Challenger Joined!' : 'Waiting for Friend...'}
                  </span>
                ) : roomCode ? (
                  <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                    PIN: {roomCode}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* 3. Local AI Practice with Octopops Bot */}
          <div className="p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-black text-white">Offline Octopops AI Practice</h3>
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                0 Data Used
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Sharpen your speed against the adaptive Octopops bot before entering ranked duels.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Link href="/quiz/sci/sci_ch01/1?mode=ai&diff=rookie">
                <button
                  onClick={() => playClickSound()}
                  className="w-full py-2 px-1 rounded-xl bg-white/5 hover:bg-emerald-500/20 border border-white/10 text-center transition-all active:scale-95"
                >
                  <div className="text-[10px] font-black text-emerald-400">🌱 Rookie</div>
                  <div className="text-[8px] text-slate-400">Pass Speed</div>
                </button>
              </Link>
              <Link href="/quiz/sci/sci_ch01/1?mode=ai&diff=topper">
                <button
                  onClick={() => playClickSound()}
                  className="w-full py-2 px-1 rounded-xl bg-white/5 hover:bg-amber-500/20 border border-white/10 text-center transition-all active:scale-95"
                >
                  <div className="text-[10px] font-black text-amber-400">🔥 JAC Topper</div>
                  <div className="text-[8px] text-slate-400">92% Acc</div>
                </button>
              </Link>
              <Link href="/quiz/sci/sci_ch01/1?mode=ai&diff=grandmaster">
                <button
                  onClick={() => playClickSound()}
                  className="w-full py-2 px-1 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 text-center transition-all active:scale-95"
                >
                  <div className="text-[10px] font-black text-red-400">👑 Grandmaster</div>
                  <div className="text-[8px] text-slate-400">Sub-3 Sec</div>
                </button>
              </Link>
            </div>
          </div>

          {/* 4. Live Open Rooms Spectator & Instant Revenge */}
          <div className="flex gap-2">
            <button
              onClick={() => { playClickSound(); setShowSpectateModal(true); }}
              className="flex-1 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 text-xs font-bold text-slate-300 active:scale-95 transition"
            >
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>Live Rooms ({openRooms.length})</span>
            </button>
            <button
              onClick={() => { playClickSound(); setShowRevengeModal(true); }}
              className="flex-1 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 text-xs font-bold text-slate-300 active:scale-95 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-400" />
              <span>Instant Revenge</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: SOCIAL HUB, GIFTS & CO-OP QUESTS
          ========================================================================= */}
      {activeTab === 'social' && (
        <div className="space-y-4">
          {/* Daily Gift Exchange (24h timer) */}
          <div className="p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-white">Daily Gift Exchange</h3>
              </div>
              <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" /> 24h Reset
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Send free +50 XP and 5 Gems to your active study group daily.
            </p>
            {giftClaimed ? (
              <div className="py-2.5 px-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center gap-2 text-xs font-black text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Gift Claimed! Next drop in 23h 58m</span>
              </div>
            ) : (
              <TactileButton
                variant="gold"
                fullWidth
                size="md"
                onClick={handleClaimDailyGift}
                className="font-black text-xs py-2.5 shadow-[0_4px_0_#92400E]"
              >
                🎁 Claim Today&apos;s Gift (+50 XP)
              </TactileButton>
            )}
          </div>

          {/* Co-Op Friends Quest Tracker */}
          <div className="p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-black text-white">Co-op Friends Quest</h3>
              </div>
              <span className="text-[9px] font-black text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                3D Chest Unlock
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Complete 25 collective quiz levels with mutual friends this week.
            </p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono font-bold text-slate-300">
                <span>Team Progress: {totalCoopLevels} / 25 Levels</span>
                <span className="text-emerald-400">{coopPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${coopPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Dynamic Follow Link */}
          <div className="p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-black text-white">Custom Invite &amp; Follow Link</h3>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Share your personal profile link to add friends directly:
            </p>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2">
              <span className="font-mono text-xs text-amber-300 flex-1 truncate">
                jackquiz.app/@{username}
              </span>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1 active:scale-95 transition"
              >
                {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* 3D Taunt & Nudge Emojis */}
          <div className="p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-white/10 shadow-lg">
            <h3 className="text-sm font-black text-white mb-2">In-Battle 3D Taunts &amp; Nudges</h3>
            <p className="text-[11px] text-slate-400 mb-3">
              Trigger animated tactical reaction emotes during live challenges:
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { emoji: '⚡', label: 'Speed Up' },
                { emoji: '🔥', label: 'On Fire' },
                { emoji: '👑', label: 'Checkmate' },
                { emoji: '🐙', label: 'Octopops' }
              ].map((t) => (
                <button
                  key={t.label}
                  onClick={() => sendTaunt(t.emoji, t.label)}
                  className="p-2.5 rounded-2xl bg-white/5 hover:bg-emerald-500/20 border border-white/10 flex flex-col items-center gap-1 active:scale-95 transition"
                >
                  <span className="text-xl">{t.emoji}</span>
                  <span className="text-[9px] font-bold text-slate-300">{t.label}</span>
                </button>
              ))}
            </div>
            {tauntSent && (
              <div className="mt-2 text-center text-xs font-black text-amber-300 animate-pulse">
                Taunt Sent: {tauntSent}!
              </div>
            )}
          </div>

          {/* Smart Mutual Friends Carousel: Live from Firestore */}
          <div className="p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-white/10 shadow-lg">
            <h3 className="text-sm font-black text-white mb-2">Active Cloud Scholars &bull; Class 10 JAC</h3>
            {realOpponentsPool.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">
                Invite classmates or create a PIN room to duel friends!
              </p>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {realOpponentsPool.slice(0, 8).map((friend) => (
                  <div
                    key={friend.uid}
                    className="w-28 shrink-0 p-2.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center"
                  >
                    <img
                      src={friend.photoURL}
                      alt={friend.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/profile_photos/IMG_20261109_001512.png';
                      }}
                      className="w-10 h-10 rounded-full mb-1 object-cover"
                    />
                    <div className="text-[11px] font-black text-white truncate w-full">{friend.name}</div>
                    <div className="text-[8px] text-amber-400 truncate w-full">@{friend.username}</div>
                    <Link
                      href={`/quiz/sci/sci_ch01/1?mode=duel&opponent=${encodeURIComponent(friend.name)}`}
                      onClick={() => playClickSound()}
                      className="mt-2 w-full py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-[9px] font-black text-emerald-300 border border-emerald-500/40 block text-center"
                    >
                      + Duel
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: 3D TROPHY ROOM & LEAGUE TIERS
          ========================================================================= */}
      {activeTab === 'trophies' && (
        <div className="space-y-4">
          {/* Navigable 3D Shelf UI */}
          <div className="p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-white">3D Trophy Room</h3>
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Rank #{myRank} • {xp} XP
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { title: 'JAC Math Topper', icon: '🏆', unlocked: (profile?.progress?.math_ch01 || 0) >= 1, rarity: 'Legendary' },
                { title: 'Science Titan', icon: '💎', unlocked: (profile?.progress?.sci_ch01 || 0) >= 1, rarity: 'Epic' },
                { title: '7-Day Streak King', icon: '👑', unlocked: streak >= 7, rarity: 'Rare' },
                { title: 'English Master', icon: '📜', unlocked: (profile?.progress?.eng_ch01 || 0) >= 1, rarity: 'Common' },
                { title: 'Social Scholar', icon: '🌍', unlocked: (profile?.progress?.sst_ch01 || 0) >= 1, rarity: 'Rare' },
                { title: '500 XP Club', icon: '🐾', unlocked: xp >= 500, rarity: 'Mythic' }
              ].map((t) => (
                <div
                  key={t.title}
                  className={`p-3 rounded-2xl border flex flex-col items-center text-center shadow-sm transition ${
                    t.unlocked
                      ? 'bg-amber-500/10 border-amber-400/40'
                      : 'bg-white/5 border-white/10 opacity-50'
                  }`}
                >
                  <div className="text-2xl mb-1">{t.icon}</div>
                  <div className="text-[10px] font-black text-white leading-tight">{t.title}</div>
                  <div className="text-[8px] font-bold text-amber-400 mt-0.5 uppercase tracking-wider">
                    {t.unlocked ? t.rarity : 'Locked'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unlockable Custom Titles */}
          <div className="p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-white/10 shadow-lg">
            <h3 className="text-sm font-black text-white mb-2">Equipable Scholar Titles</h3>
            <div className="space-y-2">
              {[
                { title: 'Royal Grandmaster (Class 10)', unlocked: xp >= 250, req: 'Unlocked at 250 XP' },
                { title: 'Lightning Scholar (5 Levels)', unlocked: ownCompletedLevels >= 5, req: 'Complete 5 levels' },
                { title: 'JAC State Top 100', unlocked: myRank <= 100, req: 'Top 100 on Firestore leaderboard' }
              ].map((t) => {
                const isEquipped = equippedTitle === t.title;
                return (
                  <div
                    key={t.title}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-black text-white">{t.title}</div>
                      <div className="text-[9px] text-slate-400">{t.req}</div>
                    </div>
                    {isEquipped ? (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                        EQUIPPED
                      </span>
                    ) : t.unlocked ? (
                      <button
                        onClick={() => { playClickSound(); setEquippedTitle(t.title); }}
                        className="text-[9px] font-black px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 hover:bg-amber-400"
                      >
                        Equip
                      </button>
                    ) : (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-500">
                        Locked
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* LIVE OPEN ROOMS SPECTATE MODAL */}
      {showSpectateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-[360px] bg-[#141A2D] border-2 border-blue-500/40 rounded-3xl p-5 shadow-2xl">
            <h3 className="text-sm font-black text-white mb-1">Active Cloud Duel Rooms</h3>
            <p className="text-[11px] text-slate-400 mb-3">
              Tap any room PIN below to join immediately.
            </p>
            <div className="space-y-2 max-h-[240px] overflow-y-auto mb-4">
              {openRooms.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  No open rooms right now. Create one using &ldquo;Create Cloud Room PIN&rdquo;!
                </p>
              ) : (
                openRooms.map((r) => (
                  <div
                    key={r.pin}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div>
                      <p className="text-xs font-black text-white">{r.hostName}</p>
                      <p className="text-[10px] text-amber-400 font-mono">
                        PIN #{r.pin} • {r.status}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowSpectateModal(false);
                        setRoomCode(r.pin);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/40 text-[10px] font-black"
                    >
                      Use PIN
                    </button>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setShowSpectateModal(false)}
              className="w-full py-2 rounded-xl bg-white/10 text-xs font-bold text-slate-300 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* INSTANT REVENGE MODAL */}
      {showRevengeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-[340px] bg-[#141A2D] border-2 border-red-500/50 rounded-3xl p-5 text-center shadow-[0_0_30px_rgba(239,68,68,0.5)]">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto mb-2 text-xl">
              ⚔️
            </div>
            <h3 className="text-base font-black text-white">Instant Revenge Match!</h3>
            <p className="text-[11px] text-slate-300 mt-1 mb-4">
              {realOpponentsPool[0]
                ? `Challenge ${realOpponentsPool[0].name} (@${realOpponentsPool[0].username}) to a live 1v1 rematch!`
                : 'Find a scholar on the leaderboard for a 1v1 rematch!'}
            </p>
            <div className="flex gap-2">
              {realOpponentsPool[0] && (
                <Link
                  href={`/quiz/sci/sci_ch01/1?mode=duel&opponent=${encodeURIComponent(realOpponentsPool[0].name)}`}
                  onClick={() => {
                    playClickSound();
                    setShowRevengeModal(false);
                  }}
                  className="flex-1"
                >
                  <TactileButton
                    variant="ruby"
                    fullWidth
                    size="sm"
                    className="font-black text-xs py-2"
                  >
                    Accept Revenge (2X XP)
                  </TactileButton>
                </Link>
              )}
              <button
                onClick={() => setShowRevengeModal(false)}
                className="px-3 py-2 rounded-xl bg-white/10 text-xs font-bold text-slate-400 hover:text-white flex-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
