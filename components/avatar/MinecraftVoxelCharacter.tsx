'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type VoxelPedestalType = 'diamond' | 'obsidian' | 'grass' | 'gold';
export type VoxelEmote = 'idle' | 'wave' | 'cheer' | 'stance' | 'cry' | 'victory';

interface MinecraftVoxelCharacterProps {
  skinPath?: string;
  mode?: 'stage' | 'hero' | 'thumbnail' | 'mini';
  width?: number;
  height?: number;
  size?: number;
  animation?: VoxelEmote;
  showPedestal?: boolean;
  pedestalType?: VoxelPedestalType;
  showSecondLayer?: boolean;
  showCape?: boolean;
  zoomMode?: 'full' | 'head';
  showParticles?: boolean;
  interactive?: boolean;
  rarityTier?: 'netherite' | 'diamond' | 'emerald' | 'gold';
  className?: string;
  onClick?: () => void;
  onFaceExtracted?: (faceDataUrl: string) => void;
}

interface SlicedSkinCacheItem {
  assembled2D: string;
  assembledNoOverlay2D: string;
  headFace2D: string;
}

// Global in-memory cache for ultra-fast instant rendering of all 40 bundle skins
const skinVoxelCache = new Map<string, SlicedSkinCacheItem>();

export const MinecraftVoxelCharacter: React.FC<MinecraftVoxelCharacterProps> = ({
  skinPath = '/skins/boy/skullwar.png',
  mode = 'thumbnail',
  width,
  height,
  size = 280,
  animation = 'idle',
  showPedestal = true,
  pedestalType = 'diamond',
  showSecondLayer = true,
  showCape = false,
  zoomMode = 'full',
  showParticles = true,
  interactive = true,
  rarityTier = 'diamond',
  className = '',
  onClick,
  onFaceExtracted
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [cacheItem, setCacheItem] = useState<SlicedSkinCacheItem | null>(
    skinVoxelCache.get(skinPath) || null
  );
  const [rotationY, setRotationY] = useState<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const initialRotationRef = useRef<number>(0);

  // 1. DETERMINISTIC HTML5 CANVAS SKIN SLICER
  useEffect(() => {
    if (skinVoxelCache.has(skinPath)) {
      const cached = skinVoxelCache.get(skinPath)!;
      setCacheItem(cached);
      if (onFaceExtracted) onFaceExtracted(cached.headFace2D);
      return;
    }

    let isCancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const renderComposite = (withOverlays: boolean): string => {
      const cvs = document.createElement('canvas');
      cvs.width = 64;
      cvs.height = 128;
      const ctx = cvs.getContext('2d');
      if (!ctx) return '';

      ctx.imageSmoothingEnabled = false;
      const is64x64 = img.height >= 64;

      // 1. HEAD (8x8 -> 32x32 at x=16, y=0)
      ctx.drawImage(img, 8, 8, 8, 8, 16, 0, 32, 32);
      if (withOverlays) {
        ctx.drawImage(img, 40, 8, 8, 8, 16, 0, 32, 32); // 3D Hat / Helmet Overlay
      }

      // 2. TORSO / CHESTPLATE (8x12 -> 32x48 at x=16, y=32)
      ctx.drawImage(img, 20, 20, 8, 12, 16, 32, 32, 48);
      if (withOverlays && is64x64) {
        ctx.drawImage(img, 20, 36, 8, 12, 16, 32, 32, 48); // Armor / Jacket Overlay
      }

      // 3. RIGHT ARM (4x12 -> 16x48 at x=0, y=32)
      ctx.drawImage(img, 44, 20, 4, 12, 0, 32, 16, 48);
      if (withOverlays && is64x64) {
        ctx.drawImage(img, 44, 36, 4, 12, 0, 32, 16, 48); // Right Sleeve
      }

      // 4. LEFT ARM (4x12 -> 16x48 at x=48, y=32)
      if (is64x64) {
        ctx.drawImage(img, 36, 52, 4, 12, 48, 32, 16, 48);
        if (withOverlays) {
          ctx.drawImage(img, 52, 52, 4, 12, 48, 32, 16, 48); // Left Sleeve
        }
      } else {
        // Legacy 64x32 skins mirrored arm
        ctx.save();
        ctx.translate(64, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 44, 20, 4, 12, 0, 32, 16, 48);
        ctx.restore();
      }

      // 5. RIGHT LEG (4x12 -> 16x48 at x=16, y=80)
      ctx.drawImage(img, 4, 20, 4, 12, 16, 80, 16, 48);
      if (withOverlays && is64x64) {
        ctx.drawImage(img, 4, 36, 4, 12, 16, 80, 16, 48); // Right Pant
      }

      // 6. LEFT LEG (4x12 -> 16x48 at x=32, y=80)
      if (is64x64) {
        ctx.drawImage(img, 20, 52, 4, 12, 32, 80, 16, 48);
        if (withOverlays) {
          ctx.drawImage(img, 4, 52, 4, 12, 32, 80, 16, 48); // Left Pant
        }
      } else {
        ctx.save();
        ctx.translate(64, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 4, 20, 4, 12, 16, 80, 16, 48);
        ctx.restore();
      }

      return cvs.toDataURL('image/png');
    };

    const renderHeadFace = (): string => {
      const cvs = document.createElement('canvas');
      cvs.width = 128;
      cvs.height = 128;
      const ctx = cvs.getContext('2d');
      if (!ctx) return '';
      ctx.imageSmoothingEnabled = false;

      // Base head face [8,8,8,8] scaled to 128x128
      ctx.drawImage(img, 8, 8, 8, 8, 0, 0, 128, 128);
      // Hat overlay [40,8,8,8]
      ctx.drawImage(img, 40, 8, 8, 8, 0, 0, 128, 128);
      return cvs.toDataURL('image/png');
    };

    img.onload = () => {
      if (isCancelled) return;
      try {
        const full = renderComposite(true);
        const noOverlay = renderComposite(false);
        const head = renderHeadFace();

        const item: SlicedSkinCacheItem = {
          assembled2D: full,
          assembledNoOverlay2D: noOverlay,
          headFace2D: head
        };

        skinVoxelCache.set(skinPath, item);
        setCacheItem(item);
        if (onFaceExtracted) onFaceExtracted(head);
      } catch (e) {
        console.warn('Voxel slicing fallback error:', e);
      }
    };

    img.onerror = () => {
      // Procedural Fallback: Generate a stylish Cyan-Obsidian Minecraft Voxel Character
      if (isCancelled) return;
      const cvs = document.createElement('canvas');
      cvs.width = 64;
      cvs.height = 128;
      const ctx = cvs.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, 64, 128);
        ctx.fillStyle = '#38BDF8';
        ctx.fillRect(16, 0, 32, 32); // Head
        ctx.fillStyle = '#0284C7';
        ctx.fillRect(16, 32, 32, 48); // Torso
        ctx.fillStyle = '#38BDF8';
        ctx.fillRect(0, 32, 16, 48); // R Arm
        ctx.fillRect(48, 32, 16, 48); // L Arm
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(16, 80, 16, 48); // R Leg
        ctx.fillRect(32, 80, 16, 48); // L Leg
      }
      const fallbackUrl = cvs.toDataURL('image/png');
      const item: SlicedSkinCacheItem = {
        assembled2D: fallbackUrl,
        assembledNoOverlay2D: fallbackUrl,
        headFace2D: fallbackUrl
      };
      setCacheItem(item);
    };

    img.src = skinPath;

    return () => {
      isCancelled = true;
    };
  }, [skinPath, onFaceExtracted]);

  // 2. TOUCH / MOUSE 360° DRAG TO SPIN HANDLERS
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive || (mode !== 'stage' && mode !== 'hero')) return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    initialRotationRef.current = rotationY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartXRef.current;
    const newRot = (initialRotationRef.current + deltaX * 1.2) % 360;
    setRotationY(newRot);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Determine which 2D texture to use based on 2nd layer toggle
  const currentTexture = showSecondLayer
    ? cacheItem?.assembled2D
    : cacheItem?.assembledNoOverlay2D || cacheItem?.assembled2D;

  // =========================================================================
  // RENDER MODE 1: THUMBNAIL (For all 40 Bundle Cards & Character Grid)
  // Renders crisp assembled standing character, NEVER raw flat UV texture!
  // =========================================================================
  if (mode === 'thumbnail' || mode === 'mini') {
    const thumbW = width || (mode === 'mini' ? 36 : 48);
    const thumbH = height || (mode === 'mini' ? 68 : 88);

    return (
      <div
        onClick={onClick}
        className={`relative flex items-center justify-center select-none ${className}`}
        style={{ width: `${thumbW}px`, height: `${thumbH}px` }}
      >
        {currentTexture ? (
          <img
            src={currentTexture}
            alt="Minecraft Assembled Character"
            className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)] group-hover:scale-105 transition-transform"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <div className="w-full h-full bg-slate-900/80 animate-pulse rounded-lg flex items-center justify-center">
            <span className="text-[8px] text-amber-400 font-mono">...</span>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // RENDER MODE 2: STAGE & HERO (Vault 3D Stage & Home Hero Card)
  // Full 360° Drag Rotation + Voxel Diamond Pedestal + Emotes + Cape
  // =========================================================================
  const stageSize = typeof size === 'number' ? size : 280;

  // Animation Transform Classes
  let animTransformClass = '';
  if (animation === 'wave') animTransformClass = 'animate-[wiggle_1s_ease-in-out_infinite]';
  if (animation === 'cheer') animTransformClass = 'animate-[bounce_0.8s_ease-in-out_infinite]';
  if (animation === 'cry') animTransformClass = 'animate-[pulse_1.2s_ease-in-out_infinite]';
  if (animation === 'victory') animTransformClass = 'animate-[spin_4s_linear_infinite]';

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={onClick}
      style={{
        width: `${stageSize}px`,
        height: `${stageSize + 40}px`,
        perspective: '900px',
        touchAction: 'none'
      }}
      className={`relative flex flex-col items-center justify-center select-none cursor-grab active:cursor-grabbing ${className}`}
    >
      {/* Enchantment Glint / Floating XP Orbs */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-emerald-400/80 animate-ping shadow-[0_0_8px_#34D399]" />
          <div className="absolute top-1/3 right-1/4 w-2.5 h-2.5 rounded-full bg-cyan-400/70 animate-pulse shadow-[0_0_10px_#22D3EE]" />
          <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 rounded-full bg-amber-400/80 animate-bounce shadow-[0_0_6px_#F59E0B]" />
        </div>
      )}

      {/* 3D Voxel Rig Container with 360° Rotation & Camera Zoom */}
      <div
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateY(${rotationY}deg) ${
            zoomMode === 'head' ? 'scale(1.85) translateY(22%)' : 'scale(1)'
          }`,
          transition: isDraggingRef.current ? 'none' : 'transform 0.25s ease-out'
        }}
        className="relative flex flex-col items-center justify-center z-10"
      >
        {/* Royal Scholar Cape (Rendered behind back shoulders) */}
        {showCape && (
          <div
            style={{
              transform: 'translateZ(-6px) translateY(12px)',
              imageRendering: 'pixelated'
            }}
            className="absolute top-14 w-20 h-32 rounded-b-md bg-gradient-to-b from-[#B45309] via-[#F59E0B] to-[#78350F] border border-amber-300/80 shadow-[0_4px_12px_rgba(245,158,11,0.5)] z-0 flex flex-col items-center justify-between p-1"
          >
            <div className="w-8 h-8 rounded-full border border-amber-200/50 flex items-center justify-center text-[10px]">
              👑
            </div>
            <div className="text-[8px] font-black text-amber-200 tracking-widest uppercase">
              Royal
            </div>
          </div>
        )}

        {/* Assembled Standing Minecraft Character (Crisp Voxel Sprite) */}
        <div
          className={`relative z-10 transition-transform ${animTransformClass}`}
          style={{ width: '130px', height: '240px' }}
        >
          {currentTexture ? (
            <img
              src={currentTexture}
              alt="Active Minecraft Character"
              className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-900/60 rounded-xl animate-pulse">
              <span className="text-xs text-amber-400 font-mono">Loading Voxel Rig...</span>
            </div>
          )}
        </div>

        {/* 3D Voxel Minecraft Block Pedestal (Diamond / Obsidian / Grass) */}
        {showPedestal && (
          <div
            style={{
              transformStyle: 'preserve-3d',
              transform: 'translateY(-16px) rotateX(65deg)'
            }}
            className="relative w-36 h-36 flex items-center justify-center mt-[-10px]"
          >
            {/* Top Surface of Block */}
            <div
              className={`w-full h-full rounded-2xl border-2 shadow-[0_0_30px_rgba(0,0,0,0.9)] flex items-center justify-center ${
                pedestalType === 'diamond'
                  ? 'bg-gradient-to-br from-cyan-600 via-sky-800 to-cyan-950 border-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.6)]'
                  : pedestalType === 'obsidian'
                  ? 'bg-gradient-to-br from-purple-900 via-slate-950 to-indigo-950 border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.5)]'
                  : 'bg-gradient-to-br from-amber-600 via-yellow-800 to-amber-950 border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.6)]'
              }`}
            >
              {/* Inner Glowing Inset Ring */}
              <div className="w-[85%] h-[85%] rounded-xl border border-white/30 flex items-center justify-center">
                <span className="text-xs font-mono font-black text-white/70">
                  {pedestalType === 'diamond' ? '💎 DIAMOND' : '🔮 OBSIDIAN'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
