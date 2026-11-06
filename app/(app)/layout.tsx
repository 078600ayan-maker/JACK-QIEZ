'use client';

import React, { useEffect } from 'react';
import { SubjectGlow } from '@/components/ui/SubjectGlow';
import { ParticleCanvas } from '@/components/ui/ParticleCanvas';
import { BottomDock } from '@/components/layout/BottomDock';
import { DynamicToast } from '@/components/ui/DynamicToast';
import { useUserStore } from '@/store/useUserStore';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, initGuest } = useUserStore();

  useEffect(() => {
    // If not logged in yet, initialize as guest
    if (!profile) {
      initGuest();
    }
  }, [profile, initGuest]);

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
