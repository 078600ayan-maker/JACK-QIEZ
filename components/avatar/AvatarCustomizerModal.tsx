'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  Sparkles,
  RotateCcw,
  Volume2,
  Wand2,
  Save,
  Flame,
  Award
} from 'lucide-react';
import {
  AvatarCustomization,
  AvatarAnimationState,
  CHARACTER_PRESETS,
  CharacterPresetId,
  SKIN_TONES,
  EYE_COLORS,
  HAIR_COLORS,
  SHIRTS,
  PANTS,
  HOODIES,
  ELYTRA_WINGS,
  SHOES,
  ACCESSORIES
} from '@/types/avatar';
import { MinecraftAvatar3D } from './MinecraftAvatar3D';
import {
  playClickSound,
  playItemEquip,
  playWingFlap,
  playAvatarJump,
  playAvatarCheer,
  playAvatarCry,
  playCorrectDing,
  playWoodClick,
  playPop
} from '@/lib/audioEngine';

interface AvatarCustomizerModalProps {
  isOpen: boolean;
  initialCustomization?: AvatarCustomization;
  onSave: (customization: AvatarCustomization) => void;
  onClose: () => void;
}

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({
  isOpen,
  initialCustomization,
  onSave,
  onClose
}) => {
  const [custom, setCustom] = useState<AvatarCustomization>(
    initialCustomization || CHARACTER_PRESETS[0].defaultCustomization
  );
  const [activeTab, setActiveTab] = useState<
    'characters' | 'hair' | 'tops' | 'bottoms' | 'wings' | 'face'
  >('characters');
  const [testAnim, setTestAnim] = useState<AvatarAnimationState>('idle');

  if (!isOpen) return null;

  const handleSelectPreset = (presetId: CharacterPresetId) => {
    playItemEquip();
    const found = CHARACTER_PRESETS.find(p => p.id === presetId);
    if (found) {
      setCustom({ ...found.defaultCustomization });
      setTestAnim('cheer');
      setTimeout(() => setTestAnim('idle'), 1800);
    }
  };

  const handleSave = () => {
    playCorrectDing();
    onSave(custom);
    onClose();
  };

  const tabs = [
    { id: 'characters', label: 'Preset Rig', icon: '👤' },
    { id: 'hair', label: 'Hair & Style', icon: '💇' },
    { id: 'tops', label: 'Tops & Hoodies', icon: '👕' },
    { id: 'bottoms', label: 'Pants & Shoes', icon: '👖' },
    { id: 'wings', label: 'Elytra Wings', icon: '🪶' },
    { id: 'face', label: 'Face & Accessories', icon: '👑' }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="relative w-full max-w-[480px] max-h-[92vh] rounded-3xl bg-gradient-to-b from-[#141C2E] via-[#0D1424] to-[#090D16] border-2 border-amber-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-3.5 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Sparkles className="w-4 h-4 fill-amber-400" />
              </span>
              <div>
                <h2 className="text-base font-black text-white tracking-tight">
                  Minecraft 3D Avatar Studio
                </h2>
                <p className="text-[10px] font-semibold text-slate-400">
                  Custom Voxel Character • 50+ Attributes
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 3D Interactive Stage */}
          <div className="relative w-full bg-gradient-to-b from-black/40 to-transparent flex flex-col items-center justify-center pt-2 pb-1 shrink-0">
            {/* 360 Hint Pill */}
            <div className="absolute top-2 left-3 z-20 px-2 py-0.5 rounded-full bg-black/50 border border-white/10 text-[9px] font-mono text-slate-400 flex items-center gap-1">
              <RotateCcw className="w-2.5 h-2.5 animate-spin" />
              <span>Drag to Spin 360°</span>
            </div>

            {/* Test Animation Reaction Controls */}
            <div className="absolute top-2 right-3 z-20 flex items-center gap-1">
              <button
                onClick={() => {
                  playAvatarCheer();
                  setTestAnim('cheer');
                  setTimeout(() => setTestAnim('idle'), 2200);
                }}
                title="Cheer on correct answer"
                className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-black text-emerald-300 hover:bg-emerald-500/30 active:scale-95 transition-all cursor-pointer"
              >
                🎉 Cheer
              </button>
              <button
                onClick={() => {
                  playAvatarCry();
                  setTestAnim('cry');
                  setTimeout(() => setTestAnim('idle'), 2200);
                }}
                title="Cry on wrong answer"
                className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-[9px] font-black text-red-300 hover:bg-red-500/30 active:scale-95 transition-all cursor-pointer"
              >
                😢 Cry
              </button>
              <button
                onClick={() => {
                  playCorrectDing();
                  setTestAnim('victory');
                  setTimeout(() => setTestAnim('idle'), 2500);
                }}
                title="Trophy Victory"
                className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[9px] font-black text-amber-300 hover:bg-amber-500/30 active:scale-95 transition-all cursor-pointer"
              >
                🏆 Trophy
              </button>
            </div>

            {/* 3D Avatar Canvas */}
            <MinecraftAvatar3D
              customization={custom}
              animation={testAnim}
              size={210}
              showPedestal={true}
              interactive={true}
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 px-3 py-2 bg-black/30 border-y border-white/10 overflow-x-auto no-scrollbar shrink-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  playWoodClick();
                  setActiveTab(tab.id as typeof activeTab);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-[0_2px_8px_rgba(245,158,11,0.4)]'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content Panels (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
            {/* 1. CHARACTER PRESETS */}
            {activeTab === 'characters' && (
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Select Base Rig (8 Minecraft Protagonists)
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {CHARACTER_PRESETS.map(p => {
                    const isSelected = custom.preset === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSelectPreset(p.id)}
                        className={`group relative text-left p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-xl shrink-0">
                          {p.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-black text-white truncate">
                            {p.name}
                          </h4>
                          <p className="text-[9px] text-slate-400 truncate">
                            {p.title}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-amber-400 text-black flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. HAIR & STYLES */}
            {activeTab === 'hair' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                    Hair Styles (7 Voxel Cuts)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'classic', name: 'Classic Steve Trim' },
                      { id: 'braid', name: 'Alex Explorer Braid' },
                      { id: 'curly', name: 'Curly Afro Volume' },
                      { id: 'spiky', name: 'Anime Spiky Locks' },
                      { id: 'ponytail', name: 'High Ponytail' },
                      { id: 'hooded', name: 'Hooded Shadow' },
                      { id: 'bald', name: 'Clean Shaved' }
                    ].map(style => (
                      <button
                        key={style.id}
                        onClick={() => {
                          playItemEquip();
                          setCustom(c => ({ ...c, hairStyle: style.id as any }));
                        }}
                        className={`p-2.5 rounded-xl text-xs font-black border text-left transition-all cursor-pointer ${
                          custom.hairStyle === style.id
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {style.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                    Hair Palette (8 Tones)
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {HAIR_COLORS.map(hc => (
                      <button
                        key={hc.id}
                        onClick={() => {
                          playPop();
                          setCustom(c => ({ ...c, hairColor: hc.color }));
                        }}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          custom.hairColor === hc.color
                            ? 'border-amber-400 bg-amber-500/20'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-lg border border-white/30 shadow-sm"
                          style={{ backgroundColor: hc.color }}
                        />
                        <span className="text-[9px] font-bold text-slate-300 truncate w-full text-center">
                          {hc.name.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. TOPS & HOODIES */}
            {activeTab === 'tops' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                    Shirts & Armor Plates (9 Rigs)
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {SHIRTS.map(s => (
                      <button
                        key={s.id}
                        onClick={() => {
                          playItemEquip();
                          setCustom(c => ({ ...c, shirt: s.id }));
                        }}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          custom.shirt === s.id
                            ? 'border-amber-400 bg-amber-500/20'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-lg border border-white/30 shadow-inner flex items-center justify-center text-xs"
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="text-[9px] font-black text-slate-300 truncate w-full text-center">
                          {s.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                    Outerwear & Capes (6 Hoodies)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {HOODIES.map(h => (
                      <button
                        key={h.id}
                        onClick={() => {
                          playWoodClick();
                          setCustom(c => ({ ...c, hoodie: h.id }));
                        }}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                          custom.hoodie === h.id
                            ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                            : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-base">{h.icon}</span>
                        <span className="text-[10px] font-bold truncate">
                          {h.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4. BOTTOMS & SHOES */}
            {activeTab === 'bottoms' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                    Pants & Greaves (8 Styles)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {PANTS.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          playItemEquip();
                          setCustom(c => ({ ...c, pants: p.id }));
                        }}
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                          custom.pants === p.id
                            ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                            : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-md border border-white/20 shrink-0"
                          style={{ backgroundColor: p.color }}
                        />
                        <span className="text-[10px] font-black truncate">
                          {p.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                    Shoes & Sabatons (7 Footwear)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {SHOES.map(s => (
                      <button
                        key={s.id}
                        onClick={() => {
                          playItemEquip();
                          setCustom(c => ({ ...c, shoes: s.id }));
                        }}
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                          custom.shoes === s.id
                            ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                            : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-md border border-white/20 shrink-0"
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="text-[10px] font-black truncate">
                          {s.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. ELYTRA WINGS */}
            {activeTab === 'wings' && (
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Articulated Elytra Gliders (With Flap Physics)
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {ELYTRA_WINGS.map(w => (
                    <button
                      key={w.id}
                      onClick={() => {
                        playWingFlap();
                        setCustom(c => ({ ...c, elytra: w.id }));
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer text-center ${
                        custom.elytra === w.id
                          ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-2xl">{w.icon}</span>
                      <span className="text-xs font-black text-white">
                        {w.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 6. FACE & ACCESSORIES */}
            {activeTab === 'face' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                    Skin Tones (8 Hues)
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {SKIN_TONES.map(st => (
                      <button
                        key={st.id}
                        onClick={() => {
                          playPop();
                          setCustom(c => ({ ...c, skinTone: st.color }));
                        }}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          custom.skinTone === st.color
                            ? 'border-amber-400 bg-amber-500/20'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-lg border border-white/30 shadow-sm"
                          style={{ backgroundColor: st.color }}
                        />
                        <span className="text-[9px] font-bold text-slate-300 truncate w-full text-center">
                          {st.name.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                    Eye Irises (8 Colors)
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {EYE_COLORS.map(ec => (
                      <button
                        key={ec.id}
                        onClick={() => {
                          playPop();
                          setCustom(c => ({ ...c, eyeColor: ec.color }));
                        }}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          custom.eyeColor === ec.color
                            ? 'border-amber-400 bg-amber-500/20'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-full border border-white/30 shadow-sm"
                          style={{ backgroundColor: ec.color }}
                        />
                        <span className="text-[9px] font-bold text-slate-300 truncate w-full text-center">
                          {ec.name.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                    Accessories & Headgear (6 Equips)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {ACCESSORIES.map(acc => (
                      <button
                        key={acc.id}
                        onClick={() => {
                          playItemEquip();
                          setCustom(c => ({ ...c, accessory: acc.id }));
                        }}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                          custom.accessory === acc.id
                            ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                            : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-base">{acc.icon}</span>
                        <span className="text-[10px] font-black truncate">
                          {acc.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="p-3.5 border-t border-white/10 bg-white/5 flex items-center justify-between shrink-0">
            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 py-2.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-xs shadow-[0_4px_0_#B45309,0_0_20px_rgba(245,158,11,0.5)] active:translate-y-1 active:shadow-[0_1px_0_#B45309] transition-all cursor-pointer"
            >
              <Save className="w-4 h-4 fill-black" />
              <span>SAVE CUSTOM RIG</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
