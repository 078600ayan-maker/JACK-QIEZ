'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  X,
  Check,
  Sparkles,
  RotateCcw,
  Save,
  Shirt,
  Sparkle,
  Crown,
  UserCheck,
  Eye,
  Sliders,
  Layers,
  ChevronRight
} from 'lucide-react';
import {
  AvatarCustomization,
  AvatarAnimationState,
  CHARACTER_PRESETS,
  CharacterPresetId,
  BOY_BUNDLES,
  GIRL_BUNDLES,
  BundleItem,
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
  playAvatarCheer,
  playAvatarCry,
  playCorrectDing,
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
    'bundles' | 'characters' | 'hair' | 'face' | 'tops' | 'bottoms' | 'shoes'
  >('bundles');

  const [bundleGender, setBundleGender] = useState<'boy' | 'girl'>(
    custom.gender || 'boy'
  );

  const [testAnim, setTestAnim] = useState<AvatarAnimationState>('idle');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSelectCharacter = (presetId: CharacterPresetId) => {
    playItemEquip();
    const found = CHARACTER_PRESETS.find(p => p.id === presetId);
    if (found) {
      setCustom({
        ...found.defaultCustomization,
        gender: found.gender
      });
      setBundleGender(found.gender);
      setTestAnim('cheer');
      setTimeout(() => setTestAnim('idle'), 1600);
      showToast(`Selected Character: ${found.name}`);
    }
  };

  const handleEquipBundle = (bundle: BundleItem) => {
    playItemEquip();
    setCustom(prev => ({
      ...prev,
      skinPath: bundle.skinPath,
      bundleId: bundle.id,
      bundleName: bundle.name,
      gender: bundle.gender
    }));
    setTestAnim('cheer');
    setTimeout(() => setTestAnim('idle'), 1800);
    showToast(`Equipped ${bundle.name}!`);
  };

  const handleSave = () => {
    playCorrectDing();
    onSave(custom);
    onClose();
  };

  const currentBundles = bundleGender === 'boy' ? BOY_BUNDLES : GIRL_BUNDLES;

  const tabs = [
    { id: 'bundles', label: 'BUNDLES (40)', icon: '🎁' },
    { id: 'characters', label: 'CHARACTERS (10)', icon: '👑' },
    { id: 'hair', label: '1. HAIR', icon: '✂️' },
    { id: 'face', label: '2. FACE ACCESSORIES', icon: '👓' },
    { id: 'tops', label: '3. TOP OUTFITS', icon: '👕' },
    { id: 'bottoms', label: '4. BOTTOM PANTS', icon: '👖' },
    { id: 'shoes', label: '5. SHOES', icon: '👟' }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-2xl select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="relative w-full max-w-[680px] max-h-[92vh] rounded-[28px] bg-gradient-to-b from-[#141C2E] via-[#0D1424] to-[#090D16] border-2 border-amber-500/40 shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-3.5 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/5">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                <Sparkles className="w-4 h-4 fill-amber-400" />
              </span>
              <div>
                <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                  <span>Minecraft 3D Avatar Studio</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono">
                    V2.0
                  </span>
                </h2>
                <p className="text-[10px] font-semibold text-slate-400">
                  {custom.name} {custom.bundleName ? `• ${custom.bundleName}` : '• Custom Voxel'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-[0_4px_14px_rgba(245,158,11,0.4)] active:scale-95 transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Save</span>
              </button>

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
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-emerald-500 text-slate-950 text-xs font-black shadow-lg animate-bounce">
              {toastMessage}
            </div>
          )}

          {/* 3D Interactive Stage */}
          <div className="relative w-full bg-gradient-to-b from-black/50 to-transparent flex flex-col items-center justify-center pt-2 pb-1 shrink-0 border-b border-white/5">
            {/* 360 Hint Pill */}
            <div className="absolute top-2 left-3 z-20 px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-[9px] font-mono text-slate-400 flex items-center gap-1">
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
                title="Cheer"
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
                title="Cry"
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
                🏆 Victory
              </button>
            </div>

            {/* The 3D Minecraft Character */}
            <div className="relative w-full flex items-center justify-center">
              <MinecraftAvatar3D
                customization={custom}
                animation={testAnim}
                size={230}
                showPedestal={true}
                interactive={true}
              />
            </div>
          </div>

          {/* Navigation Category Tabs (Horizontal Scrollbar) */}
          <div className="flex items-center gap-1 p-2 bg-black/40 border-b border-white/10 overflow-x-auto shrink-0 scrollbar-none">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  playPop();
                  setActiveTab(t.id as any);
                }}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === t.id
                    ? 'bg-amber-500 text-slate-950 shadow-[0_2px_10px_rgba(245,158,11,0.4)]'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content Panels (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
            {/* 1. BUNDLES (40 Preloaded Bundles) */}
            {activeTab === 'bundles' && (
              <div className="space-y-4">
                {/* Gender Toggle for Bundles */}
                <div className="flex items-center justify-between p-1.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 pl-2">
                    Bundle Gender:
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        playClickSound();
                        setBundleGender('boy');
                      }}
                      className={`py-1 px-4 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        bundleGender === 'boy'
                          ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.5)]'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      👦 Boys Bundles (20)
                    </button>
                    <button
                      onClick={() => {
                        playClickSound();
                        setBundleGender('girl');
                      }}
                      className={`py-1 px-4 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        bundleGender === 'girl'
                          ? 'bg-pink-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.5)]'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      👧 Girls Bundles (20)
                    </button>
                  </div>
                </div>

                {/* 4 Sections of 5 Bundles Each */}
                {Object.entries(currentBundles).map(([sectionTitle, items]) => (
                  <div key={sectionTitle} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
                        {sectionTitle}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {items.length} Outfits
                      </span>
                    </div>

                    {/* 5 Cards Per Row on Desktop / Responsive Swiper */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                      {items.map(bundle => {
                        const isEquipped = custom.skinPath === bundle.skinPath;
                        return (
                          <div
                            key={bundle.id}
                            onClick={() => handleEquipBundle(bundle)}
                            className={`group relative p-2 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center ${
                              isEquipped
                                ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                            }`}
                          >
                            {/* Skin Preview Icon */}
                            <div className="relative w-14 h-14 rounded-xl bg-black/60 border border-white/10 overflow-hidden flex items-center justify-center mb-1.5 shadow-inner">
                              <Image
                                src={bundle.previewImage}
                                alt={bundle.name}
                                width={56}
                                height={56}
                                className="object-contain"
                              />
                              {isEquipped && (
                                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-400 text-black flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </div>
                              )}
                            </div>

                            <h5 className="text-[11px] font-black text-white truncate w-full leading-tight">
                              {bundle.name}
                            </h5>
                            <p className="text-[9px] text-slate-400 truncate w-full mt-0.5">
                              {bundle.character}
                            </p>

                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleEquipBundle(bundle);
                              }}
                              className={`w-full mt-2 py-1 px-1.5 rounded-lg text-[9px] font-black transition-all cursor-pointer ${
                                isEquipped
                                  ? 'bg-amber-400 text-slate-950 font-black'
                                  : 'bg-white/10 hover:bg-white/20 text-slate-300'
                              }`}
                            >
                              {isEquipped ? 'Equipped' : 'Apply'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 2. CHARACTERS (10 Canonical Characters) */}
            {activeTab === 'characters' && (
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Select Canonical Character (5 Boys & 5 Girls)
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {CHARACTER_PRESETS.map(p => {
                    const isSelected = custom.preset === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSelectCharacter(p.id)}
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
                            {p.name} ({p.gender === 'boy' ? 'Boy' : 'Girl'})
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

            {/* 3. HAIR */}
            {activeTab === 'hair' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                    Hair Styles
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'classic', name: 'Classic Steve Trim' },
                      { id: 'braid', name: 'Alex Explorer Braid' },
                      { id: 'curly', name: 'Curly Afro Volume' },
                      { id: 'spiky', name: 'Anime Shonen Spikes' },
                      { id: 'ponytail', name: 'Warrior Ponytail' },
                      { id: 'hooded', name: 'Creeper Hood Shadow' }
                    ].map(h => (
                      <button
                        key={h.id}
                        onClick={() => {
                          playItemEquip();
                          setCustom({ ...custom, hairStyle: h.id as any });
                        }}
                        className={`p-2.5 rounded-2xl border text-left text-xs font-black transition-all cursor-pointer ${
                          custom.hairStyle === h.id
                            ? 'bg-amber-500/20 border-amber-400 text-white'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {h.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                    Hair Colors
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {HAIR_COLORS.map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          playClickSound();
                          setCustom({ ...custom, hairColor: c.color });
                        }}
                        className={`flex items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer ${
                          custom.hairColor === c.color
                            ? 'border-amber-400 bg-white/10'
                            : 'border-white/10 bg-white/5'
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="text-[10px] font-bold text-white truncate">
                          {c.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4. FACE ACCESSORIES */}
            {activeTab === 'face' && (
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Face Accessories
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {ACCESSORIES.map(acc => {
                    const isSelected = custom.accessory === acc.id;
                    return (
                      <button
                        key={acc.id}
                        onClick={() => {
                          playItemEquip();
                          setCustom({ ...custom, accessory: acc.id });
                        }}
                        className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 text-white'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="text-xs font-black">{acc.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. TOP OUTFITS */}
            {activeTab === 'tops' && (
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Tops & Jackets
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {SHIRTS.map(s => {
                    const isSelected = custom.shirt === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          playItemEquip();
                          setCustom({ ...custom, shirt: s.id });
                        }}
                        className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 text-white'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-lg border border-white/20 shrink-0"
                          style={{ backgroundColor: s.color }}
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-black text-white truncate">
                            {s.name}
                          </h5>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. BOTTOM PANTS */}
            {activeTab === 'bottoms' && (
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Pants & Trousers
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {PANTS.map(p => {
                    const isSelected = custom.pants === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          playItemEquip();
                          setCustom({ ...custom, pants: p.id });
                        }}
                        className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 text-white'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-lg border border-white/20 shrink-0"
                          style={{ backgroundColor: p.color }}
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-black text-white truncate">
                            {p.name}
                          </h5>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 7. SHOES */}
            {activeTab === 'shoes' && (
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Footwear & Boots
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {SHOES.map(sh => {
                    const isSelected = custom.shoes === sh.id;
                    return (
                      <button
                        key={sh.id}
                        onClick={() => {
                          playItemEquip();
                          setCustom({ ...custom, shoes: sh.id });
                        }}
                        className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 text-white'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-lg border border-white/20 shrink-0"
                          style={{ backgroundColor: sh.color }}
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-black text-white truncate">
                            {sh.name}
                          </h5>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="p-3.5 bg-black/60 border-t border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-amber-300">
                Wallet: 1,450 XP
              </span>
              <span className="text-[10px] text-slate-400">
                (All 40 Bundles Unlocked)
              </span>
            </div>

            <button
              onClick={handleSave}
              className="py-2 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-[0_4px_16px_rgba(245,158,11,0.4)] active:scale-95 transition-all cursor-pointer"
            >
              Set as Profile Avatar & Equip
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
