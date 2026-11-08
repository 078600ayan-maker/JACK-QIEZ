'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SubjectGlow } from '@/components/ui/SubjectGlow';
import { ParticleCanvas } from '@/components/ui/ParticleCanvas';
import { BottomDock } from '@/components/layout/BottomDock';
import { DynamicToast } from '@/components/ui/DynamicToast';
import { useUserStore } from '@/store/useUserStore';
import { getLocalUserProfile } from '@/lib/firestore';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { profile, initUser } = useUserStore();

  useEffect(() => {
    // If no user profile exists in localStorage, navigate to Login Screen
    const local = getLocalUserProfile();
    if (!local) {
      router.replace('/login');
    } else if (!profile) {
      initUser(local.uid, local.name, local.email);
    }
  }, [profile, router, initUser]);

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
