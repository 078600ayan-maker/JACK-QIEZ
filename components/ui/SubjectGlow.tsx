'use client';

import React from 'react';
import { useUserStore } from '@/store/useUserStore';

const SUBJECT_COLORS: Record<string, { primary: string; secondary: string }> = {
  sci: { primary: '#10B981', secondary: '#047857' },
  math: { primary: '#3B82F6', secondary: '#1D4ED8' },
  sst: { primary: '#F59E0B', secondary: '#B45309' },
  hin: { primary: '#F43F5E', secondary: '#BE123C' },
  eng: { primary: '#8B5CF6', secondary: '#6D28D9' }
};

export const SubjectGlow: React.FC = () => {
  const activeSubjectId = useUserStore(s => s.activeSubjectId);
  const theme = SUBJECT_COLORS[activeSubjectId] || SUBJECT_COLORS.sci;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Top Primary Radial Glow */}
      <div
        className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[140px] opacity-25 transition-all duration-700 ease-in-out"
        style={{
          background: `radial-gradient(circle, ${theme.primary} 0%, transparent 70%)`
        }}
      />

      {/* Middle Floating Aura */}
      <div
        className="absolute top-[45%] left-1/2 -translate-x-1/2 w-[450px] h-[450px] rounded-full blur-[160px] opacity-15 transition-all duration-700 ease-in-out"
        style={{
          background: `radial-gradient(circle, ${theme.secondary} 0%, transparent 65%)`
        }}
      />

      {/* Subtle Golden Dust / Starfield Grid */}
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: `radial-gradient(#F59E0B 1px, transparent 1px)`,
          backgroundSize: '36px 36px'
        }}
      />
    </div>
  );
};
