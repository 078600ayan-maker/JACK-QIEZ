'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles, UserCheck, CheckCircle2, ShieldCheck } from 'lucide-react';
import { CLASSIC_PROFILE_PHOTOS, ClassicProfilePhoto } from '@/types/avatar';
import { playClickSound, playCorrectDing } from '@/lib/audioEngine';

interface ProfilePhotoModalProps {
  isOpen: boolean;
  currentPhoto?: string;
  avatarCustomization?: any;
  onSave: (photoURL: string) => void;
  onClose: () => void;
}

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({
  isOpen,
  currentPhoto,
  onSave,
  onClose
}) => {
  const defaultPhoto = CLASSIC_PROFILE_PHOTOS[0].src;
  const [selectedPhoto, setSelectedPhoto] = useState<string>(currentPhoto || defaultPhoto);
  const [justSaved, setJustSaved] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'boy' | 'girl'>('all');

  useEffect(() => {
    if (currentPhoto) {
      setSelectedPhoto(currentPhoto);
    }
  }, [currentPhoto]);

  if (!isOpen) return null;

  const selectedChar =
    CLASSIC_PROFILE_PHOTOS.find((p) => p.src === selectedPhoto) || CLASSIC_PROFILE_PHOTOS[0];

  const handleSelectChar = (char: ClassicProfilePhoto) => {
    playClickSound();
    setSelectedPhoto(char.src);
  };

  const handleSave = () => {
    playCorrectDing();
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_profile_photo', selectedPhoto);
      }
    } catch (e) {
      console.warn('Could not save photo to localStorage', e);
    }
    onSave(selectedPhoto);
    setJustSaved(true);
    setTimeout(() => {
      setJustSaved(false);
      onClose();
    }, 450);
  };

  const filteredCharacters =
    activeFilter === 'all'
      ? CLASSIC_PROFILE_PHOTOS
      : CLASSIC_PROFILE_PHOTOS.filter((c) => c.gender === activeFilter);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-2xl select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', stiffness: 350, damping: 26 }}
          className="relative w-full max-w-[480px] max-h-[92dvh] rounded-[32px] bg-gradient-to-b from-[#141B2D] via-[#0D1220] to-[#080B14] border-2 border-amber-500/60 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden"
        >
          {/* =========================================================================
              1. TOP HEADER: SAVE BUTTON IS FIRST (PROMINENT) & CLOSE BUTTON
              ========================================================================= */}
          <div className="w-full flex items-center justify-between p-4 pb-3 border-b border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-transparent to-amber-500/15 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                <Sparkles className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white leading-tight">
                  Student Profile DP
                </h3>
                <p className="text-[10px] font-bold text-amber-300/80">
                  Select from 10 Main Characters
                </p>
              </div>
            </div>

            {/* SAVE BUTTON PLACED FIRST AND PROMINENT AS REQUESTED */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="py-2 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_3px_15px_rgba(245,158,11,0.6)] border border-[#FDE68A] bg-gradient-to-b from-[#FDE68A] via-[#F59E0B] to-[#B45309] text-slate-950 active:scale-95 transition-all cursor-pointer"
              >
                {justSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                    <span>SAVED!</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>SAVE DP</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  onClose();
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* =========================================================================
              2. ACTIVE SELECTION PREVIEW (GOLD ROTATING GLASS RING)
              ========================================================================= */}
          <div className="p-3 bg-gradient-to-b from-black/50 to-transparent border-b border-white/5 flex items-center justify-between gap-4 shrink-0 px-4">
            <div className="flex items-center gap-3 min-w-0">
              {/* Rotating Gold Ring Avatar */}
              <div className="relative w-16 h-16 rounded-full flex items-center justify-center p-[3px] shrink-0">
                <div
                  className="absolute inset-0 rounded-full animate-spin [animation-duration:10s]"
                  style={{
                    background:
                      'conic-gradient(from 0deg, #F59E0B, #FDE68A 25%, #B45309 50%, #FDE68A 75%, #F59E0B 100%)',
                    boxShadow: '0 0 20px rgba(245,158,11,0.6)'
                  }}
                />
                <div className="absolute inset-[2px] rounded-full border border-amber-200/60 backdrop-blur-sm pointer-events-none" />

                <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-950 border border-[#0F1424] shadow-xl">
                  <img
                    src={selectedPhoto}
                    alt={selectedChar.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/profile_photos/IMG_20261109_001512.png';
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Active Scholar Text */}
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                  Active Selection
                </span>
                <h4 className="text-sm font-black text-white truncate">
                  {selectedChar.name} • {selectedChar.character}
                </h4>
                <p className="text-[11px] text-slate-300 truncate font-medium">
                  {selectedChar.role}
                </p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 shrink-0 bg-black/40 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setActiveFilter('all')}
                className={`py-1 px-2.5 rounded-lg text-[10px] font-black transition-all ${
                  activeFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All (10)
              </button>
              <button
                onClick={() => setActiveFilter('boy')}
                className={`py-1 px-2.5 rounded-lg text-[10px] font-black transition-all ${
                  activeFilter === 'boy'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Boys
              </button>
              <button
                onClick={() => setActiveFilter('girl')}
                className={`py-1 px-2.5 rounded-lg text-[10px] font-black transition-all ${
                  activeFilter === 'girl'
                    ? 'bg-pink-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Girls
              </button>
            </div>
          </div>

          {/* =========================================================================
              3. LINE-BY-LINE LIST OF ALL 10 CHARACTERS (WITH UNDERLINE ON SELECT)
              ========================================================================= */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
              Tap any character to equip DP:
            </span>

            <div className="space-y-2">
              {filteredCharacters.map((char) => {
                const isSelected = selectedPhoto === char.src;

                return (
                  <div
                    key={char.id}
                    onClick={() => handleSelectChar(char)}
                    className={`relative p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500/25 via-amber-500/10 to-transparent border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-[1.01]'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-amber-400/40'
                    }`}
                  >
                    {/* Character Square Photo */}
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-950 border-2 border-amber-500/40 shrink-0 shadow-md">
                      <img
                        src={char.src}
                        alt={char.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/profile_photos/IMG_20261109_001512.png';
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Character Info */}
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className={`text-xs font-black truncate ${
                            isSelected ? 'text-amber-300' : 'text-white'
                          }`}
                        >
                          {char.name} ({char.character})
                        </h4>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                            char.gender === 'boy'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                          }`}
                        >
                          {char.gender === 'boy' ? 'Boy' : 'Girl'}
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-300 truncate mt-0.5 font-medium">
                        {char.role}
                      </p>

                      {/* Golden Glowing Underline when clicked per user request */}
                      {isSelected ? (
                        <div className="mt-1.5 h-[3px] w-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_10px_#F59E0B] animate-pulse" />
                      ) : (
                        <div className="mt-1.5 h-[1px] w-full rounded-full bg-white/5" />
                      )}
                    </div>

                    {/* Right Checkmark / Select Pill */}
                    <div className="shrink-0">
                      {isSelected ? (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg border border-white">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-[10px] font-bold text-slate-300">
                          Select
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* =========================================================================
              4. BOTTOM ORNATE SAVE BUTTON BAR (LIFTED PROPERLY)
              ========================================================================= */}
          <div className="p-3.5 border-t border-amber-500/30 bg-black/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-slate-400">Chosen:</span>
              <span className="text-xs font-black text-amber-300 uppercase tracking-wide truncate max-w-[140px]">
                {selectedChar.name}
              </span>
            </div>

            <button
              onClick={handleSave}
              className="py-2.5 px-6 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-[0_4px_20px_rgba(245,158,11,0.6)] border border-[#FDE68A] bg-gradient-to-b from-[#FDE68A] via-[#F59E0B] to-[#B45309] text-slate-950"
            >
              {justSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                  <span>SAVED TO PROFILE!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>SAVE AS PROFILE DP</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
