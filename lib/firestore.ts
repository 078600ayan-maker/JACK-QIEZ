import { collection, doc, getDoc, getDocs, limit, query, setDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, SpacedMistakeItem, SpeedDrillRecord } from '@/types/user';
import {
  normalizeUsername,
  upsertUserInDirectory,
  fetchResolvedFollowRelations,
} from './socialService';
import { markTodayActiveOnProfile, toLocalDateKey } from './streakEngine';

const LOCAL_STORAGE_KEY = 'sbr_user_profile';

export function getLocalUserProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    const profile = JSON.parse(raw);
    // Only fix truly broken/missing photo paths — never override user-chosen DP
    if (!profile.photoURL || profile.photoURL.includes('custom_reference')) {
      profile.photoURL = '/assets/profile_photos/IMG_20261109_001512.png';
      saveLocalUserProfile(profile);
    }
    return profile;
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

export function clearLocalUserProfile(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function createDefaultProfile(uid: string, name?: string, email?: string): UserProfile {
  const cleanName = (name || 'Royal Scholar').trim();
  const cleanEmail = (email || 'scholar@royal.edu').trim();
  const username = normalizeUsername(cleanName.split(' ')[0], uid);
  const todayKey = toLocalDateKey(new Date());
  return {
    uid,
    name: cleanName,
    displayName: cleanName,
    username,
    usernameLower: username.toLowerCase(),
    nameLower: cleanName.toLowerCase(),
    email: cleanEmail,
    emailLower: cleanEmail.toLowerCase(),
    photoURL: '/assets/profile_photos/IMG_20261109_001512.png',
    avatarId: 'kai',
    xp: 0,
    streak: 1,
    longestStreak: 1,
    streakFreezes: 1,
    streakShieldActive: true,
    lastActive: todayKey,
    activeDates: [todayKey],
    hearts: 5,
    oreRank: 'Coal Ore',
    oreRankScore: 0,
    currentStreak: 1,
    isRealUser: true,
    isOnline: true,
    lastSeenAt: new Date().toISOString(),
    classLevel: 'Class 10 JAC',
    trustScore: 95,
    rankedDuelsEnabled: true,
    progress: {
      sci_ch01: 0 // Ch 1 Level 1 is ready to play
    },
    levelScores: {},
    mistakes: [],
    detailedMistakes: [],
    drillHistory: [],
    followersUids: [],
    followingUids: [],
    followersCount: 0,
    followingCount: 0,
    verificationTick: 'green',
    joinedAt: new Date().toISOString(),
  };
}

/**
 * Fetch profile from Firestore first so server-side stats, follow counts, and
 * search fields stay authoritative across devices, with localStorage as offline fallback.
 */
export async function fetchUserProfile(uid: string, displayName?: string, email?: string): Promise<UserProfile> {
  const local = getLocalUserProfile();

  try {
    const userDocRef = doc(db, 'users', uid);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore timeout')), 5000)
    );
    const snap = await Promise.race([getDoc(userDocRef), timeoutPromise]);
    const relations = await fetchResolvedFollowRelations(uid).catch(() => ({
      followersUids: [] as string[],
      followingUids: [] as string[],
    }));

    let remoteData: UserProfile | null = snap && snap.exists() ? (snap.data() as UserProfile) : null;

    // Fallback: if no doc at users/{uid}, check if an existing account already exists with this same email
    const cleanEmailLower = (email || '').trim().toLowerCase();
    if (!remoteData && cleanEmailLower) {
      try {
        const emailQ = query(
          collection(db, 'users'),
          where('emailLower', '==', cleanEmailLower),
          limit(1)
        );
        const emailSnap = await Promise.race([getDocs(emailQ), timeoutPromise]);
        if (emailSnap && !emailSnap.empty) {
          remoteData = emailSnap.docs[0].data() as UserProfile;
        }
      } catch {
        // Ignore email lookup fallback errors
      }
    }

    if (remoteData) {
      const mergedFollowers = Array.from(
        new Set([...(remoteData.followersUids || []), ...relations.followersUids])
      );
      const mergedFollowing = Array.from(
        new Set([...(remoteData.followingUids || []), ...relations.followingUids])
      );

      const merged: UserProfile = markTodayActiveOnProfile({
        ...createDefaultProfile(uid, remoteData.name || displayName, remoteData.email || email),
        ...remoteData,
        uid,
        name: remoteData.name || remoteData.displayName || displayName || 'Royal Scholar',
        emailLower: (remoteData.emailLower || remoteData.email || email || '').trim().toLowerCase(),
        followersUids: mergedFollowers,
        followingUids: mergedFollowing,
        followersCount: Math.max(mergedFollowers.length, remoteData.followersCount ?? 0),
        followingCount: Math.max(mergedFollowing.length, remoteData.followingCount ?? 0),
        isOnline: true,
        lastSeenAt: new Date().toISOString(),
      });

      if (!snap.exists() || !remoteData.usernameLower || !remoteData.nameLower || !remoteData.emailLower || !remoteData.activeDates) {
        void upsertUserInDirectory(merged).catch(() => {});
      }

      saveLocalUserProfile(merged);
      return merged;
    }

    const baseProfile = markTodayActiveOnProfile(
      local && local.uid === uid
        ? { ...createDefaultProfile(uid, displayName || local.name, email || local.email), ...local, uid }
        : createDefaultProfile(uid, displayName, email)
    );

    saveLocalUserProfile(baseProfile);
    void upsertUserInDirectory(baseProfile).catch(() => {});
    return baseProfile;
  } catch (err) {
    console.warn('Firestore read error/timeout, using local profile fallback:', err);
  }

  if (local && local.uid === uid) {
    return local;
  }

  const newProfile = createDefaultProfile(uid, displayName, email);
  saveLocalUserProfile(newProfile);
  return newProfile;
}

export async function syncProfileFields(uid: string, partial: Partial<UserProfile>): Promise<void> {
  if (!uid) return;
  try {
    await setDoc(
      doc(db, 'users', uid),
      {
        ...partial,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore partial sync failed:', err);
  }
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

  // Update Streak (Duolingo local-date activeDates tracking)
  profile = markTodayActiveOnProfile(profile);

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

  // Update Streak (Duolingo local-date activeDates tracking)
  profile = markTodayActiveOnProfile(profile);

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
