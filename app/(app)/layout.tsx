'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { onSnapshot, doc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { SubjectGlow } from '@/components/ui/SubjectGlow';
import { ParticleCanvas } from '@/components/ui/ParticleCanvas';
import { BottomDock } from '@/components/layout/BottomDock';
import { DynamicToast } from '@/components/ui/DynamicToast';
import { useUserStore } from '@/store/useUserStore';
import {
  getLocalUserProfile,
  saveLocalUserProfile,
  clearLocalUserProfile
} from '@/lib/firestore';
import { upsertUserInDirectory, heartbeatUserPresence } from '@/lib/socialService';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { initUser } = useUserStore();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let unsubSnapshot: (() => void) | null = null;
    let mounted = true;

    const attachLiveUserListener = (uid: string) => {
      if (unsubSnapshot) unsubSnapshot();
      try {
        unsubSnapshot = onSnapshot(doc(db, 'users', uid), (snap) => {
          if (snap.exists() && mounted) {
            const liveData = snap.data();
            useUserStore.setState((prev) => {
              const merged = prev.profile ? { ...prev.profile, ...liveData } : (liveData as any);
              saveLocalUserProfile(merged);
              return { profile: merged };
            });
          }
        });
      } catch (e) {
        console.warn('Realtime onSnapshot fallback:', e);
      }
    };

    const redirectToLoginOnly = () => {
      clearLocalUserProfile();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sbr_session_verified');
      }
      router.replace('/login');
    };

    // Instant UI unlock if session is already verified locally; still verify & attach live listener in background
    const preVerified = typeof window !== 'undefined' && localStorage.getItem('sbr_session_verified') === 'true';
    const preLocal = getLocalUserProfile();
    if (preVerified && preLocal && preLocal.uid) {
      if (!useUserStore.getState().profile) {
        useUserStore.setState({ profile: preLocal, isLoading: false });
      }
      attachLiveUserListener(preLocal.uid);
      setAuthReady(true);
    }

    // Fast-fallback timer: Wait briefly for Firebase Auth; only allow verified local session, otherwise enforce /login
    const fallbackTimer = setTimeout(async () => {
      if (!mounted) return;
      const verified = typeof window !== 'undefined' && localStorage.getItem('sbr_session_verified') === 'true';
      const local = getLocalUserProfile();
      if (verified && local && local.uid) {
        if (!useUserStore.getState().profile) {
          void initUser(local.uid, local.name, local.email);
        }
        attachLiveUserListener(local.uid);
        setAuthReady(true);
      } else {
        redirectToLoginOnly();
      }
    }, 900);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(fallbackTimer);
      if (!mounted) return;

      if (firebaseUser) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('sbr_session_verified', 'true');
        }
        // Unblock shell immediately if local profile exists; sync Firestore asynchronously
        const localMatch = getLocalUserProfile();
        if (localMatch && localMatch.uid === firebaseUser.uid) {
          if (!useUserStore.getState().profile) {
            useUserStore.setState({ profile: localMatch, isLoading: false });
          }
          attachLiveUserListener(firebaseUser.uid);
          setAuthReady(true);
        }

        await initUser(
          firebaseUser.uid,
          firebaseUser.displayName || undefined,
          firebaseUser.email || undefined
        );
        const cur = useUserStore.getState().profile;
        if (cur) {
          attachLiveUserListener(firebaseUser.uid);
          setAuthReady(true);
          void upsertUserInDirectory({
            ...cur,
            name: cur.name || firebaseUser.displayName || 'Royal Scholar',
            displayName: cur.displayName || firebaseUser.displayName || cur.name || 'Royal Scholar',
            email: cur.email || firebaseUser.email || '',
            photoURL: cur.photoURL || firebaseUser.photoURL || undefined,
            isRealUser: !firebaseUser.isAnonymous,
            isAnonymous: firebaseUser.isAnonymous,
          }).then((synced) => {
            if (mounted) {
              useUserStore.setState({ profile: synced });
              saveLocalUserProfile(synced);
            }
          }).catch(() => {});
        } else {
          attachLiveUserListener(firebaseUser.uid);
          setAuthReady(true);
        }
      } else {
        const verified = typeof window !== 'undefined' && localStorage.getItem('sbr_session_verified') === 'true';
        const local = getLocalUserProfile();
        if (verified && local && local.uid) {
          await initUser(local.uid, local.name, local.email);
          const cur = useUserStore.getState().profile;
          if (cur) {
            const synced = await upsertUserInDirectory(cur);
            useUserStore.setState({ profile: synced });
            saveLocalUserProfile(synced);
          }
          attachLiveUserListener(local.uid);
          setAuthReady(true);
        } else {
          // Brand-new or logged-out visitor: strictly redirect to /login interface ONLY
          redirectToLoginOnly();
        }
      }
    });

    return () => {
      mounted = false;
      clearTimeout(fallbackTimer);
      unsubscribe();
      if (unsubSnapshot) unsubSnapshot();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep live presence heartbeat synced every 60s for active scholar counts & battle invites
  const activeUid = useUserStore((s) => s.profile?.uid);
  useEffect(() => {
    if (!activeUid) return;
    void heartbeatUserPresence(activeUid);
    const id = setInterval(() => {
      void heartbeatUserPresence(activeUid);
    }, 60000);
    return () => clearInterval(id);
  }, [activeUid]);

  // Don't render children or BottomDock until auth is confirmed
  if (!authReady) {
    return (
      <div className="relative min-h-[100dvh] bg-[#090D16] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
          <p className="text-xs font-black text-amber-400 uppercase tracking-widest">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] bg-[#090D16] text-white overflow-x-hidden">
      {/* 60FPS Interactive Particle Canvas (Dotty Glow Nodes & Lines) */}
      <ParticleCanvas />

      {/* Dynamic Radial Mesh Glow per Subject */}
      <SubjectGlow />

      {/* Dynamic Island Notification Capsule */}
      <DynamicToast />

      {/* Centered Mobile-First Frame (max-width 480px) */}
      <div className="relative w-full max-w-[480px] mx-auto min-h-[100dvh] flex flex-col z-10">
        {children}
      </div>

      {/* 4-Tab Floating Bottom Glass Dock */}
      <BottomDock />
    </div>
  );
}
