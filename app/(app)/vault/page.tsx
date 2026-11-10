'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  RotateCcw,
  Camera,
  Shirt,
  Shield,
  Eye,
  Check,
  BookOpen,
  Award,
  Crown,
  ChevronRight,
  Flame,
  Zap
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import {
  CHARACTER_PRESETS,
  CANONICAL_10_CHARACTERS,
  CharacterPresetId,
  BOY_BUNDLES,
  GIRL_BUNDLES,
  BundleItem,
  AvatarCustomization
} from '@/types/avatar';
import { MinecraftVoxelCharacter, VoxelEmote, VoxelPedestalType } from '@/components/avatar/MinecraftVoxelCharacter';
import {
  playClickSound,
  playItemEquip,
  playCorrectDing,
  playPop
} from '@/lib/audioEngine';
import { JAC_CLASS_10_FORMULAS, BoardFormulaItem } from '@/lib/formulasBank';

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

export default function VaultPage() {
  const router = useRouter();
  const { profile, updateCustomAvatar, updateProfilePhoto } = useUserStore();

  const [activeMainTab, setActiveMainTab] = useState<'avatar' | 'mistakes' | 'formulas'>('avatar');
  const [activeSubTab, setActiveSubTab] = useState<'bundles' | 'characters'>('bundles');
  const [bundleGender, setBundleGender] = useState<'boy' | 'girl'>(profile?.customAvatar?.gender || 'boy');
  const [characterFilter, setCharacterFilter] = useState<'all' | 'boy' | 'girl'>('all');
  const [formulaFilter, setFormulaFilter] = useState<'All' | 'Math' | 'Science' | 'Hindi & English Tips'>('All');
  const [formulaSearch, setFormulaSearch] = useState('');
  const [activeLeitnerBox, setActiveLeitnerBox] = useState<number>(1);

  // Voxel Rig Controls
  const [testAnim, setTestAnim] = useState<VoxelEmote>('idle');
  const [pedestalType, setPedestalType] = useState<VoxelPedestalType>('diamond');
  const [showSecondLayer, setShowSecondLayer] = useState<boolean>(true);
  const [showCape, setShowCape] = useState<boolean>(false);
  const [zoomMode, setZoomMode] = useState<'full' | 'head'>('full');
  const [equipFlash, setEquipFlash] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastExtractedFace, setLastExtractedFace] = useState<string>('');

  const currentCustom: AvatarCustomization =
    profile?.customAvatar || CHARACTER_PRESETS[0].defaultCustomization;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  const triggerEquipFlash = () => {
    setEquipFlash(true);
    setTimeout(() => setEquipFlash(false), 450);
  };

  const handleEquipBundle = (bundle: BundleItem) => {
    playItemEquip();
    triggerEquipFlash();
    const updated = {
      ...currentCustom,
      skinPath: bundle.skinPath,
      name: bundle.name
    };
    updateCustomAvatar(updated);
    setTestAnim('cheer');
    setTimeout(() => setTestAnim('idle'), 1800);
    showToast(`Equipped: ${bundle.name}`);
  };

  const handleSelectCharacter = (presetId: CharacterPresetId) => {
    playItemEquip();
    triggerEquipFlash();
    const found = CHARACTER_PRESETS.find((p) => p.id === presetId);
    if (found) {
      const newCustom = {
        ...found.defaultCustomization,
        name: found.name,
        skinPath: found.defaultCustomization.skinPath,
        gender: found.gender
      };
      updateCustomAvatar(newCustom);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_custom_avatar', JSON.stringify(newCustom));
      }
      if (found.photoURL) {
        updateProfilePhoto(found.photoURL);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_profile_photo', found.photoURL);
        }
      }
      setTestAnim('cheer');
      setTimeout(() => setTestAnim('idle'), 1800);
      showToast(`Equipped 100% Skin & DP: ${found.name}!`);
    }
  };

  const handleSetAvatarAsDP = () => {
    playCorrectDing();
    if (lastExtractedFace) {
      updateProfilePhoto(lastExtractedFace);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_profile_photo', lastExtractedFace);
      }
      showToast('✓ Dressed Face set as Profile DP!');
    }
  };

  const activeBundleGroup = bundleGender === 'boy' ? BOY_BUNDLES : GIRL_BUNDLES;
  const filteredCharacters =
    characterFilter === 'all'
      ? CANONICAL_10_CHARACTERS
      : CANONICAL_10_CHARACTERS.filter((c) => c.gender === characterFilter);

  return (
    <div className="w-full max-w-[960px] mx-auto px-2 sm:px-4 pt-2 pb-44 select-none">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs shadow-[0_8px_24px_rgba(245,158,11,0.6)] border border-yellow-200 pointer-events-none flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Header: Compact Mobile-First 3-Tab Navigator (No "AI Avatar", No "v1.1") */}
      <div className="w-full mb-3 space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-base">👑</span>
            <span className="text-sm font-black text-white tracking-tight">Royal Vault &amp; Study Hub</span>
          </div>
          <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
            40 Skins &bull; 10 Scholars
          </span>
        </div>

        {/* 3 Main Visible Tabs: 100% visible on any mobile phone */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[rgba(16,22,38,0.92)] border border-white/10 shadow-lg">
          <button
            onClick={() => {
              playClickSound();
              setActiveMainTab('avatar');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-black transition-all cursor-pointer text-center truncate ${
              activeMainTab === 'avatar'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Wardrobe (40)
          </button>
          <button
            onClick={() => {
              playClickSound();
              setActiveMainTab('mistakes');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-black transition-all cursor-pointer text-center truncate ${
              activeMainTab === 'mistakes'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Mistakes (1-5)
          </button>
          <button
            onClick={() => {
              playClickSound();
              setActiveMainTab('formulas');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-black transition-all cursor-pointer text-center truncate ${
              activeMainTab === 'formulas'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Formulas
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: AI AVATAR (v1.1) DRESSING ROOM (Left Stage + Right Bundles)
          ========================================================================= */}
      {activeMainTab === 'avatar' && (
        <div className="rounded-[32px] bg-gradient-to-b from-[#131A2D] via-[#0E1424] to-[#070A12] border-2 border-amber-500/50 shadow-[0_25px_80px_rgba(0,0,0,0.85)] flex flex-col md:flex-row overflow-hidden min-h-[580px]">
          {/* Equip Flash */}
          {equipFlash && (
            <div className="absolute inset-0 z-40 pointer-events-none bg-amber-400/20 animate-pulse" />
          )}

          {/* LEFT COLUMN: 3D VOXEL STAGE + PEDESTAL + EMOTES */}
          <div className="w-full md:w-[350px] p-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent shrink-0">
            {/* Stage Title & 1-Tap Save */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                  Interactive Stage
                </span>
                <h3 className="text-sm font-black text-white truncate max-w-[180px]">
                  {currentCustom.name || 'Skullwar Knight'}
                </h3>
              </div>

              <button
                onClick={handleSetAvatarAsDP}
                className="h-[34px] px-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-[0_2px_10px_rgba(245,158,11,0.5)] border border-[#FDE68A] bg-gradient-to-b from-[#FDE68A] via-[#F59E0B] to-[#B45309] text-slate-950 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Set as DP</span>
              </button>
            </div>

            {/* 5 Compact Emote Pills (Height: 32px) */}
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
                >
                  <span className="text-[11px]">{em.icon}</span>
                  <span className="text-[8px] font-black uppercase tracking-tighter">
                    {em.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Stage Character Render with Pedestal Block */}
            <div className="relative flex-1 min-h-[220px] flex flex-col items-center justify-center my-1 rounded-2xl bg-black/40 border border-white/5 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent pointer-events-none" />

              <MinecraftVoxelCharacter
                skinPath={currentCustom.skinPath || '/skins/boy/skullwar.png'}
                mode="stage"
                size={220}
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

              <div className="absolute bottom-2 inset-x-0 mx-auto w-fit px-2.5 py-0.5 rounded-full bg-black/70 border border-amber-400/30 text-[9px] font-mono text-amber-300 flex items-center gap-1 shadow-md pointer-events-none">
                <RotateCcw className="w-2.5 h-2.5 text-amber-400 animate-spin [animation-duration:8s]" />
                <span>Drag to Spin 360°</span>
              </div>
            </div>

            {/* 4 Compact Voxel Toggles (Height: 34px) */}
            <div className="grid grid-cols-4 gap-1.5 mt-2">
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
              >
                <Shirt className="w-3 h-3" />
                <span>{showSecondLayer ? 'Layer: ON' : 'Layer: OFF'}</span>
              </button>

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
              >
                <Shield className="w-3 h-3" />
                <span>{showCape ? 'Cape: ON' : 'Cape: OFF'}</span>
              </button>

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
              >
                <Eye className="w-3 h-3" />
                <span>{zoomMode === 'head' ? 'Close-Up' : 'Full'}</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setPedestalType(pedestalType === 'diamond' ? 'obsidian' : 'diamond');
                }}
                className="h-[34px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black text-slate-300 flex flex-col items-center justify-center transition-all cursor-pointer"
              >
                <span>{pedestalType === 'diamond' ? '💎' : '🔮'}</span>
                <span>{pedestalType === 'diamond' ? 'Diamond' : 'Obsidian'}</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: BUNDLES (40) & CHARACTERS (10) GRID */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#090C16]/95">
            {/* Top Sub-Nav Bar (Compact Micro-Buttons) */}
            <div className="p-2 border-b border-white/10 flex flex-wrap items-center justify-between gap-1.5 shrink-0">
              <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-xl border border-white/10">
                <button
                  onClick={() => {
                    playPop();
                    setActiveSubTab('bundles');
                  }}
                  className={`py-1 px-2.5 rounded-lg font-black text-[10px] tracking-wide transition-all cursor-pointer ${
                    activeSubTab === 'bundles'
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  BUNDLES (40)
                </button>
                <button
                  onClick={() => {
                    playPop();
                    setActiveSubTab('characters');
                  }}
                  className={`py-1 px-2.5 rounded-lg font-black text-[10px] tracking-wide transition-all cursor-pointer ${
                    activeSubTab === 'characters'
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  CHARACTERS (10)
                </button>
              </div>

              {activeSubTab === 'bundles' ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setBundleGender('boy')}
                    className={`py-1 px-2 rounded-lg text-[10px] font-bold transition-all ${
                      bundleGender === 'boy'
                        ? 'bg-blue-500 text-white font-black'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    Boys (20)
                  </button>
                  <button
                    onClick={() => setBundleGender('girl')}
                    className={`py-1 px-2 rounded-lg text-[10px] font-bold transition-all ${
                      bundleGender === 'girl'
                        ? 'bg-pink-500 text-white font-black'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    Girls (20)
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCharacterFilter('all')}
                    className={`py-1 px-2 rounded-lg text-[10px] font-bold transition-all ${
                      characterFilter === 'all'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    All 10
                  </button>
                  <button
                    onClick={() => setCharacterFilter('boy')}
                    className={`py-1 px-2 rounded-lg text-[10px] font-bold transition-all ${
                      characterFilter === 'boy'
                        ? 'bg-blue-500 text-white font-black'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    Boys (5)
                  </button>
                  <button
                    onClick={() => setCharacterFilter('girl')}
                    className={`py-1 px-2 rounded-lg text-[10px] font-bold transition-all ${
                      characterFilter === 'girl'
                        ? 'bg-pink-500 text-white font-black'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    Girls (5)
                  </button>
                </div>
              )}
            </div>

            {/* Scrollable Outfits Grid */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 max-h-[500px]">
              {activeSubTab === 'bundles' ? (
                <div className="space-y-4">
                  {Object.entries(activeBundleGroup).map(([categoryTitle, skins]) => (
                    <div key={categoryTitle} className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-black uppercase text-amber-400">
                          ⚔️ {categoryTitle}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {skins.length} Outfits
                        </span>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {skins.map((skin) => {
                          const isSelected = currentCustom.skinPath === skin.skinPath;
                          const perkInfo = RARITY_PERKS[skin.id] || {
                            tier: 'diamond',
                            perk: 'Focus Aura',
                            color: '#06B6D4'
                          };

                          return (
                            <div
                              key={skin.id}
                              onClick={() => handleEquipBundle(skin)}
                              className={`group relative rounded-2xl p-1.5 transition-all cursor-pointer flex flex-col items-center ${
                                isSelected
                                  ? 'bg-amber-500/20 border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-[1.03] z-10'
                                  : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40'
                              }`}
                            >
                              <div
                                style={{ backgroundColor: `${perkInfo.color}25`, borderColor: perkInfo.color }}
                                className="w-full text-center py-0.5 rounded-md border text-[8px] font-black uppercase text-white mb-1"
                              >
                                {perkInfo.tier}
                              </div>

                              <div className="relative w-full aspect-[3/5] rounded-xl overflow-hidden bg-slate-950/80 border border-white/10 shadow-inner flex items-center justify-center p-1">
                                <MinecraftVoxelCharacter
                                  skinPath={skin.skinPath}
                                  mode="thumbnail"
                                  width={48}
                                  height={84}
                                />
                              </div>

                              <div className="mt-1 text-center w-full px-0.5">
                                <span className={`text-[10px] font-bold block truncate ${isSelected ? 'text-amber-300 font-black' : 'text-slate-200'}`}>
                                  {skin.character}
                                </span>
                                <span className="text-[8px] text-slate-400 block truncate mt-0.5 font-medium">
                                  {perkInfo.perk}
                                </span>
                              </div>

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
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {filteredCharacters.map((char) => {
                    const isSelected = currentCustom.preset === char.id;

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
                        <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-slate-950/80 border border-white/10 flex items-center justify-center p-1 shadow-inner">
                          <img
                            src={`/assets/canonical_characters/${char.id}.png`}
                            alt={char.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = char.photoURL || '/assets/profile_photos/IMG_20261109_001512.png';
                            }}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          />
                        </div>

                        <div className="mt-1.5 w-full">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-xs font-black truncate ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                              {char.name}
                            </span>
                            <span className="text-[8px] px-1 py-0.2 rounded font-bold uppercase bg-white/10 text-slate-300">
                              {char.gender}
                            </span>
                          </div>
                          <span className="text-[9px] text-amber-400/90 block truncate mt-0.5">
                            {char.role}
                          </span>
                        </div>

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
        </div>
      )}

      {/* =========================================================================
          VIEW 2: MISTAKES VAULT & LEITNER SPACED REPETITION (BOXES 1 TO 5)
          ========================================================================= */}
      {activeMainTab === 'mistakes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-lg">
                📦
              </div>
              <div>
                <h2 className="text-sm font-black text-white">Leitner Spaced Repetition</h2>
                <p className="text-[11px] text-slate-400">Master incorrect quiz questions through 5 progressive memory boxes</p>
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold text-amber-400 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30">
              {profile?.detailedMistakes?.length || 0} In Review
            </span>
          </div>

          {/* 5 Leitner Boxes Selector Tabs */}
          <div className="grid grid-cols-5 gap-1.5 p-1 rounded-2xl bg-black/60 border border-white/10">
            {[
              { box: 1, label: 'Box 1', sub: 'Daily' },
              { box: 2, label: 'Box 2', sub: '2 Days' },
              { box: 3, label: 'Box 3', sub: 'Weekly' },
              { box: 4, label: 'Box 4', sub: 'Bi-Weekly' },
              { box: 5, label: 'Box 5', sub: 'Mastered' }
            ].map(b => (
              <button
                key={b.box}
                onClick={() => {
                  playPop();
                  setActiveLeitnerBox(b.box);
                }}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                  activeLeitnerBox === b.box
                    ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white font-black shadow-md scale-105'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400'
                }`}
              >
                <span className="text-[11px] font-black">{b.label}</span>
                <span className="text-[8px] font-medium opacity-80">{b.sub}</span>
              </button>
            ))}
          </div>

          {(!profile?.detailedMistakes || profile.detailedMistakes.length === 0) ? (
            <div className="bg-[#131B26] border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">🐙</div>
              <p className="text-sm font-black text-white mb-1">No mistakes in Box {activeLeitnerBox}!</p>
              <p className="text-[11px] text-slate-400">Answer quizzes in Subjects to auto-route hard questions here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.detailedMistakes
                .filter(m => (m.boxLevel || 1) === activeLeitnerBox)
                .map((mistake) => (
                  <div
                    key={mistake.questionId}
                    className="bg-[#131B26] border border-white/10 rounded-2xl p-4 shadow-md"
                  >
                    <p className="text-xs font-bold text-white mb-3 leading-relaxed">{mistake.questionText}</p>
                    <div className="space-y-1.5 mb-3">
                      {mistake.options.map((opt, idx) => {
                        const isCorrect = idx === mistake.correctAnswer;
                        const isWrong = idx === mistake.userWrongAnswer && idx !== mistake.correctAnswer;
                        return (
                          <div
                            key={idx}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border ${
                              isCorrect
                                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                                : isWrong
                                ? 'bg-red-500/15 border-red-500/50 text-red-300'
                                : 'bg-white/5 border-white/5 text-slate-400'
                            }`}
                          >
                            {isCorrect ? '✓ ' : isWrong ? '✗ ' : ''}{opt}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">
                        Box {mistake.boxLevel} &bull; Reviewed {mistake.reviewCount}x
                      </span>
                      <button
                        onClick={() => {
                          playClickSound();
                          showToast('🔄 Retry question in subject drill!');
                        }}
                        className="px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black hover:bg-amber-500/30 transition-all cursor-pointer"
                      >
                        🔄 Retry
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 3: 50+ NCERT FORMULA BANK & BOARD EXAM WRITING TIPS
          ========================================================================= */}
      {activeMainTab === 'formulas' && (
        <div className="space-y-4">
          {/* Header & Live Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>📚 50+ Class 10 JAC Formulas &amp; Tips</span>
              </h2>
              <p className="text-[11px] text-slate-400">Strictly aligned with Class 10 JAC Board Syllabus 2027</p>
            </div>

            {/* Live Search */}
            <input
              type="text"
              placeholder="Search formula, law or theorem..."
              value={formulaSearch}
              onChange={(e) => setFormulaSearch(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 w-full sm:w-64"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {(['All', 'Math', 'Science', 'Hindi & English Tips'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => {
                  playPop();
                  setFormulaFilter(cat);
                }}
                className={`py-1 px-3 rounded-full text-xs font-black tracking-wide shrink-0 transition-all cursor-pointer ${
                  formulaFilter === cat
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10'
                }`}
              >
                {cat === 'All' ? '🔥 All 50+ Formulas' : cat}
              </button>
            ))}
          </div>

          {/* Formulas Card Grid */}
          <div className="grid grid-cols-1 gap-2.5 max-h-[600px] overflow-y-auto pr-1">
            {JAC_CLASS_10_FORMULAS
              .filter(item => formulaFilter === 'All' || item.category === formulaFilter)
              .filter(item => {
                if (!formulaSearch.trim()) return true;
                const q = formulaSearch.toLowerCase();
                return item.title.toLowerCase().includes(q) || item.formula.toLowerCase().includes(q) || item.chapter.toLowerCase().includes(q);
              })
              .map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-gradient-to-br from-[#121827] to-[#0A0E17] border border-white/10 hover:border-amber-400/40 transition-all shadow-md"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30">
                        {item.chapter}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        {item.category}
                      </span>
                    </div>

                    {item.highYield && (
                      <span className="text-[8.5px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded-full border border-emerald-500/30">
                        ★ High Yield
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-black text-white">{item.title}</h4>

                  <div className="mt-1.5 font-mono text-xs font-black text-emerald-300 bg-black/60 px-3 py-2 rounded-xl border border-emerald-500/30 break-words select-all">
                    {item.formula}
                  </div>

                  <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                    💡 <strong className="text-amber-300">Board Tip:</strong> {item.tip}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
