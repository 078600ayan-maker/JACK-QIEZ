'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Share2, Award } from 'lucide-react';
import { CrownBadge } from '@/components/ui/CrownBadge';
import { TactileButton } from '@/components/ui/TactileButton';
import { playClickSound } from '@/lib/audioEngine';

interface VictoryCardProps {
  studentName: string;
  chapterName: string;
  subjectTitle: string;
  xpEarned: number;
  accuracy: number;
  onClose: () => void;
}

export const VictoryCard: React.FC<VictoryCardProps> = ({
  studentName,
  chapterName,
  subjectTitle,
  xpEarned,
  accuracy,
  onClose
}) => {
  const handleShare = () => {
    playClickSound();
    const shareText = `👑 I just conquered the Boss Level in "${chapterName}" (${subjectTitle}) on Study Buddy: Royal 3D with ${accuracy}% accuracy and earned +${xpEarned} XP!`;
    if (navigator.share) {
      navigator.share({
        title: 'Study Buddy Royal Victory',
        text: shareText,
        url: window.location.origin
      }).catch(() => {});
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        className="w-full max-w-[380px] rounded-3xl p-6 bg-gradient-to-b from-[#1E1B4B] via-[#0F172A] to-[#090D16] border-2 border-[#F59E0B] shadow-[0_20px_50px_rgba(245,158,11,0.35)] relative overflow-hidden text-center"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Decorative Golden Rays */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-[#F59E0B]/20 blur-3xl pointer-events-none" />

        {/* Crown Badge */}
        <div className="flex justify-center mb-3">
          <CrownBadge size="lg" animated />
        </div>

        <div className="text-[11px] font-black uppercase tracking-widest text-[#FBBF24]">
          ROYAL MASTERY CITATION
        </div>

        <h2 className="text-xl font-black text-white mt-1 mb-1 tracking-tight">
          {studentName || 'Royal Scholar'}
        </h2>

        <p className="text-xs text-slate-300 font-medium px-4 mb-4">
          Conquered Boss Level in <br />
          <strong className="text-amber-300">{chapterName}</strong>
        </p>

        {/* Stats Grid on Postcard */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 mb-5">
          <div className="text-center p-2 rounded-xl bg-white/5">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Accuracy</div>
            <div className="text-lg font-black text-emerald-400">{accuracy}%</div>
          </div>
          <div className="text-center p-2 rounded-xl bg-white/5">
            <div className="text-[10px] text-slate-400 font-bold uppercase">XP Awarded</div>
            <div className="text-lg font-black text-amber-300">+{xpEarned}</div>
          </div>
        </div>

        {/* Action Button */}
        <TactileButton
          variant="gold"
          fullWidth
          size="md"
          onClick={handleShare}
          className="flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          <span>SHARE TO WHATSAPP</span>
        </TactileButton>
      </motion.div>
    </div>
  );
};
