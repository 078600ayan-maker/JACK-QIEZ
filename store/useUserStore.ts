import { create } from 'zustand';
import { UserProfile } from '@/types/user';
import { AvatarCustomization } from '@/types/avatar';
import {
  fetchUserProfile,
  syncOnLevelComplete,
  saveLocalUserProfile,
  clearLocalUserProfile,
  syncProfileFields,
} from '@/lib/firestore';
import { upsertUserInDirectory } from '@/lib/socialService';
import { setLanguagePreferenceInCloud } from '@/lib/firebaseAuthMultiplayer';

interface UserState {
  profile: UserProfile | null;
  activeSubjectId: string;
  isLoading: boolean;

  // Actions
  initUser: (uid: string, name?: string, email?: string) => Promise<void>;
  setProfile: (profile: UserProfile | null) => void;
  updateProfilePartial: (partial: Partial<UserProfile>) => Promise<void>;
  logoutUser: () => void;
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

  initUser: async (uid: string, name?: string, email?: string) => {
    set({ isLoading: true });
    const profile = await fetchUserProfile(uid, name, email);
    set({ profile, isLoading: false });
  },

  setProfile: (profile: UserProfile | null) => {
    if (profile) {
      saveLocalUserProfile(profile);
    } else {
      clearLocalUserProfile();
    }
    set({ profile, isLoading: false });
  },

  updateProfilePartial: async (partial: Partial<UserProfile>) => {
    const { profile } = get();
    if (!profile) return;
    const updated: UserProfile = { ...profile, ...partial };
    saveLocalUserProfile(updated);
    set({ profile: updated });
    await syncProfileFields(profile.uid, partial);
    void upsertUserInDirectory(updated).catch(() => {});
  },

  logoutUser: () => {
    clearLocalUserProfile();
    set({ profile: null, isLoading: false });
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
    void syncProfileFields(profile.uid, { customAvatar: avatar, avatarId: avatar.preset });
  },

  updateProfilePhoto: (photoURL: string) => {
    const { profile } = get();
    if (!profile) return;
    const updated: UserProfile = { ...profile, photoURL };
    saveLocalUserProfile(updated);
    set({ profile: updated });
    void syncProfileFields(profile.uid, { photoURL });
    void upsertUserInDirectory(updated).catch(() => {});
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
    void syncProfileFields(profile.uid, { hearts: newHearts });
  },

  refillHearts: () => {
    const { profile } = get();
    if (!profile) return;
    const updated = { ...profile, hearts: 5 };
    saveLocalUserProfile(updated);
    set({ profile: updated });
    void syncProfileFields(profile.uid, { hearts: 5 });
  },

  removeMistake: (questionId: number) => {
    const { profile } = get();
    if (!profile) return;
    const updatedMistakes = (profile.mistakes || []).filter(id => id !== questionId);
    const updated = { ...profile, mistakes: updatedMistakes };
    saveLocalUserProfile(updated);
    set({ profile: updated });
    void syncProfileFields(profile.uid, { mistakes: updatedMistakes });
  }
}));
