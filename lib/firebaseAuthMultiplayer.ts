'use client';

import {
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  onSnapshot,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Unsubscribe
} from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import { UserProfile } from '@/types/user';
import { getUserCurrentOreTier } from '@/types/ranking';
import { saveLocalUserProfile, getLocalUserProfile } from './firestore';

export interface LeaderboardScholarItem {
  uid: string;
  displayName: string;
  email: string;
  oreRank: string;
  oreRankScore: number;
  currentStreak: number;
  avatarSvg?: string;
  isSelf: boolean;
  avatarPreset?: string;
}

/**
 * 1-Tap Google Authentication using Firebase Auth.
 * Automatically generates user profiles in Firestore with default Ore Rank 'Coal',
 * streak count 1, oreRankScore 0, and real-time friend listeners.
 */
export async function loginWithGoogleOneTap(): Promise<FirebaseUser | null> {
  try {
    const credential = await signInWithPopup(auth, googleProvider);
    const user = credential.user;
    if (!user) return null;

    const userRef = doc(db, 'users', user.uid);
    let snap;
    try {
      snap = await getDoc(userRef);
    } catch (e) {
      console.warn('Firestore offline or unconfigured, proceeding with local profile:', e);
    }

    const defaultOre = 'Coal';
    const initialProfile: UserProfile = {
      uid: user.uid,
      name: user.displayName || 'Royal Scholar',
      displayName: user.displayName || 'Royal Scholar',
      email: user.email || '',
      photoURL: user.photoURL || undefined,
      languagePreference: 'hi',
      oreRank: defaultOre,
      oreRankScore: 0,
      currentStreak: 1,
      connectedFriends: [],
      updatedAt: new Date().toISOString(),
      lastActive: new Date().toISOString().split('T')[0],
      avatarId: 'steve',
      xp: 0,
      streak: 1,
      hearts: 5,
      progress: { sci_ch01: 0 },
      levelScores: {},
      mistakes: []
    };

    if (!snap || !snap.exists()) {
      try {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName || 'Royal Scholar',
          email: user.email || '',
          languagePreference: 'hi',
          oreRank: 'Coal',
          oreRankScore: 0,
          currentStreak: 1,
          connectedFriends: [],
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Could not write user profile to remote Firestore:', err);
      }
      saveLocalUserProfile(initialProfile);
    } else {
      const data = snap.data();
      const merged: UserProfile = {
        ...initialProfile,
        ...data,
        name: data.displayName || initialProfile.name,
        displayName: data.displayName || initialProfile.name,
        languagePreference: data.languagePreference || 'hi',
        oreRank: data.oreRank || 'Coal',
        oreRankScore: data.oreRankScore ?? data.xp ?? 0,
        currentStreak: data.currentStreak ?? data.streak ?? 1,
        connectedFriends: data.connectedFriends || []
      };
      saveLocalUserProfile(merged);
    }

    return user;
  } catch (err) {
    console.error('Firebase 1-Tap Google Login Error:', err);
    throw err;
  }
}

/**
 * Real-time Multiplayer Dual-Stream Comparison Listener
 * Tracks Ore Rank score, daily streaks, and solved quiz volume across connected friends.
 */
export function subscribeLiveLeaderboard(
  currentUid: string,
  callback: (scholars: LeaderboardScholarItem[]) => void
): Unsubscribe {
  const userRef = doc(db, 'users', currentUid);

  try {
    return onSnapshot(userRef, async (snap) => {
      if (!snap.exists()) {
        const local = getLocalUserProfile();
        callback([
          {
            uid: currentUid,
            displayName: local?.displayName || local?.name || 'You (Scholar)',
            email: local?.email || '',
            oreRank: local?.oreRank || 'Coal',
            oreRankScore: local?.oreRankScore ?? local?.xp ?? 0,
            currentStreak: local?.currentStreak ?? local?.streak ?? 1,
            isSelf: true,
            avatarPreset: local?.customAvatar?.preset || 'steve'
          }
        ]);
        return;
      }

      const userData = snap.data();
      const friendUids: string[] = userData.connectedFriends || [];

      const selfItem: LeaderboardScholarItem = {
        uid: userData.uid || currentUid,
        displayName: userData.displayName || 'You (Scholar)',
        email: userData.email || '',
        oreRank: userData.oreRank || 'Coal',
        oreRankScore: userData.oreRankScore ?? userData.xp ?? 0,
        currentStreak: userData.currentStreak ?? userData.streak ?? 1,
        isSelf: true,
        avatarPreset: userData.avatarPreset || 'steve'
      };

      if (!friendUids.length) {
        callback([selfItem]);
        return;
      }

      try {
        const q = query(
          collection(db, 'users'),
          where('uid', 'in', friendUids.slice(0, 10))
        );
        const friendsSnap = await getDocs(q);
        const list: LeaderboardScholarItem[] = friendsSnap.docs.map(d => {
          const dData = d.data();
          return {
            uid: dData.uid,
            displayName: dData.displayName || 'Friend',
            email: dData.email || '',
            oreRank: dData.oreRank || 'Coal',
            oreRankScore: dData.oreRankScore ?? dData.xp ?? 0,
            currentStreak: dData.currentStreak ?? dData.streak ?? 1,
            isSelf: false,
            avatarPreset: dData.avatarPreset || 'alex'
          };
        });

        const combined = [selfItem, ...list].sort(
          (a, b) => b.oreRankScore - a.oreRankScore
        );
        callback(combined);
      } catch (err) {
        console.warn('Error reading friend documents in multiplayer stream:', err);
        callback([selfItem]);
      }
    });
  } catch (err) {
    console.warn('Firestore subscription fallback:', err);
    const local = getLocalUserProfile();
    callback([
      {
        uid: currentUid,
        displayName: local?.displayName || local?.name || 'You (Scholar)',
        email: local?.email || '',
        oreRank: local?.oreRank || 'Coal',
        oreRankScore: local?.oreRankScore ?? local?.xp ?? 0,
        currentStreak: local?.currentStreak ?? local?.streak ?? 1,
        isSelf: true,
        avatarPreset: local?.customAvatar?.preset || 'steve'
      }
    ]);
    return () => {};
  }
}

/**
 * Updates user language preference in Firestore and Local Profile
 */
export async function setLanguagePreferenceInCloud(uid: string, lang: 'hi' | 'en'): Promise<void> {
  const local = getLocalUserProfile();
  if (local) {
    saveLocalUserProfile({ ...local, languagePreference: lang });
  }

  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      languagePreference: lang,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Could not update language preference in Firestore:', err);
  }
}

/**
 * Syncs user ore score and streak to Firestore and calculates rank promotion
 */
export async function syncUserOreScoreToCloud(
  uid: string,
  newXp: number,
  streak?: number
): Promise<string> {
  const oreTier = getUserCurrentOreTier(newXp);
  const local = getLocalUserProfile();
  if (local) {
    saveLocalUserProfile({
      ...local,
      xp: newXp,
      oreRankScore: newXp,
      oreRank: oreTier.name.split(' ')[0],
      streak: streak ?? local.streak,
      currentStreak: streak ?? local.currentStreak ?? local.streak
    });
  }

  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      oreRankScore: newXp,
      oreRank: oreTier.name.split(' ')[0],
      ...(streak !== undefined ? { currentStreak: streak } : {}),
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Could not sync ore score to Firestore:', err);
  }

  return oreTier.name;
}
