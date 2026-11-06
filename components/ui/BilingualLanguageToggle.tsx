'use client';

import React from 'react';
import { useUserStore } from '@/store/useUserStore';
import { playClickSound, playWoodClick } from '@/lib/audioEngine';
import { Globe } from 'lucide-react';

interface BilingualLanguageToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const BilingualLanguageToggle: React.FC<BilingualLanguageToggleProps> = ({
  className = '',
  size = 'md'
}) => {
  const { profile, setLanguagePreference } = useUserStore();
  const currentLang = profile?.languagePreference || 'hi';

  const handleToggle = (lang: 'hi' | 'en') => {
    if (lang === currentLang) return;
    playWoodClick();
    setLanguagePreference(lang);
  };

  const isSmall = size === 'sm';

  return (
    <div
      className={`inline-flex items-center p-1 rounded-2xl bg-[rgba(20,27,45,0.85)] backdrop-blur-xl border border-white/15 shadow-[0_4px_16px_rgba(0,0,0,0.4)] select-none ${className}`}
    >
      <div className="flex items-center gap-1">
        {/* HINDI BUTTON */}
        <button
          onClick={() => handleToggle('hi')}
          className={`flex items-center gap-1.5 py-1 px-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            currentLang === 'hi'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-[0_2px_8px_rgba(245,158,11,0.4)]'
              : 'text-slate-400 hover:text-white'
          } ${isSmall ? 'text-[10px] px-2 py-0.5' : 'text-xs'}`}
        >
          <span>🇮🇳</span>
          <span>HINDI</span>
        </button>

        {/* ENGLISH BUTTON */}
        <button
          onClick={() => handleToggle('en')}
          className={`flex items-center gap-1.5 py-1 px-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            currentLang === 'en'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-[0_2px_8px_rgba(245,158,11,0.4)]'
              : 'text-slate-400 hover:text-white'
          } ${isSmall ? 'text-[10px] px-2 py-0.5' : 'text-xs'}`}
        >
          <span>🇬🇧</span>
          <span>ENGLISH</span>
        </button>
      </div>
    </div>
  );
};
