'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Sparkles, MessageCircle, Volume2 } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { getJackVoice } from '@/lib/jackVoiceSynthesizer';
import { playClickSound, playCorrectChime, playLevelUpCelebration } from '@/lib/audioEngine';

import { DuolingoOctopus3D } from './DuolingoOctopus3D';

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
      className={`fixed bottom-20 right-2 z-30 flex flex-col items-end select-none pointer-events-auto ${className}`}
    >
      {/* Speech Bubble */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            className="mb-1 max-w-[200px] p-2.5 rounded-2xl rounded-br-sm bg-[rgba(15,23,42,0.92)] backdrop-blur-xl border border-emerald-500/40 shadow-[0_8px_24px_rgba(0,0,0,0.6),0_0_15px_rgba(16,185,129,0.2)]"
          >
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-emerald-400">
              <Sparkles className="w-3 h-3 text-emerald-400 fill-emerald-400" />
              <span>OCTOPOPS 3D</span>
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

      {/* 3D Green Octopus Mascot (Zero-box 100% Transparent Canvas) */}
      <div 
        onClick={handleCompanionClick}
        className="cursor-pointer active:scale-95 transition-transform"
        title="Poke OctoPops!"
      >
        <DuolingoOctopus3D
          emotion={isTalking ? 'happy' : 'idle'}
          size={95}
          showBubble={false}
          interactive={false}
        />
      </div>
    </div>
  );
};
