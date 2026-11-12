'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
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
  ShieldCheck,
  Sparkles,
  Zap,
  ArrowRight,
  Eye,
  CheckCircle2,
  Copy,
  Clock,
  RotateCcw,
  Search,
  UserPlus,
  UserCheck,
  Lock,
  ChevronDown,
  ChevronUp,
  Bell
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
  searchUsersInDatabase,
  toggleFollowInDatabase,
  toggleDuelRoomReady,
  fetchRecentPairDuels,
  fetchActiveScholarsCount,
  sendBuddyNudgeInCloud,
  DuelRoom
} from '@/lib/socialService';
import {
  computeSelfTrustScore,
  evaluatePairAntiFix,
  findBestGlobalMatch,
  DuelHistorySlice,
  PairAntiFixReport,
} from '@/lib/matchIntegrity';
import { playClickSound } from '@/lib/audioEngine';
import { TactileButton } from '@/components/ui/TactileButton';
import { triggerHaptic } from '@/lib/haptics';

interface BattleScholarCard {
  uid: string;
  name: string;
  username: string;
  emailLower?: string;
  xp: number;
  streak: number;
  photoURL: string;
  title: string;
  isOnline?: boolean;
  isAnonymous?: boolean;
  pin?: string;
}

const DUEL_SUBJECTS = [
  { id: 'sci', slug: 'sci', name: 'Science (विज्ञान)', chapters: 13 },
  { id: 'math', slug: 'math', name: 'Maths (गणित)', chapters: 14 },
  { id: 'sst', slug: 'sst', name: 'Social Science', chapters: 14 },
  { id: 'eng', slug: 'eng', name: 'English', chapters: 14 },
  { id: 'hin', slug: 'hin', name: 'Hindi (हिंदी)', chapters: 14 },
];

function BattleHubContent() {
  const searchParams = useSearchParams();
  const { profile, setProfile } = useUserStore();
  const [activeTab, setActiveTab] = useState<'matchmaking' | 'social' | 'trophies'>('matchmaking');

  // Real Firestore Battle State
  const [dbScholars, setDbScholars] = useState<UserProfile[]>([]);
  const [friendProfiles, setFriendProfiles] = useState<UserProfile[]>([]);
  const [openRooms, setOpenRooms] = useState<DuelRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<DuelRoom | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [roomError, setRoomError] = useState<string | null>(null);
  const [roomSuccess, setRoomSuccess] = useState<string | null>(null);
  const [roomBusy, setRoomBusy] = useState(false);

  // Global Matchmaking & Anti-Fixing State
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('sci');
  const [selectedChapterId, setSelectedChapterId] = useState<number>(1);
  const [strictBracket, setStrictBracket] = useState<boolean>(true);
  const [recentDuels, setRecentDuels] = useState<DuelHistorySlice[]>([]);
  const [activeOnlineCount, setActiveOnlineCount] = useState<number>(1);
  const [showIntegrityMatrix, setShowIntegrityMatrix] = useState<boolean>(false);

  // Online Friend Search & Linking Hub State (10 linking features)
  const [friendQuery, setFriendQuery] = useState('');
  const [friendResults, setFriendResults] = useState<UserProfile[]>([]);
  const [friendSearching, setFriendSearching] = useState(false);
  const [followingUids, setFollowingUids] = useState<string[]>(profile?.followingUids || []);
  const [followBusyMap, setFollowBusyMap] = useState<Record<string, boolean>>({});
  const [linkingNotice, setLinkingNotice] = useState<string | null>(null);
  const [copiedPin, setCopiedPin] = useState(false);

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
  const selectedSubjectMeta = DUEL_SUBJECTS.find((s) => s.id === selectedSubjectId) || DUEL_SUBJECTS[0];
  const chKey = `${selectedSubjectId}_ch${String(selectedChapterId).padStart(2, '0')}`;

  useEffect(() => {
    setGiftClaimed(profile?.lastGiftClaimDate === today);
  }, [profile?.lastGiftClaimDate, today]);

  useEffect(() => {
    if (Array.isArray(profile?.followingUids)) {
      setFollowingUids(profile.followingUids);
    }
  }, [profile?.followingUids]);

  // Live Firestore Global Scholars + Active Duel Rooms + Recent Pair Duels
  useEffect(() => {
    const unsubUsers = subscribeGlobalLeaderboard((users) => {
      setDbScholars(users);
      const nowMs = Date.now();
      const online = users.filter((u) => {
        const ts = u.lastSeenAt ? Date.parse(u.lastSeenAt) : u.updatedAt ? Date.parse(u.updatedAt) : 0;
        return u.isOnline || (ts > 0 && nowMs - ts <= 20 * 60 * 1000);
      }).length;
      if (online > 0) setActiveOnlineCount(online);
    }, 50);
    const unsubRooms = subscribeOpenDuelRooms((rooms) => {
      setOpenRooms(rooms);
    }, 12);
    fetchActiveScholarsCount().then((c) => {
      if (c > 0) setActiveOnlineCount((prev) => Math.max(prev, c));
    }).catch(() => {});
    return () => {
      unsubUsers();
      unsubRooms();
    };
  }, []);

  useEffect(() => {
    if (!profile?.uid) return;
    fetchRecentPairDuels(profile.uid).then((list) => setRecentDuels(list)).catch(() => {});
  }, [profile?.uid]);

  // Auto-read ?pin=XXXX deep link and pre-fill or join automatically
  useEffect(() => {
    const urlPin = searchParams?.get('pin');
    if (urlPin && /^\d{4}$/.test(urlPin)) {
      setRoomCode(urlPin);
      if (profile?.uid && (!activeRoom || activeRoom.pin !== urlPin)) {
        joinDuelRoomByPin(urlPin, profile).then((res) => {
          if (res.ok && res.room) {
            setActiveRoom(res.room);
            setRoomSuccess(`Linked to PIN Room #${urlPin}!`);
          }
        }).catch(() => {});
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, profile?.uid]);

  // Debounced Friend Search (Email, @username, or Full Name) right in Battle Hub
  useEffect(() => {
    const clean = friendQuery.trim();
    if (!clean) {
      setFriendResults([]);
      setFriendSearching(false);
      return;
    }
    let cancelled = false;
    setFriendSearching(true);
    const t = setTimeout(async () => {
      try {
        const found = await searchUsersInDatabase(clean, 20);
        if (!cancelled) {
          setFriendResults(found.filter((u) => u.uid !== profile?.uid));
        }
      } finally {
        if (!cancelled) setFriendSearching(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [friendQuery, profile?.uid]);

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
          emailLower: room.guestEmailLower,
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
      emailLower: u.emailLower || (u.email || '').trim().toLowerCase(),
      xp: u.xp || 0,
      streak: u.streak || 0,
      photoURL: u.photoURL || '/assets/profile_photos/IMG_20261109_001512.png',
      title: u.role || 'JAC Class 10 Scholar',
      isOnline: u.isOnline,
      isAnonymous: u.isAnonymous,
    }));

  const selfTrustScore = computeSelfTrustScore(profile, recentDuels);
  const currentAntiFixReport: PairAntiFixReport = evaluatePairAntiFix({
    selfProfile: profile,
    opponent: matchedOpponent
      ? {
          uid: matchedOpponent.uid,
          name: matchedOpponent.name,
          emailLower: matchedOpponent.emailLower,
          xp: matchedOpponent.xp,
          isAnonymous: matchedOpponent.isAnonymous,
        }
      : activeRoom && activeRoom.guestUid && profile?.uid !== activeRoom.guestUid
        ? {
            uid: activeRoom.guestUid,
            name: activeRoom.guestName,
            emailLower: activeRoom.guestEmailLower,
            xp: activeRoom.guestXp,
          }
        : null,
    pin: activeRoom?.pin || roomCode || '1000',
    seed: activeRoom?.questionSeed,
    subjectId: selectedSubjectId === 'sci' ? 'science' : selectedSubjectId === 'math' ? 'maths' : selectedSubjectId === 'sst' ? 'social_science' : selectedSubjectId === 'eng' ? 'english' : 'hindi',
    chapterId: selectedChapterId,
    recentDuels,
  });

  // Global Matchmaking Pro: Skill-bracket + 10-point anti-fixing check + live global room sync
  const handleAutoMatch = async () => {
    playClickSound();
    triggerHaptic();
    setRoomError(null);
    setRoomSuccess(null);
    setIsSearchingMatch(true);
    setMatchedOpponent(null);

    try {
      const subjectFull =
        selectedSubjectId === 'sci'
          ? 'science'
          : selectedSubjectId === 'math'
            ? 'maths'
            : selectedSubjectId === 'sst'
              ? 'social_science'
              : selectedSubjectId === 'eng'
                ? 'english'
                : 'hindi';

      // First check if another verified global waiting room matches cleanly (excluding self/same-email)
      const selfEmail = (profile?.emailLower || profile?.email || '').trim().toLowerCase();
      const openGlobalRoom = openRooms.find(
        (r) =>
          r.mode === 'global' &&
          r.status === 'waiting' &&
          r.hostUid !== profile?.uid &&
          (!selfEmail || !r.hostEmailLower || r.hostEmailLower !== selfEmail)
      );

      if (openGlobalRoom && profile?.uid) {
        const joined = await joinDuelRoomByPin(openGlobalRoom.pin, profile);
        if (joined.ok && joined.room) {
          setActiveRoom(joined.room);
          setRoomCode(joined.room.pin);
          setMatchedOpponent({
            uid: joined.room.hostUid,
            name: joined.room.hostName,
            username: joined.room.hostUsername,
            emailLower: joined.room.hostEmailLower,
            xp: joined.room.hostXp,
            streak: 1,
            photoURL: joined.room.hostPhoto,
            title: 'Global Matched Host',
            pin: joined.room.pin,
          });
          setRoomSuccess(`Matched into live Global Room #${joined.room.pin} (Seed #${joined.room.questionSeed})!`);
          setIsSearchingMatch(false);
          return;
        }
      }

      const best = findBestGlobalMatch({
        selfProfile: profile,
        scholars: dbScholars,
        recentDuels,
        subjectId: subjectFull,
        chapterId: selectedChapterId,
        strictBracket,
      });

      if (!best) {
        // Fallback to relaxed bracket if strict bracket had no close peer
        const relaxed = strictBracket
          ? findBestGlobalMatch({
              selfProfile: profile,
              scholars: dbScholars,
              recentDuels,
              subjectId: subjectFull,
              chapterId: selectedChapterId,
              strictBracket: false,
            })
          : null;

        if (!relaxed) {
          setRoomError('No eligible verified scholars in bracket right now. Generate a 4-Digit PIN below to invite a friend!');
          setIsSearchingMatch(false);
          return;
        }
        let createdPin: string | undefined;
        if (profile?.uid) {
          const globalRoom = await createDuelRoom(profile, selectedSubjectId, selectedSubjectMeta.name, {
            chapterId: selectedChapterId,
            mode: 'global',
            integrityScore: relaxed.integrityReport.integrityScore,
            integrityStatus: relaxed.integrityReport.status,
            integrityFlags: relaxed.integrityReport.flags,
          });
          setActiveRoom(globalRoom);
          setRoomCode(globalRoom.pin);
          createdPin = globalRoom.pin;
        }
        setMatchedOpponent({
          uid: relaxed.scholar.uid,
          name: relaxed.scholar.name || relaxed.scholar.displayName || 'JAC Scholar',
          username: relaxed.scholar.username || normalizeUsername(relaxed.scholar.name, relaxed.scholar.uid),
          emailLower: relaxed.scholar.emailLower,
          xp: relaxed.scholar.xp || 0,
          streak: relaxed.scholar.streak || 0,
          photoURL: relaxed.scholar.photoURL || '/assets/profile_photos/IMG_20261109_001512.png',
          title: `${relaxed.bracketLabel} • Verified`,
          pin: createdPin,
        });
        setIsSearchingMatch(false);
        return;
      }

      let createdPin: string | undefined;
      if (profile?.uid) {
        const globalRoom = await createDuelRoom(profile, selectedSubjectId, selectedSubjectMeta.name, {
          chapterId: selectedChapterId,
          mode: 'global',
          integrityScore: best.integrityReport.integrityScore,
          integrityStatus: best.integrityReport.status,
          integrityFlags: best.integrityReport.flags,
        });
        setActiveRoom(globalRoom);
        setRoomCode(globalRoom.pin);
        createdPin = globalRoom.pin;
      }

      setMatchedOpponent({
        uid: best.scholar.uid,
        name: best.scholar.name || best.scholar.displayName || 'JAC Scholar',
        username: best.scholar.username || normalizeUsername(best.scholar.name, best.scholar.uid),
        emailLower: best.scholar.emailLower,
        xp: best.scholar.xp || 0,
        streak: best.scholar.streak || 0,
        photoURL: best.scholar.photoURL || '/assets/profile_photos/IMG_20261109_001512.png',
        title: `${best.bracketLabel} • ${best.integrityReport.integrityScore}% Fair-Play`,
        pin: createdPin,
      });
    } finally {
      setIsSearchingMatch(false);
    }
  };

  const handleCreatePinRoom = async (invitedFriend?: UserProfile) => {
    if (!profile?.uid) {
      setRoomError('Please sign in first to generate a cloud 4-digit PIN room.');
      return;
    }
    if (roomBusy) return;
    playClickSound();
    triggerHaptic();
    setRoomBusy(true);
    setRoomError(null);
    setRoomSuccess(null);
    try {
      const room = await createDuelRoom(profile, selectedSubjectId, selectedSubjectMeta.name, {
        chapterId: selectedChapterId,
        invitedFriendUid: invitedFriend?.uid,
        mode: 'friend',
        integrityScore: selfTrustScore,
        integrityStatus: selfTrustScore >= 80 ? 'Verified' : 'Caution',
      });
      setRoomCode(room.pin);
      setActiveRoom(room);
      const inviteUrl = `https://jackquiz.vercel.app/battle?pin=${room.pin}`;
      navigator.clipboard?.writeText(inviteUrl);
      if (invitedFriend?.uid) {
        await sendBuddyNudgeInCloud(profile.uid, profile.name || 'Scholar', invitedFriend.uid);
        setRoomSuccess(`4-Digit PIN #${room.pin} generated, invite link copied & ${invitedFriend.name} notified!`);
      } else {
        setRoomSuccess(`4-Digit PIN #${room.pin} generated! Invite link copied to clipboard.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to generate PIN room. Check connection.';
      setRoomError(msg);
    } finally {
      setRoomBusy(false);
    }
  };

  const handleJoinPinRoom = async () => {
    const cleanPin = roomCode.replace(/\D/g, '').trim();
    if (!profile?.uid) {
      setRoomError('Please sign in to join a cloud PIN room.');
      return;
    }
    if (cleanPin.length !== 4) {
      setRoomError('Enter a valid 4-digit PIN (e.g. 4829).');
      return;
    }
    if (roomBusy) return;
    playClickSound();
    triggerHaptic();
    setRoomBusy(true);
    setRoomError(null);
    setRoomSuccess(null);
    try {
      const res = await joinDuelRoomByPin(cleanPin, profile);
      if (!res.ok || !res.room) {
        setRoomError(res.error || 'Room not found.');
        return;
      }
      setActiveRoom(res.room);
      setRoomSuccess(`Joined PIN Room #${res.room.pin}! Anti-Match-Fixing Shield Active.`);
      const isHostSelf = res.room.hostUid === profile.uid;
      if (!isHostSelf) {
        setMatchedOpponent({
          uid: res.room.hostUid,
          name: res.room.hostName,
          username: res.room.hostUsername,
          emailLower: res.room.hostEmailLower,
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

  const handleToggleFollowFriend = async (targetUid: string) => {
    if (!profile?.uid || !targetUid || targetUid === profile.uid || followBusyMap[targetUid]) return;
    playClickSound();
    const currentlyFollowing = followingUids.includes(targetUid);
    const shouldFollow = !currentlyFollowing;
    const nextFollowing = shouldFollow
      ? Array.from(new Set([...followingUids, targetUid]))
      : followingUids.filter((id) => id !== targetUid);

    setFollowBusyMap((p) => ({ ...p, [targetUid]: true }));
    setFollowingUids(nextFollowing);
    setProfile({
      ...profile,
      followingUids: nextFollowing,
      connectedFriends: nextFollowing,
      followingCount: nextFollowing.length,
    });
    try {
      const res = await toggleFollowInDatabase(profile.uid, targetUid, shouldFollow);
      if (res.ok) {
        setLinkingNotice(shouldFollow ? 'Friend linked & synced to your roster!' : 'Friend unlinked.');
        setTimeout(() => setLinkingNotice(null), 2500);
      }
    } finally {
      setFollowBusyMap((p) => ({ ...p, [targetUid]: false }));
    }
  };

  const handleToggleReady = async () => {
    if (!activeRoom || !profile?.uid) return;
    playClickSound();
    const isHost = activeRoom.hostUid === profile.uid;
    const next = isHost ? !activeRoom.hostReady : !activeRoom.guestReady;
    await toggleDuelRoomReady(activeRoom.pin, isHost ? 'host' : 'guest', next);
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
          {/* 0. DEDICATED ANTI-MATCH-FIXING & INTEGRITY ENGINE (ABOVE GLOBAL & FRIEND LOBBIES) */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#10242A] via-[#131D30] to-[#0D1322] border border-cyan-400/35 shadow-[0_10px_28px_rgba(6,182,212,0.12)]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-300" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  🛡️ Anti-Match-Fixing &amp; Integrity Shield
                </h3>
              </div>
              <span
                className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                  currentAntiFixReport.status === 'Verified'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                    : currentAntiFixReport.status === 'Caution'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                    : 'bg-red-500/20 text-red-300 border-red-400/40'
                }`}
              >
                {currentAntiFixReport.status} • {currentAntiFixReport.integrityScore}%
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center mb-2.5">
              <div className="p-2 rounded-xl bg-black/30 border border-white/10">
                <div className="text-[9px] text-slate-400 font-bold uppercase">Trust Score</div>
                <div className="text-xs font-black text-cyan-300">{selfTrustScore}%</div>
              </div>
              <div className="p-2 rounded-xl bg-black/30 border border-white/10">
                <div className="text-[9px] text-slate-400 font-bold uppercase">Online Now</div>
                <div className="text-xs font-black text-emerald-300">{activeOnlineCount} Active</div>
              </div>
              <div className="p-2 rounded-xl bg-black/30 border border-white/10">
                <div className="text-[9px] text-slate-400 font-bold uppercase">Rank Mult</div>
                <div className="text-xs font-black text-amber-300">
                  {currentAntiFixReport.xpMultiplier}x XP
                </div>
              </div>
            </div>

            {currentAntiFixReport.flags.length > 0 && (
              <div className="mb-2 p-2 rounded-xl bg-amber-500/15 border border-amber-400/35 text-[10px] font-bold text-amber-200">
                ⚠️ {currentAntiFixReport.flags.join(' • ')}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setShowIntegrityMatrix((v) => !v);
              }}
              className="w-full py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-[10px] font-black text-cyan-200"
            >
              <span>Inspect 10 Pro Anti-Match-Fixing Protections ({currentAntiFixReport.checks.filter((c) => c.passed).length}/10 Active)</span>
              {showIntegrityMatrix ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showIntegrityMatrix && (
              <div className="mt-2.5 space-y-1.5 max-h-[240px] overflow-y-auto pr-1">
                {currentAntiFixReport.checks.map((chk) => (
                  <div
                    key={chk.id}
                    className={`p-2 rounded-xl border text-[10px] flex items-start justify-between gap-2 ${
                      chk.passed
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-slate-200'
                        : 'bg-red-500/15 border-red-500/35 text-red-200'
                    }`}
                  >
                    <div>
                      <div className="font-black text-white">
                        {chk.id}. {chk.label}
                      </div>
                      <div className="text-[9px] text-slate-400">{chk.detail}</div>
                    </div>
                    <span className="shrink-0 font-black">
                      {chk.passed ? '✅' : '⛔'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 1. GLOBAL AUTO-MATCHMAKING PRO (ELO + SUBJECT LOCK + SEEDED) */}
          <div className="p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-black text-white">Global Auto-Match Pro</h3>
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                10-Point Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2.5">
              Skill-bracket pairing across 69 chapters with shared cryptographic board seeds &amp; cooldown guards.
            </p>

            {/* Subject & Bracket Controls */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  setSelectedChapterId(1);
                }}
                className="bg-white/5 border border-white/15 rounded-xl px-2.5 py-2 text-[11px] font-bold text-white focus:outline-none focus:border-emerald-400/50"
              >
                {DUEL_SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#0F172A]">
                    {s.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(Number(e.target.value) || 1)}
                className="bg-white/5 border border-white/15 rounded-xl px-2.5 py-2 text-[11px] font-bold text-white focus:outline-none focus:border-emerald-400/50"
              >
                {Array.from({ length: selectedSubjectMeta.chapters }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num} className="bg-[#0F172A]">
                    Chapter {num}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between mb-3 px-2.5 py-1.5 rounded-xl bg-black/30 border border-white/10 text-[10px]">
              <span className="font-bold text-slate-300">
                Bracket Mode: {strictBracket ? 'ELO Tight (±800 XP)' : 'Open Global Pool'}
              </span>
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setStrictBracket((v) => !v);
                }}
                className="px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black"
              >
                Switch
              </button>
            </div>

            {isSearchingMatch ? (
              <div className="py-4 text-center space-y-2">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                  Running ELO &amp; Anti-Fixing Scan...
                </p>
                <p className="text-[10px] text-slate-400">Verifying Seed #{currentAntiFixReport.seed} &amp; Scholar Bracket</p>
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
                      <p className="text-[9px] text-cyan-300 font-bold">
                        {matchedOpponent.title} {matchedOpponent.pin ? `• PIN #${matchedOpponent.pin}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs">⚔️</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/quiz/${selectedSubjectId}/${chKey}/1?mode=duel&opponent=${encodeURIComponent(
                      matchedOpponent.name
                    )}${matchedOpponent.pin ? `&pin=${matchedOpponent.pin}` : ''}&seed=${
                      activeRoom?.questionSeed || currentAntiFixReport.seed
                    }`}
                    className="flex-1"
                  >
                    <TactileButton variant="emerald" fullWidth size="sm" className="font-black text-xs py-2">
                      ⚔️ Launch Synced 1v1 ({selectedSubjectMeta.id.toUpperCase()} Ch {selectedChapterId})
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
                ⚡ Find Fair Global Opponent
              </TactileButton>
            )}
          </div>

          {/* 2. ONLINE FRIEND MERGING, EMAIL SEARCH & 4-DIGIT PIN LOBBY (10 LINKING FEATURES) */}
          <div className="p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-amber-400/25 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-white">Online Linking &amp; 4-Digit PIN Lobby</h3>
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                10 Pro Link Features
              </span>
            </div>

            {/* Inline Friend Search by Email / @username / Name */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search friend by Email, @username, or Name..."
                  value={friendQuery}
                  onChange={(e) => setFriendQuery(e.target.value)}
                  className="w-full bg-black/35 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/60"
                />
              </div>

              {linkingNotice && (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-[10px] font-bold text-emerald-300 text-center">
                  {linkingNotice}
                </div>
              )}

              {friendQuery.trim() && (
                <div className="space-y-1.5 max-h-[210px] overflow-y-auto pr-1">
                  {friendSearching ? (
                    <p className="text-[10px] text-slate-400 text-center py-2">Searching Email &amp; Scholar Cloud...</p>
                  ) : friendResults.length === 0 ? (
                    <p className="text-[10px] text-slate-400 text-center py-2">
                      No scholar found matching &ldquo;{friendQuery.trim()}&rdquo;. Check spelling or email.
                    </p>
                  ) : (
                    friendResults.map((f) => {
                      const isFollowing = followingUids.includes(f.uid);
                      return (
                        <div
                          key={f.uid}
                          className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={f.photoURL || '/assets/profile_photos/IMG_20261109_001512.png'}
                              alt={f.name}
                              className="w-8 h-8 rounded-full object-cover border border-amber-400/40 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-black text-white truncate">{f.name}</span>
                                {f.isOnline && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
                              </div>
                              <p className="text-[9px] text-amber-300 font-bold truncate">
                                @{f.username} • {f.xp || 0} XP {f.emailLower ? `• ${f.emailLower}` : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              disabled={Boolean(followBusyMap[f.uid])}
                              onClick={() => handleToggleFollowFriend(f.uid)}
                              className={`px-2 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 ${
                                isFollowing
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                                  : 'bg-white/10 text-white border border-white/15 hover:bg-white/20'
                              }`}
                            >
                              {isFollowing ? <UserCheck className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                              <span>{isFollowing ? 'Linked' : 'Link'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCreatePinRoom(f)}
                              className="px-2 py-1 rounded-lg bg-amber-500 text-slate-950 text-[9px] font-black hover:bg-amber-400"
                            >
                              🎲 PIN Duel
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {roomError && (
              <div className="p-2 rounded-xl bg-red-500/15 border border-red-400/40 text-[11px] font-bold text-red-200">
                {roomError}
              </div>
            )}
            {roomSuccess && (
              <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-[11px] font-bold text-emerald-200">
                {roomSuccess}
              </div>
            )}

            {/* 4-Digit PIN Join & Generate Controls */}
            <div className="space-y-2 pt-1 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 4-Digit PIN (e.g. 4829)"
                  maxLength={4}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white placeholder:text-slate-500 tracking-widest focus:outline-none focus:border-amber-400/60"
                />
                <TactileButton
                  variant="gold"
                  size="sm"
                  disabled={roomCode.trim().length !== 4 || roomBusy}
                  onClick={handleJoinPinRoom}
                  className="font-black text-xs px-4"
                >
                  {roomBusy ? 'Joining...' : 'Join PIN'}
                </TactileButton>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCreatePinRoom()}
                  disabled={roomBusy}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_3px_0_#92400E] active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{roomBusy ? '⏳ Generating...' : '🎲 Generate 4-Digit PIN'}</span>
                </button>
                {activeRoom && (
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      navigator.clipboard?.writeText(`https://jackquiz.vercel.app/battle?pin=${activeRoom.pin}`);
                      setCopiedPin(true);
                      setTimeout(() => setCopiedPin(false), 2000);
                    }}
                    className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-[10px] font-black text-amber-300 flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedPin ? 'Copied!' : `#${activeRoom.pin}`}</span>
                  </button>
                )}
              </div>

              {/* Active Synchronized PIN Room Card */}
              {activeRoom && (
                <div className="p-3 rounded-2xl bg-black/40 border border-amber-400/35 space-y-2.5 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-300 font-mono tracking-wider">
                      ROOM PIN #{activeRoom.pin} • SEED #{activeRoom.questionSeed || currentAntiFixReport.seed}
                    </span>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                      {activeRoom.guestUid ? 'Linked & Ready!' : 'Waiting Guest...'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      <div className="font-black text-white truncate">Host: {activeRoom.hostName}</div>
                      <div className="text-emerald-400 font-bold">
                        {activeRoom.hostReady ? '✅ Ready' : '⏳ Preparing'}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      <div className="font-black text-white truncate">
                        Guest: {activeRoom.guestName || 'Invite Friend…'}
                      </div>
                      <div className="text-amber-300 font-bold">
                        {activeRoom.guestUid ? (activeRoom.guestReady ? '✅ Ready' : '⏳ Preparing') : 'Share Link'}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleToggleReady}
                      className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-[10px] font-black text-white"
                    >
                      Toggle Ready
                    </button>
                    <Link
                      href={`/quiz/${activeRoom.subjectId || selectedSubjectId}/${activeRoom.subjectId || selectedSubjectId}_ch${String(
                        activeRoom.chapterId || selectedChapterId
                      ).padStart(2, '0')}/1?mode=duel&opponent=${encodeURIComponent(
                        activeRoom.guestUid && activeRoom.hostUid === profile?.uid
                          ? activeRoom.guestName || 'Challenger'
                          : activeRoom.hostName
                      )}&pin=${activeRoom.pin}&seed=${activeRoom.questionSeed || currentAntiFixReport.seed}`}
                      className="flex-1"
                    >
                      <TactileButton variant="emerald" fullWidth size="sm" className="font-black text-xs py-2">
                        ⚔️ Enter PIN Room Battle
                      </TactileButton>
                    </Link>
                  </div>
                </div>
              )}
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

export default function BattleHubPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#090D16] flex items-center justify-center text-white text-xs font-bold">Loading Battle Hub...</div>}>
      <BattleHubContent />
    </Suspense>
  );
}
