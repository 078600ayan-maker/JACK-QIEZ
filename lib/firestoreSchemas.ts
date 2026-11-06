/**
 * Phase 2 Firestore Schemas and Real-time Continuous Sync Logic
 * Jack Quiz - Royal Obsidian Gamified Study Ecosystem
 */

import {
  doc,
  collection,
  setDoc,
  getDoc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  increment,
  arrayUnion,
  query,
  orderBy,
  limit,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, SpacedMistakeItem, SpeedDrillRecord } from '@/types/user';

export interface MascotUnlockSchema {
  unlockedEmotions: ('idle' | 'laugh' | 'cry' | 'cheer' | 'focus' | 'zen')[];
  equippedSkin: 'octopops_emerald' | 'steve_pixel' | 'eve_pixel' | 'lord_monocle' | 'cyber_neon';
  unlockedSkins: string[];
}

export interface BuddyLinkSchema {
  buddyUid: string;
  buddyName: string;
  buddyAvatar: string;
  streakDays: number;
  lastPingDate: string;
  reminderSent: boolean;
  linkedSince: string;
  lessonsDone: number;
  xpEarned: number;
}

export interface TeacherPredictedQuestionSchema {
  id: number;
  pyqYears: number[]; // e.g. [2019, 2021, 2024]
  frequencyScore: number; // 1 to 10
  predictiveProbability: string; // e.g. "110% High Probability JAC 2027"
  teacherNotes: string; // 10-year experienced examiner tips
  subject: string;
  chapter: string;
  level: number; // 1 to 5 (Bronze to Boss)
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

/**
 * Continuous real-time listener for User Profile, XP, and Streaks
 */
export function subscribeToUserProfile(
  uid: string,
  onUpdate: (profile: Partial<UserProfile>) => void
): Unsubscribe {
  const userRef = doc(db, 'users', uid);
  return onSnapshot(
    userRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as UserProfile);
      }
    },
    (err) => {
      console.warn('Profile real-time listener offline or throttled:', err.message);
    }
  );
}

/**
 * Continuous real-time listener for Buddy Streaks sub-collection
 */
export function subscribeToBuddyStreaks(
  uid: string,
  onUpdate: (buddies: BuddyLinkSchema[]) => void
): Unsubscribe {
  const buddiesRef = collection(db, 'users', uid, 'buddies');
  return onSnapshot(
    buddiesRef,
    (snap) => {
      const buddies = snap.docs.map(d => d.data() as BuddyLinkSchema);
      onUpdate(buddies);
    },
    (err) => {
      console.warn('Buddy streak listener offline:', err.message);
    }
  );
}

/**
 * Continuous real-time listener for Mistake Vault
 */
export function subscribeToMistakeVault(
  uid: string,
  onUpdate: (mistakes: SpacedMistakeItem[]) => void
): Unsubscribe {
  const mistakesRef = collection(db, 'users', uid, 'mistakes');
  return onSnapshot(
    mistakesRef,
    (snap) => {
      const mistakes = snap.docs.map(d => d.data() as SpacedMistakeItem);
      onUpdate(mistakes);
    },
    (err) => {
      console.warn('Mistake vault listener offline:', err.message);
    }
  );
}

/**
 * Sync unlocked 3D mascot emotions and skins
 */
export async function syncMascotUnlocks(
  uid: string,
  data: MascotUnlockSchema
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, { mascotState: data }, { merge: true });
  } catch (err) {
    console.warn('Mascot unlock sync fallback:', err);
  }
}

/**
 * Link a new buddy for multiplayer streak tracking
 */
export async function linkBuddyStreak(
  uid: string,
  buddy: BuddyLinkSchema
): Promise<void> {
  try {
    const buddyRef = doc(db, 'users', uid, 'buddies', buddy.buddyUid);
    await setDoc(buddyRef, buddy, { merge: true });
  } catch (err) {
    console.warn('Buddy link fallback:', err);
  }
}

/**
 * Send reminder nudge to buddy
 */
export async function sendBuddyReminder(
  uid: string,
  buddyUid: string
): Promise<void> {
  try {
    const buddyRef = doc(db, 'users', uid, 'buddies', buddyUid);
    await updateDoc(buddyRef, {
      reminderSent: true,
      lastPingDate: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Buddy reminder fallback:', err);
  }
}
