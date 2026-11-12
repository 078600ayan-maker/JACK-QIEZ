'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Flame,
  Trophy,
  Award,
  Heart,
  ExternalLink,
  Calendar,
  Users,
  LogOut,
  Sparkles,
  Camera,
  Crown,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Check,
  X,
  Search,
  Edit2,
  Swords,
  Eye,
  PhoneCall,
  UserCheck,
  UserPlus,
  Shirt,
  Copy,
  Share2,
  Zap,
  Shield,
  BookOpen,
  Activity
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useUserStore } from '@/store/useUserStore';
import { UserProfile } from '@/types/user';
import {
  searchUsersInDatabase,
  toggleFollowInDatabase,
  fetchUsersByUids,
  fetchResolvedFollowRelations,
  subscribeGlobalLeaderboard,
  normalizeUsername,
  isUsernameAvailable,
  upsertUserInDirectory,
  fetchActiveScholarsCount,
  updateUserVerificationTickInCloud,
  isUserOnline,
} from '@/lib/socialService';
import { VerificationTick } from '@/components/ui/VerificationTick';
import {
  buildWeeklyStreakStrip,
  buildMonthlyStreakMatrix,
  getDuolingoStreakLevel,
  getEffectiveJoinDateKey,
} from '@/lib/streakEngine';
import { computeSelfTrustScore } from '@/lib/matchIntegrity';
import { CrownBadge } from '@/components/ui/CrownBadge';
import { TactileButton } from '@/components/ui/TactileButton';
import { MinecraftVoxelCharacter } from '@/components/avatar/MinecraftVoxelCharacter';
import { AvatarCustomizerModal } from '@/components/avatar/AvatarCustomizerModal';
import { ProfilePhotoModal } from '@/components/profile/ProfilePhotoModal';
import { CHARACTER_PRESETS, CLASSIC_PROFILE_PHOTOS } from '@/types/avatar';
import { getUserCurrentOreTier } from '@/types/ranking';
import { playClickSound, playAvatarCheer, playCorrectDing } from '@/lib/audioEngine';
import Image from 'next/image';

export interface ScholarFollowRef {
  uid: string;
  name: string;
  username: string;
  photoURL: string;
  xp: number;
  role: string;
  skinPath: string;
  dressedOutfit: string;
}

export interface ScholarItem {
  uid: string;
  name: string;
  username: string;
  class: string;
  xp: number;
  streak: number;
  followers: number;
  following: number;
  photoURL: string;
  skinPath?: string;
  dressedOutfit?: string;
  isRealUser: boolean;
  role?: string;
  bio?: string;
  isCurrentUser?: boolean;
  followersUids?: string[];
  followingUids?: string[];
  isOnline?: boolean;
  verificationTick?: 'green' | 'red' | 'black';
  email?: string;
  isAdmin?: boolean;
  isAdminPermitted?: boolean;
  isFeaturedReference?: boolean;
}

function profileToScholarItem(u: UserProfile, currentUid?: string): ScholarItem {
  const ore = getUserCurrentOreTier(u.xp || 0);
  const followersUids = Array.isArray(u.followersUids) ? u.followersUids : [];
  const followingUids = Array.isArray(u.followingUids) ? u.followingUids : [];
  return {
    uid: u.uid,
    name: u.name || u.displayName || 'JAC Scholar',
    username: u.username || normalizeUsername(u.name, u.uid),
    class: 'Class 10 JAC',
    xp: u.xp || 0,
    streak: u.streak || 0,
    followers: Math.max(followersUids.length, u.followersCount ?? 0),
    following: Math.max(followingUids.length, u.followingCount ?? 0),
    photoURL: u.photoURL || '/assets/profile_photos/IMG_20261109_001512.png',
    skinPath: u.customAvatar?.skinPath || CHARACTER_PRESETS[0].defaultCustomization.skinPath || '/skins/boy/skullwar.png',
    dressedOutfit: u.customAvatar?.name || CHARACTER_PRESETS[0].defaultCustomization.name || 'Skullwar Champion',
    isRealUser: u.isRealUser !== false,
    role: u.role || `${ore.name} Scholar`,
    bio: u.bio || 'Class 10 JAC Scholar preparing for Board Exams 2026.',
    isCurrentUser: Boolean(currentUid && u.uid === currentUid),
    followersUids,
    followingUids,
    isOnline: isUserOnline(u),
    verificationTick: u.verificationTick || (u.isAdmin ? 'red' : 'green'),
    email: u.emailLower || u.email || '',
    isAdmin: Boolean(u.isAdmin),
    isAdminPermitted: Boolean(u.isAdminPermitted),
    isFeaturedReference: Boolean(u.isFeaturedReference),
  };
}

function ProfileContent() {
  const router = useRouter();
  const { profile, setProfile, logoutUser, refillHearts, updateCustomAvatar, updateProfilePhoto } = useUserStore();

  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarTab, setAvatarTab] = useState<'bundles' | 'characters'>('characters');
  const [dpModalOpen, setDpModalOpen] = useState(false);
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);
  const [copiedProfileLink, setCopiedProfileLink] = useState(false);

  // Admin Verification Tick Console State
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [adminAuthorized, setAdminAuthorized] = useState(false);
  const [adminStatus, setAdminStatus] = useState<string | null>(null);
  const [adminBusyUid, setAdminBusyUid] = useState<string | null>(null);

  // Inspected Scholar Modal state
  const [inspectedScholar, setInspectedScholar] = useState<ScholarItem | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'overview' | 'followers' | 'following'>('overview');
  const [inspectedFollowersList, setInspectedFollowersList] = useState<ScholarItem[]>([]);
  const [inspectedFollowingList, setInspectedFollowingList] = useState<ScholarItem[]>([]);
  const [loadingRelations, setLoadingRelations] = useState(false);

  // Own Followers/Following modal state
  const [ownSocialModalTab, setOwnSocialModalTab] = useState<'followers' | 'following' | null>(null);
  const [ownFollowersList, setOwnFollowersList] = useState<ScholarItem[]>([]);
  const [ownFollowingList, setOwnFollowingList] = useState<ScholarItem[]>([]);
  const [loadingOwnSocial, setLoadingOwnSocial] = useState(false);

  // Real-time Firestore Users Directory & Search State
  const [searchUsername, setSearchUsername] = useState('');
  const [directoryScholars, setDirectoryScholars] = useState<ScholarItem[]>([]);
  const [searchResults, setSearchResults] = useState<ScholarItem[] | null>(null);
  const [searchingDb, setSearchingDb] = useState(false);

  // Bidirectional Follow State backed by Firestore
  const [followingUids, setFollowingUids] = useState<string[]>(profile?.followingUids || []);
  const [followersUids, setFollowersUids] = useState<string[]>(profile?.followersUids || []);
  const [followBusyMap, setFollowBusyMap] = useState<Record<string, boolean>>({});
  const [socialFeedback, setSocialFeedback] = useState<string | null>(null);

  // Keep local follow UID arrays synced with Zustand + resolved Firestore `follows` edges
  useEffect(() => {
    if (!profile?.uid) return;
    if (Array.isArray(profile.followingUids)) {
      setFollowingUids((prev) => Array.from(new Set([...(profile.followingUids || []), ...prev.filter((id) => profile.followingUids?.includes(id))])));
    }
    if (Array.isArray(profile.followersUids)) {
      setFollowersUids(profile.followersUids);
    }
    let active = true;
    fetchResolvedFollowRelations(profile.uid).then(({ followersUids: fers, followingUids: fing }) => {
      if (!active) return;
      setFollowersUids(fers);
      setFollowingUids(fing);
    });
    return () => {
      active = false;
    };
  }, [profile?.uid, profile?.followingUids, profile?.followersUids]);

  // Subscribe to global Firestore users directory + live active scholars count
  useEffect(() => {
    const unsub = subscribeGlobalLeaderboard((users) => {
      setDirectoryScholars(users.map((u) => profileToScholarItem(u, profile?.uid)));
    }, 50);
    return () => unsub();
  }, [profile?.uid]);

  // Debounced live Firestore search when user types in `@username` / name search bar
  useEffect(() => {
    const clean = searchUsername.trim();
    if (!clean) {
      setSearchResults(null);
      setSearchingDb(false);
      return;
    }

    let cancelled = false;
    setSearchingDb(true);
    const timer = setTimeout(async () => {
      try {
        const users = await searchUsersInDatabase(clean, 30);
        if (!cancelled) {
          setSearchResults(users.map((u) => profileToScholarItem(u, profile?.uid)));
        }
      } finally {
        if (!cancelled) setSearchingDb(false);
      }
    }, 90);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchUsername, profile?.uid]);

  // Load real Followers & Following profiles when opening an inspected scholar
  useEffect(() => {
    if (!inspectedScholar) {
      setInspectedFollowersList([]);
      setInspectedFollowingList([]);
      return;
    }
    let cancelled = false;
    setLoadingRelations(true);
    (async () => {
      try {
        const { followersUids: fers, followingUids: fing } = await fetchResolvedFollowRelations(
          inspectedScholar.uid
        );
        const [ferUsers, fingUsers] = await Promise.all([
          fetchUsersByUids(fers),
          fetchUsersByUids(fing),
        ]);
        if (cancelled) return;
        setInspectedFollowersList(ferUsers.map((u) => profileToScholarItem(u, profile?.uid)));
        setInspectedFollowingList(fingUsers.map((u) => profileToScholarItem(u, profile?.uid)));
        setInspectedScholar((prev) =>
          prev && prev.uid === inspectedScholar.uid
            ? {
                ...prev,
                followers: Math.max(fers.length, prev.followers),
                following: Math.max(fing.length, prev.following),
              }
            : prev
        );
      } finally {
        if (!cancelled) setLoadingRelations(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspectedScholar?.uid]);

  const openOwnSocialList = async (tab: 'followers' | 'following') => {
    playClickSound();
    setOwnSocialModalTab(tab);
    if (!profile?.uid) return;
    setLoadingOwnSocial(true);
    try {
      const { followersUids: fers, followingUids: fing } = await fetchResolvedFollowRelations(profile.uid);
      setFollowersUids(fers);
      setFollowingUids(fing);
      const [ferUsers, fingUsers] = await Promise.all([
        fetchUsersByUids(fers),
        fetchUsersByUids(fing),
      ]);
      setOwnFollowersList(ferUsers.map((u) => profileToScholarItem(u, profile.uid)));
      setOwnFollowingList(fingUsers.map((u) => profileToScholarItem(u, profile.uid)));
    } finally {
      setLoadingOwnSocial(false);
    }
  };

  const followingCount = Math.max(followingUids.length, profile?.followingCount ?? 0);
  const followersCount = Math.max(followersUids.length, profile?.followersCount ?? 0);

  const handleToggleFollow = async (targetUid: string) => {
    if (!profile?.uid || !targetUid || targetUid === profile.uid) return;
    if (followBusyMap[targetUid]) return;

    playClickSound();
    const currentlyFollowing = followingUids.includes(targetUid);
    const shouldFollow = !currentlyFollowing;

    // Optimistic state updates for instant zero-lag UI across header, directory, and modals
    const nextFollowingUids = shouldFollow
      ? Array.from(new Set([...followingUids, targetUid]))
      : followingUids.filter((id) => id !== targetUid);

    setFollowBusyMap((prev) => ({ ...prev, [targetUid]: true }));
    setFollowingUids(nextFollowingUids);

    setProfile({
      ...profile,
      followingUids: nextFollowingUids,
      connectedFriends: nextFollowingUids,
      followingCount: nextFollowingUids.length,
    });

    const delta = shouldFollow ? 1 : -1;
    setDirectoryScholars((prev) =>
      prev.map((s) =>
        s.uid === targetUid ? { ...s, followers: Math.max(0, s.followers + delta) } : s
      )
    );
    setSearchResults((prev) =>
      prev
        ? prev.map((s) =>
            s.uid === targetUid ? { ...s, followers: Math.max(0, s.followers + delta) } : s
          )
        : null
    );
    setInspectedScholar((prev) =>
      prev && prev.uid === targetUid
        ? { ...prev, followers: Math.max(0, prev.followers + delta) }
        : prev
    );

    try {
      const res = await toggleFollowInDatabase(profile.uid, targetUid, shouldFollow);
      if (!res.ok) {
        // Revert optimistic update if Firestore write failed completely
        setFollowingUids(followingUids);
        setProfile(profile);
        setSocialFeedback(res.error || 'Failed to sync follow status to database.');
        setTimeout(() => setSocialFeedback(null), 3000);
      } else {
        setSocialFeedback(shouldFollow ? 'Followed & synced to cloud!' : 'Unfollowed & synced to cloud!');
        setTimeout(() => setSocialFeedback(null), 2000);
      }
    } finally {
      setFollowBusyMap((prev) => ({ ...prev, [targetUid]: false }));
    }
  };

  // Duel state
  const [duelOpponent, setDuelOpponent] = useState<ScholarItem | null>(null);

  // Edit Profile modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState(profile?.firstName || '');
  const [editLastName, setEditLastName] = useState(profile?.lastName || '');
  const [editAge, setEditAge] = useState(String(profile?.age || ''));
  const [editUsername, setEditUsername] = useState(profile?.username || '');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const handleRandomDuel = () => {
    playClickSound();
    const pool = directoryScholars.filter((s) => s.uid !== profile?.uid);
    if (pool.length === 0) return;
    const rand = pool[Math.floor(Math.random() * pool.length)] || pool[0];
    setDuelOpponent(rand);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setEditSaving(true);
    setEditError('');
    try {
      const cleanedUsername = normalizeUsername(editUsername || editFirstName, profile.uid);
      const available = await isUsernameAvailable(cleanedUsername, profile.uid);
      if (!available) {
        setEditError(`@${cleanedUsername} is already taken by another scholar.`);
        return;
      }

      const combinedName =
        `${editFirstName.trim()} ${editLastName.trim()}`.trim() || profile.name;
      const updatedProfile = {
        ...profile,
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        name: combinedName,
        displayName: combinedName,
        nameLower: combinedName.toLowerCase(),
        age: parseInt(editAge, 10) || profile.age,
        username: cleanedUsername,
        usernameLower: cleanedUsername.toLowerCase(),
      };
      setProfile(updatedProfile);
      setEditModalOpen(false);
      void upsertUserInDirectory(updatedProfile).catch(() => {});
    } finally {
      setEditSaving(false);
    }
  };

  const name = profile?.name || 'Royal Scholar';
  const email = profile?.email || 'scholar@jackquiz.cloud';
  const photoURL = profile?.photoURL || '/assets/profile_photos/IMG_20261109_001512.png';
  const xp = profile?.xp ?? 0;
  const streak = profile?.streak ?? 0;
  const hearts = profile?.hearts ?? 5;

  const currentOre = getUserCurrentOreTier(xp);
  const activeAvatarCustom =
    profile?.customAvatar || CHARACTER_PRESETS[0].defaultCustomization;

  const crownsWon = Object.values(profile?.progress || {}).filter((lvl) => lvl >= 5).length;
  const scores = Object.values(profile?.levelScores || {});
  const avgAccuracy =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  // Compute live Global Rank from Firestore directory
  const sortedDirectory = [...directoryScholars].sort((a, b) => b.xp - a.xp);
  const computedRankIdx = sortedDirectory.findIndex((s) => s.uid === profile?.uid);
  const userStateRank = computedRankIdx >= 0 ? `#${computedRankIdx + 1}` : directoryScholars.length > 0 ? `#${directoryScholars.length + 1}` : '#1';

  const handleRefill = () => {
    playClickSound();
    refillHearts();
  };

  const handleLogout = async () => {
    playClickSound();
    try {
      await signOut(auth);
    } catch {
      // ignore if offline/anonymous cleanup
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sbr_session_verified');
    }
    logoutUser();
    router.replace('/login');
  };

  // Scholars displayed in the directory / search results
  const term = searchUsername.trim();

  // Canonical Admin Reference Account fallback if database has no registered admin account yet
  const CANONICAL_ADMIN_REFERENCE: ScholarItem = {
    uid: 'admin_official_ayan',
    name: 'Ayan Ali (Master Faculty)',
    username: 'ayan_admin',
    class: 'Class 10 JAC Faculty',
    xp: 9999,
    streak: 365,
    followers: 1250,
    following: 12,
    photoURL: '/assets/profile_photos/IMG_20261109_001512.png',
    skinPath: '/skins/boy/skullwar.png',
    dressedOutfit: 'Faculty Lead Robes',
    isRealUser: true,
    role: 'System Administrator & Faculty Lead',
    bio: 'Lead Examiner & Master Instructor for JAC Board Examination 2026.',
    followersUids: [],
    followingUids: [],
    isOnline: true,
    verificationTick: 'red',
    email: 'admin@jackquiz.com',
    isAdmin: true,
    isAdminPermitted: true,
    isFeaturedReference: true,
  };

  // Duolingo-style: when no search query, show ONLY Admin and Admin-Permitted reference accounts
  const isAdminOrPermitted = (s: ScholarItem): boolean => {
    return Boolean(
      s.isAdmin ||
      s.isAdminPermitted ||
      s.isFeaturedReference ||
      s.verificationTick === 'red' ||
      s.verificationTick === 'black' ||
      (s.role || '').toLowerCase().includes('admin') ||
      (s.username || '').toLowerCase() === 'ayan' ||
      (s.username || '').toLowerCase() === 'admin'
    );
  };

  const adminPermittedAccounts = directoryScholars.filter(isAdminOrPermitted);
  const defaultDisplayList = adminPermittedAccounts.length > 0
    ? adminPermittedAccounts
    : [CANONICAL_ADMIN_REFERENCE];

  const termLower = term.toLowerCase().replace(/^@+/, '');
  const localMatches = termLower
    ? directoryScholars.filter(
        (s) =>
          s.name.toLowerCase().includes(termLower) ||
          s.username.toLowerCase().includes(termLower) ||
          (s.email || '').toLowerCase().includes(termLower)
      )
    : [];
  const displayedScholars = term
    ? searchResults && searchResults.length > 0
      ? searchResults
      : localMatches
    : defaultDisplayList;

  // Duolingo-style Pre-Join-Aware Weekly & Monthly Streak + 10 Pro Telemetry Compute
  const weekCells = buildWeeklyStreakStrip(profile);
  const monthCells = buildMonthlyStreakMatrix(profile);
  const effectiveJoinDate = getEffectiveJoinDateKey(profile);
  const streakLevel = getDuolingoStreakLevel(streak);
  const activeDaysThisMonth = monthCells.filter((c) => c.status === 'active').length;
  const trustScore = computeSelfTrustScore(profile);
  const drillHistory = profile?.drillHistory || [];
  const bestDrillScore = drillHistory.reduce((m, d) => Math.max(m, d.score || 0), 0);
  const bestDrillAcc = drillHistory.reduce((m, d) => Math.max(m, d.accuracy || 0), 0);
  const subjectSpecs = [
    { id: 'sci', label: 'Science', totalCh: 13, color: 'from-emerald-400 to-teal-500' },
    { id: 'math', label: 'Maths', totalCh: 14, color: 'from-amber-400 to-orange-500' },
    { id: 'sst', label: 'Social Sci', totalCh: 14, color: 'from-sky-400 to-blue-500' },
    { id: 'eng', label: 'English', totalCh: 14, color: 'from-purple-400 to-fuchsia-500' },
    { id: 'hin', label: 'Hindi', totalCh: 14, color: 'from-rose-400 to-red-500' },
  ];

  return (
    <div className="w-full max-w-[480px] mx-auto px-4 pt-3 pb-44 select-none">
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

        {/* YouTube Button */}
        <a
          href="https://youtube.com/@jack_quiz?si=fT6w3HfWnB5a_oSl"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playClickSound()}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-[0_0_12px_rgba(239,68,68,0.4)] active:scale-95 transition-all"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          <span>YouTube</span>
          <ExternalLink className="w-3 h-3 text-red-200" />
        </a>
      </div>

      {/* 3D Glass Profile Hero Card */}
      <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#090D16] border-t-2 border-amber-400/50 border-x border-b border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.7)] overflow-hidden mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CrownBadge size="sm" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FBBF24]">
              ROYAL SCHOLAR IDENTITY
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold text-slate-400">
              {profile?.classLevel || 'CLASS 10 JAC'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between my-2">
          {/* Custom DP with Rotating Golden Ring Frame + Online/Offline Dot */}
          <div className="relative shrink-0 mr-3">
            <div
              onClick={() => {
                playClickSound();
                setDpModalOpen(true);
              }}
              className="relative w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-pointer group active:scale-95 transition-all"
              title="Click to Change DP"
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 relative">
                <img
                  src={photoURL}
                  alt={name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/profile_photos/IMG_20261109_001512.png';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              {/* Floating Red Camera/Edit Button */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-red-600 hover:bg-red-500 text-white border-2 border-slate-900 flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.8)] group-hover:scale-110 transition-transform">
                <Camera className="w-3 h-3 text-white" />
              </div>
              {/* Real-time Online/Offline Presence Dot */}
              <div
                className={`absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                  profile?.isOnline
                    ? 'bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.7)]'
                    : 'bg-[#ef4444] shadow-[0_0_6px_rgba(239,68,68,0.5)]'
                }`}
                title={profile?.isOnline ? 'Online' : 'Offline'}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-lg font-black text-white tracking-tight truncate">{name}</h2>
              <VerificationTick tick={profile?.verificationTick || 'green'} size="sm" />
            </div>
            <div className="mt-1">
              <VerificationTick tick={profile?.verificationTick || 'green'} size="xs" showLabel />
            </div>
            <p className="text-[11px] text-amber-400 font-black truncate mt-0.5">
              @{profile?.username || 'scholar'} {profile?.age ? `• ${profile.age}y` : ''}
            </p>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">{email}</p>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
                <Image
                  src={currentOre.iconSvg}
                  alt={currentOre.name}
                  width={12}
                  height={12}
                  className="object-contain"
                />
                <span>{currentOre.name}</span>
              </span>
              <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-200">
                <Shirt className="w-2.5 h-2.5 text-purple-300" />
                <span className="truncate max-w-[95px]">{activeAvatarCustom.name}</span>
              </span>
            </div>
          </div>

          {/* Synced 3D Equipped Wardrobe Outfit Showcase (Matches Home Lobby 1:1) */}
          <div
            onClick={() => {
              playClickSound();
              setAvatarTab('bundles');
              setAvatarModalOpen(true);
            }}
            className="shrink-0 flex flex-col items-center cursor-pointer group"
            title="Tap to Change Equipped Dress & 3D Skin"
          >
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-b from-amber-500/10 to-black/60 border-2 border-amber-400/50 overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.35)] group-hover:scale-105 transition-transform">
              <MinecraftVoxelCharacter
                key={activeAvatarCustom.skinPath || 'default-skin'}
                skinPath={
                  activeAvatarCustom.skinPath ||
                  CHARACTER_PRESETS[0].defaultCustomization.skinPath ||
                  '/skins/boy/skullwar.png'
                }
                mode="thumbnail"
                width={68}
                height={88}
                showSecondLayer={true}
                showCape={true}
              />
            </div>
            <span className="text-[9px] font-black text-amber-300 mt-1 tracking-wider uppercase text-center max-w-[92px] truncate">
              👕 {activeAvatarCustom.name}
            </span>
          </div>
        </div>

        {/* =========================================================================
            PRIMARY SOCIAL & STUDENT STATUS BAR: FOLLOW, FOLLOWING, STATUS
            ========================================================================= */}
        <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
          <button
            type="button"
            onClick={() => openOwnSocialList('followers')}
            className="p-2 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-400/40 transition-all cursor-pointer active:scale-95"
          >
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              Followers
            </span>
            <div className="text-base font-black text-amber-300">{followersCount}</div>
          </button>
          <button
            type="button"
            onClick={() => openOwnSocialList('following')}
            className="p-2 rounded-xl bg-white/5 hover:bg-blue-500/10 border border-white/5 hover:border-blue-400/40 transition-all cursor-pointer active:scale-95"
          >
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              Following
            </span>
            <div className="text-base font-black text-blue-300">{followingCount}</div>
          </button>
          <div className="p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              Global Rank
            </span>
            <div className="text-base font-black text-emerald-400">{userStateRank}</div>
          </div>
        </div>

        {/* Action Button Row: Follow Status & Edit Profile */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => {
              playClickSound();
              setEditFirstName(profile?.firstName || name.split(' ')[0] || '');
              setEditLastName(profile?.lastName || name.split(' ').slice(1).join(' ') || '');
              setEditAge(String(profile?.age || ''));
              setEditUsername(profile?.username || '');
              setEditModalOpen(true);
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-black flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={() => {
              playClickSound();
              setDpModalOpen(true);
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-[0_2px_0_#92400E] transition-all active:scale-95"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Change DP</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          PROMINENT ACTION GRID: [CHOOSE DP], [AVATAR STUDIO V3.0], [TEACHER खाता]
          ========================================================================= */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {/* Choose DP Button */}
        <button
          onClick={() => {
            playClickSound();
            setDpModalOpen(true);
          }}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-[#1C253D] to-[#101728] border border-amber-400/40 hover:border-amber-400 shadow-[0_4px_16px_rgba(0,0,0,0.5),0_0_15px_rgba(245,158,11,0.15)] active:scale-95 transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/30 to-amber-300/10 border border-amber-400/40 text-amber-300 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
            <Camera className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xs font-black text-white">Choose DP</span>
          <span className="text-[9px] text-amber-400 font-bold">10 Heroes</span>
        </button>

        {/* Avatar Studio V3.0 Button */}
        <button
          onClick={() => {
            playClickSound();
            setAvatarTab('bundles');
            setAvatarModalOpen(true);
          }}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-[#1C253D] to-[#101728] border border-amber-400/40 hover:border-amber-400 shadow-[0_4px_16px_rgba(0,0,0,0.5),0_0_15px_rgba(245,158,11,0.15)] active:scale-95 transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/30 to-amber-300/10 border border-amber-400/40 text-amber-300 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
            <Crown className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
          <span className="text-xs font-black text-white">AI Wardrobe</span>
          <span className="text-[9px] text-amber-400 font-bold">40 3D Skins</span>
        </button>

        {/* Teacher Portal / खाता Button */}
        <button
          onClick={() => {
            playClickSound();
            setTeacherModalOpen(true);
          }}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-[#1C253D] to-[#101728] border border-emerald-400/30 hover:border-emerald-400 shadow-[0_4px_16px_rgba(0,0,0,0.5),0_0_15px_rgba(16,185,129,0.15)] active:scale-95 transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xs font-black text-white">Teacher खाता</span>
          <span className="text-[9px] text-emerald-400 font-bold">Classroom</span>
        </button>
      </div>



      {/* =========================================================================
          DUOLINGO-STYLE PRE-JOIN-AWARE 7-DAY & 30-DAY STREAK ALGORITHM + LEVELS
          ========================================================================= */}
      <div className="p-4 rounded-3xl bg-[rgba(30,41,59,0.72)] backdrop-blur-xl border border-amber-500/25 mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              {streakLevel.badgeEmoji} {streakLevel.title} &bull; {streak}d Streak
            </span>
          </div>
          <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
            Joined {effectiveJoinDate}
          </span>
        </div>

        {/* Duolingo Streak Level Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span>
              Level {streakLevel.level} • Longest: {Math.max(streak, profile?.longestStreak || 1)}d • Freeze: {profile?.streakFreezes ?? 1} 🛡️
            </span>
            <span className="text-amber-300 font-bold">Goal: {streakLevel.nextMilestone}d</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300 transition-all"
              style={{ width: `${Math.max(8, streakLevel.progressPercent)}%` }}
            />
          </div>
        </div>

        {/* 7-Day Week Strip (Mon - Sun): Days prior to joinedAt are strictly crossed out */}
        <div className="grid grid-cols-7 gap-1.5 mb-3">
          {weekCells.map((cell) => (
            <div
              key={cell.dateKey}
              title={`${cell.label} (${cell.dateKey}): ${cell.status.replace('_', ' ')}`}
              className={`py-2 rounded-xl flex flex-col items-center justify-center transition-all border ${
                cell.isToday
                  ? 'bg-gradient-to-b from-amber-500 to-orange-500 text-slate-950 border-white shadow-[0_0_12px_rgba(245,158,11,0.65)] scale-105'
                  : cell.status === 'active'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : cell.status === 'pre_join'
                  ? 'bg-slate-950/60 border-white/5 text-slate-600 line-through opacity-55'
                  : cell.status === 'missed'
                  ? 'bg-red-950/40 border-red-500/30 text-red-400'
                  : 'bg-white/5 border-white/5 text-slate-500'
              }`}
            >
              <span className="text-[9px] font-bold uppercase">{cell.label}</span>
              <span className="text-xs mt-0.5 font-black">
                {cell.isToday
                  ? '🔥'
                  : cell.status === 'active'
                  ? '✓'
                  : cell.status === 'pre_join'
                  ? '✕'
                  : cell.status === 'missed'
                  ? '!'
                  : '•'}
              </span>
            </div>
          ))}
        </div>

        {/* 30-Day Calendar Matrix: Dates before joinedAt (e.g. 1-24 if joined 25th) are crossed out */}
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1.5">
          <span>Monthly 30-Day Radar</span>
          <span className="text-amber-300">{activeDaysThisMonth} Active Days This Month</span>
        </div>
        <div className="grid grid-cols-10 gap-1.5 pt-0.5">
          {monthCells.map((cell) => (
            <div
              key={cell.dayNum}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-[8px] font-black transition-all
                ${
                  cell.isToday
                    ? 'bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-300 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.9)] scale-110 border border-white'
                    : cell.status === 'active'
                    ? 'bg-emerald-500/80 text-white'
                    : cell.status === 'pre_join'
                    ? 'bg-slate-950/60 border border-white/5 text-slate-600 line-through opacity-50'
                    : cell.status === 'missed'
                    ? 'bg-red-950/40 border border-red-500/20 text-red-400/70 line-through'
                    : 'bg-white/5 border border-white/5 text-slate-600'
                }
              `}
              title={`${cell.dateKey} (${cell.status.replace('_', ' ')})`}
            >
              {cell.isToday ? '🔥' : cell.status === 'pre_join' ? `/${cell.dayNum}` : cell.status === 'missed' ? '✕' : cell.dayNum}
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          10-POINT PRO SCHOLAR PROFILE DASHBOARD (MASTERY, TELEMETRY, OUTFIT, SHARE)
          ========================================================================= */}
      <div className="p-4 rounded-3xl bg-[rgba(26,34,53,0.82)] backdrop-blur-xl border border-white/10 mb-4 space-y-3.5 shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Pro Scholar Telemetry &amp; 69-Chapter Mastery
            </h3>
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setAdminStatus(null);
                setAdminModalOpen(true);
              }}
              className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black text-slate-300 cursor-pointer"
              title="Admin Verification Tick Control"
            >
              🛡️ Admin Tick
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              const url = `https://jackquiz.vercel.app/battle?invite=${encodeURIComponent(profile?.username || 'scholar')}`;
              navigator.clipboard?.writeText(url);
              setCopiedProfileLink(true);
              setTimeout(() => setCopiedProfileLink(false), 2000);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 text-[10px] font-black text-blue-300"
          >
            {copiedProfileLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
            <span>{copiedProfileLink ? 'Copied Link!' : 'Share Profile'}</span>
          </button>
        </div>

        {/* 4-Column Quick Pro Metrics: Trust Score, 60s Drill Best, Duel Wins, Active Scholars */}
        <div className="grid grid-cols-4 gap-1.5 text-center">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10">
            <Shield className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-0.5" />
            <div className="text-xs font-black text-emerald-300">{trustScore}%</div>
            <div className="text-[8px] text-slate-400 uppercase font-bold">Trust</div>
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/10">
            <Zap className="w-3.5 h-3.5 text-amber-400 mx-auto mb-0.5" />
            <div className="text-xs font-black text-amber-300">{bestDrillScore}</div>
            <div className="text-[8px] text-slate-400 uppercase font-bold">60s Best</div>
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/10">
            <Swords className="w-3.5 h-3.5 text-red-400 mx-auto mb-0.5" />
            <div className="text-xs font-black text-red-300">{profile?.duelWins ?? 0}</div>
            <div className="text-[8px] text-slate-400 uppercase font-bold">Duel Wins</div>
          </div>
        </div>

        {/* Subject-Wise Mastery Progress across all 69 JAC Chapters */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-black text-slate-300">
            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3 text-amber-400" /> JAC Class 10 Subject Mastery</span>
            <span className="text-amber-300">Best Drill Acc: {bestDrillAcc}%</span>
          </div>
          <div className="space-y-1.5">
            {subjectSpecs.map((sub) => {
              const completedCount = Object.entries(profile?.progress || {}).filter(
                ([k, v]) => k.startsWith(`${sub.id}_`) && (v || 0) >= 1
              ).length;
              const pct = Math.min(100, Math.round((completedCount / sub.totalCh) * 100));
              return (
                <div key={sub.id} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-300">{sub.label}</span>
                    <span className="text-slate-400 font-mono">
                      {completedCount}/{sub.totalCh} Ch ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${sub.color}`}
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Streak & Scholar Milestone Badges Shelf + Equipped Outfit Bar */}
        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { label: '⚡ Spark 3d', ok: streak >= 3 || (profile?.longestStreak || 0) >= 3 },
              { label: '🏆 Week 7d', ok: streak >= 7 || (profile?.longestStreak || 0) >= 7 },
              { label: '💎 500 XP', ok: xp >= 500 },
              { label: '👑 Crown', ok: crownsWon >= 1 },
            ].map((b) => (
              <span
                key={b.label}
                className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                  b.ok
                    ? 'bg-amber-500/20 border-amber-400/50 text-amber-200'
                    : 'bg-white/5 border-white/10 text-slate-500'
                }`}
              >
                {b.label}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setAvatarTab('bundles');
              setAvatarModalOpen(true);
            }}
            className="text-[10px] font-black text-purple-300 hover:text-purple-200 flex items-center gap-1"
          >
            <Shirt className="w-3 h-3" />
            <span>Outfit: {activeAvatarCustom.name}</span>
          </button>
        </div>
      </div>

      {/* 4-Box Bento Grid for Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-4 rounded-2xl bg-[rgba(30,41,59,0.65)] border border-white/10">
          <div className="flex items-center justify-between text-[#F59E0B] mb-2">
            <Flame className="w-5 h-5 fill-[#F59E0B]" />
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
              Streak
            </span>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{streak} Days</div>
          <div className="text-[11px] font-bold text-slate-400 mt-0.5">Daily Study Fire</div>
        </div>

        <div className="p-4 rounded-2xl bg-[rgba(30,41,59,0.65)] border border-white/10">
          <div className="flex items-center justify-between text-[#FBBF24] mb-2">
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
              XP Power
            </span>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{xp}</div>
          <div className="text-[11px] font-bold text-slate-400 mt-0.5">Total XP Earned</div>
        </div>

        <div className="p-4 rounded-2xl bg-[rgba(30,41,59,0.65)] border border-white/10">
          <div className="flex items-center justify-between text-[#10B981] mb-2">
            <Award className="w-5 h-5" />
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Rate
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400 tracking-tight">{avgAccuracy}%</div>
          <div className="text-[11px] font-bold text-slate-400 mt-0.5">Overall Accuracy</div>
        </div>

        <div className="p-4 rounded-2xl bg-[rgba(30,41,59,0.65)] border border-white/10">
          <div className="flex items-center justify-between text-[#F59E0B] mb-2">
            <CrownBadge size="sm" />
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
              Boss Clears
            </span>
          </div>
          <div className="text-2xl font-black text-amber-300 tracking-tight">{crownsWon} 👑</div>
          <div className="text-[11px] font-bold text-slate-400 mt-0.5">Chapter Crowns</div>
        </div>
      </div>

      {/* Hearts Recovery Card */}
      <div className="p-4 rounded-2xl bg-[rgba(30,41,59,0.65)] border border-white/10 mb-4 flex items-center justify-between">
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

      {/* =========================================================================
          SOCIAL HUB: Find Study Buddies & Classmates (Database @username Search)
          ========================================================================= */}
      <div className="mt-5 p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              🔍 Find Friends (Email / @Username / Name)
            </h3>
          </div>
          <span className="text-[9px] font-black text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-400/30">
            {searchingDb ? 'Searching Cloud...' : `${displayedScholars.length} Found`}
          </span>
        </div>

        {/* Search Input (Live Firestore Query) */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by email, @username, or full name..."
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-10 pr-8 py-2.5 text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition"
          />
          {searchUsername && (
            <button
              type="button"
              onClick={() => setSearchUsername('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {socialFeedback && (
          <div className="mb-2.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-[11px] font-bold text-emerald-300 text-center">
            {socialFeedback}
          </div>
        )}

        {/* Duolingo-Style Pre-Search Section Header */}
        {!term && (
          <div className="mb-2.5 px-1 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Suggested / Official Reference Accounts</span>
            </span>
            <span className="text-[9px] font-bold text-slate-400">
              Admin &amp; Verified Faculty
            </span>
          </div>
        )}

        {/* Scholars Cards with View Profile */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {displayedScholars.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-white/5 border border-white/10">
              <p className="text-xs font-bold text-slate-300">
                {searchingDb
                  ? 'Searching Firestore users directory...'
                  : term
                  ? `No registered scholar matched "@${term.replace(/^@+/, '')}".`
                  : 'No official reference accounts found.'}
              </p>
            </div>
          ) : (
            displayedScholars.map((s) => {
              const isFollowing = followingUids.includes(s.uid);
              const isBusy = Boolean(followBusyMap[s.uid]);
              const isYou = s.isCurrentUser || s.uid === profile?.uid;

              return (
                <div
                  key={s.uid}
                  className={`p-3 rounded-2xl border transition-all ${
                    isYou
                      ? 'bg-amber-500/10 border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Avatar with Individual Real-Time Presence Dot */}
                      <div className="relative shrink-0">
                        <img
                          src={s.photoURL}
                          alt={s.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/profile_photos/IMG_20261109_001512.png';
                          }}
                          className="w-10 h-10 rounded-xl object-cover border border-white/15 shrink-0 bg-slate-900"
                        />
                        <span
                          className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-950 ${
                            s.isOnline
                              ? 'bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.8)]'
                              : 'bg-[#ef4444] shadow-[0_0_5px_rgba(239,68,68,0.6)]'
                          }`}
                          title={s.isOnline ? 'Online' : 'Offline'}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-black text-white truncate">{s.name}</p>
                          <VerificationTick tick={s.verificationTick} size="xs" />
                          {isYou && (
                            <span className="text-[8px] font-black px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950">
                              YOU
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-amber-400 font-bold truncate">
                          @{s.username} &bull; {s.xp} XP &bull; {s.followers} followers
                        </p>
                      </div>
                    </div>

                    {/* Actions: View Profile + Follow/Unfollow + Duel */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          playClickSound();
                          setInspectedScholar(s);
                          setInspectorTab('overview');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 text-[10px] font-black text-blue-300 flex items-center gap-1 transition-all active:scale-95"
                        title="View Full Profile Details"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Profile</span>
                      </button>

                      {!isYou && (
                        <>
                          <button
                            disabled={isBusy}
                            onClick={() => handleToggleFollow(s.uid)}
                            className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-1 disabled:opacity-60 ${
                              isFollowing
                                ? 'bg-amber-500/20 hover:bg-red-500/20 hover:text-red-300 hover:border-red-400/40 text-amber-300 border border-amber-400/40'
                                : 'bg-emerald-500 text-slate-950 font-black shadow-[0_2px_0_#065F46]'
                            }`}
                          >
                            {isFollowing ? (
                              <>
                                <UserCheck className="w-3 h-3" />
                                <span>Following</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3 h-3" />
                                <span>Follow</span>
                              </>
                            )}
                          </button>
                          <Link
                            href={`/quiz/sci/sci_ch01/1?mode=duel&opponent=${encodeURIComponent(s.name)}`}
                            onClick={() => playClickSound()}
                            className="px-2 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-[10px] font-black text-red-300 flex items-center gap-1"
                          >
                            <Swords className="w-3 h-3" />
                            <span>Duel</span>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* =========================================================================
          1v1 DUEL ARENA CHALLENGE CARD
          ========================================================================= */}
      <div className="mt-4 p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">⚔️</span>
          <h3 className="text-xs font-black uppercase tracking-wider text-white">
            Quick 1v1 Battle Arena
          </h3>
        </div>

        <button
          onClick={handleRandomDuel}
          className="w-full py-2.5 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-black hover:bg-red-500/25 transition-all mb-3 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>🎲 Match With Random Canonical Scholar</span>
        </button>

        {duelOpponent && (
          <div className="space-y-3">
            {/* Stat comparison */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[9px] text-slate-400 uppercase font-bold">You</p>
                <p className="text-sm font-black text-amber-300">{xp} XP</p>
                <p className="text-[10px] text-orange-300 font-bold">{streak}d 🔥</p>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-xl font-black text-white">VS</span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[9px] text-slate-400 uppercase font-bold">{duelOpponent.name}</p>
                <p className="text-sm font-black text-blue-300">{duelOpponent.xp} XP</p>
                <p className="text-[10px] text-orange-300 font-bold">{duelOpponent.streak}d 🔥</p>
              </div>
            </div>

            <Link
              href={`/quiz/sci/sci_ch01/1?mode=duel&opponent=${encodeURIComponent(duelOpponent.name)}`}
              onClick={() => playClickSound()}
              className="block w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 text-white text-center font-black text-xs uppercase tracking-wider shadow-[0_4px_0_#7F1D1D] active:translate-y-1 active:shadow-none transition-all"
            >
              ⚔️ Start 1v1 Battle with {duelOpponent.name}!
            </Link>
          </div>
        )}
      </div>

      {/* Account Actions */}
      <div className="mt-4 space-y-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-400 hover:text-white transition-all active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          <span>Switch Account or Sign Out</span>
        </button>
      </div>

      {/* =========================================================================
          FULL SCHOLAR PROFILE INSPECTOR MODAL ("अंदर घुसने का ऑप्शन")
          WITH 3D DRESSED AVATAR, FOLLOWERS LIST & FOLLOWING ACCOUNTS
          ========================================================================= */}
      {inspectedScholar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xl select-none">
          <div className="relative w-full max-w-[430px] max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-[#18233C] via-[#0F172A] to-[#0A0D16] border-2 border-amber-400/50 p-5 shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setInspectedScholar(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all z-20"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Profile Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 mb-4">
              <button
                onClick={() => { playClickSound(); setInspectorTab('overview'); }}
                className={`flex-1 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                  inspectorTab === 'overview'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                👤 Overview &amp; 3D
              </button>
              <button
                onClick={() => { playClickSound(); setInspectorTab('followers'); }}
                className={`flex-1 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                  inspectorTab === 'followers'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                👥 Followers ({Math.max(inspectedScholar.followers, inspectedFollowersList.length)})
              </button>
              <button
                onClick={() => { playClickSound(); setInspectorTab('following'); }}
                className={`flex-1 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                  inspectorTab === 'following'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ⭐ Following ({Math.max(inspectedScholar.following, inspectedFollowingList.length)})
              </button>
            </div>

            {/* TAB 1: OVERVIEW & 3D DRESSED AVATAR */}
            {inspectorTab === 'overview' && (
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-24 h-28 shrink-0 rounded-2xl bg-black/50 border-2 border-amber-400/40 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                    <MinecraftVoxelCharacter
                      skinPath={inspectedScholar.skinPath || '/skins/boy/minecraft-skins.png'}
                      mode="thumbnail"
                      width={80}
                      height={100}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-lg font-black text-white truncate">{inspectedScholar.name}</h3>
                      <VerificationTick tick={inspectedScholar.verificationTick} size="sm" />
                    </div>
                    <div className="mt-1">
                      <VerificationTick tick={inspectedScholar.verificationTick} size="xs" showLabel />
                    </div>
                    <p className="text-xs font-bold text-amber-400 mt-1">@{inspectedScholar.username}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-[10px] font-bold text-blue-300">
                      {inspectedScholar.role || 'Class 10 JAC Scholar'}
                    </span>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-300">
                      <Shirt className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{inspectedScholar.dressedOutfit || 'Royal Student Wardrobe'}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 p-3 rounded-2xl bg-white/5 border border-white/5 leading-relaxed mb-4">
                  {inspectedScholar.bio || 'Active Class 10 Scholar preparing for JAC Board Exams 2026.'}
                </p>

                {/* Live Scholar Stats */}
                <div className="grid grid-cols-4 gap-2 text-center py-3 border-y border-white/10 mb-4">
                  <div className="p-2 rounded-xl bg-white/5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">XP</span>
                    <span className="text-sm font-black text-amber-300">{inspectedScholar.xp}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Streak</span>
                    <span className="text-sm font-black text-orange-400">{inspectedScholar.streak}d 🔥</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectorTab('followers')}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
                  >
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Followers</span>
                    <span className="text-sm font-black text-white">{Math.max(inspectedScholar.followers, inspectedFollowersList.length)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectorTab('following')}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
                  >
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Following</span>
                    <span className="text-sm font-black text-white">{Math.max(inspectedScholar.following, inspectedFollowingList.length)}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: FOLLOWERS LIST (LIVE FROM FIRESTORE) */}
            {inspectorTab === 'followers' && (
              <div className="space-y-2 mb-4 max-h-[260px] overflow-y-auto pr-1">
                <p className="text-[11px] text-slate-400 mb-2">
                  Scholars following @{inspectedScholar.username}:
                </p>
                {loadingRelations ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Loading followers from database...</p>
                ) : inspectedFollowersList.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No followers yet.</p>
                ) : (
                  inspectedFollowersList.map((f) => {
                    const isFollowingF = followingUids.includes(f.uid);
                    const isSelfF = f.uid === profile?.uid;
                    return (
                      <div
                        key={f.uid}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/40 transition-all"
                      >
                        <div
                          onClick={() => {
                            playClickSound();
                            setInspectedScholar(f);
                            setInspectorTab('overview');
                          }}
                          className="flex items-center gap-2.5 cursor-pointer min-w-0"
                        >
                          <div className="relative shrink-0">
                            <img
                              src={f.photoURL}
                              alt={f.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/profile_photos/IMG_20261109_001512.png';
                              }}
                              className="w-9 h-9 rounded-xl object-cover border border-white/10 bg-slate-900"
                            />
                            <span
                              className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-slate-950 ${
                                f.isOnline
                                  ? 'bg-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.8)]'
                                  : 'bg-[#ef4444] shadow-[0_0_4px_rgba(239,68,68,0.6)]'
                              }`}
                              title={f.isOnline ? 'Online' : 'Offline'}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-white truncate">{f.name}</p>
                            <p className="text-[10px] text-amber-400 font-bold truncate">@{f.username} &bull; {f.xp} XP</p>
                          </div>
                        </div>

                        {!isSelfF && (
                          <button
                            disabled={Boolean(followBusyMap[f.uid])}
                            onClick={() => handleToggleFollow(f.uid)}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-black shrink-0 ${
                              isFollowingF
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                                : 'bg-emerald-500 text-slate-950'
                            }`}
                          >
                            {isFollowingF ? 'Following ✓' : '+ Follow'}
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 3: FOLLOWING LIST (LIVE FROM FIRESTORE) */}
            {inspectorTab === 'following' && (
              <div className="space-y-2 mb-4 max-h-[260px] overflow-y-auto pr-1">
                <p className="text-[11px] text-slate-400 mb-2">
                  Scholars followed by @{inspectedScholar.username}:
                </p>
                {loadingRelations ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Loading following list from database...</p>
                ) : inspectedFollowingList.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Not following anyone yet.</p>
                ) : (
                  inspectedFollowingList.map((f) => {
                    const isFollowingF = followingUids.includes(f.uid);
                    const isSelfF = f.uid === profile?.uid;
                    return (
                      <div
                        key={f.uid}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/40 transition-all"
                      >
                        <div
                          onClick={() => {
                            playClickSound();
                            setInspectedScholar(f);
                            setInspectorTab('overview');
                          }}
                          className="flex items-center gap-2.5 cursor-pointer min-w-0"
                        >
                          <div className="relative shrink-0">
                            <img
                              src={f.photoURL}
                              alt={f.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/profile_photos/IMG_20261109_001512.png';
                              }}
                              className="w-9 h-9 rounded-xl object-cover border border-white/10 bg-slate-900"
                            />
                            <span
                              className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-slate-950 ${
                                f.isOnline
                                  ? 'bg-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.8)]'
                                  : 'bg-[#ef4444] shadow-[0_0_4px_rgba(239,68,68,0.6)]'
                              }`}
                              title={f.isOnline ? 'Online' : 'Offline'}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-white truncate">{f.name}</p>
                            <p className="text-[10px] text-amber-400 font-bold truncate">@{f.username} &bull; {f.xp} XP</p>
                          </div>
                        </div>

                        {!isSelfF && (
                          <button
                            disabled={Boolean(followBusyMap[f.uid])}
                            onClick={() => handleToggleFollow(f.uid)}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-black shrink-0 ${
                              isFollowingF
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                                : 'bg-emerald-500 text-slate-950'
                            }`}
                          >
                            {isFollowingF ? 'Following ✓' : '+ Follow'}
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              {!inspectedScholar.isCurrentUser && (
                <>
                  <button
                    disabled={Boolean(followBusyMap[inspectedScholar.uid])}
                    onClick={() => handleToggleFollow(inspectedScholar.uid)}
                    className={`w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 ${
                      followingUids.includes(inspectedScholar.uid)
                        ? 'bg-amber-500/20 hover:bg-red-500/20 hover:text-red-300 hover:border-red-400/40 text-amber-300 border border-amber-400/40'
                        : 'bg-emerald-500 text-slate-950 font-black shadow-[0_3px_0_#065F46]'
                    }`}
                  >
                    {followingUids.includes(inspectedScholar.uid) ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Following Scholar ✓ (Tap to Unfollow)</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>+ Follow Scholar</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={`/quiz/sci/sci_ch01/1?mode=duel&opponent=${encodeURIComponent(inspectedScholar.name)}`}
                    onClick={() => {
                      playClickSound();
                      setInspectedScholar(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white text-center font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_3px_0_#7F1D1D] active:translate-y-0.5 transition-all"
                  >
                    <Swords className="w-4 h-4" />
                    <span>⚔️ Challenge {inspectedScholar.name} to 1v1 Battle</span>
                  </Link>
                </>
              )}

              <button
                onClick={() => setInspectedScholar(null)}
                className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition-all"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS: AVATAR CUSTOMIZER, PROFILE PHOTO & TEACHER PORTAL & EDIT
          ========================================================================= */}
      <AvatarCustomizerModal
        isOpen={avatarModalOpen}
        initialTab={avatarTab}
        initialCustomization={activeAvatarCustom}
        onSave={(newCustom) => {
          updateCustomAvatar(newCustom);
          playAvatarCheer();
        }}
        onClose={() => setAvatarModalOpen(false)}
      />

      <ProfilePhotoModal
        isOpen={dpModalOpen}
        currentPhoto={photoURL}
        onSave={(newPhoto) => {
          updateProfilePhoto(newPhoto);
        }}
        onClose={() => setDpModalOpen(false)}
      />

      {/* Teacher Portal Modal */}
      {teacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="relative w-full max-w-[420px] rounded-3xl bg-gradient-to-b from-[#16213A] to-[#0A0E18] border-2 border-emerald-500/40 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Teacher Portal (शिक्षक खाता)</h3>
                  <p className="text-[10px] text-emerald-400 font-bold">Class 10 JAC Educator Console</p>
                </div>
              </div>
              <button
                onClick={() => setTeacherModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Assigned Class</span>
                  <span className="text-xs font-black text-white">Class 10 JAC Batch A</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-slate-400 font-bold">Cloud Scholars</span>
                  <div className="text-base font-black text-white mt-0.5">{directoryScholars.length} Registered</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-slate-400 font-bold">Your Avg Accuracy</span>
                  <div className="text-base font-black text-emerald-400 mt-0.5">{avgAccuracy}%</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                playCorrectDing();
                setTeacherModalOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all"
            >
              Close Portal
            </button>
          </div>
        </div>
      )}

      {/* Own Followers / Following Modal (Live from Firestore) */}
      {ownSocialModalTab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="relative w-full max-w-[420px] rounded-3xl bg-gradient-to-b from-[#16213A] to-[#0A0E18] border-2 border-amber-500/40 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openOwnSocialList('followers')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                    ownSocialModalTab === 'followers'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-white/5 text-slate-300'
                  }`}
                >
                  Followers ({followersCount})
                </button>
                <button
                  type="button"
                  onClick={() => openOwnSocialList('following')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                    ownSocialModalTab === 'following'
                      ? 'bg-blue-500 text-slate-950'
                      : 'bg-white/5 text-slate-300'
                  }`}
                >
                  Following ({followingCount})
                </button>
              </div>
              <button
                onClick={() => setOwnSocialModalTab(null)}
                className="w-8 h-8 rounded-full bg-white/10 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {loadingOwnSocial ? (
                <p className="text-xs text-slate-400 py-6 text-center">Loading from Firestore database...</p>
              ) : (ownSocialModalTab === 'followers' ? ownFollowersList : ownFollowingList).length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  {ownSocialModalTab === 'followers'
                    ? 'No scholars following you yet.'
                    : 'You are not following anyone yet. Search @username below to connect!'}
                </p>
              ) : (
                (ownSocialModalTab === 'followers' ? ownFollowersList : ownFollowingList).map((u) => {
                  const isFollowingU = followingUids.includes(u.uid);
                  const isBusyU = Boolean(followBusyMap[u.uid]);
                  return (
                    <div
                      key={u.uid}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/10"
                    >
                      <div
                        onClick={() => {
                          setOwnSocialModalTab(null);
                          setInspectedScholar(u);
                          setInspectorTab('overview');
                        }}
                        className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                      >
                        <img
                          src={u.photoURL}
                          alt={u.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/profile_photos/IMG_20261109_001512.png';
                          }}
                          className="w-9 h-9 rounded-xl object-cover border border-white/15 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="text-xs font-black text-white truncate">{u.name}</p>
                            <VerificationTick tick={u.verificationTick} size="xs" />
                          </div>
                          <p className="text-[10px] text-amber-400 font-bold truncate">@{u.username} &bull; {u.xp} XP</p>
                        </div>
                      </div>
                      <button
                        disabled={isBusyU}
                        onClick={() => handleToggleFollow(u.uid)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-black shrink-0 ${
                          isFollowingU
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                            : 'bg-emerald-500 text-slate-950'
                        }`}
                      >
                        {isFollowingU ? 'Following ✓' : '+ Follow'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="relative w-full max-w-[420px] rounded-3xl bg-gradient-to-b from-[#16213A] to-[#0A0E18] border-2 border-amber-500/40 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-sm font-black text-white">⚙️ Edit Profile</h3>
              <button
                onClick={() => { setEditModalOpen(false); setEditError(''); }}
                className="w-8 h-8 rounded-full bg-white/10 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="mb-3 p-2.5 rounded-xl bg-red-500/20 border border-red-400/40 text-xs font-bold text-red-200">
                {editError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider mb-1.5 block">First Name</label>
                <input
                  type="text"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 transition"
                />
              </div>
              <div>
                <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider mb-1.5 block">Last Name</label>
                <input
                  type="text"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 transition"
                />
              </div>
              <div>
                <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider mb-1.5 block">Age</label>
                <select
                  value={editAge}
                  onChange={(e) => setEditAge(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 transition appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#0F172A]">Select age</option>
                  {Array.from({ length: 8 }, (_, i) => i + 13).map((a) => (
                    <option key={a} value={a} className="bg-[#0F172A]">{a} years old</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider mb-1.5 block">@Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 font-black text-sm">@</span>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 transition"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={editSaving}
              className="mt-4 w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#92400E] active:translate-y-1 active:shadow-none disabled:opacity-50 transition-all"
            >
              {editSaving ? 'Saving...' : '✓ Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Admin Verification Tick Console (Green = Default All, Red & Black = Admin-Controlled) */}
      {adminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="relative w-full max-w-[440px] max-h-[85dvh] flex flex-col rounded-3xl bg-gradient-to-b from-[#16213A] to-[#0A0E18] border-2 border-amber-500/40 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div>
                <h3 className="text-sm font-black text-white">🛡️ Admin Verification Tick Console</h3>
                <p className="text-[10px] text-slate-400">
                  Green is active by default for all scholars. Only Admin can grant Red or Black ticks.
                </p>
              </div>
              <button
                onClick={() => setAdminModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!adminAuthorized ? (
              <div className="space-y-3">
                <input
                  type="password"
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  placeholder="Enter Admin Verification Key..."
                  className="w-full bg-black/60 border border-white/15 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                />
                {adminStatus && (
                  <p className="text-[11px] font-bold text-red-300">{adminStatus}</p>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    setAdminStatus(null);
                    try {
                      const res = await fetch('/api/admin/verify-tick', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ passcode: adminPasscode, tick: 'green' }),
                      });
                      const data = await res.json();
                      if (res.ok && data.authorized) {
                        setAdminAuthorized(true);
                        setAdminStatus('Admin Verified. Select any scholar to update tick.');
                      } else {
                        setAdminStatus(data.error || 'Invalid Admin Key.');
                      }
                    } catch {
                      setAdminStatus('Could not verify Admin Key.');
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer"
                >
                  Unlock Admin Control
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {adminStatus && (
                  <p className="text-[11px] font-bold text-emerald-300 pb-1">{adminStatus}</p>
                )}
                {directoryScholars.slice(0, 30).map((sch) => (
                  <div
                    key={sch.uid}
                    className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-white truncate">{sch.name}</span>
                        <VerificationTick tick={sch.verificationTick} size="xs" />
                      </div>
                      <span className="text-[10px] text-amber-400 font-bold">@{sch.username}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {(['green', 'red', 'black'] as const).map((tk) => (
                        <button
                          key={tk}
                          disabled={adminBusyUid === sch.uid}
                          onClick={async () => {
                            setAdminBusyUid(sch.uid);
                            setAdminStatus(null);
                            try {
                              const checkRes = await fetch('/api/admin/verify-tick', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  passcode: adminPasscode,
                                  targetUid: sch.uid,
                                  tick: tk,
                                }),
                              });
                              if (!checkRes.ok) {
                                setAdminStatus('Admin verification expired.');
                                return;
                              }
                              const saved = await updateUserVerificationTickInCloud(sch.uid, tk);
                              if (saved) {
                                setDirectoryScholars((prev) =>
                                  prev.map((item) =>
                                    item.uid === sch.uid ? { ...item, verificationTick: tk } : item
                                  )
                                );
                                if (profile && profile.uid === sch.uid) {
                                  setProfile({ ...profile, verificationTick: tk });
                                }
                                setAdminStatus(`Updated ${sch.name} to ${tk.toUpperCase()} tick.`);
                              } else {
                                setAdminStatus('Firestore permission blocked or network error.');
                              }
                            } finally {
                              setAdminBusyUid(null);
                            }
                          }}
                          className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border cursor-pointer ${
                            (sch.verificationTick || 'green') === tk
                              ? 'border-amber-400 bg-amber-500/20 text-white'
                              : 'border-white/10 bg-black/40 text-slate-400 hover:text-white'
                          }`}
                        >
                          {tk}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-white">Loading Scholar Profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
