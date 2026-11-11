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

export interface DuelRoom {
  pin: string;
  hostUid: string;
  hostName: string;
  hostUsername: string;
  hostPhoto: string;
  hostXp: number;
  guestUid?: string;
  guestName?: string;
  guestUsername?: string;
  guestPhoto?: string;
  guestXp?: number;
  subjectId: string;
  subjectName: string;
  status: 'waiting' | 'active' | 'finished';
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
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
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
  const payload: UserProfile = {
    ...profile,
    name: cleanName,
    displayName: cleanName,
    username,
    usernameLower: username.toLowerCase(),
    nameLower: cleanName.toLowerCase(),
    followingUids,
    followersUids,
    followingCount: Math.max(followingUids.length, profile.followingCount ?? 0),
    followersCount: Math.max(followersUids.length, profile.followersCount ?? 0),
    oreRankScore: Math.max(profile.oreRankScore ?? 0, profile.xp ?? 0),
    isOnline: true,
    updatedAt: nowIso,
  };

  try {
    await setDoc(doc(db, 'users', profile.uid), stripUndefined(payload as unknown as Record<string, unknown>), {
      merge: true,
    });
  } catch (err) {
    console.error('[socialService] upsertUserInDirectory failed:', err);
  }

  return payload;
}

/**
 * Checks whether a desired username is already claimed by another user UID.
 */
export async function isUsernameAvailable(username: string, currentUid: string): Promise<boolean> {
  const clean = normalizeUsername(username, currentUid).toLowerCase();
  if (!clean) return false;
  try {
    const q = query(collection(db, 'users'), where('usernameLower', '==', clean), limit(3));
    const snap = await getDocs(q);
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
 * Searches real users in Firestore by `@username` prefix or full name prefix.
 * Empty query returns top scholars by XP.
 */
export async function searchUsersInDatabase(
  rawTerm: string,
  limitCount = 30
): Promise<UserProfile[]> {
  const term = rawTerm.trim().toLowerCase().replace(/^@+/, '');
  const resultsMap = new Map<string, UserProfile>();

  try {
    if (!term) {
      const topSnap = await getDocs(
        query(collection(db, 'users'), orderBy('xp', 'desc'), limit(limitCount))
      );
      topSnap.forEach((docSnap) => {
        const data = docSnap.data() as UserProfile;
        resultsMap.set(docSnap.id, { ...data, uid: data.uid || docSnap.id });
      });
      return Array.from(resultsMap.values());
    }

    const endTerm = `${term}\uf8ff`;
    const [byUsernameSnap, byNameSnap] = await Promise.all([
      getDocs(
        query(
          collection(db, 'users'),
          where('usernameLower', '>=', term),
          where('usernameLower', '<=', endTerm),
          limit(limitCount)
        )
      ),
      getDocs(
        query(
          collection(db, 'users'),
          where('nameLower', '>=', term),
          where('nameLower', '<=', endTerm),
          limit(limitCount)
        )
      ),
    ]);

    byUsernameSnap.forEach((docSnap) => {
      const data = docSnap.data() as UserProfile;
      resultsMap.set(docSnap.id, { ...data, uid: data.uid || docSnap.id });
    });
    byNameSnap.forEach((docSnap) => {
      const data = docSnap.data() as UserProfile;
      resultsMap.set(docSnap.id, { ...data, uid: data.uid || docSnap.id });
    });

    // Fallback substring scan over top active scholars for partial matches (e.g. searching middle chars or legacy users without *Lower)
    if (resultsMap.size < 8) {
      const recentSnap = await getDocs(
        query(collection(db, 'users'), orderBy('xp', 'desc'), limit(50))
      );
      recentSnap.forEach((docSnap) => {
        if (resultsMap.has(docSnap.id)) return;
        const data = docSnap.data() as UserProfile;
        const u = (data.username || '').toLowerCase();
        const n = (data.name || data.displayName || '').toLowerCase();
        if (u.includes(term) || n.includes(term)) {
          resultsMap.set(docSnap.id, { ...data, uid: data.uid || docSnap.id });
        }
      });
    }

    const arr = Array.from(resultsMap.values());
    arr.sort((a, b) => {
      const aExact = (a.usernameLower || a.username || '').toLowerCase() === term ? 2 : 0;
      const bExact = (b.usernameLower || b.username || '').toLowerCase() === term ? 2 : 0;
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
      onUpdate(list);
    },
    (err) => {
      console.error('[socialService] subscribeGlobalLeaderboard error:', err);
    }
  );
}

/**
 * Creates a live 4-digit PIN Duel Room in Firestore (`duel_rooms/{pin}`).
 */
export async function createDuelRoom(
  host: UserProfile,
  subjectId: string,
  subjectName: string
): Promise<DuelRoom> {
  const pin = Math.floor(1000 + Math.random() * 9000).toString();
  const now = new Date().toISOString();
  const room: DuelRoom = {
    pin,
    hostUid: host.uid,
    hostName: host.name || host.displayName || 'JAC Scholar',
    hostUsername: host.username || normalizeUsername(host.name, host.uid),
    hostPhoto: host.photoURL || '/assets/profile_photos/IMG_20261109_001512.png',
    hostXp: host.xp || 0,
    subjectId,
    subjectName,
    status: 'waiting',
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, 'duel_rooms', pin), room);
  return room;
}

/**
 * Joins an existing 4-digit PIN Duel Room in Firestore (`duel_rooms/{pin}`).
 */
export async function joinDuelRoomByPin(
  pin: string,
  guest: UserProfile
): Promise<{ ok: boolean; room?: DuelRoom; error?: string }> {
  const cleanPin = pin.trim();
  if (cleanPin.length !== 4) {
    return { ok: false, error: 'Please enter a valid 4-digit PIN.' };
  }

  try {
    const roomRef = doc(db, 'duel_rooms', cleanPin);
    const snap = await getDoc(roomRef);
    if (!snap.exists()) {
      return { ok: false, error: `No active duel room found for PIN #${cleanPin}.` };
    }

    const existing = snap.data() as DuelRoom;
    const now = new Date().toISOString();
    const updated: DuelRoom = {
      ...existing,
      guestUid: guest.uid,
      guestName: guest.name || guest.displayName || 'Challenger',
      guestUsername: guest.username || normalizeUsername(guest.name, guest.uid),
      guestPhoto: guest.photoURL || '/assets/profile_photos/classic_character_1.png',
      guestXp: guest.xp || 0,
      status: existing.hostUid === guest.uid ? existing.status : 'active',
      updatedAt: now,
    };

    await updateDoc(roomRef, {
      guestUid: updated.guestUid,
      guestName: updated.guestName,
      guestUsername: updated.guestUsername,
      guestPhoto: updated.guestPhoto,
      guestXp: updated.guestXp,
      status: updated.status,
      updatedAt: now,
    });

    return { ok: true, room: updated };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unable to join room.';
    return { ok: false, error: msg };
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
