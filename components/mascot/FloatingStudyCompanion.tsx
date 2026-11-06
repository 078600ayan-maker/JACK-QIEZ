'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Sparkles, MessageCircle, Volume2 } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { getJackVoice } from '@/lib/jackVoiceSynthesizer';
import { playClickSound, playCorrectChime, playLevelUpCelebration } from '@/lib/audioEngine';

interface FloatingStudyCompanionProps {
  customMessage?: string;
  onClick?: () => void;
  className?: string;
}

export const FloatingStudyCompanion: React.FC<FloatingStudyCompanionProps> = ({
  customMessage,
  onClick,
  className = ''
}) => {
  const { profile } = useUserStore();
  const [showBubble, setShowBubble] = useState(true);
  const [isTalking, setIsTalking] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<string>(
    customMessage || 'Choose a subject to keep your streak!'
  );

  const avatarPreset = profile?.customAvatar?.preset || 'steve';
  const userLang = profile?.languagePreference || 'hi';

  const voicelines = [
    'Superb meri jaan! Aaj kaunsa subject crack karenge?',
    'JAC Board exam mein full marks laane hain!',
    'Streak break mat hone dena, aag laga do!',
    'Mathematics formulas revise kar lo aaj!',
    'Shaandar taiyari chal rahi hai boss!'
  ];

  const handleCompanionClick = () => {
    playClickSound();
    playCorrectChime();
    setIsTalking(true);

    const randomLine = voicelines[Math.floor(Math.random() * voicelines.length)];
    setCurrentPrompt(randomLine);
    setShowBubble(true);

    try {
      const voice = getJackVoice();
      voice.speakHinglish(randomLine);
    } catch {
      // Speech fallback
    }

    setTimeout(() => {
      setIsTalking(false);
    }, 2500);

    if (onClick) onClick();
  };

  return (
    <div
      className={`fixed bottom-20 right-4 z-30 flex flex-col items-end select-none pointer-events-auto ${className}`}
    >
      {/* Speech Bubble (From Screenshot 1 & 2) */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            className="mb-1.5 max-w-[190px] p-2.5 rounded-2xl rounded-br-sm bg-[rgba(15,23,42,0.92)] backdrop-blur-xl border border-amber-500/40 shadow-[0_8px_24px_rgba(0,0,0,0.6),0_0_15px_rgba(245,158,11,0.2)]"
          >
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-amber-400">
              <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>JACK BUDDY</span>
              {isTalking && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping ml-auto" />
              )}
            </div>
            <p className="text-[11px] font-bold text-white leading-tight mt-1">
              {currentPrompt}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Robot / Avatar Floating Companion (Exact reproduction of Screenshot 1 & 2 mascot) */}
      <motion.button
        onClick={handleCompanionClick}
        animate={{
          y: [0, -6, 0],
          rotate: isTalking ? [-3, 3, -3, 0] : 0
        }}
        transition={{
          y: {
            duration: 2.8,
            repeat: Infinity,
            ease: 'easeInOut'
          },
          rotate: {
            duration: 0.3,
            repeat: isTalking ? Infinity : 0
          }
        }}
        whileTap={{ scale: 0.9 }}
        className="relative group cursor-pointer"
        aria-label="Study Companion Mascot"
      >
        {/* Glowing Aura Ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-amber-500/30 to-emerald-400/20 blur-md group-hover:scale-110 transition-transform" />

        {/* Mascot Character Body SVG matching Screenshot 1 & 2 */}
        <div className="relative w-14 h-18 flex items-center justify-center filter drop-shadow-[0_8px_12px_rgba(0,0,0,0.7)]">
          <svg
            viewBox="0 0 100 120"
            className="w-14 h-18 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Academic Cap / Halo */}
            <ellipse cx="50" cy="18" rx="22" ry="7" fill="#F59E0B" fillOpacity="0.4" stroke="#FBBF24" strokeWidth="2" />
            <polygon points="50,10 75,18 50,26 25,18" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.5" />
            <line x1="50" y1="18" x2="68" y2="28" stroke="#F59E0B" strokeWidth="1.5" />
            <circle cx="68" cy="29" r="2" fill="#F59E0B" />

            {/* Robot Head Frame */}
            <rect x="22" y="26" width="56" height="42" rx="14" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2.5" />
            
            {/* Screen Visor */}
            <rect x="28" y="32" width="44" height="28" rx="8" fill="#0A0F1D" />

            {/* Glowing Green Expressive Eyes (From Screenshot 1 & 2) */}
            <ellipse cx="40" cy="45" rx="5" ry="6" fill="#10B981" />
            <ellipse cx="60" cy="45" rx="5" ry="6" fill="#10B981" />
            <circle cx="41" cy="43" r="1.8" fill="#A7F3D0" />
            <circle cx="61" cy="43" r="1.8" fill="#A7F3D0" />
            {/* Little smile */}
            <path d="M46 51 Q50 55 54 51" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" fill="none" />

            {/* Cheerful Ear Nodes */}
            <circle cx="21" cy="46" r="3.5" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1.5" />
            <circle cx="79" cy="46" r="3.5" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1.5" />

            {/* Collar & Tie */}
            <path d="M38 68 L50 78 L62 68 Z" fill="#2563EB" />
            <circle cx="50" cy="72" r="2" fill="#F59E0B" />

            {/* Cyber Robotic Body / Floating Dress */}
            <path
              d="M32 70 C32 70, 26 95, 36 108 C42 115, 58 115, 64 108 C74 95, 68 70, 68 70 Z"
              fill="url(#bodyGrad)"
              stroke="#475569"
              strokeWidth="2"
            />

            {/* Arm Details */}
            <path d="M26 74 Q18 85 24 94" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
            <circle cx="24" cy="94" r="3" fill="#94A3B8" />

            <path d="M74 74 Q82 85 76 94" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
            <circle cx="76" cy="94" r="3" fill="#94A3B8" />

            {/* Floating Energy Rings / Jets */}
            <ellipse cx="50" cy="112" rx="14" ry="4" fill="#38BDF8" fillOpacity="0.6" />
            <ellipse cx="50" cy="116" rx="9" ry="2.5" fill="#38BDF8" fillOpacity="0.4" />

            <defs>
              <linearGradient id="bodyGrad" x1="50" y1="70" x2="50" y2="115" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1E293B" />
                <stop offset="0.6" stopColor="#334155" />
                <stop offset="1" stopColor="#1E1B4B" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </motion.button>
    </div>
  );
};
