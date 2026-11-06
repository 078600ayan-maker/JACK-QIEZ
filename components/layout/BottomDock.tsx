'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, BookOpen, ShieldAlert, Trophy, User } from 'lucide-react';
import { playClickSound } from '@/lib/audioEngine';
import { useUserStore } from '@/store/useUserStore';

export const BottomDock: React.FC = () => {
  const pathname = usePathname();
  const mistakeCount = useUserStore(s => s.profile?.mistakes?.length || 0);

  // If in quiz, hide bottom dock per Distraction-Free Quiz Theater rule
  if (pathname.startsWith('/quiz')) {
    return null;
  }

  // 5 Minimalist Royal Tabs: Home, Subjects, Vault, Ranks, Profile (Matching Screenshot 1 & 2)
  const tabs = [
    { name: 'Home', href: '/', icon: Sparkles },
    { name: 'Subjects', href: '/subjects', icon: BookOpen },
    { name: 'Vault', href: '/mistakes', icon: ShieldAlert, badge: mistakeCount > 0 ? mistakeCount : null },
    { name: 'Ranks', href: '/leaderboard', icon: Trophy },
    { name: 'Profile', href: '/profile', icon: User }
  ];

  return (
    <nav className="fixed bottom-4 inset-x-0 mx-auto w-[94%] max-w-[460px] z-40 select-none">
      <div className="flex items-center justify-around py-2 px-2.5 rounded-[999px] bg-[rgba(20,27,45,0.85)] backdrop-blur-[24px] backdrop-saturate-[180%] border-t border-white/20 border-x border-b border-white/5 shadow-[0_12px_36px_rgba(0,0,0,0.65),0_0_20px_rgba(245,158,11,0.1)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              onClick={() => playClickSound()}
              className={`
                group relative flex flex-col items-center justify-center py-1.5 px-3 rounded-full
                transition-all duration-200 ease-out
                ${isActive ? 'scale-110 text-[#F59E0B]' : 'text-slate-400 hover:text-slate-200 hover:scale-105 active:scale-95'}
              `}
            >
              {/* Active Golden Glow pill */}
              {isActive && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#F59E0B]/20 via-[#F59E0B]/10 to-[#F59E0B]/20 border border-[#F59E0B]/40 blur-[1px]" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:-translate-y-0.5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />

                {/* Notification Badge */}
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#EF4444] text-[9px] font-black text-white flex items-center justify-center shadow-[0_0_8px_#EF4444]">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] mt-1 font-semibold tracking-tight ${isActive ? 'text-[#FBBF24]' : 'text-slate-400'}`}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
