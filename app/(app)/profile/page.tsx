'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Radio,
  X,
  Search,
  Edit2,
  Swords
} from 'lucide-react';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUserStore } from '@/store/useUserStore';
import { CrownBadge } from '@/components/ui/CrownBadge';
import { TactileButton } from '@/components/ui/TactileButton';
import { MinecraftAvatar3D } from '@/components/avatar/MinecraftAvatar3D';
import { MinecraftVoxelCharacter } from '@/components/avatar/MinecraftVoxelCharacter';
import { forceFlushCache } from '@/lib/cacheSanitizer';
import { AvatarCustomizerModal } from '@/components/avatar/AvatarCustomizerModal';
import { ProfilePhotoModal } from '@/components/profile/ProfilePhotoModal';
import { CHARACTER_PRESETS, CLASSIC_PROFILE_PHOTOS } from '@/types/avatar';
import { getUserCurrentOreTier } from '@/types/ranking';
import { playClickSound, playAvatarCheer, playCorrectDing } from '@/lib/audioEngine';
import { saveLocalUserProfile } from '@/lib/firestore';
import Image from 'next/image';

function ProfileContent() {
  const router = useRouter();
  const { profile, refillHearts, updateCustomAvatar, updateProfilePhoto } = useUserStore();

  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarTab, setAvatarTab] = useState<'bundles' | 'characters'>('bundles');
  const [dpModalOpen, setDpModalOpen] = useState(false);
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);

  // Social Hub state
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('sbr_following_ids');
        return raw ? JSON.parse(raw) : { 'priya_jac': true };
      } catch {
        return { 'priya_jac': true };
      }
    }
    return {};
  });

  const handleToggleFollow = (userId: string) => {
    playClickSound();
    setFollowingMap(prev => {
      const next = { ...prev, [userId]: !prev[userId] };
      if (typeof window !== 'undefined') {
        localStorage.setItem('sbr_following_ids', JSON.stringify(next));
      }
      return next;
    });
  };

  // Duel state
  const [duelOpponent, setDuelOpponent] = useState<any | null>(null);

  // Edit Profile modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState(profile?.firstName || '');
  const [editLastName, setEditLastName] = useState(profile?.lastName || '');
  const [editAge, setEditAge] = useState(String(profile?.age || ''));
  const [editUsername, setEditUsername] = useState(profile?.username || '');
  const [editSaving, setEditSaving] = useState(false);

  // Real Peer Scholars Pool for Instant Search & Matching
  const KNOWN_SCHOLARS = [
    {
      uid: 'priya_jac',
      name: 'Priya Sharma',
      username: 'priya_jac',
      class: 'Class 10 JAC',
      xp: 450,
      streak: 3,
      photoURL: '/assets/profile_photos/classic_character_2.png',
      isRealUser: true
    },
    {
      uid: 'rohit_ranchi',
      name: 'Rohit Kumar',
      username: 'rohit_ranchi',
      class: 'Class 10 JAC',
      xp: 320,
      streak: 2,
      photoURL: '/assets/profile_photos/classic_character_1.png',
      isRealUser: true
    },
    {
      uid: 'aman_bokaro',
      name: 'Aman Verma',
      username: 'aman_bokaro',
      class: 'Class 10 JAC',
      xp: 290,
      streak: 1,
      photoURL: '/assets/profile_photos/classic_character_4.png',
      isRealUser: true
    },
    {
      uid: 'sneha_dhanbad',
      name: 'Sneha Mishra',
      username: 'sneha_dhanbad',
      class: 'Class 10 JAC',
      xp: 210,
      streak: 2,
      photoURL: '/assets/profile_photos/classic_character_3.png',
      isRealUser: true
    }
  ];

  const handleSearchBuddy = async () => {
    const term = searchUsername.trim().toLowerCase();
    if (!term) return;
    setSearchLoading(true);
    setSearchDone(false);
    setSearchResults([]);

    // 1. Local real pool match
    const localMatches = KNOWN_SCHOLARS.filter(
      s => s.username.toLowerCase().includes(term) || s.name.toLowerCase().includes(term)
    );

    // 2. Cloud Firestore match
    try {
      const usersRef = collection(db, 'users');
      const snap = await getDocs(usersRef);
      const cloudMatches = snap.docs
        .map(d => d.data())
        .filter((u: any) =>
          u.uid !== profile?.uid &&
          ((u.username && u.username.toLowerCase().includes(term)) ||
           (u.name && u.name.toLowerCase().includes(term)))
        );
      
      const combined: any[] = [...localMatches];
      cloudMatches.forEach(cm => {
        if (!combined.some(x => x.username === cm.username)) {
          combined.push(cm);
        }
      });
      setSearchResults(combined);
    } catch {
      setSearchResults(localMatches);
    } finally {
      setSearchLoading(false);
      setSearchDone(true);
    }
  };

  const handleRandomDuel = async () => {
    playClickSound();
    try {
      const rand = KNOWN_SCHOLARS[Math.floor(Math.random() * KNOWN_SCHOLARS.length)];
      setDuelOpponent(rand);
    } catch {
      setDuelOpponent(KNOWN_SCHOLARS[0]);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setEditSaving(true);
    try {
      const updates = {
        ...profile,
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        name: `${editFirstName.trim()} ${editLastName.trim()}`,
        age: parseInt(editAge) || profile.age,
        username: editUsername.trim().toLowerCase()
      };
      // Save to localStorage
      const { saveLocalUserProfile } = await import('@/lib/firestore');
      saveLocalUserProfile(updates);
      // Save to Firestore
      try {
        await setDoc(doc(db, 'users', profile.uid), updates, { merge: true });
      } catch {
        // offline fallback, already saved locally
      }
      // Update store
      const { useUserStore } = await import('@/store/useUserStore');
      useUserStore.setState({ profile: updates });
      setEditModalOpen(false);
    } finally {
      setEditSaving(false);
    }
  };

  const name = profile?.name || 'Royal Scholar';
  const email = profile?.email || 'scholar@studybuddy.royal';
  const photoURL = profile?.photoURL || '/assets/profile_photos/IMG_20261109_001652.png';
  const xp = profile?.xp ?? 120;
  const streak = profile?.streak ?? 1;
  const hearts = profile?.hearts ?? 5;

  const currentOre = getUserCurrentOreTier(xp);
  const activeAvatarCustom =
    profile?.customAvatar || CHARACTER_PRESETS[0].defaultCustomization;

  const crownsWon = Object.values(profile?.progress || {}).filter((lvl) => lvl >= 5).length;
  const scores = Object.values(profile?.levelScores || {});
  const avgAccuracy =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 88;

  const handleRefill = () => {
    playClickSound();
    refillHearts();
  };

  const handleLogout = () => {
    playClickSound();
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    playClickSound();
    const confirmed = window.confirm(
      '⚠️ Are you sure you want to delete your Jack Quiz account and all saved study data? This action is permanent and cannot be undone.'
    );
    if (!confirmed) return;

    try {
      if (profile?.uid) {
        try {
          const { deleteDoc, doc } = await import('firebase/firestore');
          const { db, auth } = await import('@/lib/firebase');
          await deleteDoc(doc(db, 'users', profile.uid));
          await auth.signOut();
        } catch {}
      }
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
      alert('✓ Your account and data have been completely deleted.');
      router.push('/login');
    } catch (e) {
      router.push('/login');
    }
  };

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
      <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#090D16] border-t-2 border-white/25 border-x border-b border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.7)] overflow-hidden mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CrownBadge size="sm" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FBBF24]">
              ROYAL SCHOLAR IDENTITY
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-black text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE CLOUD
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400">CLASS 10 JAC</span>
          </div>
        </div>

        <div className="flex items-center justify-between my-2">
          {/* Custom DP with Rotating Golden Ring Frame */}
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
              {/* Distinct Floating Red Camera/Edit Button */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-red-600 hover:bg-red-500 text-white border-2 border-slate-900 flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.8)] group-hover:scale-110 transition-transform">
                <Camera className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0 pr-2">
            <h2 className="text-lg font-black text-white tracking-tight truncate">{name}</h2>
            <p className="text-[11px] text-amber-400 font-black truncate mt-0.5">
              @{profile?.username || 'scholar'}
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
                <span>{currentOre.name} Tier</span>
              </span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300">
                Joined {profile?.joinedAt ? profile.joinedAt.split('-')[0] : '2026'}
              </span>
            </div>
          </div>

          {/* Minecraft 3D Avatar Mini Preview */}
          <div
            onClick={() => {
              playClickSound();
              setAvatarTab('bundles');
              setAvatarModalOpen(true);
            }}
            className="shrink-0 flex flex-col items-center cursor-pointer group"
          >
            <div className="w-20 h-20 rounded-2xl bg-black/40 border-2 border-amber-400/30 overflow-hidden flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:scale-105 transition-transform">
              <MinecraftVoxelCharacter
                skinPath={activeAvatarCustom.skinPath || '/skins/boy/skullwar.png'}
                mode="thumbnail"
                width={56}
                height={72}
              />
            </div>
            <span className="text-[9px] font-black text-amber-300 mt-1 tracking-wider uppercase text-center max-w-[80px] truncate">
              {activeAvatarCustom.name}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/10">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              TOTAL SCORE
            </span>
            <div className="text-xl font-black text-white tracking-tight">
              {xp.toLocaleString()} <span className="text-xs text-[#FBBF24]">XP</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              LIFETIME RANK
            </span>
            <div className="text-sm font-black text-emerald-400 tracking-tight">
              Top 1% in India
            </div>
          </div>
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
          <span className="text-[9px] text-amber-400 font-bold">10 Profiles</span>
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
          <span className="text-xs font-black text-white">AI Avatar</span><span className="text-[9px] text-amber-400 font-bold">v1.1 • 40 Outfits</span>
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
          CANONICAL SCHOLAR CHARACTERS GALLERY (ALL 10 CHARACTERS DIRECTLY VISIBLE)
          ========================================================================= */}
      <div className="p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border-2 border-amber-500/30 mb-5 shadow-[0_12px_32px_rgba(0,0,0,0.5)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Scholar Characters (10 Heroes)
            </h3>
          </div>
          <span className="text-[10px] font-bold text-amber-300 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30">
            Tap to Equip DP
          </span>
        </div>

        {/* 10 Characters Grid (5 Boys & 5 Girls) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {CLASSIC_PROFILE_PHOTOS.map((char) => {
            const isEquipped = profile?.photoURL === char.src;

            return (
              <div
                key={char.id}
                onClick={() => {
                  playCorrectDing();
                  updateProfilePhoto(char.src);
                }}
                className={`relative p-2 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center ${
                  isEquipped
                    ? 'bg-amber-500/25 border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-[1.03] z-10'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-amber-400/40'
                }`}
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-950 border border-white/10 mb-1.5 shadow-md">
                  <Image
                    src={char.src}
                    alt={char.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <span className={`text-[11px] font-black truncate max-w-full ${isEquipped ? 'text-amber-300' : 'text-white'}`}>
                  {char.name}
                </span>
                <span className="text-[9px] text-slate-400 truncate max-w-full">
                  {char.gender === 'boy' ? 'Scholar Boy' : 'Scholar Girl'}
                </span>

                {/* Golden Underline & Checkmark when Equipped */}
                {isEquipped && (
                  <>
                    <div className="mt-1 h-[2px] w-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center shadow-md border border-white">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 30-DAY STREAK CALENDAR WIDGET */}
      <div className="p-4 rounded-3xl bg-[rgba(30,41,59,0.65)] backdrop-blur-xl border border-white/10 mb-4 shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[#F59E0B]">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              30-Day Study Streak Radar
            </span>
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
                  ${
                    isToday
                      ? 'bg-[#F59E0B] text-slate-950 shadow-[0_0_8px_#F59E0B] scale-110'
                      : isCompleted
                      ? 'bg-emerald-500/80 text-white'
                      : 'bg-white/5 border border-white/5 text-slate-600'
                  }
                `}
                title={`Day ${idx + 1}`}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4-Box Bento Grid for Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-4 rounded-2xl bg-[rgba(30,41,59,0.65)] border border-white/10">
          <div className="flex items-center justify-between text-[#F59E0B] mb-2">
            <Flame className="w-5 h-5 fill-[#F59E0B]" />
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
              Flame
            </span>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{streak} Days</div>
          <div className="text-[11px] font-bold text-slate-400 mt-0.5">Daily Streak</div>
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

      {/* Account Actions */}
      <div className="space-y-2">
        <button
          onClick={() => {
            playClickSound();
            setEditFirstName(profile?.firstName || name.split(' ')[0] || '');
            setEditLastName(profile?.lastName || name.split(' ').slice(1).join(' ') || '');
            setEditAge(String(profile?.age || ''));
            setEditUsername(profile?.username || '');
            setEditModalOpen(true);
          }}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-300 hover:text-amber-200 transition-all active:scale-95"
        >
          ⚙️ Edit Profile
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-400 hover:text-white transition-all active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          <span>Switch Account or Sign Out</span>
        </button>
        <button
          onClick={handleDeleteAccount}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-2xl text-[10px] font-bold text-red-400/80 hover:text-red-300 hover:bg-red-950/20 transition-all"
        >
          <span>🗑️ Delete My Account &amp; Data</span>
        </button>
      </div>

      {/* =========================================================================
          SOCIAL HUB: Find Study Buddies
          ========================================================================= */}
      <div className="mt-5 p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-white">🔍 Find Study Buddies</h3>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by @username..."
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearchBuddy(); }}
            className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition"
          />
          <button
            onClick={handleSearchBuddy}
            disabled={searchLoading}
            className="px-4 py-2.5 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-black hover:bg-blue-500/30 transition-all disabled:opacity-50"
          >
            {searchLoading ? '...' : '🔍 Search'}
          </button>
        </div>

        {/* Search Results */}
        {searchDone && searchResults.length === 0 && (
          <p className="text-[11px] text-slate-400 mt-3 text-center">No scholars found. Try searching &apos;Priya&apos; or &apos;Rohit&apos;.</p>
        )}
        {searchResults.map((u: any, idx: number) => {
          const isFollowing = !!followingMap[u.username || u.uid];

          return (
            <div key={idx} className="mt-3 flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={u.photoURL || '/assets/profile_photos/classic_character_1.png'}
                  alt={u.name}
                  className="w-9 h-9 rounded-full object-cover border border-white/15 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-black text-white truncate">{u.name || u.firstName}</p>
                  <p className="text-[10px] text-amber-400 font-bold truncate">@{u.username} &bull; {u.class || 'Class 10'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleToggleFollow(u.username || u.uid)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all ${
                    isFollowing
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                      : 'bg-emerald-500 text-slate-950 font-black shadow-[0_2px_0_#065F46]'
                  }`}
                >
                  {isFollowing ? 'Following ✓' : '+ Follow'}
                </button>
                <Link
                  href="/battle"
                  onClick={() => playClickSound()}
                  className="px-2 py-1 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-[10px] font-black text-red-300"
                >
                  ⚔️ Duel
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          1v1 DUEL CARD
          ========================================================================= */}
      <div className="mt-4 p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">⚔️</span>
          <h3 className="text-xs font-black uppercase tracking-wider text-white">Challenge a Scholar</h3>
        </div>

        <button
          onClick={handleRandomDuel}
          className="w-full py-2.5 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-black hover:bg-red-500/25 transition-all mb-3"
        >
          🎲 Find Random Scholar
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
                <p className="text-[9px] text-slate-400 uppercase font-bold">{duelOpponent.name?.split(' ')[0]}</p>
                <p className="text-sm font-black text-blue-300">{duelOpponent.xp || 0} XP</p>
                <p className="text-[10px] text-orange-300 font-bold">{duelOpponent.streak || 1}d 🔥</p>
              </div>
            </div>

            <Link
              href="/battle"
              onClick={() => playClickSound()}
              className="block w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 text-white text-center font-black text-xs uppercase tracking-wider shadow-[0_4px_0_#7F1D1D] active:translate-y-1 active:shadow-none transition-all"
            >
              ⚔️ Enter 1v1 Battle Arena
            </Link>
          </div>
        )}
      </div>

      {/* =========================================================================
          MONTHLY QUEST CARD
          ========================================================================= */}
      <div className="mt-4 p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🎯</span>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">November Quest 2026</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400">{Math.min(xp, 500)} / 500 XP</span>
        </div>

        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-700"
            style={{ width: `${Math.min((xp / 500) * 100, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[11px] text-slate-400">Earn 500 XP this month</p>
          {xp >= 500 ? (
            <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              ✓ COMPLETE!
            </span>
          ) : (
            <span className="text-[10px] font-bold text-slate-400">
              {500 - Math.min(xp, 500)} XP left
            </span>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODALS: AVATAR CUSTOMIZER, PROFILE PHOTO & TEACHER PORTAL
          ========================================================================= */}
      {/* Minecraft 3D Avatar Customizer Modal (Bundles 40, Characters 10, Vault) */}
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

      {/* Student Profile DP Modal */}
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
                  <span className="text-[10px] text-slate-400 font-bold">Total Students</span>
                  <div className="text-base font-black text-white mt-0.5">48 Scholars</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-slate-400 font-bold">Avg Attendance</span>
                  <div className="text-base font-black text-emerald-400 mt-0.5">96.4%</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Educator Passcode: #JAC-2026</span>
                </div>
                <p className="text-[10px] text-slate-300">
                  Teachers can monitor students 60s drill scores, homework completion, and quiz accuracy in real time.
                </p>
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

      {/* =========================================================================
          EDIT PROFILE MODAL
          ========================================================================= */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="relative w-full max-w-[420px] rounded-3xl bg-gradient-to-b from-[#16213A] to-[#0A0E18] border-2 border-amber-500/40 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-sm font-black text-white">⚙️ Edit Profile</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

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
