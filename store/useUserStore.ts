import { create } from 'zustand';
import { UserProfile } from '@/types/user';
import { AvatarCustomization } from '@/types/avatar';
import { fetchUserProfile, syncOnLevelComplete, getLocalUserProfile, saveLocalUserProfile } from '@/lib/firestore';
import { setLanguagePreferenceInCloud, syncUserOreScoreToCloud } from '@/lib/firebaseAuthMultiplayer';
import { getUserCurrentOreTier } from '@/types/ranking';

interface UserState {
  profile: UserProfile | null;
  activeSubjectId: string;
  isLoading: boolean;
  isGuest: boolean;

  // Actions
  initUser: (uid: string, name?: string, email?: string) => Promise<void>;
  initGuest: () => void;
  setActiveSubjectId: (subId: string) => void;
  setLanguagePreference: (lang: 'hi' | 'en') => Promise<void>;
  updateCustomAvatar: (avatar: AvatarCustomization) => void;
  updateProfilePhoto: (photoURL: string) => void;
  recordLevelCompletion: (data: {
    chId: string;
    level: number;
    scorePercent: number;
    earnedXp: number;
    newMistakeIds?: number[];
    remainingHearts: number;
  }) => Promise<void>;
  loseHeart: () => void;
  refillHearts: () => void;
  removeMistake: (questionId: number) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  activeSubjectId: 'sci', // default Science
  isLoading: true,
  isGuest: false,

  initUser: async (uid: string, name?: string, email?: string) => {
    set({ isLoading: true });
    const profile = await fetchUserProfile(uid, name, email);
    set({ profile, isLoading: false, isGuest: false });
  },

  initGuest: () => {
    const existing = getLocalUserProfile();
    if (existing) {
      set({ profile: existing, isLoading: false, isGuest: true });
    } else {
      const guestProfile: UserProfile = {
        uid: 'guest_' + Math.random().toString(36).substring(2, 9),
        name: 'Guest Scholar',
        email: 'guest@studybuddy.royal',
        xp: 120,
        streak: 1,
        lastActive: new Date().toISOString().split('T')[0],
        hearts: 5,
        progress: { sci_ch01: 0 },
        levelScores: {},
        mistakes: []
      };
      saveLocalUserProfile(guestProfile);
      set({ profile: guestProfile, isLoading: false, isGuest: true });
    }
  },

  setActiveSubjectId: (subId: string) => {
    set({ activeSubjectId: subId });
  },

  setLanguagePreference: async (lang: 'hi' | 'en') => {
    const { profile } = get();
    if (!profile) return;
    const updated = { ...profile, languagePreference: lang };
    saveLocalUserProfile(updated);
    set({ profile: updated });
    await setLanguagePreferenceInCloud(profile.uid, lang);
  },

  updateCustomAvatar: (avatar: AvatarCustomization) => {
    const { profile } = get();
    if (!profile) return;
    const updated: UserProfile = { ...profile, customAvatar: avatar, avatarId: avatar.preset };
    saveLocalUserProfile(updated);
    set({ profile: updated });
  },

  updateProfilePhoto: (photoURL: string) => {
    const { profile } = get();
    if (!profile) return;
    const updated: UserProfile = { ...profile, photoURL };
    saveLocalUserProfile(updated);
    set({ profile: updated });
  },

  recordLevelCompletion: async (data) => {
    const { profile } = get();
    if (!profile) return;
    const updated = await syncOnLevelComplete(profile.uid, data);
    set({ profile: { ...updated } });
  },

  loseHeart: () => {
    const { profile } = get();
    if (!profile) return;
    const newHearts = Math.max(0, (profile.hearts ?? 5) - 1);
    const updated = { ...profile, hearts: newHearts };
    saveLocalUserProfile(updated);
    set({ profile: updated });
  },

  refillHearts: () => {
    const { profile } = get();
    if (!profile) return;
    const updated = { ...profile, hearts: 5 };
    saveLocalUserProfile(updated);
    set({ profile: updated });
  },

  removeMistake: (questionId: number) => {
    const { profile } = get();
    if (!profile) return;
    const updatedMistakes = (profile.mistakes || []).filter(id => id !== questionId);
    const updated = { ...profile, mistakes: updatedMistakes };
    saveLocalUserProfile(updated);
    set({ profile: updated });
  }
}));
