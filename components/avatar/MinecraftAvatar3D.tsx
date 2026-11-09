'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  AvatarAnimationState,
  AvatarCustomization,
  CHARACTER_PRESETS
} from '@/types/avatar';
import { playAvatarJump, playAvatarCheer, playAvatarCry, playClickSound } from '@/lib/audioEngine';
import { MinecraftSkinPreview } from './MinecraftSkinPreview';

interface MinecraftAvatar3DProps {
  customization?: AvatarCustomization;
  animation?: AvatarAnimationState;
  size?: number | string;
  showPedestal?: boolean;
  interactive?: boolean;
  speechText?: string;
  className?: string;
  onClickAvatar?: () => void;
}

export const MinecraftAvatar3D: React.FC<MinecraftAvatar3DProps> = ({
  customization,
  animation = 'idle',
  size = 320,
  showPedestal = true,
  interactive = true,
  speechText,
  className = '',
  onClickAvatar
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<any>(null);
  const crownRef = useRef<THREE.Group | null>(null);
  const pedestalRef = useRef<THREE.Group | null>(null);
  const [webGLError, setWebGLError] = useState<boolean>(false);

  const activeCustom = customization || CHARACTER_PRESETS[0].defaultCustomization;
  const [currentAnim, setCurrentAnim] = useState<AvatarAnimationState>(animation);

  // Sync animation prop changes
  useEffect(() => {
    setCurrentAnim(animation);
  }, [animation]);

  // Click response
  const handleContainerClick = () => {
    if (onClickAvatar) {
      onClickAvatar();
      return;
    }
    if (currentAnim === 'idle') {
      playAvatarCheer();
      setCurrentAnim('cheer');
      setTimeout(() => setCurrentAnim('idle'), 2400);
    }
  };

  // Determine actual skin path
  const resolveSkinPath = useCallback((): string => {
    if (activeCustom.skinPath && activeCustom.skinPath.length > 0) {
      return activeCustom.skinPath;
    }
    const matchedPreset = CHARACTER_PRESETS.find(p => p.id === activeCustom.preset);
    if (matchedPreset?.defaultCustomization.skinPath) {
      return matchedPreset.defaultCustomization.skinPath;
    }
    return '/skins/boy/minecraft-skins.png';
  }, [activeCustom]);

  // Animation switcher function
  const applyAnimation = useCallback((viewer: any, anim: AvatarAnimationState, mod: any) => {
    if (!viewer || !mod) return;
    try {
      switch (anim) {
        case 'idle':
          viewer.animation = new mod.IdleAnimation();
          viewer.animation.speed = 0.85;
          break;
        case 'cheer':
        case 'victory':
          viewer.animation = new mod.WaveAnimation();
          viewer.animation.speed = 1.35;
          break;
        case 'laugh':
          viewer.animation = new mod.WalkingAnimation();
          viewer.animation.speed = 1.0;
          break;
        case 'cry':
          viewer.animation = null;
          if (viewer.playerObject?.skin?.head) {
            viewer.playerObject.skin.head.rotation.x = 0.4;
          }
          break;
        default:
          viewer.animation = new mod.IdleAnimation();
      }
    } catch (e) {
      console.warn('Could not switch animation:', e);
    }
  }, []);

  // Initialize and update skinview3d viewer
  useEffect(() => {
    let isDisposed = false;
    let skinview3dMod: any = null;

    const initViewer = async () => {
      if (typeof window === 'undefined' || !canvasHostRef.current) return;

      try {
        skinview3dMod = await import('skinview3d');
        if (isDisposed || !canvasHostRef.current) return;

        // Clean previous canvas and viewer
        if (viewerRef.current) {
          try {
            viewerRef.current.dispose();
          } catch {}
          viewerRef.current = null;
        }

        // Clean child elements from host container to ensure a brand-new WebGL context
        while (canvasHostRef.current.firstChild) {
          canvasHostRef.current.removeChild(canvasHostRef.current.firstChild);
        }

        // Create fresh Canvas element
        const freshCanvas = document.createElement('canvas');
        freshCanvas.className = 'w-full h-full block cursor-grab active:cursor-grabbing outline-none';
        canvasHostRef.current.appendChild(freshCanvas);

        const container = containerRef.current || canvasHostRef.current;
        const targetW = Math.max(container.clientWidth || 0, typeof size === 'number' ? size : 280, 240);
        const targetH = typeof size === 'number' ? size : 320;

        const skinPath = resolveSkinPath();

        const viewer = new skinview3dMod.SkinViewer({
          canvas: freshCanvas,
          width: targetW,
          height: targetH,
          pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
          skin: skinPath,
          model: 'auto-detect'
        });

        viewerRef.current = viewer;

        // Configure camera & controls
        viewer.fov = 45;
        viewer.zoom = 0.95;
        if (viewer.controls) {
          viewer.controls.enableRotate = interactive;
          viewer.controls.enableZoom = false;
          viewer.controls.enablePan = false;
          viewer.controls.autoRotate = false;
        }

        // Add 3D Obsidian & Gold Pedestal
        if (showPedestal && viewer.scene) {
          const pedGroup = new THREE.Group();
          pedGroup.position.y = -24.5; // at player feet level

          // Obsidian base cylinder
          const pedGeo = new THREE.CylinderGeometry(15, 17, 2.2, 36);
          const pedMat = new THREE.MeshStandardMaterial({
            color: 0x0c1322,
            roughness: 0.25,
            metalness: 0.85
          });
          const pedMesh = new THREE.Mesh(pedGeo, pedMat);
          pedGroup.add(pedMesh);

          // Golden trim ring
          const ringGeo = new THREE.TorusGeometry(15.2, 0.45, 12, 48);
          const ringMat = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            metalness: 0.95,
            roughness: 0.2
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.x = Math.PI / 2;
          ringMesh.position.y = 1.0;
          pedGroup.add(ringMesh);

          viewer.scene.add(pedGroup);
          pedestalRef.current = pedGroup;
        }

        // Add 3D Golden Crown accessory if equipped
        if (activeCustom.accessory === 'golden_crown' && viewer.playerObject?.skin?.head?.inner) {
          const crownGroup = new THREE.Group();
          crownGroup.position.set(0, 4.8, 0);

          const crownBase = new THREE.CylinderGeometry(4.5, 4.5, 1.6, 8);
          const crownMat = new THREE.MeshStandardMaterial({
            color: 0xfacc15,
            metalness: 0.9,
            roughness: 0.2
          });
          const baseMesh = new THREE.Mesh(crownBase, crownMat);
          crownGroup.add(baseMesh);

          for (let g = 0; g < 4; g++) {
            const gemGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
            const gemMat = new THREE.MeshStandardMaterial({
              color: 0xef4444,
              emissive: 0x991b1b,
              roughness: 0.2
            });
            const gem = new THREE.Mesh(gemGeo, gemMat);
            const angle = (g * Math.PI) / 2;
            gem.position.set(Math.sin(angle) * 4.5, 0.2, Math.cos(angle) * 4.5);
            crownGroup.add(gem);
          }

          viewer.playerObject.skin.head.inner.add(crownGroup);
          crownRef.current = crownGroup;
        }

        // Apply animation state
        applyAnimation(viewer, currentAnim, skinview3dMod);

        // Schedule progressive resize triggers to catch modal transitions (Framer Motion)
        const runResizing = () => {
          if (!viewerRef.current || !containerRef.current) return;
          const currentW = containerRef.current.clientWidth;
          const currentH = containerRef.current.clientHeight || (typeof size === 'number' ? size : 320);
          if (currentW > 20 && currentH > 20) {
            viewerRef.current.setSize(currentW, currentH);
          }
        };

        requestAnimationFrame(runResizing);
        const t1 = setTimeout(runResizing, 80);
        const t2 = setTimeout(runResizing, 200);
        const t3 = setTimeout(runResizing, 400);

        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
        };
      } catch (err) {
        console.error('Error initializing 3D Minecraft viewer, falling back to 2D composite:', err);
        setWebGLError(true);
      }
    };

    initViewer();

    return () => {
      isDisposed = true;
      if (viewerRef.current) {
        try {
          viewerRef.current.dispose();
        } catch {}
        viewerRef.current = null;
      }
    };
  }, [resolveSkinPath, size, showPedestal, interactive, applyAnimation]);

  // Update skin texture dynamically when outfit / character changes
  useEffect(() => {
    if (!viewerRef.current) return;
    const skinPath = resolveSkinPath();
    try {
      viewerRef.current.loadSkin(skinPath, { model: 'auto-detect' });
    } catch (e) {
      console.warn('Dynamic skin load error:', e);
    }
  }, [resolveSkinPath]);

  // Sync animation when state changes (cheer, cry, victory)
  useEffect(() => {
    if (!viewerRef.current) return;
    import('skinview3d').then(mod => {
      applyAnimation(viewerRef.current, currentAnim, mod);
    });
  }, [currentAnim, applyAnimation]);

  // ResizeObserver to adapt smoothly whenever parent modal or viewport changes size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver((entries) => {
      if (!viewerRef.current) return;
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height || (typeof size === 'number' ? size : 320);
        if (w > 20 && h > 20) {
          try {
            viewerRef.current.setSize(w, h);
          } catch {}
        }
      }
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, [size]);

  const heightVal = typeof size === 'number' ? `${size}px` : size;
  const currentSkin = resolveSkinPath();

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      style={{ height: heightVal, minHeight: heightVal }}
      className={`relative w-full flex items-center justify-center select-none overflow-hidden ${className}`}
    >
      {/* Three.js / skinview3d WebGL Canvas Container */}
      {!webGLError ? (
        <div ref={canvasHostRef} className="w-full h-full flex items-center justify-center" />
      ) : (
        /* Reliable 2D Assembled Character Fallback */
        <MinecraftSkinPreview
          skinPath={currentSkin}
          width={130}
          height={240}
          showPedestal={showPedestal}
        />
      )}

      {/* Floating Speech Bubble (Optional) */}
      {speechText && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 max-w-[85%] px-3 py-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-amber-400/40 text-amber-300 text-[11px] font-black shadow-[0_4px_16px_rgba(0,0,0,0.6)] text-center animate-fade-in pointer-events-none">
          {speechText}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-amber-400/40 rotate-45" />
        </div>
      )}
    </div>
  );
};
