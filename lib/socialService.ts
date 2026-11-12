import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  arrayUnion,
  arrayRemove,
  increment,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile } from '@/types/user';
import { createMatchSeed } from './matchIntegrity';

export type PublicUserCard = UserProfile;

export interface DuelRoom {
  pin: string;
  hostUid: string;
  hostName: string;
  hostUsername: string;
  hostPhoto: string;
  hostXp: number;
  hostEmailLower?: string;
  hostReady?: boolean;
  hostScore?: number;
  guestUid?: string;
  guestName?: string;
  guestUsername?: string;
  guestPhoto?: string;
  guestXp?: number;
  guestEmailLower?: string;
  guestReady?: boolean;
  guestScore?: number;
  invitedFriendUid?: string;
  subjectId: string;
  subjectName: string;
  chapterId?: number;
  chapterName?: string;
  questionSeed?: number;
  mode?: 'friend' | 'global';
  status: 'waiting' | 'active' | 'finished';
  winnerUid?: string;
  durationMs?: number;
  integrityScore?: number;
  integrityStatus?: 'Verified' | 'Caution' | 'Flagged';
  integrityFlags?: string[];
  lastTaunt?: {
    fromUid: string;
    fromName: string;
    emoji: string;
    label: string;
    at: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LiveCallLog {
  id: string;
  uid: string;
  subject: string;
  chapter: string;
  turns: number;
  scoreXp: number;
  durationSeconds: number;
  createdAt: string;
}

export function normalizeUsername(raw?: string, fallbackUid?: string): string {
  const base = (raw || '')
    .trim()
    .toLowerCase()
    .replace(/^@+/, '')
    .replace(/[^a-z0-9_.]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/\.{2,}/g, '.')
    .replace(/^[_.]|[_.]+$/g, '');
  if (base.length >= 3) return base.slice(0, 24);
  const suffix = (fallbackUid || Math.random().toString(36).slice(2, 8))
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
    .slice(0, 6);
  return `scholar_${suffix || 'jac10'}`;
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) clean[k] = v;
  }
  return clean as Partial<T>;
}

let cachedDirectoryUsers: UserProfile[] = [];
let cachedDirectoryUpdatedAt = 0;
const DIRECTORY_CACHE_TTL_MS = 30_000;

function normalizeDirectoryUser(raw: UserProfile, docId: string): UserProfile {
  const uid = raw.uid || docId;
  const cleanName = (raw.name || raw.displayName || raw.email?.split('@')[0] || 'JAC Scholar').trim();
  const emailLower = (raw.emailLower || raw.email || '').trim().toLowerCase();
  const username = raw.username || normalizeUsername(cleanName.split(' ')[0] || emailLower.split('@')[0], uid);
  return {
    ...raw,
    uid,
    name: cleanName,
    displayName: raw.displayName || cleanName,
    username,
    usernameLower: (raw.usernameLower || username).toLowerCase(),
    nameLower: (raw.nameLower || cleanName).toLowerCase(),
    emailLower,
  };
}

function updateDirectoryCache(users: UserProfile[]): void {
  if (!users || users.length === 0) return;
  const map = new Map<string, UserProfile>();
  for (const u of cachedDirectoryUsers) {
    if (u?.uid) map.set(u.uid, u);
  }
  for (const u of users) {
    if (u?.uid) map.set(u.uid, normalizeDirectoryUser(u, u.uid));
  }
  cachedDirectoryUsers = Array.from(map.values());
  cachedDirectoryUpdatedAt = Date.now();
}

/**
 * Ensures the signed-in user document exists and has normalized searchable fields
 * (`username`, `usernameLower`, `nameLower`, `followingUids`, `followersUids`, counts).
 */
export async function upsertUserInDirectory(profile: UserProfile): Promise<UserProfile> {
  if (!profile?.uid) return profile;

  const cleanName = (profile.name || profile.displayName || 'JAC Scholar').trim();
  const username = normalizeUsername(
    profile.username || cleanName.split(' ')[0],
    profile.uid
  );
  const followingUids = Array.isArray(profile.followingUids)
    ? Array.from(new Set(profile.followingUids))
    : Array.isArray(profile.connectedFriends)
    ? Array.from(new Set(profile.connectedFriends))
    : [];
  const followersUids = Array.isArray(profile.followersUids)
    ? Array.from(new Set(profile.followersUids))
    : [];

  const nowIso = new Date().toISOString();
  const cleanEmailLower = (profile.email || '').trim().toLowerCase();
  const payload: UserProfile = {
    ...profile,
    name: cleanName,
    displayName: cleanName,
    username,
    usernameLower: username.toLowerCase(),
    nameLower: cleanName.toLowerCase(),
    emailLower: cleanEmailLower,
    followingUids,
    followersUids,
    followingCount: Math.max(followingUids.length, profile.followingCount ?? 0),
    followersCount: Math.max(followersUids.length, profile.followersCount ?? 0),
    oreRankScore: Math.max(profile.oreRankScore ?? 0, profile.xp ?? 0),
    isOnline: true,
    lastSeenAt: nowIso,
    updatedAt: nowIso,
  };

  try {
    await Promise.race([
      setDoc(doc(db, 'users', profile.uid), stripUndefined(payload as unknown as Record<string, unknown>), {
        merge: true,
      }),
      new Promise<void>((resolve) => setTimeout(resolve, 1500)),
    ]);
  } catch (err) {
    // Fallback if live Firestore rules reject verificationTick/isAdmin on older docs
    try {
      const safePayload = stripUndefined(payload as unknown as Record<string, unknown>);
      delete safePayload.verificationTick;
      delete safePayload.isAdmin;
      await Promise.race([
        setDoc(doc(db, 'users', profile.uid), safePayload, { merge: true }),
        new Promise<void>((resolve) => setTimeout(resolve, 1200)),
      ]);
    } catch {
      console.error('[socialService] upsertUserInDirectory failed:', err);
    }
  }

  updateDirectoryCache([payload]);
  return payload;
}

/**
 * Ultra-fast username availability check (<1ms cache hit, <=700ms Firestore query).
 */
export async function isUsernameAvailable(username: string, currentUid: string): Promise<boolean> {
  const clean = normalizeUsername(username, currentUid).toLowerCase();
  if (!clean) return false;

  // Instant in-memory cache check
  if (cachedDirectoryUsers.length > 0) {
    const takenInCache = cachedDirectoryUsers.some(
      (u) => u.uid !== currentUid && (u.usernameLower || u.username || '').toLowerCase() === clean
    );
    if (takenInCache) return false;
  }

  try {
    const q = query(collection(db, 'users'), where('usernameLower', '==', clean), limit(2));
    const snap = await Promise.race([
      getDocs(q),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 700)),
    ]);
    if (!snap) return true;
    for (const d of snap.docs) {
      if (d.id !== currentUid) return false;
    }
    return true;
  } catch (err) {
    console.error('[socialService] isUsernameAvailable failed:', err);
    return true;
  }
}

/**
 * Searches real users in Firestore by `@username`, full name, or email address.
 * Empty query returns top scholars by XP (plus fallback directory scan).
 */
export async function searchUsersInDatabase(
  rawTerm: string,
  limitCount = 30
): Promise<UserProfile[]> {
  const term = rawTerm.trim().toLowerCase().replace(/^@+/, '');
  const resultsMap = new Map<string, UserProfile>();

  const matchesTerm = (u: UserProfile): boolean => {
    if (!term) return true;
    const uname = (u.usernameLower || u.username || '').toLowerCase();
    const name = (u.nameLower || u.name || u.displayName || '').toLowerCase();
    const email = (u.emailLower || u.email || '').toLowerCase();
    const emailLocal = email.split('@')[0] || '';
    return (
      uname.includes(term) ||
      name.includes(term) ||
      email.includes(term) ||
      emailLocal.includes(term)
    );
  };

  try {
    // Seed immediately from in-memory directory cache if available
    for (const cached of cachedDirectoryUsers) {
      if (matchesTerm(cached)) {
        resultsMap.set(cached.uid, cached);
      }
    }

    const cacheFresh =
      cachedDirectoryUsers.length > 0 &&
      Date.now() - cachedDirectoryUpdatedAt < DIRECTORY_CACHE_TTL_MS;
    if (cacheFresh && resultsMap.size >= (term ? 5 : limitCount)) {
      const cachedArr = Array.from(resultsMap.values()).sort((a, b) => (b.xp || 0) - (a.xp || 0));
      return cachedArr.slice(0, limitCount);
    }

    if (!term) {
      const [topSnap, recentSnap] = await Promise.race([
        Promise.all([
          getDocs(query(collection(db, 'users'), orderBy('xp', 'desc'), limit(limitCount))).catch(() => null),
          getDocs(query(collection(db, 'users'), limit(Math.max(limitCount, 120)))).catch(() => null),
        ]),
        new Promise<[null, null]>((resolve) => setTimeout(() => resolve([null, null]), 1200)),
      ]);
      const fetched: UserProfile[] = [];
      topSnap?.forEach((docSnap) => {
        const normalized = normalizeDirectoryUser(docSnap.data() as UserProfile, docSnap.id);
        fetched.push(normalized);
        resultsMap.set(normalized.uid, normalized);
      });
      recentSnap?.forEach((docSnap) => {
        const normalized = normalizeDirectoryUser(docSnap.data() as UserProfile, docSnap.id);
        fetched.push(normalized);
        if (!resultsMap.has(normalized.uid)) {
          resultsMap.set(normalized.uid, normalized);
        }
      });
      if (fetched.length > 0) updateDirectoryCache(fetched);
      return Array.from(resultsMap.values())
        .sort((a, b) => (b.xp || 0) - (a.xp || 0))
        .slice(0, limitCount);
    }

    const rawTrimmed = rawTerm.trim();
    const endTerm = `${term}\uf8ff`;
    const [
      byExactEmailLowerSnap,
      byExactEmailRawSnap,
      byUsernameSnap,
      byNameSnap,
      byEmailLowerSnap,
      dirSnap,
    ] = await Promise.race([
      Promise.all([
        getDocs(query(collection(db, 'users'), where('emailLower', '==', term), limit(10))).catch(() => null),
        getDocs(query(collection(db, 'users'), where('email', '==', rawTrimmed), limit(10))).catch(() => null),
        getDocs(
          query(
            collection(db, 'users'),
            where('usernameLower', '>=', term),
            where('usernameLower', '<=', endTerm),
            limit(limitCount)
          )
        ).catch(() => null),
        getDocs(
          query(
            collection(db, 'users'),
            where('nameLower', '>=', term),
            where('nameLower', '<=', endTerm),
            limit(limitCount)
          )
        ).catch(() => null),
        getDocs(
          query(
            collection(db, 'users'),
            where('emailLower', '>=', term),
            where('emailLower', '<=', endTerm),
            limit(limitCount)
          )
        ).catch(() => null),
        getDocs(query(collection(db, 'users'), limit(300))).catch(() => null),
      ]),
      new Promise<[null, null, null, null, null, null]>((resolve) =>
        setTimeout(() => resolve([null, null, null, null, null, null]), 1200)
      ),
    ]);

    const addDoc = (docSnap: { id: string; data: () => unknown }) => {
      const normalized = normalizeDirectoryUser(docSnap.data() as UserProfile, docSnap.id);
      resultsMap.set(normalized.uid, normalized);
      return normalized;
    };

    byExactEmailLowerSnap?.forEach(addDoc);
    byExactEmailRawSnap?.forEach(addDoc);
    byUsernameSnap?.forEach(addDoc);
    byNameSnap?.forEach(addDoc);
    byEmailLowerSnap?.forEach(addDoc);

    if (dirSnap) {
      const dirUsers: UserProfile[] = [];
      dirSnap.forEach((docSnap) => {
        const normalized = normalizeDirectoryUser(docSnap.data() as UserProfile, docSnap.id);
        dirUsers.push(normalized);
        if (!resultsMap.has(normalized.uid) && matchesTerm(normalized)) {
          resultsMap.set(normalized.uid, normalized);
        }
      });
      if (dirUsers.length > 0) updateDirectoryCache(dirUsers);
    }

    const arr = Array.from(resultsMap.values());
    arr.sort((a, b) => {
      const aEm = (a.emailLower || a.email || '').toLowerCase() === term ? 3 : 0;
      const bEm = (b.emailLower || b.email || '').toLowerCase() === term ? 3 : 0;
      const aExact = (a.usernameLower || a.username || '').toLowerCase() === term ? 2 : 0;
      const bExact = (b.usernameLower || b.username || '').toLowerCase() === term ? 2 : 0;
      if (aEm !== bEm) return bEm - aEm;
      if (aExact !== bExact) return bExact - aExact;
      return (b.xp || 0) - (a.xp || 0);
    });
    return arr.slice(0, limitCount);
  } catch (err) {
    console.error('[socialService] searchUsersInDatabase failed:', err);
    return Array.from(resultsMap.values());
  }
}

/**
 * Fetches specific user profiles by UID array (chunked by 10 for Firestore `in` queries).
 */
export async function fetchUsersByUids(uids: string[]): Promise<UserProfile[]> {
  const unique = Array.from(new Set(uids.filter(Boolean)));
  if (unique.length === 0) return [];

  const users: UserProfile[] = [];
  for (let i = 0; i < unique.length; i += 10) {
    const chunk = unique.slice(i, i + 10);
    try {
      const snap = await getDocs(query(collection(db, 'users'), where('uid', 'in', chunk)));
      snap.forEach((docSnap) => {
        const data = docSnap.data() as UserProfile;
        users.push({ ...data, uid: data.uid || docSnap.id });
      });
    } catch (err) {
      console.error('[socialService] fetchUsersByUids chunk failed:', err);
    }
  }
  return users;
}

/**
 * Fetches follower UIDs from both `users/{uid}.followersUids` and `follows` edge collection
 * so counts stay accurate even if cross-user doc rules are restricted.
 */
export async function fetchResolvedFollowRelations(uid: string): Promise<{
  followersUids: string[];
  followingUids: string[];
}> {
  const followersSet = new Set<string>();
  const followingSet = new Set<string>();

  try {
    const [userSnap, followersEdgeSnap, followingEdgeSnap] = await Promise.all([
      getDoc(doc(db, 'users', uid)),
      getDocs(query(collection(db, 'follows'), where('targetUid', '==', uid), limit(100))),
      getDocs(query(collection(db, 'follows'), where('followerUid', '==', uid), limit(100))),
    ]);

    if (userSnap.exists()) {
      const data = userSnap.data() as UserProfile;
      (data.followersUids || []).forEach((id) => id && followersSet.add(id));
      (data.followingUids || []).forEach((id) => id && followingSet.add(id));
    }

    followersEdgeSnap.forEach((d) => {
      const f = d.data()?.followerUid;
      if (typeof f === 'string' && f) followersSet.add(f);
    });
    followingEdgeSnap.forEach((d) => {
      const t = d.data()?.targetUid;
      if (typeof t === 'string' && t) followingSet.add(t);
    });
  } catch (err) {
    console.error('[socialService] fetchResolvedFollowRelations failed:', err);
  }

  return {
    followersUids: Array.from(followersSet),
    followingUids: Array.from(followingSet),
  };
}

/**
 * Real-time bidirectional Follow / Unfollow in Firestore.
 * Updates both `users/{currentUid}` (`followingUids`/`followingCount`), `users/{targetUid}`
 * (`followersUids`/`followersCount`), and `follows/{currentUid}_{targetUid}` edge document.
 */
export async function toggleFollowInDatabase(
  currentUid: string,
  targetUid: string,
  shouldFollow: boolean
): Promise<{ ok: boolean; error?: string }> {
  if (!currentUid || !targetUid || currentUid === targetUid) {
    return { ok: false, error: 'Invalid follow target' };
  }

  const edgeId = `${currentUid}_${targetUid}`;
  const currentRef = doc(db, 'users', currentUid);
  const targetRef = doc(db, 'users', targetUid);
  const edgeRef = doc(db, 'follows', edgeId);

  try {
    const batch = writeBatch(db);
    if (shouldFollow) {
      batch.set(
        currentRef,
        {
          followingUids: arrayUnion(targetUid),
          connectedFriends: arrayUnion(targetUid),
          followingCount: increment(1),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      batch.set(
        targetRef,
        {
          followersUids: arrayUnion(currentUid),
          followersCount: increment(1),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      batch.set(edgeRef, {
        followerUid: currentUid,
        targetUid,
        createdAt: new Date().toISOString(),
      });
    } else {
      batch.set(
        currentRef,
        {
          followingUids: arrayRemove(targetUid),
          connectedFriends: arrayRemove(targetUid),
          followingCount: increment(-1),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      batch.set(
        targetRef,
        {
          followersUids: arrayRemove(currentUid),
          followersCount: increment(-1),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      batch.delete(edgeRef);
    }

    await batch.commit();
    return { ok: true };
  } catch (batchErr: unknown) {
    // Fallback if Firestore rules restrict updating another user's `users/{targetUid}` document:
    // Still commit own `users/{currentUid}` + `follows/{edgeId}` so bidirectional reads stay accurate.
    try {
      const ownBatch = writeBatch(db);
      if (shouldFollow) {
        ownBatch.set(
          currentRef,
          {
            followingUids: arrayUnion(targetUid),
            connectedFriends: arrayUnion(targetUid),
            followingCount: increment(1),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        ownBatch.set(edgeRef, {
          followerUid: currentUid,
          targetUid,
          createdAt: new Date().toISOString(),
        });
      } else {
        ownBatch.set(
          currentRef,
          {
            followingUids: arrayRemove(targetUid),
            connectedFriends: arrayRemove(targetUid),
            followingCount: increment(-1),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        ownBatch.delete(edgeRef);
      }
      await ownBatch.commit();
      return { ok: true };
    } catch (fallbackErr: unknown) {
      const msg =
        fallbackErr instanceof Error
          ? fallbackErr.message
          : batchErr instanceof Error
          ? batchErr.message
          : 'Failed to update follow status';
      console.error('[socialService] toggleFollowInDatabase failed:', msg);
      return { ok: false, error: msg };
    }
  }
}

/**
 * Live listener for global directory & leaderboard ordered by XP descending.
 */
export function subscribeGlobalLeaderboard(
  onUpdate: (users: UserProfile[]) => void,
  limitCount = 50
): Unsubscribe {
  const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(limitCount));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: UserProfile[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as UserProfile;
        list.push({ ...data, uid: data.uid || docSnap.id });
      });
      updateDirectoryCache(list);
      onUpdate(list);
    },
    (err) => {
      console.error('[socialService] subscribeGlobalLeaderboard error:', err);
    }
  );
}

/**
 * Creates a live 4-digit PIN Duel Room in Firestore (`duel_rooms/{pin}`) with collision checking
 * and synchronized cryptographic match seed + optional invited friend + anti-fixing metadata.
 */
export async function createDuelRoom(
  host: UserProfile,
  subjectId: string,
  subjectName: string,
  options?: {
    chapterId?: number;
    chapterName?: string;
    invitedFriendUid?: string;
    mode?: 'friend' | 'global';
    integrityScore?: number;
    integrityStatus?: 'Verified' | 'Caution' | 'Flagged';
    integrityFlags?: string[];
  }
): Promise<DuelRoom> {
  let chosenPin = Math.floor(1000 + Math.random() * 9000).toString();

  // Single fast 600ms collision check (1 retry max) so 4-digit PIN generation is sub-second
  try {
    const existingSnap = await Promise.race([
      getDoc(doc(db, 'duel_rooms', chosenPin)),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 600)),
    ]);
    if (existingSnap && existingSnap.exists() && (existingSnap.data() as DuelRoom)?.status !== 'finished') {
      chosenPin = Math.floor(1000 + Math.random() * 9000).toString();
    }
  } catch {
    // Proceed with generated PIN
  }

  const now = new Date().toISOString();
  const seed = createMatchSeed(chosenPin, Date.now() % 10000);
  const room: DuelRoom = stripUndefined({
    pin: chosenPin,
    hostUid: host.uid,
    hostName: host.name || host.displayName || 'JAC Scholar',
    hostUsername: host.username || normalizeUsername(host.name, host.uid),
    hostPhoto: host.photoURL || '/assets/profile_photos/IMG_20261109_001512.png',
    hostXp: host.xp || 0,
    hostEmailLower: (host.emailLower || host.email || '').trim().toLowerCase(),
    hostReady: true,
    invitedFriendUid: options?.invitedFriendUid,
    subjectId,
    subjectName,
    chapterId: options?.chapterId ?? 1,
    chapterName: options?.chapterName,
    questionSeed: seed,
    mode: options?.mode || 'friend',
    integrityScore: options?.integrityScore ?? 96,
    integrityStatus: options?.integrityStatus || 'Verified',
    integrityFlags: options?.integrityFlags || [],
    status: 'waiting',
    createdAt: now,
    updatedAt: now,
  } as Record<string, unknown>) as unknown as DuelRoom;

  await Promise.race([
    setDoc(doc(db, 'duel_rooms', chosenPin), room),
    new Promise<void>((resolve) => setTimeout(resolve, 1000)),
  ]);
  return room;
}

/**
 * Joins an existing 4-digit PIN Duel Room in Firestore (`duel_rooms/{pin}`).
 */
export async function joinDuelRoomByPin(
  pin: string,
  guest: UserProfile
): Promise<{ ok: boolean; room?: DuelRoom; error?: string }> {
  const cleanPin = pin.replace(/\D/g, '').trim();
  if (cleanPin.length !== 4) {
    return { ok: false, error: 'Please enter a valid 4-digit PIN.' };
  }

  try {
    const roomRef = doc(db, 'duel_rooms', cleanPin);
    const snap = await Promise.race([
      getDoc(roomRef),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 1800)),
    ]);
    if (!snap) {
      return { ok: false, error: 'Room lookup timed out. Please try again.' };
    }
    if (!snap.exists()) {
      return { ok: false, error: `No active duel room found for PIN #${cleanPin}.` };
    }

    const existing = snap.data() as DuelRoom;
    const now = new Date().toISOString();
    const isHostRejoin = existing.hostUid === guest.uid;
    const guestEmailLower = (guest.emailLower || guest.email || '').trim().toLowerCase();

    const updated: DuelRoom = {
      ...existing,
      ...(isHostRejoin
        ? {}
        : {
            guestUid: guest.uid,
            guestName: guest.name || guest.displayName || 'Challenger',
            guestUsername: guest.username || normalizeUsername(guest.name, guest.uid),
            guestPhoto: guest.photoURL || '/assets/profile_photos/classic_character_1.png',
            guestXp: guest.xp || 0,
            guestEmailLower,
            guestReady: true,
            status: 'active',
          }),
      updatedAt: now,
    };

    if (!isHostRejoin) {
      await Promise.race([
        updateDoc(
          roomRef,
          stripUndefined({
            guestUid: updated.guestUid,
            guestName: updated.guestName,
            guestUsername: updated.guestUsername,
            guestPhoto: updated.guestPhoto,
            guestXp: updated.guestXp,
            guestEmailLower: updated.guestEmailLower,
            guestReady: true,
            status: updated.status,
            updatedAt: now,
          } as Record<string, unknown>)
        ),
        new Promise<void>((resolve) => setTimeout(resolve, 1500)),
      ]);
    }

    return { ok: true, room: updated };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unable to join room.';
    return { ok: false, error: msg };
  }
}

export async function toggleDuelRoomReady(
  pin: string,
  role: 'host' | 'guest',
  ready: boolean
): Promise<void> {
  if (!pin) return;
  try {
    const field = role === 'host' ? 'hostReady' : 'guestReady';
    await updateDoc(doc(db, 'duel_rooms', pin), {
      [field]: ready,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[socialService] toggleDuelRoomReady warning:', err);
  }
}

export async function recordDuelRoomResult(params: {
  pin: string;
  uid: string;
  role: 'host' | 'guest' | 'solo';
  scorePercent: number;
  durationMs: number;
}): Promise<void> {
  const { pin, uid, role, scorePercent, durationMs } = params;
  if (!pin || !uid) return;
  try {
    const roomRef = doc(db, 'duel_rooms', pin);
    const snap = await getDoc(roomRef);
    if (!snap.exists()) return;
    const room = snap.data() as DuelRoom;
    const scoreField = role === 'guest' ? 'guestScore' : 'hostScore';
    const nextHostScore = role === 'host' ? scorePercent : room.hostScore;
    const nextGuestScore = role === 'guest' ? scorePercent : room.guestScore;
    let winnerUid = room.winnerUid;
    let status = room.status;
    if (typeof nextHostScore === 'number' && typeof nextGuestScore === 'number') {
      winnerUid = nextHostScore >= nextGuestScore ? room.hostUid : (room.guestUid || room.hostUid);
      status = 'finished';
    }
    await updateDoc(
      roomRef,
      stripUndefined({
        [scoreField]: scorePercent,
        durationMs: Math.max(room.durationMs || 0, durationMs),
        winnerUid,
        status,
        updatedAt: new Date().toISOString(),
      } as Record<string, unknown>)
    );
  } catch (err) {
    console.warn('[socialService] recordDuelRoomResult warning:', err);
  }
}

export async function fetchRecentPairDuels(uid: string): Promise<
  Array<{
    pin: string;
    hostUid: string;
    guestUid?: string | null;
    winnerUid?: string | null;
    status: string;
    createdAt: number;
    durationMs?: number;
    hostScore?: number;
    guestScore?: number;
    subjectId?: string;
  }>
> {
  if (!uid) return [];
  try {
    const snap = await getDocs(
      query(collection(db, 'duel_rooms'), orderBy('updatedAt', 'desc'), limit(40))
    );
    const out: Array<{
      pin: string;
      hostUid: string;
      guestUid?: string | null;
      winnerUid?: string | null;
      status: string;
      createdAt: number;
      durationMs?: number;
      hostScore?: number;
      guestScore?: number;
      subjectId?: string;
    }> = [];
    snap.forEach((d) => {
      const data = d.data() as DuelRoom;
      if (data.hostUid === uid || data.guestUid === uid) {
        const ts = Date.parse(data.createdAt || data.updatedAt || '');
        out.push({
          pin: data.pin,
          hostUid: data.hostUid,
          guestUid: data.guestUid,
          winnerUid: data.winnerUid,
          status: data.status,
          createdAt: Number.isNaN(ts) ? Date.now() : ts,
          durationMs: data.durationMs,
          hostScore: data.hostScore,
          guestScore: data.guestScore,
          subjectId: data.subjectId,
        });
      }
    });
    return out;
  } catch {
    return [];
  }
}

export async function heartbeatUserPresence(uid: string): Promise<void> {
  if (!uid) return;
  try {
    await setDoc(
      doc(db, 'users', uid),
      { isOnline: true, lastSeenAt: new Date().toISOString() },
      { merge: true }
    );
  } catch {
    // non-fatal heartbeat
  }
}

export async function fetchActiveScholarsCount(): Promise<number> {
  try {
    const snap = await getDocs(query(collection(db, 'users'), limit(120)));
    const cutoff = Date.now() - 20 * 60 * 1000;
    let count = 0;
    snap.forEach((d) => {
      const u = d.data() as UserProfile;
      const ts = u.lastSeenAt ? Date.parse(u.lastSeenAt) : u.updatedAt ? Date.parse(u.updatedAt) : 0;
      if (u.isOnline || (ts && ts >= cutoff)) {
        count += 1;
      }
    });
    return Math.max(1, count);
  } catch {
    return 1;
  }
}

export function subscribeDuelRoom(
  pin: string,
  onUpdate: (room: DuelRoom | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, 'duel_rooms', pin), (snap) => {
    if (!snap.exists()) {
      onUpdate(null);
      return;
    }
    onUpdate(snap.data() as DuelRoom);
  });
}

export function subscribeOpenDuelRooms(
  onUpdate: (rooms: DuelRoom[]) => void,
  limitCount = 12
): Unsubscribe {
  const q = query(collection(db, 'duel_rooms'), orderBy('updatedAt', 'desc'), limit(limitCount));
  return onSnapshot(
    q,
    (snap) => {
      const rooms: DuelRoom[] = [];
      snap.forEach((d) => rooms.push(d.data() as DuelRoom));
      onUpdate(rooms);
    },
    (err) => {
      console.error('[socialService] subscribeOpenDuelRooms error:', err);
    }
  );
}

export async function sendDuelTauntInCloud(
  pin: string,
  fromUid: string,
  fromName: string,
  emoji: string,
  label: string
): Promise<void> {
  if (!pin) return;
  try {
    await updateDoc(doc(db, 'duel_rooms', pin), {
      lastTaunt: {
        fromUid,
        fromName,
        emoji,
        label,
        at: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[socialService] sendDuelTauntInCloud failed:', err);
  }
}

export async function claimDailyGiftInCloud(uid: string): Promise<{ claimed: boolean; xpBonus: number }> {
  const today = new Date().toISOString().split('T')[0];
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    const prevDate = snap.exists() ? (snap.data() as UserProfile).lastGiftClaimDate : undefined;
    if (prevDate === today) {
      return { claimed: false, xpBonus: 0 };
    }
    await setDoc(
      userRef,
      {
        xp: increment(50),
        hearts: 5,
        lastGiftClaimDate: today,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return { claimed: true, xpBonus: 50 };
  } catch (err) {
    console.error('[socialService] claimDailyGiftInCloud failed:', err);
    return { claimed: false, xpBonus: 0 };
  }
}

export async function sendBuddyNudgeInCloud(
  fromUid: string,
  fromName: string,
  toUid: string
): Promise<boolean> {
  if (!fromUid || !toUid) return false;
  try {
    const id = `${fromUid}_${toUid}_${new Date().toISOString().split('T')[0]}`;
    await setDoc(doc(db, 'nudges', id), {
      fromUid,
      fromName,
      toUid,
      createdAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error('[socialService] sendBuddyNudgeInCloud failed:', err);
    return false;
  }
}

export async function syncCallCreditsInCloud(
  uid: string,
  action: 'read' | 'deduct',
  dailyAllowance = 3
): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  if (!uid) return dailyAllowance;

  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    const data = snap.exists() ? (snap.data() as UserProfile) : undefined;
    let remaining =
      data?.dailyCallCreditsDate === today && typeof data.dailyCallCredits === 'number'
        ? data.dailyCallCredits
        : dailyAllowance;

    if (action === 'deduct' && remaining > 0) {
      remaining -= 1;
    }

    await setDoc(
      userRef,
      {
        dailyCallCredits: remaining,
        dailyCallCreditsDate: today,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return remaining;
  } catch (err) {
    console.error('[socialService] syncCallCreditsInCloud failed:', err);
    return dailyAllowance;
  }
}

export async function logLiveCallSessionInCloud(
  uid: string,
  subject: string,
  chapter: string,
  turns: number,
  durationSeconds: number
): Promise<number> {
  const earnedXp = Math.min(40, Math.max(5, turns * 5));
  if (!uid) return 0;

  try {
    const logId = `call_${Date.now()}`;
    const batch = writeBatch(db);
    batch.set(doc(db, 'users', uid, 'callLogs', logId), {
      id: logId,
      uid,
      subject,
      chapter,
      turns,
      scoreXp: earnedXp,
      durationSeconds,
      createdAt: new Date().toISOString(),
    } as LiveCallLog);
    batch.set(
      doc(db, 'users', uid),
      {
        xp: increment(earnedXp),
        weeklyXp: increment(earnedXp),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    await batch.commit();
    return earnedXp;
  } catch (err) {
    console.error('[socialService] logLiveCallSessionInCloud failed:', err);
    return 0;
  }
}

export async function updateUserVerificationTickInCloud(
  targetUid: string,
  tick: 'green' | 'red' | 'black'
): Promise<boolean> {
  if (!targetUid) return false;
  try {
    await setDoc(
      doc(db, 'users', targetUid),
      {
        verificationTick: tick,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error('[socialService] updateUserVerificationTickInCloud failed:', err);
    return false;
  }
}
