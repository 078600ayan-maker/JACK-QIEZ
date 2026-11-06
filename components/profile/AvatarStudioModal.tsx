'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Users, Sparkles, Flame, Share2, Bell } from 'lucide-react';
import { TactileButton } from '@/components/ui/TactileButton';
import { playClickSound } from '@/lib/audioEngine';

export interface AvatarOption {
  id: string;
  name: string;
  role: string;
  icon: string;
  bgGradient: string;
  borderColor: string;
  type: 'mascot' | 'steve' | 'eve' | 'pixel';
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'steve_pixel',
    name: 'Steve Pixel Companion',
    role: 'Cyan Tunic Rig (Friends see this)',
    icon: '⛏️',
    bgGradient: 'from-cyan-700 to-blue-900',
    borderColor: '#38BDF8',
    type: 'steve'
  },
  {
    id: 'eve_pixel',
    name: 'Eve / Alex Pixel Rig',
    role: 'Adventurer Scholar Rig',
    icon: '🏹',
    bgGradient: 'from-amber-700 to-orange-950',
    borderColor: '#F59E0B',
    type: 'eve'
  },
  {
    id: 'pompi_blue',
    name: 'Pompi Cyan Companion',
    role: 'Cool Shades Pompi',
    icon: '🐱',
    bgGradient: 'from-blue-600 to-sky-950',
    borderColor: '#38BDF8',
    type: 'pixel'
  },
  {
    id: 'pompi_orange',
    name: 'Pompi Amber Scholar',
    role: 'Monocle Pompi Variant',
    icon: '🦊',
    bgGradient: 'from-orange-600 to-amber-950',
    borderColor: '#F97316',
    type: 'pixel'
  },
  {
    id: 'sakura_bloom',
    name: 'Sakura Pink Buddy',
    role: 'Floral Focus Rig',
    icon: '🌸',
    bgGradient: 'from-pink-600 to-rose-950',
    borderColor: '#F472B6',
    type: 'pixel'
  },
  {
    id: 'topper_crown',
    name: 'Diamond King Crown',
    role: 'Rank #1 Obsidian League',
    icon: '👑',
    bgGradient: 'from-amber-500 to-yellow-950',
    borderColor: '#FBBF24',
    type: 'pixel'
  }
];

interface AvatarStudioModalProps {
  isOpen: boolean;
  selectedAvatarId: string;
  onSelectAvatar: (avatarId: string) => void;
  onClose: () => void;
}

export const AvatarStudioModal: React.FC<AvatarStudioModalProps> = ({
  isOpen,
  selectedAvatarId,
  onSelectAvatar,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'avatar' | 'buddies'>('avatar');
  const [remindedList, setRemindedList] = useState<Record<string, boolean>>({});

  const [buddies, setBuddies] = useState([
    { id: 'b_1', name: 'Rachel Sharma', streak: 66, avatar: '🌸', status: 'active', lessons: 80, xp: 10100 },
    { id: 'b_2', name: 'Ellis Kumar', streak: 33, avatar: '⛏️', status: 'pending', lessons: 45, xp: 4500 },
    { id: 'b_3', name: 'Stephen Hansda', streak: 11, avatar: '🕶️', status: 'pending', lessons: 24, xp: 2100 }
  ]);

  if (!isOpen) return null;

  const handleRemindBuddy = (bId: string) => {
    playClickSound();
    setRemindedList(prev => ({ ...prev, [bId]: true }));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="relative w-full max-w-[460px] max-h-[85vh] rounded-3xl bg-gradient-to-b from-[#141E33] to-[#090D16] border-2 border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-xl bg-amber-500/20 text-[#F59E0B]">
                <Sparkles className="w-5 h-5 fill-[#F59E0B]" />
              </span>
              <div>
                <h3 className="text-base font-black text-white">Avatar Studio & Buddy Streak</h3>
                <span className="text-[10px] text-slate-400 font-bold">
                  Personalize 3D Voxel Rig & Study Buddies
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 2-Segment Switcher */}
          <div className="p-3 border-b border-white/10 flex gap-2">
            <button
              onClick={() => {
                playClickSound();
                setActiveTab('avatar');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'avatar'
                  ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              🎨 My Avatar Rigs
            </button>

            <button
              onClick={() => {
                playClickSound();
                setActiveTab('buddies');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'buddies'
                  ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              🔥 Buddy Streaks (Multiplayer)
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
            {activeTab === 'avatar' ? (
              <div className="grid grid-cols-2 gap-3">
                {AVATAR_OPTIONS.map((av) => {
                  const isSelected = selectedAvatarId === av.id;

                  return (
                    <button
                      key={av.id}
                      onClick={() => {
                        playClickSound();
                        onSelectAvatar(av.id);
                      }}
                      className={`
                        relative p-3 rounded-2xl border text-left flex flex-col items-center justify-center transition-all duration-150 cursor-pointer
                        bg-gradient-to-b ${av.bgGradient}
                        ${isSelected ? 'border-2 shadow-[0_0_20px_currentColor] scale-105' : 'border-white/10 hover:border-white/25 hover:scale-[1.02]'}
                      `}
                      style={{ color: isSelected ? av.borderColor : undefined }}
                    >
                      {/* Checkmark Badge */}
                      {isSelected && (
                        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_8px_#10B981]">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}

                      <span className="text-4xl mb-2 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                        {av.icon}
                      </span>
                      <h4 className="text-xs font-black text-white text-center leading-tight">
                        {av.name}
                      </h4>
                      <span className="text-[9px] font-bold text-slate-300 text-center mt-0.5">
                        {av.role}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Multiplayer Buddy Streaks Tab (Matching Airlearn reference) */
              <div className="space-y-4">
                {/* Hero Buddy Streak Banner */}
                <div className="rounded-2xl p-4 bg-gradient-to-r from-orange-500/20 via-amber-500/15 to-transparent border border-orange-500/30">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">🔥</span>
                    <div>
                      <h4 className="text-sm font-black text-white">Buddy Streak Active</h4>
                      <p className="text-[11px] text-slate-300">
                        Buddies who learn together, stay together!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-xs font-bold text-amber-300">Invite a buddy, spark the streak!</span>
                    <button
                      onClick={() => {
                        playClickSound();
                        navigator.clipboard?.writeText?.('https://jackquiz.study/buddy-invite');
                        alert('Invite link copied to clipboard!');
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500 text-black text-xs font-black hover:bg-amber-400 active:scale-95 transition-all cursor-pointer"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>Share Invite</span>
                    </button>
                  </div>
                </div>

                {/* Buddies List */}
                <div className="space-y-2">
                  <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                    Your Study Buddies
                  </h5>

                  {buddies.map((b) => {
                    const isReminded = remindedList[b.id];

                    return (
                      <div
                        key={b.id}
                        className="rounded-2xl p-3 bg-white/5 border border-white/10 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{b.avatar}</span>
                          <div>
                            <h6 className="text-xs font-bold text-white">{b.name}</h6>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
                              <span className="text-[10px] font-black text-amber-300">{b.streak} Days Streak</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemindBuddy(b.id)}
                          disabled={isReminded}
                          className={`
                            px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer
                            ${isReminded
                              ? 'bg-white/10 text-slate-400 border border-white/5'
                              : 'bg-orange-500/20 text-orange-300 border border-orange-500/40 hover:bg-orange-500/30 active:scale-95'
                            }
                          `}
                        >
                          <Bell className="w-3 h-3" />
                          <span>{isReminded ? 'Reminder sent' : 'Remind'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="p-3 border-t border-white/10">
            <TactileButton
              variant="gold"
              fullWidth
              size="md"
              onClick={() => {
                playClickSound();
                onClose();
              }}
            >
              Done & Save Rig ✓
            </TactileButton>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
