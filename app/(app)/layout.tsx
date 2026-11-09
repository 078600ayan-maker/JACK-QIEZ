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
import { getLocalUserProfile, saveLocalUserProfile } from '@/lib/firestore';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { profile, initUser } = useUserStore();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let unsubSnapshot: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Firebase user is signed in
        if (!profile) {
          await initUser(firebaseUser.uid, firebaseUser.displayName || undefined, firebaseUser.email || undefined);
        }
        setAuthReady(true);

        // Real-Time onSnapshot Listener (Phase 2 Requirement 1)
        try {
          unsubSnapshot = onSnapshot(doc(db, 'users', firebaseUser.uid), (snap) => {
            if (snap.exists()) {
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
      } else {
        // No Firebase user — check localStorage fallback
        const local = getLocalUserProfile();
        if (!local) {
          router.replace('/login');
        } else {
          if (!profile) {
            await initUser(local.uid, local.name, local.email);
          }
          setAuthReady(true);
        }
      }
    });

    return () => {
      unsubscribe();
      if (unsubSnapshot) unsubSnapshot();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
