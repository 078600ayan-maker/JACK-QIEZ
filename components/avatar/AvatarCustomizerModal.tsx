'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  Sparkles,
  RotateCcw,
  Camera,
  Shirt,
  Shield,
  Zap,
  Flame,
  Award,
  ChevronRight,
  Eye,
  CheckCircle2
} from 'lucide-react';
import {
  AvatarCustomization,
  CHARACTER_PRESETS,
  CharacterPresetId,
  BOY_BUNDLES,
  GIRL_BUNDLES,
  BundleItem
} from '@/types/avatar';
import { MinecraftVoxelCharacter, VoxelEmote, VoxelPedestalType } from './MinecraftVoxelCharacter';
import {
  playClickSound,
  playItemEquip,
  playAvatarCheer,
  playAvatarCry,
  playCorrectDing,
  playPop
} from '@/lib/audioEngine';
import { useUserStore } from '@/store/useUserStore';

interface AvatarCustomizerModalProps {
  isOpen: boolean;
  initialCustomization?: AvatarCustomization;
  initialTab?: 'bundles' | 'characters';
  onSave: (customization: AvatarCustomization) => void;
  onClose: () => void;
}

// Rarity tiers and visual aura perks for authentic Minecraft Bedrock Dressing Room feel
const RARITY_PERKS: Record<string, { tier: 'netherite' | 'diamond' | 'emerald' | 'gold'; perk: string; color: string }> = {
  boy_skullwar: { tier: 'netherite', perk: '+20% Focus Armor', color: '#A855F7' },
  boy_galactic_mask: { tier: 'diamond', perk: 'Cosmic Recall Aura', color: '#06B6D4' },
  boy_madara: { tier: 'netherite', perk: 'Legendary Willpower', color: '#A855F7' },
  boy_levi: { tier: 'diamond', perk: 'Speed Drill Vanguard', color: '#06B6D4' },
  boy_cudey: { tier: 'gold', perk: 'Board Exam Shield', color: '#F59E0B' },
  boy_sasuke: { tier: 'netherite', perk: 'Sharingan Precision', color: '#A855F7' },
  boy_light: { tier: 'emerald', perk: 'Genius Deduction', color: '#10B981' },
  boy_baki: { tier: 'gold', perk: 'Indomitable Grit', color: '#F59E0B' },
  boy_ben10: { tier: 'diamond', perk: 'Omni-Subject Boost', color: '#06B6D4' },
  boy_kakashi: { tier: 'emerald', perk: 'Chidori Speed Drill', color: '#10B981' },
  boy_goku: { tier: 'netherite', perk: 'Ultra Instinct 95%+', color: '#A855F7' },
  boy_tanjiro: { tier: 'emerald', perk: 'Sun Breathing Focus', color: '#10B981' },
  boy_luffy: { tier: 'diamond', perk: 'Gear 5 Momentum', color: '#06B6D4' },
  boy_zoro: { tier: 'gold', perk: 'Triple-Sword Mastery', color: '#F59E0B' },
  boy_zenitsu: { tier: 'diamond', perk: 'Thunder Clap Reflex', color: '#06B6D4' },

  girl_nezuko: { tier: 'netherite', perk: 'Demon Recovery Aura', color: '#A855F7' },
  girl_hinata: { tier: 'diamond', perk: 'Gentle Step Accuracy', color: '#06B6D4' },
  girl_sakura: { tier: 'emerald', perk: 'Chakra Memory Shield', color: '#10B981' },
  girl_nami: { tier: 'gold', perk: 'Weather Math Mastery', color: '#F59E0B' },
  girl_robin: { tier: 'emerald', perk: 'Archaeologist Memory', color: '#10B981' },
  girl_konan: { tier: 'netherite', perk: 'Paper Angel Armor', color: '#A855F7' },
  girl_albedo: { tier: 'netherite', perk: 'Guardian Wall Shield', color: '#A855F7' },
  girl_monika: { tier: 'emerald', perk: 'Literature Visionary', color: '#10B981' },
  girl_himiko: { tier: 'gold', perk: 'Wildcard Speed Boost', color: '#F59E0B' },
  girl_ayano: { tier: 'diamond', perk: 'Observation Intellect', color: '#06B6D4' }
};

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({
  isOpen,
  initialCustomization,
  initialTab = 'bundles',
  onSave,
  onClose
}) => {
  const { profile, updateProfilePhoto } = useUserStore();
  const [custom, setCustom] = useState<AvatarCustomization>(
    initialCustomization || CHARACTER_PRESETS[0].defaultCustomization
  );

  // Tabs: BUNDLES (40) vs CHARACTERS (10)
  const [activeTab, setActiveTab] = useState<'bundles' | 'characters'>(initialTab);
  const [bundleGender, setBundleGender] = useState<'boy' | 'girl'>(custom.gender || 'boy');
  const [characterFilter, setCharacterFilter] = useState<'all' | 'boy' | 'girl'>('all');

  // 10 Minecraft Bedrock Dressing Room Interactive Controls
  const [testAnim, setTestAnim] = useState<VoxelEmote>('idle');
  const [pedestalType, setPedestalType] = useState<VoxelPedestalType>('diamond');
  const [showSecondLayer, setShowSecondLayer] = useState<boolean>(true);
  const [showCape, setShowCape] = useState<boolean>(false);
  const [zoomMode, setZoomMode] = useState<'full' | 'head'>('full');
  const [equipFlash, setEquipFlash] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastExtractedFace, setLastExtractedFace] = useState<string>('');

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  const triggerEquipFlash = () => {
    setEquipFlash(true);
    setTimeout(() => setEquipFlash(false), 450);
  };

  // Equip Bundle (40 Unlocked Outfits)
  const handleEquipBundle = (bundle: BundleItem) => {
    playItemEquip();
    triggerEquipFlash();
    setCustom((prev) => ({
      ...prev,
      skinPath: bundle.skinPath,
      name: bundle.name
    }));
    setTestAnim('cheer');
    setTimeout(() => setTestAnim('idle'), 1800);
    showToast(`Equipped: ${bundle.name}`);
  };

  // Select Character (10 Canonical Scholars)
  const handleSelectCharacter = (presetId: CharacterPresetId) => {
    playItemEquip();
    triggerEquipFlash();
    const found = CHARACTER_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setCustom({
        ...found.defaultCustomization,
        gender: found.gender
      });
      setTestAnim('cheer');
      setTimeout(() => setTestAnim('idle'), 1800);
      showToast(`Selected Scholar: ${found.name}`);
    }
  };

  // 1-Tap DP Snapshot: sets active front face directly to Profile DP & Home screen
  const handleSetAvatarAsDP = () => {
    playCorrectDing();
    if (lastExtractedFace) {
      updateProfilePhoto(lastExtractedFace);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_profile_photo', lastExtractedFace);
      }
      showToast('✓ Dressed Face set as Profile DP!');
    } else {
      showToast('Avatar Face Saved!');
    }
  };

  // Save changes to Global User Store & Cloud Profile
  const handleSave = () => {
    playCorrectDing();
    onSave(custom);
    showToast('Saved to Profile!');
    setTimeout(() => onClose(), 350);
  };

  const activeBundleGroup = bundleGender === 'boy' ? BOY_BUNDLES : GIRL_BUNDLES;
  const filteredCharacters =
    characterFilter === 'all'
      ? CHARACTER_PRESETS
      : CHARACTER_PRESETS.filter((c) => c.gender === characterFilter);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/92 backdrop-blur-2xl select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', stiffness: 350, damping: 26 }}
          className="relative w-full max-w-[960px] h-[92dvh] max-h-[820px] rounded-[32px] bg-gradient-to-b from-[#131A2D] via-[#0E1424] to-[#070A12] border-2 border-amber-500/50 shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col md:flex-row overflow-hidden"
        >
          {/* Equip Level-Up Flash Effect */}
          {equipFlash && (
            <div className="absolute inset-0 z-50 pointer-events-none bg-amber-400/20 animate-pulse transition-opacity" />
          )}

          {/* Toast Notification */}
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs shadow-[0_8px_24px_rgba(245,158,11,0.6)] border border-yellow-200 pointer-events-none flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>{toastMessage}</span>
            </motion.div>
          )}

          {/* =========================================================================
              LEFT COLUMN: 3D VOXEL STAGE + ROTATING PEDESTAL & BEDROCK CONTROLS
              ========================================================================= */}
          <div className="w-full md:w-[360px] p-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent shrink-0">
            {/* Top Bar: Clean "AI Avatar v1.1" Title + Compact Save */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center shadow-md font-black text-sm">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-black text-white leading-tight tracking-tight">
                      AI Avatar
                    </h3>
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-[9px] font-black text-amber-300 font-mono">
                      v1.1
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Minecraft Voxel Dressing Room
                  </p>
                </div>
              </div>

              {/* Compact Tactile Save Button (Height: 34px) */}
              <button
                onClick={handleSave}
                className="h-[34px] px-4 rounded-xl font-black text-xs uppercase tracking-wider shadow-[0_3px_12px_rgba(245,158,11,0.5)] border border-[#FDE68A] bg-gradient-to-b from-[#FDE68A] via-[#F59E0B] to-[#B45309] text-slate-950 active:scale-95 hover:brightness-110 transition-all cursor-pointer"
              >
                Save
              </button>
            </div>

            {/* 5 Compact Emote Action Pills (Height: 32px) */}
            <div className="grid grid-cols-5 gap-1.5 my-2.5 shrink-0">
              {[
                { id: 'wave', label: 'Wave', icon: '👋' },
                { id: 'cheer', label: 'Cheer', icon: '🔥' },
                { id: 'stance', label: 'Stance', icon: '⚔️' },
                { id: 'cry', label: 'Cry', icon: '😢' },
                { id: 'victory', label: 'Victory', icon: '🏆' }
              ].map((em) => (
                <button
                  key={em.id}
                  onClick={() => {
                    playClickSound();
                    setTestAnim(em.id as VoxelEmote);
                    setTimeout(() => setTestAnim('idle'), 2200);
                  }}
                  className={`h-[32px] px-1 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    testAnim === em.id
                      ? 'bg-amber-500/30 border-amber-400 text-amber-300 shadow-sm scale-105'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                  }`}
                  title={em.label}
                >
                  <span className="text-[12px]">{em.icon}</span>
                  <span className="text-[8px] font-black uppercase tracking-tighter">
                    {em.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Central 3D Interactive Stage */}
            <div className="relative flex-1 min-h-[220px] flex flex-col items-center justify-center my-1 overflow-hidden rounded-2xl bg-black/40 border border-white/5">
              {/* Radial Golden Stage Light */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent pointer-events-none" />

              {/* Equipped Badge (Top-left corner, never overlaps tabs) */}
              <div className="absolute top-2 left-2 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/90 border border-amber-400/40 text-[9px] font-black text-amber-300 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="truncate max-w-[120px]">{custom.name || 'Skullwar'}</span>
              </div>

              {/* Voxel Character Component (Deterministic CSS 3D + 2D Slicer) */}
              <MinecraftVoxelCharacter
                skinPath={custom.skinPath || '/skins/boy/skullwar.png'}
                mode="stage"
                size={230}
                animation={testAnim}
                showPedestal={true}
                pedestalType={pedestalType}
                showSecondLayer={showSecondLayer}
                showCape={showCape}
                zoomMode={zoomMode}
                showParticles={true}
                interactive={true}
                onFaceExtracted={(face) => setLastExtractedFace(face)}
              />

              {/* Drag to Spin 360° Indicator */}
              <div className="absolute bottom-2 inset-x-0 mx-auto w-fit px-2.5 py-0.5 rounded-full bg-black/70 border border-amber-400/30 text-[9px] font-mono text-amber-300 flex items-center gap-1 shadow-md pointer-events-none">
                <RotateCcw className="w-2.5 h-2.5 text-amber-400 animate-spin [animation-duration:8s]" />
                <span>Drag to Spin 360°</span>
              </div>
            </div>

            {/* Compact Minecraft-UI Toggles Row (Height: 34px each) */}
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {/* 1. 2nd Layer Toggle */}
              <button
                onClick={() => {
                  playClickSound();
                  setShowSecondLayer(!showSecondLayer);
                  showToast(showSecondLayer ? '2nd Layer: OFF' : '2nd Layer: ON');
                }}
                className={`h-[34px] rounded-xl border text-[9px] font-black flex flex-col items-center justify-center transition-all cursor-pointer ${
                  showSecondLayer
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
                title="Toggle Outer Armor Layer"
              >
                <Shirt className="w-3 h-3" />
                <span>{showSecondLayer ? 'Layer: ON' : 'Layer: OFF'}</span>
              </button>

              {/* 2. Royal Cape Toggle */}
              <button
                onClick={() => {
                  playClickSound();
                  setShowCape(!showCape);
                  showToast(showCape ? 'Cape: OFF' : 'Cape: ON');
                }}
                className={`h-[34px] rounded-xl border text-[9px] font-black flex flex-col items-center justify-center transition-all cursor-pointer ${
                  showCape
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
                title="Toggle Royal Cape"
              >
                <Shield className="w-3 h-3" />
                <span>{showCape ? 'Cape: ON' : 'Cape: OFF'}</span>
              </button>

              {/* 3. Zoom Toggle */}
              <button
                onClick={() => {
                  playClickSound();
                  setZoomMode(zoomMode === 'full' ? 'head' : 'full');
                }}
                className={`h-[34px] rounded-xl border text-[9px] font-black flex flex-col items-center justify-center transition-all cursor-pointer ${
                  zoomMode === 'head'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
                title="Toggle Camera Zoom"
              >
                <Eye className="w-3 h-3" />
                <span>{zoomMode === 'head' ? 'Close-Up' : 'Full Body'}</span>
              </button>

              {/* 4. Pedestal Toggle */}
              <button
                onClick={() => {
                  playClickSound();
                  setPedestalType(pedestalType === 'diamond' ? 'obsidian' : 'diamond');
                }}
                className="h-[34px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black text-slate-300 flex flex-col items-center justify-center transition-all cursor-pointer"
                title="Switch Pedestal Block"
              >
                <span>{pedestalType === 'diamond' ? '💎' : '🔮'}</span>
                <span>{pedestalType === 'diamond' ? 'Diamond' : 'Obsidian'}</span>
              </button>
            </div>

            {/* 1-Tap DP Snapshot Button */}
            <button
              onClick={handleSetAvatarAsDP}
              className="mt-2 w-full h-[36px] rounded-xl bg-white/5 hover:bg-white/10 border border-amber-400/40 text-amber-300 font-black text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Snap & Apply as Profile DP</span>
            </button>
          </div>

          {/* =========================================================================
              RIGHT COLUMN: MAIN CUSTOMIZATION HUB (BUNDLES 40 & CHARACTERS 10)
              ========================================================================= */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#090C16]/95">
            {/* Top Navigation Bar: BUNDLES (40) vs CHARACTERS (10) */}
            <div className="p-3 sm:p-4 border-b border-white/10 flex items-center justify-between gap-3 shrink-0 bg-white/[0.02]">
              {/* 2 Primary Tabs with Compact Height */}
              <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-2xl border border-white/10">
                <button
                  onClick={() => {
                    playPop();
                    setActiveTab('bundles');
                  }}
                  className={`py-1.5 px-4 rounded-xl font-black text-xs tracking-wider transition-all cursor-pointer ${
                    activeTab === 'bundles'
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  BUNDLES (40)
                </button>

                <button
                  onClick={() => {
                    playPop();
                    setActiveTab('characters');
                  }}
                  className={`py-1.5 px-4 rounded-xl font-black text-xs tracking-wider transition-all cursor-pointer ${
                    activeTab === 'characters'
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  CHARACTERS (10)
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  playClickSound();
                  onClose();
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-Filters Bar */}
            <div className="px-3 sm:px-4 py-2 border-b border-white/5 flex items-center justify-between bg-black/30 shrink-0">
              {activeTab === 'bundles' ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      playClickSound();
                      setBundleGender('boy');
                    }}
                    className={`py-1 px-3 rounded-lg text-xs font-bold transition-all ${
                      bundleGender === 'boy'
                        ? 'bg-blue-500 text-white font-black shadow-md'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    ♂ Boys Bundles (20)
                  </button>
                  <button
                    onClick={() => {
                      playClickSound();
                      setBundleGender('girl');
                    }}
                    className={`py-1 px-3 rounded-lg text-xs font-bold transition-all ${
                      bundleGender === 'girl'
                        ? 'bg-pink-500 text-white font-black shadow-md'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    ♀ Girls Bundles (20)
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCharacterFilter('all')}
                    className={`py-1 px-3 rounded-lg text-xs font-bold transition-all ${
                      characterFilter === 'all'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    All (10)
                  </button>
                  <button
                    onClick={() => setCharacterFilter('boy')}
                    className={`py-1 px-3 rounded-lg text-xs font-bold transition-all ${
                      characterFilter === 'boy'
                        ? 'bg-blue-500 text-white font-black shadow-md'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    Boys (5)
                  </button>
                  <button
                    onClick={() => setCharacterFilter('girl')}
                    className={`py-1 px-3 rounded-lg text-xs font-bold transition-all ${
                      characterFilter === 'girl'
                        ? 'bg-pink-500 text-white font-black shadow-md'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    Girls (5)
                  </button>
                </div>
              )}

              <span className="text-[10px] font-mono text-amber-400">
                100% Pre-Unlocked
              </span>
            </div>

            {/* Scrollable Grid of All 40 Bundles / 10 Characters */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
              {/* =====================================================================
                  TAB 1: BUNDLES (40) - ALWAYS RENDERS ASSEMBLED STANDING VOXELS
                  ===================================================================== */}
              {activeTab === 'bundles' && (
                <div className="space-y-4">
                  {Object.entries(activeBundleGroup).map(([categoryTitle, skins]) => (
                    <div key={categoryTitle} className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <span>⚔️</span>
                          <span>{categoryTitle}</span>
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          {skins.length} Outfits
                        </span>
                      </div>

                      {/* Assembled Standing Character Cards Grid */}
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {skins.map((skin) => {
                          const isSelected = custom.skinPath === skin.skinPath;
                          const perkInfo = RARITY_PERKS[skin.id] || {
                            tier: 'diamond',
                            perk: 'Focus Aura',
                            color: '#06B6D4'
                          };

                          return (
                            <div
                              key={skin.id}
                              onClick={() => handleEquipBundle(skin)}
                              style={{
                                borderColor: isSelected ? '#F59E0B' : undefined
                              }}
                              className={`group relative rounded-2xl p-1.5 transition-all cursor-pointer flex flex-col items-center ${
                                isSelected
                                  ? 'bg-amber-500/20 border-2 shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-[1.03] z-10'
                                  : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40'
                              }`}
                            >
                              {/* Rarity Tier Pill */}
                              <div
                                style={{ backgroundColor: `${perkInfo.color}25`, borderColor: perkInfo.color }}
                                className="w-full text-center py-0.5 rounded-md border text-[8px] font-black uppercase tracking-widest text-white mb-1"
                              >
                                {perkInfo.tier}
                              </div>

                              {/* Assembled Standing Minecraft Voxel Character Preview */}
                              <div className="relative w-full aspect-[3/5] rounded-xl overflow-hidden bg-slate-950/80 border border-white/10 shadow-inner flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
                                <MinecraftVoxelCharacter
                                  skinPath={skin.skinPath}
                                  mode="thumbnail"
                                  width={48}
                                  height={86}
                                />
                              </div>

                              {/* Outfit Name */}
                              <div className="mt-1 text-center w-full px-0.5">
                                <span
                                  className={`text-[10px] font-bold block truncate leading-tight ${
                                    isSelected ? 'text-amber-300 font-black' : 'text-slate-200'
                                  }`}
                                >
                                  {skin.character}
                                </span>

                                {/* Scholar Stat Aura Tag */}
                                <span className="text-[8px] text-slate-400 block truncate mt-0.5 font-medium">
                                  {perkInfo.perk}
                                </span>
                              </div>

                              {/* Active Golden Checkmark */}
                              {isSelected && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center shadow-md border border-white">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* =====================================================================
                  TAB 2: CHARACTERS (10 Canonical JAC Scholars)
                  ===================================================================== */}
              {activeTab === 'characters' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {filteredCharacters.map((char) => {
                    const isSelected = custom.preset === char.id;

                    return (
                      <div
                        key={char.id}
                        onClick={() => handleSelectCharacter(char.id)}
                        className={`group relative p-2 rounded-2xl transition-all cursor-pointer flex flex-col items-center text-center ${
                          isSelected
                            ? 'bg-amber-500/20 border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-[1.03] z-10'
                            : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40'
                        }`}
                      >
                        {/* Voxel Character Silhouette */}
                        <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-slate-950/80 border border-white/10 flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
                          <MinecraftVoxelCharacter
                            skinPath={char.defaultCustomization.skinPath || '/skins/boy/skullwar.png'}
                            mode="thumbnail"
                            width={54}
                            height={92}
                          />
                        </div>

                        {/* Scholar Name & Role */}
                        <div className="mt-1.5 w-full">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`text-xs font-black truncate ${
                                isSelected ? 'text-amber-300' : 'text-white'
                              }`}
                            >
                              {char.name}
                            </span>
                            <span className="text-[8px] px-1 py-0.2 rounded font-bold uppercase bg-white/10 text-slate-300">
                              {char.gender}
                            </span>
                          </div>
                          <span className="text-[9px] text-amber-400/90 block truncate mt-0.5 font-medium">
                            {char.role}
                          </span>
                        </div>

                        {/* Selected Golden Underline */}
                        {isSelected ? (
                          <div className="mt-1 h-[2px] w-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_8px_#F59E0B]" />
                        ) : (
                          <div className="mt-1 h-[2px] w-full bg-transparent" />
                        )}

                        {/* Checkmark */}
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center shadow-md border border-white">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
