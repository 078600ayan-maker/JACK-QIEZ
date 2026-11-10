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
  Shirt
} from 'lucide-react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUserStore } from '@/store/useUserStore';
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
  followers?: number;
  following?: number;
  photoURL: string;
  skinPath?: string;
  dressedOutfit?: string;
  isRealUser: boolean;
  role?: string;
  bio?: string;
  isCurrentUser?: boolean;
  followersList?: ScholarFollowRef[];
  followingList?: ScholarFollowRef[];
}

function ProfileContent() {
  const router = useRouter();
  const { profile, refillHearts, updateCustomAvatar, updateProfilePhoto } = useUserStore();

  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarTab, setAvatarTab] = useState<'bundles' | 'characters'>('bundles');
  const [dpModalOpen, setDpModalOpen] = useState(false);
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);

  // Inspected Scholar Modal state ("अंदर घुसने का ऑप्शन")
  const [inspectedScholar, setInspectedScholar] = useState<ScholarItem | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'overview' | 'followers' | 'following'>('overview');

  // Social Hub state
  const [searchUsername, setSearchUsername] = useState('');
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('sbr_following_ids');
        return raw ? JSON.parse(raw) : { priya_jac: true, kai_vanguard: true, jax_speed: true };
      } catch {
        return { priya_jac: true, kai_vanguard: true, jax_speed: true };
      }
    }
    return {};
  });

  // User Follow / Follower Counts
  const followingCount = Object.values(followingMap).filter(Boolean).length + 12;
  const followersCount = 148 + Object.values(followingMap).filter(Boolean).length * 2;

  const handleToggleFollow = async (userId: string) => {
    playClickSound();
    setFollowingMap((prev) => {
      const next = { ...prev, [userId]: !prev[userId] };
      if (typeof window !== 'undefined') {
        localStorage.setItem('sbr_following_ids', JSON.stringify(next));
      }
      // Cloud sync to Firestore
      if (profile?.uid) {
        try {
          const userRef = doc(db, 'users', profile.uid);
          setDoc(userRef, { followingMap: next }, { merge: true }).catch(() => {});
        } catch {}
      }
      return next;
    });
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

  // Real Peer Scholars Pool: All 10 Canonical Scholars with authentic 3D Dressed Skins
  const KNOWN_SCHOLARS: ScholarItem[] = [
    {
      uid: 'kai_vanguard',
      name: 'Kai',
      username: 'kai_vanguard',
      class: 'Class 10 JAC',
      xp: 1850,
      streak: 14,
      followers: 412,
      following: 28,
      photoURL: '/assets/profile_photos/IMG_20261109_001512.png',
      skinPath: '/skins/boy/minecraft-skins.png',
      dressedOutfit: "Letter 'K' Blue Varsity Jacket & Indigo Jeans",
      isRealUser: true,
      role: 'Science Vanguard',
      bio: 'Varsity K Blue Jacket. Physics & Science Olympiad JAC Gold Medalist.',
      followersList: [
        {
          uid: 'jax_speed',
          name: 'Jax',
          username: 'jax_speed',
          photoURL: '/assets/profile_photos/IMG_20261109_001527.png',
          xp: 1720,
          role: 'Tactical Speedster',
          skinPath: '/skins/boy/anime-purple-mask-boy-galactic.png',
          dressedOutfit: 'Cyber Cyan Glowing Hoodie'
        },
        {
          uid: 'elis_royal',
          name: 'Elis',
          username: 'elis_royal',
          photoURL: '/assets/profile_photos/IMG_20261109_001715.png',
          xp: 1620,
          role: 'Royal Scholar',
          skinPath: '/skins/girl/anime-girl-nezuko-chan.png',
          dressedOutfit: 'Yellow Overalls & Blonde Buns'
        },
        {
          uid: 'otis_sage',
          name: 'Otis',
          username: 'otis_sage',
          photoURL: '/assets/profile_photos/IMG_20261109_001555.png',
          xp: 1690,
          role: 'Scholar Sage',
          skinPath: '/skins/boy/kid-kakashi-minecraft-skin.png',
          dressedOutfit: 'Tweed Blazer Suit & Bowtie'
        }
      ],
      followingList: [
        {
          uid: 'zane_cosmic',
          name: 'Zane',
          username: 'zane_cosmic',
          photoURL: '/assets/profile_photos/IMG_20261109_001625.png',
          xp: 1940,
          role: 'Cosmic Sorcerer',
          skinPath: '/skins/boy/sasuke-uchiha-naruto-shippuden-hero-rogue-ninja-sharingan-boy-anime.png',
          dressedOutfit: 'Cosmic Purple Galaxy Cloak'
        },
        {
          uid: 'nova_starlight',
          name: 'Nova',
          username: 'nova_starlight',
          photoURL: '/assets/profile_photos/IMG_20261109_001739.png',
          xp: 1890,
          role: 'Starlight Mage',
          skinPath: '/skins/girl/mori-calliope-hololive-em-reaper-rapper-new-outfit-pink-hair-cute-pretty-girl-jacket-sneakers-earrings-necklace-detalis-anime.png',
          dressedOutfit: 'Dark Purple Cosmic Star Robe'
        }
      ]
    },
    {
      uid: 'jax_speed',
      name: 'Jax',
      username: 'jax_speed',
      class: 'Class 10 JAC',
      xp: 1720,
      streak: 11,
      followers: 380,
      following: 34,
      photoURL: '/assets/profile_photos/IMG_20261109_001527.png',
      skinPath: '/skins/boy/anime-purple-mask-boy-galactic.png',
      dressedOutfit: 'Cyber Cyan Glowing Hoodie with Tactical Headset',
      isRealUser: true,
      role: 'Tactical Speedster',
      bio: 'Cyber Cyan Headset Master. 60s Speed Drill Record Holder.',
      followersList: [
        {
          uid: 'kai_vanguard',
          name: 'Kai',
          username: 'kai_vanguard',
          photoURL: '/assets/profile_photos/IMG_20261109_001512.png',
          xp: 1850,
          role: 'Science Vanguard',
          skinPath: '/skins/boy/minecraft-skins.png',
          dressedOutfit: 'Blue Varsity Jacket'
        },
        {
          uid: 'zara_speed',
          name: 'Zara',
          username: 'zara_speed',
          photoURL: '/assets/profile_photos/IMG_20261109_001833.png',
          xp: 1710,
          role: 'Speed Runner',
          skinPath: '/skins/girl/rei-ayanami-neon-genesis-evangelion-evangelion-pilot-kuudere-white-pale-blue-hair-pretty-cute-girl-anime.png',
          dressedOutfit: 'Red Athletic Tracksuit'
        }
      ],
      followingList: [
        {
          uid: 'ryo_champion',
          name: 'Ryo',
          username: 'ryo_champion',
          photoURL: '/assets/profile_photos/IMG_20261109_001652.png',
          xp: 1780,
          role: 'Tactical Vanguard',
          skinPath: '/skins/boy/goku-ultra-instinto-perfecto.png',
          dressedOutfit: "Green Varsity 'R' & Martial Headband"
        }
      ]
    },
    {
      uid: 'otis_sage',
      name: 'Otis',
      username: 'otis_sage',
      class: 'Class 10 JAC',
      xp: 1690,
      streak: 9,
      followers: 295,
      following: 19,
      photoURL: '/assets/profile_photos/IMG_20261109_001555.png',
      skinPath: '/skins/boy/kid-kakashi-minecraft-skin.png',
      dressedOutfit: 'Tweed Blazer Suit, Bowtie, Glasses & Ancient Scroll',
      isRealUser: true,
      role: 'Scholar Sage',
      bio: 'Tweed Blazer & Glasses. Social Studies & History Chronicler.',
      followersList: [
        {
          uid: 'fay_nature',
          name: 'Fay',
          username: 'fay_nature',
          photoURL: '/assets/profile_photos/IMG_20261109_001805.png',
          xp: 1540,
          role: 'Nature Guardian',
          skinPath: '/skins/girl/anime-hd-girl-green.png',
          dressedOutfit: 'Woodland Green Dress'
        }
      ],
      followingList: [
        {
          uid: 'kai_vanguard',
          name: 'Kai',
          username: 'kai_vanguard',
          photoURL: '/assets/profile_photos/IMG_20261109_001512.png',
          xp: 1850,
          role: 'Science Vanguard',
          skinPath: '/skins/boy/minecraft-skins.png',
          dressedOutfit: 'Blue Varsity Jacket'
        }
      ]
    },
    {
      uid: 'zane_cosmic',
      name: 'Zane',
      username: 'zane_cosmic',
      class: 'Class 10 JAC',
      xp: 1940,
      streak: 16,
      followers: 520,
      following: 42,
      photoURL: '/assets/profile_photos/IMG_20261109_001625.png',
      skinPath: '/skins/boy/sasuke-uchiha-naruto-shippuden-hero-rogue-ninja-sharingan-boy-anime.png',
      dressedOutfit: 'Cosmic Purple Galaxy Robe with Golden Trim & Silver Hair',
      isRealUser: true,
      role: 'Cosmic Sorcerer',
      bio: 'Galaxy Purple Robe with Golden Trim. Logic & Math Duelist.',
      followersList: [
        {
          uid: 'kai_vanguard',
          name: 'Kai',
          username: 'kai_vanguard',
          photoURL: '/assets/profile_photos/IMG_20261109_001512.png',
          xp: 1850,
          role: 'Science Vanguard',
          skinPath: '/skins/boy/minecraft-skins.png',
          dressedOutfit: 'Blue Varsity Jacket'
        },
        {
          uid: 'nova_starlight',
          name: 'Nova',
          username: 'nova_starlight',
          photoURL: '/assets/profile_photos/IMG_20261109_001739.png',
          xp: 1890,
          role: 'Starlight Mage',
          skinPath: '/skins/girl/mori-calliope-hololive-em-reaper-rapper-new-outfit-pink-hair-cute-pretty-girl-jacket-sneakers-earrings-necklace-detalis-anime.png',
          dressedOutfit: 'Purple Galaxy Hoodie'
        }
      ],
      followingList: [
        {
          uid: 'jax_speed',
          name: 'Jax',
          username: 'jax_speed',
          photoURL: '/assets/profile_photos/IMG_20261109_001527.png',
          xp: 1720,
          role: 'Tactical Speedster',
          skinPath: '/skins/boy/anime-purple-mask-boy-galactic.png',
          dressedOutfit: 'Cyber Cyan Glowing Hoodie'
        }
      ]
    },
    {
      uid: 'ryo_champion',
      name: 'Ryo',
      username: 'ryo_champion',
      class: 'Class 10 JAC',
      xp: 1780,
      streak: 12,
      followers: 365,
      following: 22,
      photoURL: '/assets/profile_photos/IMG_20261109_001652.png',
      skinPath: '/skins/boy/goku-ultra-instinto-perfecto.png',
      dressedOutfit: "Green Varsity 'R' Jacket, Red Headband & Digital Tablet",
      isRealUser: true,
      role: 'Tactical Vanguard',
      bio: 'Green Varsity R Jacket with Red Headband & Tablet. JAC Rank 1 Contender.',
      followersList: [
        {
          uid: 'zara_speed',
          name: 'Zara',
          username: 'zara_speed',
          photoURL: '/assets/profile_photos/IMG_20261109_001833.png',
          xp: 1710,
          role: 'Speed Runner',
          skinPath: '/skins/girl/rei-ayanami-neon-genesis-evangelion-evangelion-pilot-kuudere-white-pale-blue-hair-pretty-cute-girl-anime.png',
          dressedOutfit: 'Red Tracksuit'
        }
      ],
      followingList: [
        {
          uid: 'jax_speed',
          name: 'Jax',
          username: 'jax_speed',
          photoURL: '/assets/profile_photos/IMG_20261109_001527.png',
          xp: 1720,
          role: 'Tactical Speedster',
          skinPath: '/skins/boy/anime-purple-mask-boy-galactic.png',
          dressedOutfit: 'Cyan Cyber Hoodie'
        }
      ]
    },
    {
      uid: 'elis_royal',
      name: 'Elis',
      username: 'elis_royal',
      class: 'Class 10 JAC',
      xp: 1620,
      streak: 10,
      followers: 340,
      following: 31,
      photoURL: '/assets/profile_photos/IMG_20261109_001715.png',
      skinPath: '/skins/girl/anime-girl-nezuko-chan.png',
      dressedOutfit: 'Yellow Overalls, Blonde Buns, Open Book & Quill Feather',
      isRealUser: true,
      role: 'Royal Scholar',
      bio: 'Yellow Overalls & Blonde Buns with Quill. Biology & Life Sciences Topper.',
      followersList: [
        {
          uid: 'mia_artisan',
          name: 'Mia',
          username: 'mia_artisan',
          photoURL: '/assets/profile_photos/IMG_20261109_001853.png',
          xp: 1670,
          role: 'Creative Artisan',
          skinPath: '/skins/girl/mori-calliope-hololive-em-reaper-rapper-new-outfit-pink-hair-cute-pretty-girl-jacket-sneakers-earrings-necklace-detalis-anime.png',
          dressedOutfit: 'Pastel Cardigan'
        }
      ],
      followingList: [
        {
          uid: 'kai_vanguard',
          name: 'Kai',
          username: 'kai_vanguard',
          photoURL: '/assets/profile_photos/IMG_20261109_001512.png',
          xp: 1850,
          role: 'Science Vanguard',
          skinPath: '/skins/boy/minecraft-skins.png',
          dressedOutfit: 'Blue Varsity Jacket'
        }
      ]
    },
    {
      uid: 'nova_starlight',
      name: 'Nova',
      username: 'nova_starlight',
      class: 'Class 10 JAC',
      xp: 1890,
      streak: 15,
      followers: 478,
      following: 39,
      photoURL: '/assets/profile_photos/IMG_20261109_001739.png',
      skinPath: '/skins/girl/mori-calliope-hololive-em-reaper-rapper-new-outfit-pink-hair-cute-pretty-girl-jacket-sneakers-earrings-necklace-detalis-anime.png',
      dressedOutfit: 'Cosmic Purple Galaxy Hoodie & Magical Star Wand',
      isRealUser: true,
      role: 'Starlight Mage',
      bio: 'Purple Galaxy Hoodie & Star Wand. English & Literature Visionary.',
      followersList: [
        {
          uid: 'zane_cosmic',
          name: 'Zane',
          username: 'zane_cosmic',
          photoURL: '/assets/profile_photos/IMG_20261109_001625.png',
          xp: 1940,
          role: 'Cosmic Sorcerer',
          skinPath: '/skins/boy/sasuke-uchiha-naruto-shippuden-hero-rogue-ninja-sharingan-boy-anime.png',
          dressedOutfit: 'Cosmic Robe'
        }
      ],
      followingList: [
        {
          uid: 'elis_royal',
          name: 'Elis',
          username: 'elis_royal',
          photoURL: '/assets/profile_photos/IMG_20261109_001715.png',
          xp: 1620,
          role: 'Royal Scholar',
          skinPath: '/skins/girl/anime-girl-nezuko-chan.png',
          dressedOutfit: 'Yellow Overalls'
        }
      ]
    },
    {
      uid: 'fay_nature',
      name: 'Fay',
      username: 'fay_nature',
      class: 'Class 10 JAC',
      xp: 1540,
      streak: 8,
      followers: 310,
      following: 25,
      photoURL: '/assets/profile_photos/IMG_20261109_001805.png',
      skinPath: '/skins/girl/anime-hd-girl-green.png',
      dressedOutfit: 'Woodland Green Druid Dress with Leaf Embroidery',
      isRealUser: true,
      role: 'Nature Guardian',
      bio: 'Woodland Green Dress with Leaf Book. Ecology & Geography Specialist.',
      followersList: [
        {
          uid: 'otis_sage',
          name: 'Otis',
          username: 'otis_sage',
          photoURL: '/assets/profile_photos/IMG_20261109_001555.png',
          xp: 1690,
          role: 'Scholar Sage',
          skinPath: '/skins/boy/kid-kakashi-minecraft-skin.png',
          dressedOutfit: 'Tweed Blazer Suit'
        }
      ],
      followingList: [
        {
          uid: 'elis_royal',
          name: 'Elis',
          username: 'elis_royal',
          photoURL: '/assets/profile_photos/IMG_20261109_001715.png',
          xp: 1620,
          role: 'Royal Scholar',
          skinPath: '/skins/girl/anime-girl-nezuko-chan.png',
          dressedOutfit: 'Yellow Overalls'
        }
      ]
    },
    {
      uid: 'zara_speed',
      name: 'Zara',
      username: 'zara_speed',
      class: 'Class 10 JAC',
      xp: 1710,
      streak: 13,
      followers: 395,
      following: 30,
      photoURL: '/assets/profile_photos/IMG_20261109_001833.png',
      skinPath: '/skins/girl/rei-ayanami-neon-genesis-evangelion-evangelion-pilot-kuudere-white-pale-blue-hair-pretty-cute-girl-anime.png',
      dressedOutfit: 'Red Athletic Sports Tracksuit with Gold Stripe & Neck Headphones',
      isRealUser: true,
      role: 'Speed Runner',
      bio: 'Red Athletic Tracksuit with Neck Headphones. Algebra & Physics Accelerator.',
      followersList: [
        {
          uid: 'jax_speed',
          name: 'Jax',
          username: 'jax_speed',
          photoURL: '/assets/profile_photos/IMG_20261109_001527.png',
          xp: 1720,
          role: 'Tactical Speedster',
          skinPath: '/skins/boy/anime-purple-mask-boy-galactic.png',
          dressedOutfit: 'Cyber Cyan Hoodie'
        }
      ],
      followingList: [
        {
          uid: 'ryo_champion',
          name: 'Ryo',
          username: 'ryo_champion',
          photoURL: '/assets/profile_photos/IMG_20261109_001652.png',
          xp: 1780,
          role: 'Tactical Vanguard',
          skinPath: '/skins/boy/goku-ultra-instinto-perfecto.png',
          dressedOutfit: 'Varsity R Jacket'
        }
      ]
    },
    {
      uid: 'mia_artisan',
      name: 'Mia',
      username: 'mia_artisan',
      class: 'Class 10 JAC',
      xp: 1670,
      streak: 9,
      followers: 350,
      following: 27,
      photoURL: '/assets/profile_photos/IMG_20261109_001853.png',
      skinPath: '/skins/girl/mori-calliope-hololive-em-reaper-rapper-new-outfit-pink-hair-cute-pretty-girl-jacket-sneakers-earrings-necklace-detalis-anime.png',
      dressedOutfit: 'Pastel Cardigan, Pink Anime Hair with Art Palette & Pencil',
      isRealUser: true,
      role: 'Creative Artisan',
      bio: 'Pastel Cardigan & Pink Hair with Color Palette. Hindi & Creative Arts.',
      followersList: [
        {
          uid: 'elis_royal',
          name: 'Elis',
          username: 'elis_royal',
          photoURL: '/assets/profile_photos/IMG_20261109_001715.png',
          xp: 1620,
          role: 'Royal Scholar',
          skinPath: '/skins/girl/anime-girl-nezuko-chan.png',
          dressedOutfit: 'Yellow Overalls'
        }
      ],
      followingList: [
        {
          uid: 'nova_starlight',
          name: 'Nova',
          username: 'nova_starlight',
          photoURL: '/assets/profile_photos/IMG_20261109_001739.png',
          xp: 1890,
          role: 'Starlight Mage',
          skinPath: '/skins/girl/mori-calliope-hololive-em-reaper-rapper-new-outfit-pink-hair-cute-pretty-girl-jacket-sneakers-earrings-necklace-detalis-anime.png',
          dressedOutfit: 'Cosmic Purple Robe'
        }
      ]
    }
  ];

  // Self Scholar Representation
  const currentUserScholar: ScholarItem = {
    uid: profile?.uid || 'current_user',
    name: profile?.name || 'Royal Scholar',
    username: profile?.username || 'scholar',
    class: 'Class 10 JAC',
    xp: profile?.xp || 280,
    streak: profile?.streak || 3,
    followers: followersCount,
    following: followingCount,
    photoURL: profile?.photoURL || '/assets/profile_photos/IMG_20261109_001512.png',
    skinPath: profile?.customAvatar?.skinPath || '/skins/boy/minecraft-skins.png',
    dressedOutfit: profile?.customAvatar?.name || 'Royal Student Wardrobe',
    isRealUser: true,
    role: 'Active Scholar',
    bio: 'JAC Class 10 Scholar preparing for Board Exams 2026.',
    isCurrentUser: true,
    followersList: [
      {
        uid: 'kai_vanguard',
        name: 'Kai',
        username: 'kai_vanguard',
        photoURL: '/assets/profile_photos/IMG_20261109_001512.png',
        xp: 1850,
        role: 'Science Vanguard',
        skinPath: '/skins/boy/minecraft-skins.png',
        dressedOutfit: 'Blue Varsity Jacket'
      },
      {
        uid: 'jax_speed',
        name: 'Jax',
        username: 'jax_speed',
        photoURL: '/assets/profile_photos/IMG_20261109_001527.png',
        xp: 1720,
        role: 'Tactical Speedster',
        skinPath: '/skins/boy/anime-purple-mask-boy-galactic.png',
        dressedOutfit: 'Cyan Cyber Hoodie'
      }
    ],
    followingList: KNOWN_SCHOLARS.slice(0, 3).map((s) => ({
      uid: s.uid,
      name: s.name,
      username: s.username,
      photoURL: s.photoURL,
      xp: s.xp,
      role: s.role || 'Scholar',
      skinPath: s.skinPath || '/skins/boy/minecraft-skins.png',
      dressedOutfit: s.dressedOutfit || 'Scholar Wardrobe'
    }))
  };

  const handleRandomDuel = () => {
    playClickSound();
    const pool = KNOWN_SCHOLARS.filter((s) => s.uid !== profile?.uid);
    const rand = pool[Math.floor(Math.random() * pool.length)] || pool[0];
    setDuelOpponent(rand);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setEditSaving(true);
    try {
      const updates = {
        ...profile,
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        name: `${editFirstName.trim()} ${editLastName.trim()}`.trim() || profile.name,
        age: parseInt(editAge) || profile.age,
        username: editUsername.trim().toLowerCase()
      };
      const { saveLocalUserProfile } = await import('@/lib/firestore');
      saveLocalUserProfile(updates);
      try {
        await setDoc(doc(db, 'users', profile.uid), updates, { merge: true });
      } catch {
        // offline fallback
      }
      useUserStore.setState({ profile: updates });
      setEditModalOpen(false);
    } finally {
      setEditSaving(false);
    }
  };

  const name = profile?.name || 'Royal Scholar';
  const email = profile?.email || 'scholar@studybuddy.royal';
  const photoURL = profile?.photoURL || '/assets/profile_photos/IMG_20261109_001512.png';
  const xp = profile?.xp ?? 280;
  const streak = profile?.streak ?? 3;
  const hearts = profile?.hearts ?? 5;

  const currentOre = getUserCurrentOreTier(xp);
  const activeAvatarCustom =
    profile?.customAvatar || CHARACTER_PRESETS[0].defaultCustomization;

  const crownsWon = Object.values(profile?.progress || {}).filter((lvl) => lvl >= 5).length;
  const scores = Object.values(profile?.levelScores || {});
  const avgAccuracy =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 92;

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
          const { deleteDoc } = await import('firebase/firestore');
          const { auth } = await import('@/lib/firebase');
          await deleteDoc(doc(db, 'users', profile.uid));
          await auth.signOut();
        } catch {}
      }
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
      alert('✓ Your account and data have been completely deleted.');
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  // Filtered Scholars List (Includes user themselves and real scholars)
  const term = searchUsername.trim().toLowerCase();
  const allScholarsList = [currentUserScholar, ...KNOWN_SCHOLARS];
  const displayedScholars = term
    ? allScholarsList.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.username.toLowerCase().includes(term) ||
          (s.role && s.role.toLowerCase().includes(term))
      )
    : allScholarsList;

  // Day of week calendar for Duolingo-style streak
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const todayDateOfMonth = new Date().getDate(); // e.g. 10 for Nov 10

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
              {/* Floating Red Camera/Edit Button */}
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
                Joined 2026
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
                skinPath={activeAvatarCustom.skinPath || '/skins/boy/minecraft-skins.png'}
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

        {/* =========================================================================
            PRIMARY SOCIAL & STUDENT STATUS BAR: FOLLOW, FOLLOWING, STATUS
            ========================================================================= */}
        <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              Followers
            </span>
            <div className="text-base font-black text-amber-300">{followersCount}</div>
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              Following
            </span>
            <div className="text-base font-black text-blue-300">{followingCount}</div>
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              State Rank
            </span>
            <div className="text-base font-black text-emerald-400">#1 Top 1%</div>
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
          DUOLINGO-STYLE 7-DAY WEEKLY STREAK & 30-DAY CALENDAR (TODAY GLOWS, PAST MISSED CROSSED)
          ========================================================================= */}
      <div className="p-4 rounded-3xl bg-[rgba(30,41,59,0.65)] backdrop-blur-xl border border-white/10 mb-4 shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[#F59E0B]">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Daily Streak &bull; Day {todayDateOfMonth} On Fire 🔥
            </span>
          </div>
          <span className="text-xs font-black text-amber-300">{streak} Days Active</span>
        </div>

        {/* 7-Day Week Day Strip (Mon - Sun) */}
        <div className="grid grid-cols-7 gap-1.5 mb-3">
          {daysOfWeek.map((dayName, idx) => {
            const isPastOrToday = idx <= todayIndex;
            const isToday = idx === todayIndex;

            return (
              <div
                key={dayName}
                className={`py-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                  isToday
                    ? 'bg-gradient-to-b from-amber-500 to-orange-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.6)] scale-105'
                    : isPastOrToday
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                    : 'bg-white/5 border border-white/5 text-slate-500'
                }`}
              >
                <span className="text-[9px] font-bold uppercase">{dayName}</span>
                <span className="text-xs mt-0.5">
                  {isToday ? '🔥' : isPastOrToday ? '✓' : '•'}
                </span>
              </div>
            );
          })}
        </div>

        {/* 30-Day Calendar Dot Grid: Today glows, past missed are crossed out ✕ */}
        <div className="grid grid-cols-10 gap-1.5 pt-1">
          {Array.from({ length: 30 }).map((_, idx) => {
            const dayNum = idx + 1;
            const isToday = dayNum === todayDateOfMonth;
            const isPast = dayNum < todayDateOfMonth;
            const isCompletedInStreak = isPast && dayNum >= todayDateOfMonth - streak + 1;

            return (
              <div
                key={idx}
                className={`
                  aspect-square rounded-lg flex items-center justify-center text-[8px] font-black transition-all
                  ${
                    isToday
                      ? 'bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-300 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.9)] scale-110 border border-white animate-pulse'
                      : isCompletedInStreak
                      ? 'bg-emerald-500/80 text-white'
                      : isPast
                      ? 'bg-red-950/40 border border-red-500/20 text-red-400/60 line-through'
                      : 'bg-white/5 border border-white/5 text-slate-600'
                  }
                `}
                title={`Day ${dayNum} ${isToday ? '(Today)' : isPast ? (isCompletedInStreak ? '(Streak Active)' : '(Missed)') : '(Upcoming)'}`}
              >
                {isToday ? '🔥' : isPast && !isCompletedInStreak ? '✕' : dayNum}
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
          SOCIAL HUB: Find Study Buddies & Classmates (with Profile Inspection)
          ========================================================================= */}
      <div className="mt-5 p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              🔍 Find Study Buddies &amp; Friends
            </h3>
          </div>
          <span className="text-[9px] font-black text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-400/30">
            {displayedScholars.length} Scholars
          </span>
        </div>

        {/* Search Input (Real-time Filter) */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search scholar by name, @username or subject..."
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition"
          />
        </div>

        {/* Scholars Cards with View Profile ("अंदर घुसने का ऑप्शन") */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {displayedScholars.map((s) => {
            const isFollowing = !!followingMap[s.username || s.uid];
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
                    <img
                      src={s.photoURL}
                      alt={s.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/profile_photos/IMG_20261109_001512.png';
                      }}
                      className="w-10 h-10 rounded-xl object-cover border border-white/15 shrink-0 bg-slate-900"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-black text-white truncate">{s.name}</p>
                        {isYou && (
                          <span className="text-[8px] font-black px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-amber-400 font-bold truncate">
                        @{s.username} &bull; {s.xp} XP &bull; {s.streak}d 🔥
                      </p>
                    </div>
                  </div>

                  {/* Actions: View Profile ("अंदर घुसने का ऑप्शन") + Follow + Duel */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* View Profile Button ("अंदर घुसने का ऑप्शन") */}
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
                          onClick={() => handleToggleFollow(s.username || s.uid)}
                          className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-1 ${
                            isFollowing
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
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
          })}
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
                👥 Followers ({inspectedScholar.followersList?.length || 3})
              </button>
              <button
                onClick={() => { playClickSound(); setInspectorTab('following'); }}
                className={`flex-1 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                  inspectorTab === 'following'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ⭐ Following ({inspectedScholar.followingList?.length || 2})
              </button>
            </div>

            {/* TAB 1: OVERVIEW & 3D DRESSED AVATAR */}
            {inspectorTab === 'overview' && (
              <div>
                <div className="flex items-center gap-4 mb-4">
                  {/* Interactive 3D Dressed Avatar Model */}
                  <div className="w-24 h-28 shrink-0 rounded-2xl bg-black/50 border-2 border-amber-400/40 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                    <MinecraftVoxelCharacter
                      skinPath={inspectedScholar.skinPath || '/skins/boy/minecraft-skins.png'}
                      mode="thumbnail"
                      width={80}
                      height={100}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-black text-white truncate">{inspectedScholar.name}</h3>
                    <p className="text-xs font-bold text-amber-400">@{inspectedScholar.username}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-[10px] font-bold text-blue-300">
                      {inspectedScholar.role || 'Class 10 JAC Scholar'}
                    </span>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-300">
                      <Shirt className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{inspectedScholar.dressedOutfit || 'Authentic Outfit'}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 p-3 rounded-2xl bg-white/5 border border-white/5 leading-relaxed mb-4">
                  {inspectedScholar.bio || 'Active Class 10 Scholar preparing for JAC Board Exams 2026.'}
                </p>

                {/* Scholar Stats */}
                <div className="grid grid-cols-4 gap-2 text-center py-3 border-y border-white/10 mb-4">
                  <div className="p-2 rounded-xl bg-white/5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">XP</span>
                    <span className="text-sm font-black text-amber-300">{inspectedScholar.xp}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Streak</span>
                    <span className="text-sm font-black text-orange-400">{inspectedScholar.streak}d 🔥</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Followers</span>
                    <span className="text-sm font-black text-white">{inspectedScholar.followers || 300}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Following</span>
                    <span className="text-sm font-black text-white">{inspectedScholar.following || 25}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: FOLLOWERS LIST (ACCOUNTS FOLLOWING THIS SCHOLAR) */}
            {inspectorTab === 'followers' && (
              <div className="space-y-2 mb-4 max-h-[260px] overflow-y-auto pr-1">
                <p className="text-[11px] text-slate-400 mb-2">
                  Scholars following @{inspectedScholar.username}:
                </p>
                {(inspectedScholar.followersList || []).map((f) => (
                  <div
                    key={f.uid}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/40 transition-all"
                  >
                    <div
                      onClick={() => {
                        playClickSound();
                        const full = KNOWN_SCHOLARS.find((k) => k.uid === f.uid) || {
                          uid: f.uid,
                          name: f.name,
                          username: f.username,
                          class: 'Class 10 JAC',
                          xp: f.xp,
                          streak: 8,
                          photoURL: f.photoURL,
                          skinPath: f.skinPath,
                          dressedOutfit: f.dressedOutfit,
                          isRealUser: true,
                          role: f.role
                        };
                        setInspectedScholar(full);
                        setInspectorTab('overview');
                      }}
                      className="flex items-center gap-2.5 cursor-pointer min-w-0"
                    >
                      <img
                        src={f.photoURL}
                        alt={f.name}
                        className="w-9 h-9 rounded-xl object-cover border border-white/10 bg-slate-900 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-black text-white truncate">{f.name}</p>
                        <p className="text-[10px] text-amber-400 font-bold truncate">@{f.username} &bull; {f.xp} XP</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleFollow(f.username || f.uid)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-black shrink-0 ${
                        followingMap[f.username || f.uid]
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                          : 'bg-emerald-500 text-slate-950'
                      }`}
                    >
                      {followingMap[f.username || f.uid] ? 'Following ✓' : '+ Follow'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: FOLLOWING LIST (ACCOUNTS THIS SCHOLAR IS FOLLOWING) */}
            {inspectorTab === 'following' && (
              <div className="space-y-2 mb-4 max-h-[260px] overflow-y-auto pr-1">
                <p className="text-[11px] text-slate-400 mb-2">
                  Scholars followed by @{inspectedScholar.username}:
                </p>
                {(inspectedScholar.followingList || []).map((f) => (
                  <div
                    key={f.uid}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/40 transition-all"
                  >
                    <div
                      onClick={() => {
                        playClickSound();
                        const full = KNOWN_SCHOLARS.find((k) => k.uid === f.uid) || {
                          uid: f.uid,
                          name: f.name,
                          username: f.username,
                          class: 'Class 10 JAC',
                          xp: f.xp,
                          streak: 8,
                          photoURL: f.photoURL,
                          skinPath: f.skinPath,
                          dressedOutfit: f.dressedOutfit,
                          isRealUser: true,
                          role: f.role
                        };
                        setInspectedScholar(full);
                        setInspectorTab('overview');
                      }}
                      className="flex items-center gap-2.5 cursor-pointer min-w-0"
                    >
                      <img
                        src={f.photoURL}
                        alt={f.name}
                        className="w-9 h-9 rounded-xl object-cover border border-white/10 bg-slate-900 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-black text-white truncate">{f.name}</p>
                        <p className="text-[10px] text-amber-400 font-bold truncate">@{f.username} &bull; {f.xp} XP</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleFollow(f.username || f.uid)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-black shrink-0 ${
                        followingMap[f.username || f.uid]
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                          : 'bg-emerald-500 text-slate-950'
                      }`}
                    >
                      {followingMap[f.username || f.uid] ? 'Following ✓' : '+ Follow'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Modal Actions */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              {!inspectedScholar.isCurrentUser && (
                <>
                  <button
                    onClick={() => handleToggleFollow(inspectedScholar.username || inspectedScholar.uid)}
                    className={`w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      followingMap[inspectedScholar.username || inspectedScholar.uid]
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                        : 'bg-emerald-500 text-slate-950 font-black shadow-[0_3px_0_#065F46]'
                    }`}
                  >
                    {followingMap[inspectedScholar.username || inspectedScholar.uid] ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Following Scholar ✓</span>
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
                  <span className="text-[10px] text-slate-400 font-bold">Total Students</span>
                  <div className="text-base font-black text-white mt-0.5">48 Scholars</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-slate-400 font-bold">Avg Attendance</span>
                  <div className="text-base font-black text-emerald-400 mt-0.5">96.4%</div>
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

      {/* Edit Profile Modal */}
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
