'use client';

import React, { useEffect, useRef, useState } from 'react';

interface MinecraftSkinPreviewProps {
  skinPath: string;
  width?: number;
  height?: number;
  className?: string;
  showPedestal?: boolean;
}

// In-memory cache for rendered composite character data URLs
const skinCompositeCache = new Map<string, string>();

export const MinecraftSkinPreview: React.FC<MinecraftSkinPreviewProps> = ({
  skinPath,
  width = 64,
  height = 120,
  className = '',
  showPedestal = false
}) => {
  const [dataUrl, setDataUrl] = useState<string | null>(skinCompositeCache.get(skinPath) || null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (skinCompositeCache.has(skinPath)) {
      setDataUrl(skinCompositeCache.get(skinPath)!);
      return;
    }

    let isCancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (isCancelled) return;

      // We render a 64x128 pixel-crisp Minecraft character composite
      const cvs = document.createElement('canvas');
      cvs.width = 64;
      cvs.height = 128;
      const ctx = cvs.getContext('2d');
      if (!ctx) return;

      ctx.imageSmoothingEnabled = false;

      const is64x64 = img.height >= 64;

      // Slicing Coordinates & Target Offsets (Scale = 4)
      // 1. HEAD (8x8) -> Target: x=16, y=0, w=32, h=32
      ctx.drawImage(img, 8, 8, 8, 8, 16, 0, 32, 32);
      // Head Hat Overlay (40, 8, 8, 8)
      ctx.drawImage(img, 40, 8, 8, 8, 16, 0, 32, 32);

      // 2. TORSO (8x12) -> Target: x=16, y=32, w=32, h=48
      ctx.drawImage(img, 20, 20, 8, 12, 16, 32, 32, 48);
      // Torso Jacket Overlay (20, 36, 8, 12) if 64x64
      if (is64x64) {
        ctx.drawImage(img, 20, 36, 8, 12, 16, 32, 32, 48);
      }

      // 3. RIGHT ARM (4x12) -> Target: x=0, y=32, w=16, h=48
      ctx.drawImage(img, 44, 20, 4, 12, 0, 32, 16, 48);
      // Right Arm Overlay (44, 36, 4, 12) if 64x64
      if (is64x64) {
        ctx.drawImage(img, 44, 36, 4, 12, 0, 32, 16, 48);
      }

      // 4. LEFT ARM (4x12) -> Target: x=48, y=32, w=16, h=48
      if (is64x64) {
        ctx.drawImage(img, 36, 52, 4, 12, 48, 32, 16, 48);
        ctx.drawImage(img, 52, 52, 4, 12, 48, 32, 16, 48);
      } else {
        // Mirrored right arm for legacy skins
        ctx.save();
        ctx.translate(64, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 44, 20, 4, 12, 0, 32, 16, 48);
        ctx.restore();
      }

      // 5. RIGHT LEG (4x12) -> Target: x=16, y=80, w=16, h=48
      ctx.drawImage(img, 4, 20, 4, 12, 16, 80, 16, 48);
      // Right Leg Overlay (4, 36, 4, 12) if 64x64
      if (is64x64) {
        ctx.drawImage(img, 4, 36, 4, 12, 16, 80, 16, 48);
      }

      // 6. LEFT LEG (4x12) -> Target: x=32, y=80, w=16, h=48
      if (is64x64) {
        ctx.drawImage(img, 20, 52, 4, 12, 32, 80, 16, 48);
        ctx.drawImage(img, 4, 52, 4, 12, 32, 80, 16, 48);
      } else {
        // Mirrored right leg
        ctx.save();
        ctx.translate(64, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 4, 20, 4, 12, 16, 80, 16, 48);
        ctx.restore();
      }

      try {
        const url = cvs.toDataURL('image/png');
        skinCompositeCache.set(skinPath, url);
        setDataUrl(url);
      } catch (e) {
        console.warn('Could not generate skin preview data URL:', e);
      }
    };

    img.onerror = () => {
      // Fallback: draw generic voxel outline
      setDataUrl('/skins/boy/minecraft-skins.png');
    };

    img.src = skinPath;

    return () => {
      isCancelled = true;
    };
  }, [skinPath]);

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {/* 2D Standing Assembled Character */}
      {dataUrl ? (
        <img
          src={dataUrl}
          alt="Minecraft Assembled Character"
          className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
          style={{ imageRendering: 'pixelated' }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-black/40 animate-pulse rounded-lg">
          <span className="text-[9px] text-amber-400 font-mono">Loading...</span>
        </div>
      )}

      {/* Optional Golden Pedestal Ring Underneath */}
      {showPedestal && (
        <div className="absolute -bottom-1 w-[80%] h-2.5 rounded-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 border border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
      )}
    </div>
  );
};
