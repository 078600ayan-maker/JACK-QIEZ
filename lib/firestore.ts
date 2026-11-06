import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, SpacedMistakeItem, SpeedDrillRecord } from '@/types/user';

const LOCAL_STORAGE_KEY = 'sbr_user_profile';

export function getLocalUserProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLocalUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage errors
  }
}

export function createDefaultProfile(uid: string, name?: string, email?: string): UserProfile {
  return {
    uid,
    name: name || 'Royal Scholar',
    email: email || 'scholar@royal.edu',
    avatarId: 'steve',
    xp: 120,
    streak: 1,
    streakShieldActive: true,
    lastActive: new Date().toISOString().split('T')[0],
    hearts: 5,
    progress: {
      sci_ch01: 0 // Ch 1 Level 1 is ready to play
    },
    levelScores: {},
    mistakes: [],
    detailedMistakes: [],
    drillHistory: []
  };
}

/**
 * Fetch profile from Firestore, fallback to LocalStorage or default
 */
export async function fetchUserProfile(uid: string, displayName?: string, email?: string): Promise<UserProfile> {
  const local = getLocalUserProfile();
  if (local && local.uid === uid) {
    return local;
  }

  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      saveLocalUserProfile(data);
      return data;
    }
  } catch (err) {
    console.warn('Firestore read error (offline or unconfigured), using local profile:', err);
  }

  const newProfile = createDefaultProfile(uid, displayName, email);
  saveLocalUserProfile(newProfile);
  return newProfile;
}

/**
 * Single document sync on level completion:
 * Stores progress, xp, mistakes, hearts in /users/{uid}
 */
export async function syncOnLevelComplete(
  uid: string,
  updates: {
    chId: string;
    level: number;
    scorePercent: number;
    earnedXp: number;
    newMistakeIds?: number[];
    remainingHearts: number;
  }
): Promise<UserProfile> {
  let profile = getLocalUserProfile() || createDefaultProfile(uid);

  // Update Progress
  const currentHighest = profile.progress[updates.chId] || 0;
  if (updates.level > currentHighest && updates.scorePercent >= 75) {
    profile.progress[updates.chId] = updates.level;
  }

  // Update Level Scores
  if (!profile.levelScores) profile.levelScores = {};
  profile.levelScores[`${updates.chId}_lvl${updates.level}`] = Math.max(
    profile.levelScores[`${updates.chId}_lvl${updates.level}`] || 0,
    updates.scorePercent
  );

  // Update XP
  profile.xp = (profile.xp || 0) + updates.earnedXp;

  // Update Hearts
  profile.hearts = updates.remainingHearts;

  // Update Streak
  const today = new Date().toISOString().split('T')[0];
  if (profile.lastActive !== today) {
    profile.streak = (profile.streak || 0) + 1;
    profile.lastActive = today;
  }

  // Update legacy Mistakes
  if (updates.newMistakeIds && updates.newMistakeIds.length > 0) {
    const existing = new Set(profile.mistakes || []);
    updates.newMistakeIds.forEach(id => existing.add(id));
    profile.mistakes = Array.from(existing);
  }

  // 1. Save Locally
  saveLocalUserProfile(profile);

  // 2. Fire and forget Firestore write
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, profile, { merge: true });
  } catch (err) {
    console.warn('Firestore sync queued or offline:', err);
  }

  return profile;
}

/**
 * Sync Speed Drill directly to Firebase Firestore with local fallback
 */
export async function syncSpeedDrillToFirebase(
  uid: string,
  drillData: SpeedDrillRecord
): Promise<UserProfile> {
  let profile = getLocalUserProfile() || createDefaultProfile(uid);

  if (!profile.drillHistory) profile.drillHistory = [];
  profile.drillHistory.unshift(drillData);
  if (profile.drillHistory.length > 50) {
    profile.drillHistory = profile.drillHistory.slice(0, 50);
  }

  // Award XP
  profile.xp = (profile.xp || 0) + drillData.earnedXp;

  // Update Streak
  const today = new Date().toISOString().split('T')[0];
  if (profile.lastActive !== today) {
    profile.streak = (profile.streak || 0) + 1;
    profile.lastActive = today;
  }

  saveLocalUserProfile(profile);

  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, profile, { merge: true });
  } catch (err) {
    console.warn('Firestore drill sync fallback:', err);
  }

  return profile;
}

/**
 * Record a mistake into the Spaced Repetition engine
 */
export async function recordSpacedMistake(
  uid: string,
  mistake: Omit<SpacedMistakeItem, 'boxLevel' | 'lastReviewed' | 'nextReviewDue' | 'reviewCount'>
): Promise<UserProfile> {
  let profile = getLocalUserProfile() || createDefaultProfile(uid);
  if (!profile.detailedMistakes) profile.detailedMistakes = [];

  const existingIdx = profile.detailedMistakes.findIndex(m => m.questionId === mistake.questionId);
  const now = new Date();
  const nextDue = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000); // 1 day interval for box 1

  if (existingIdx >= 0) {
    profile.detailedMistakes[existingIdx].boxLevel = 1;
    profile.detailedMistakes[existingIdx].lastReviewed = now.toISOString();
    profile.detailedMistakes[existingIdx].nextReviewDue = nextDue.toISOString();
    profile.detailedMistakes[existingIdx].reviewCount++;
    profile.detailedMistakes[existingIdx].userWrongAnswer = mistake.userWrongAnswer;
  } else {
    profile.detailedMistakes.unshift({
      ...mistake,
      boxLevel: 1,
      lastReviewed: now.toISOString(),
      nextReviewDue: nextDue.toISOString(),
      reviewCount: 1
    });
  }

  // Also maintain in legacy mistakes array
  const existingSet = new Set(profile.mistakes || []);
  existingSet.add(mistake.questionId);
  profile.mistakes = Array.from(existingSet);

  saveLocalUserProfile(profile);

  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, profile, { merge: true });
  } catch (err) {
    console.warn('Firestore mistake sync fallback:', err);
  }

  return profile;
}

/**
 * Advance mistake along the Leitner Spaced Repetition boxes (1 -> 5)
 */
export async function advanceMistakeRepetition(
  uid: string,
  questionId: number
): Promise<UserProfile> {
  let profile = getLocalUserProfile() || createDefaultProfile(uid);
  if (!profile.detailedMistakes) return profile;

  const item = profile.detailedMistakes.find(m => m.questionId === questionId);
  if (!item) return profile;

  const intervals = [1, 3, 7, 14, 30]; // Days for boxes 1 to 5
  item.boxLevel = Math.min(5, item.boxLevel + 1);
  item.reviewCount++;
  const now = new Date();
  const nextDays = intervals[item.boxLevel - 1] || 1;
  item.lastReviewed = now.toISOString();
  item.nextReviewDue = new Date(now.getTime() + nextDays * 24 * 60 * 60 * 1000).toISOString();

  if (item.boxLevel >= 5) {
    profile.mistakes = (profile.mistakes || []).filter(id => id !== questionId);
  }

  saveLocalUserProfile(profile);

  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, profile, { merge: true });
  } catch (err) {
    console.warn('Firestore advance repetition fallback:', err);
  }

  return profile;
}
