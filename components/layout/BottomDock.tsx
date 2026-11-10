'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, BookOpen, Trophy, User, Swords } from 'lucide-react';
import { playClickSound } from '@/lib/audioEngine';

function BottomDockContent() {
  const pathname = usePathname();

  // If in quiz, hide bottom dock per Distraction-Free Quiz Theater rule
  if (pathname.startsWith('/quiz')) {
    return null;
  }

  // 6 Minimalist Royal Tabs:
  // Home, Subjects, Vault, Ranks, Profile, Battle (6th Tab with Neon NEW Badge)
  const tabs = [
    { name: 'Home', href: '/', icon: 'home' },
    { name: 'Subjects', href: '/subjects', icon: 'subjects' },
    { name: 'Vault', href: '/vault', icon: 'vault' },
    { name: 'Ranks', href: '/leaderboard', icon: 'ranks' },
    { name: 'Profile', href: '/profile', icon: 'profile' },
    { name: 'Battle', href: '/battle', icon: 'battle', isNew: true }
  ];

  return (
    <nav className="fixed bottom-3 inset-x-0 mx-auto w-[96%] max-w-[480px] z-50 select-none pb-[env(safe-area-inset-bottom)] pointer-events-auto">
      <div className="flex items-center justify-around py-1.5 px-1.5 rounded-[999px] bg-[rgba(16,22,38,0.96)] backdrop-blur-[24px] backdrop-saturate-[180%] border-t border-white/25 border-x border-b border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.85),0_0_25px_rgba(245,158,11,0.2)]">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              onClick={() => playClickSound()}
              className={`
                group relative flex flex-col items-center justify-center py-1 px-2 sm:px-2.5 rounded-full
                transition-all duration-200 ease-out
                ${
                  isActive
                    ? 'scale-105 text-amber-400 font-black'
                    : 'text-slate-400 hover:text-slate-200 hover:scale-105 active:scale-95'
                }
              `}
            >
              {/* Active Golden Glow pill */}
              {isActive && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/25 via-yellow-400/15 to-amber-500/25 border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.35)]" />
              )}

              {/* Pulsating Neon 'NEW' Badge for 6th Battle Hub Tab */}
              {tab.isNew && (
                <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-emerald-400 to-[#10B981] text-[7px] font-black text-slate-950 tracking-wider uppercase shadow-[0_0_10px_#10B981] animate-pulse z-20">
                  NEW
                </span>
              )}

              <div className="relative z-10 flex items-center justify-center">
                {tab.icon === 'home' && <Home className="w-4 h-4" />}
                {tab.icon === 'subjects' && <BookOpen className="w-4 h-4" />}
                {tab.icon === 'vault' && (
                  <svg
                    className={`w-4 h-4 ${isActive ? 'text-amber-400 fill-amber-400/30' : 'text-slate-400'}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="6" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                    <circle cx="12" cy="15" r="1.5" />
                    <path d="M12 16.5V18" />
                  </svg>
                )}
                {tab.icon === 'ranks' && <Trophy className="w-4 h-4" />}
                {tab.icon === 'profile' && <User className="w-4 h-4" />}
                {tab.icon === 'battle' && <Swords className="w-4 h-4 text-emerald-400" />}
              </div>

              <span
                className={`relative z-10 text-[9px] mt-0.5 tracking-tight ${
                  isActive
                    ? 'text-amber-300 font-black drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]'
                    : 'text-slate-400 font-semibold'
                }`}
              >
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export const BottomDock: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <BottomDockContent />
    </Suspense>
  );
};
