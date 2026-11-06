'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

export type MascotAnimation = 'idle' | 'laugh' | 'cry' | 'cheer';

interface NativeOctopops3DProps {
  animation?: MascotAnimation;
  speechText?: string;
  size?: number | string; // height or width
  showControls?: boolean;
  className?: string;
  onActionTrigger?: (anim: MascotAnimation) => void;
}

export const NativeOctopops3D: React.FC<NativeOctopops3DProps> = ({
  animation = 'idle',
  speechText,
  size = 320,
  showControls = true,
  className = '',
  onActionTrigger
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentAnim, setCurrentAnim] = useState<MascotAnimation>(animation);
  const [displayedSpeech, setDisplayedSpeech] = useState<string>(
    speechText || '🌱 शांत और फोकस्ड! 100% तैयारी।'
  );

  // Sync external animation prop changes
  useEffect(() => {
    setCurrentAnim(animation);
  }, [animation]);

  useEffect(() => {
    if (speechText) setDisplayedSpeech(speechText);
  }, [speechText]);

  const triggerAnim = useCallback((anim: MascotAnimation, text?: string) => {
    setCurrentAnim(anim);
    if (text) setDisplayedSpeech(text);
    if (onActionTrigger) onActionTrigger(anim);
  }, [onActionTrigger]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer Setup
    const width = container.clientWidth || 380;
    const height = typeof size === 'number' ? size : 320;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 9.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. Lighting Setup (Cinematic Royal Lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xb8ff50, 1.4);
    keyLight.position.set(4, 8, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    rimLight.position.set(-6, 4, -4);
    scene.add(rimLight);

    const warmBounceLight = new THREE.DirectionalLight(0xf59e0b, 0.6);
    warmBounceLight.position.set(0, -4, 4);
    scene.add(warmBounceLight);

    // 3. World Group & Turntable
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // Subtle Obsidian Circular Pedestal (Zero Clutter)
    const pedestalGeo = new THREE.CylinderGeometry(2.4, 2.6, 0.22, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x0c1322,
      roughness: 0.35,
      metalness: 0.85
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -1.2;
    pedestal.receiveShadow = true;
    worldGroup.add(pedestal);

    // Pedestal Emerald Glowing Edge Ring
    const ringGeo = new THREE.TorusGeometry(2.42, 0.04, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.8
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.08;
    worldGroup.add(ring);

    // 4. Build The Official 3D Green Voxel Quadruped Character
    const characterGroup = new THREE.Group();
    worldGroup.add(characterGroup);

    // Materials: Emerald Green, Neon Lime, Pink Ear, White Boots
    const greenBodyMat = new THREE.MeshStandardMaterial({
      color: 0x58cc02,
      roughness: 0.35,
      metalness: 0.15
    });

    const neonLimeMat = new THREE.MeshStandardMaterial({
      color: 0x80ff44,
      roughness: 0.25,
      metalness: 0.2
    });

    const pinkInnerMat = new THREE.MeshStandardMaterial({
      color: 0xff66aa,
      roughness: 0.4
    });

    const bootWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.3
    });

    const glassOuterMat = new THREE.MeshPhysicalMaterial({
      color: 0xaaffcc,
      transmission: 0.72,
      opacity: 0.85,
      transparent: true,
      roughness: 0.1,
      ior: 1.45
    });

    // Main Voxel Head/Body Cube (1.9 x 1.7 x 1.7)
    const bodyGeo = new THREE.BoxGeometry(1.9, 1.7, 1.7);
    const bodyMesh = new THREE.Mesh(bodyGeo, greenBodyMat);
    bodyMesh.position.y = 0.55;
    bodyMesh.castShadow = true;
    characterGroup.add(bodyMesh);

    // Outer Glass Shell
    const glassGeo = new THREE.BoxGeometry(2.05, 1.85, 1.85);
    const glassMesh = new THREE.Mesh(glassGeo, glassOuterMat);
    glassMesh.position.y = 0.55;
    characterGroup.add(glassMesh);

    // 2 Tall Bunny Ears
    const earLeftGroup = new THREE.Group();
    earLeftGroup.position.set(-0.55, 1.4, 0.1);
    characterGroup.add(earLeftGroup);

    const earGeo = new THREE.BoxGeometry(0.38, 0.95, 0.32);
    const earLeftMesh = new THREE.Mesh(earGeo, greenBodyMat);
    earLeftMesh.position.y = 0.45;
    earLeftGroup.add(earLeftMesh);

    const innerEarGeo = new THREE.BoxGeometry(0.24, 0.65, 0.08);
    const earLeftInner = new THREE.Mesh(innerEarGeo, pinkInnerMat);
    earLeftInner.position.set(0, 0.42, 0.15);
    earLeftGroup.add(earLeftInner);

    const tipGeo = new THREE.BoxGeometry(0.38, 0.22, 0.32);
    const earLeftTip = new THREE.Mesh(tipGeo, neonLimeMat);
    earLeftTip.position.y = 0.95;
    earLeftGroup.add(earLeftTip);

    const earRightGroup = new THREE.Group();
    earRightGroup.position.set(0.55, 1.4, 0.1);
    characterGroup.add(earRightGroup);

    const earRightMesh = new THREE.Mesh(earGeo, greenBodyMat);
    earRightMesh.position.y = 0.45;
    earRightGroup.add(earRightMesh);

    const earRightInner = new THREE.Mesh(innerEarGeo, pinkInnerMat);
    earRightInner.position.set(0, 0.42, 0.15);
    earRightGroup.add(earRightInner);

    const earRightTip = new THREE.Mesh(tipGeo, neonLimeMat);
    earRightTip.position.y = 0.95;
    earRightGroup.add(earRightTip);

    // 4 Quadruped Legs with White Boots
    const createLeg = (x: number, z: number) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(x, -0.3, z);

      const upperGeo = new THREE.BoxGeometry(0.36, 0.5, 0.36);
      const upper = new THREE.Mesh(upperGeo, greenBodyMat);
      upper.position.y = -0.22;
      legGroup.add(upper);

      const bootGeo = new THREE.BoxGeometry(0.42, 0.38, 0.48);
      const boot = new THREE.Mesh(bootGeo, bootWhiteMat);
      boot.position.set(0, -0.55, 0.04);
      legGroup.add(boot);

      characterGroup.add(legGroup);
      return legGroup;
    };

    const legFL = createLeg(-0.55, 0.45);
    const legFR = createLeg(0.55, 0.45);
    const legBL = createLeg(-0.55, -0.45);
    const legBR = createLeg(0.55, -0.45);

    // 2 Side Pixel Arms
    const armGeo = new THREE.BoxGeometry(0.28, 0.72, 0.28);

    const armLeftGroup = new THREE.Group();
    armLeftGroup.position.set(-1.08, 0.55, 0);
    const armLeftMesh = new THREE.Mesh(armGeo, neonLimeMat);
    armLeftMesh.position.y = -0.3;
    armLeftGroup.add(armLeftMesh);
    characterGroup.add(armLeftGroup);

    const armRightGroup = new THREE.Group();
    armRightGroup.position.set(1.08, 0.55, 0);
    const armRightMesh = new THREE.Mesh(armGeo, neonLimeMat);
    armRightMesh.position.y = -0.3;
    armRightGroup.add(armRightMesh);
    characterGroup.add(armRightGroup);

    // Back Pixel Wagging Tail
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 0.15, -0.9);
    characterGroup.add(tailGroup);

    const tailGeo = new THREE.BoxGeometry(0.24, 0.24, 0.55);
    const tailMesh = new THREE.Mesh(tailGeo, neonLimeMat);
    tailMesh.position.z = -0.25;
    tailMesh.rotation.x = 0.25;
    tailGroup.add(tailMesh);

    // Dynamic Face Canvas Texture
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = 512;
    faceCanvas.height = 512;
    const fctx = faceCanvas.getContext('2d')!;
    const faceTexture = new THREE.CanvasTexture(faceCanvas);

    const faceGeo = new THREE.PlaneGeometry(1.4, 1.2);
    const faceMat = new THREE.MeshBasicMaterial({
      map: faceTexture,
      transparent: true
    });
    const facePlane = new THREE.Mesh(faceGeo, faceMat);
    facePlane.position.set(0, 0.55, 0.86);
    characterGroup.add(facePlane);

    const updateFace = (anim: MascotAnimation, timeTick: number) => {
      fctx.clearRect(0, 0, 512, 512);

      if (anim === 'laugh') {
        // Joyful squint eyes `> <` and smiling mouth
        fctx.strokeStyle = '#0B2912';
        fctx.lineWidth = 22;
        fctx.lineCap = 'round';

        // Left `>`
        fctx.beginPath();
        fctx.moveTo(110, 180);
        fctx.lineTo(165, 215);
        fctx.lineTo(110, 250);
        fctx.stroke();

        // Right `<`
        fctx.beginPath();
        fctx.moveTo(402, 180);
        fctx.lineTo(347, 215);
        fctx.lineTo(402, 250);
        fctx.stroke();

        // Big smiling mouth
        fctx.beginPath();
        fctx.arc(256, 310, 60, 0.1, Math.PI - 0.1, false);
        fctx.fillStyle = '#C026D3';
        fctx.fill();
        fctx.stroke();
      } else if (anim === 'cry') {
        // Drooping teary eyes
        fctx.fillStyle = '#0B2912';
        fctx.fillRect(115, 195, 75, 75);
        fctx.fillRect(322, 195, 75, 75);

        // Falling cyan tears
        fctx.fillStyle = '#38BDF8';
        const tearY = 275 + (timeTick % 40) * 3;
        fctx.fillRect(140, tearY, 25, 45);
        fctx.fillRect(347, tearY, 25, 45);

        // Sad wavy mouth
        fctx.strokeStyle = '#0B2912';
        fctx.lineWidth = 18;
        fctx.beginPath();
        fctx.arc(256, 400, 50, Math.PI + 0.3, -0.3, false);
        fctx.stroke();
      } else if (anim === 'cheer') {
        // Big sparkling eyes with white gleam
        fctx.fillStyle = '#0B2912';
        fctx.fillRect(110, 180, 85, 90);
        fctx.fillRect(317, 180, 85, 90);

        // Sparkle glints
        fctx.fillStyle = '#FFFFFF';
        fctx.fillRect(125, 195, 30, 30);
        fctx.fillRect(332, 195, 30, 30);
        fctx.fillRect(165, 235, 15, 15);
        fctx.fillRect(372, 235, 15, 15);

        // Cheerful open mouth
        fctx.fillStyle = '#EC4899';
        fctx.beginPath();
        fctx.arc(256, 335, 50, 0, Math.PI, false);
        fctx.fill();
        fctx.lineWidth = 14;
        fctx.strokeStyle = '#0B2912';
        fctx.stroke();
      } else {
        // Idle: Classic pixel black eyes with specular pupil and silent closed mouth
        fctx.fillStyle = '#071A0B';
        fctx.fillRect(120, 190, 75, 80);
        fctx.fillRect(317, 190, 75, 80);

        // Pupil highlights
        fctx.fillStyle = '#FFFFFF';
        fctx.fillRect(135, 205, 26, 26);
        fctx.fillRect(332, 205, 26, 26);

        // Silent closed mouth (subtle line)
        fctx.fillStyle = '#14532D';
        fctx.fillRect(236, 350, 40, 12);
      }

      faceTexture.needsUpdate = true;
    };

    // 5. Turntable Drag Interaction
    let isDragging = false;
    let prevX = 0;
    let turntableRotY = 0;
    let targetTurntableRotY = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      prevX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const dx = clientX - prevX;
      prevX = clientX;
      targetTurntableRotY += dx * 0.012;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onPointerDown);
    domEl.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);

    // 6. 60FPS Hardware-Accelerated Animation Loop
    let clock = new THREE.Clock();
    let animId: number;
    let tickCount = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      tickCount++;

      // Update Face Texture every few frames
      if (tickCount % 3 === 0) {
        updateFace(currentAnim, tickCount);
      }

      // Smooth turntable rotation (gentle auto-rotate when not dragging)
      if (!isDragging) {
        targetTurntableRotY += 0.005;
      }
      turntableRotY += (targetTurntableRotY - turntableRotY) * 0.1;
      worldGroup.rotation.y = turntableRotY;

      // Animation Mechanics
      let idleBreath = Math.sin(t * 3.0) * 0.06;
      let legSpeed = 3.0;
      let legAmp = 0.08;

      if (currentAnim === 'laugh') {
        // Joyful fast bouncing
        characterGroup.position.y = Math.abs(Math.sin(t * 10)) * 0.22;
        characterGroup.rotation.z = Math.sin(t * 6) * 0.08;

        armLeftGroup.rotation.z = -1.2 + Math.sin(t * 14) * 0.35;
        armRightGroup.rotation.z = 1.2 - Math.sin(t * 14) * 0.35;

        earLeftGroup.rotation.z = Math.sin(t * 12) * 0.25;
        earRightGroup.rotation.z = -Math.sin(t * 12) * 0.25;

        tailGroup.rotation.y = Math.sin(t * 16) * 0.55;
      } else if (currentAnim === 'cry') {
        // Drooping head & ears, shivering body
        characterGroup.position.y = -0.1 + Math.sin(t * 18) * 0.02;
        characterGroup.rotation.x = 0.15;

        earLeftGroup.rotation.z = 0.35;
        earRightGroup.rotation.z = -0.35;

        armLeftGroup.rotation.z = -0.2;
        armRightGroup.rotation.z = 0.2;

        tailGroup.rotation.y = 0;
      } else if (currentAnim === 'cheer') {
        // High-energy celebration jump & double arm pump
        characterGroup.position.y = Math.abs(Math.sin(t * 8)) * 0.45;
        characterGroup.rotation.z = Math.sin(t * 5) * 0.1;

        armLeftGroup.rotation.z = -2.1 + Math.sin(t * 12) * 0.2;
        armRightGroup.rotation.z = 2.1 - Math.sin(t * 12) * 0.2;

        earLeftGroup.rotation.z = Math.sin(t * 15) * 0.3;
        earRightGroup.rotation.z = -Math.sin(t * 15) * 0.3;

        tailGroup.rotation.y = Math.sin(t * 20) * 0.6;
      } else {
        // Idle Animation (Default Clean)
        characterGroup.position.y = idleBreath;
        characterGroup.rotation.x = 0;
        characterGroup.rotation.z = 0;

        earLeftGroup.rotation.z = Math.sin(t * 2.5) * 0.06;
        earRightGroup.rotation.z = -Math.sin(t * 2.5) * 0.06;

        armLeftGroup.rotation.z = Math.sin(t * 2.2) * 0.06;
        armRightGroup.rotation.z = -Math.sin(t * 2.2) * 0.06;

        tailGroup.rotation.y = Math.sin(t * 4.5) * 0.22;

        legFL.rotation.x = Math.sin(t * legSpeed) * legAmp;
        legBR.rotation.x = Math.sin(t * legSpeed) * legAmp;
        legFR.rotation.x = -Math.sin(t * legSpeed) * legAmp;
        legBL.rotation.x = -Math.sin(t * legSpeed) * legAmp;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 380;
      const h = typeof size === 'number' ? size : 320;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', onPointerDown);
      domEl.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [currentAnim, size]);

  return (
    <div className={`relative w-full rounded-3xl bg-gradient-to-b from-[rgba(26,38,60,0.7)] to-[rgba(9,13,22,0.85)] backdrop-blur-2xl border-t-2 border-[#10B981]/40 border-x border-b border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.6)] overflow-hidden select-none ${className}`}>
      {/* Dynamic Floating Speech Bubble Header */}
      <div className="pt-3 px-4 pb-1">
        <div className="relative mx-auto max-w-[360px] p-2.5 rounded-2xl bg-[rgba(246,255,248,0.95)] text-[#092112] font-black text-xs sm:text-sm text-center shadow-[0_4px_0_#1E6B07,0_8px_20px_rgba(0,0,0,0.3)] transition-all duration-200">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-base">🐰</span>
            <span className="leading-snug">{displayedSpeech}</span>
          </div>
          {/* Pointer */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[rgba(246,255,248,0.95)]" />
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full cursor-grab active:cursor-grabbing flex items-center justify-center"
        style={{ height: size }}
      >
        {/* Top-Right Badge: Native 60 FPS Engine */}
        <div className="absolute top-2 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#10B981]/40 text-[10px] font-black text-[#80FF44]">
          <span className="w-2 h-2 rounded-full bg-[#80FF44] animate-ping" />
          <span>NATIVE 60 FPS • THREE.JS</span>
        </div>
      </div>

      {/* Interactive Micro-Interaction Toolbar */}
      {showControls && (
        <div className="px-3 pb-3 pt-1">
          <div className="flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => triggerAnim('idle', '🌱 शांत और फोकस्ड! 100% तैयारी।')}
              className={`shrink-0 px-3 py-1.5 rounded-xl border text-[11px] font-black shadow-[0_3px_0_rgba(0,0,0,0.5)] transition-all cursor-pointer ${
                currentAnim === 'idle'
                  ? 'bg-emerald-600 border-emerald-400 text-white'
                  : 'bg-white/10 hover:bg-white/20 border-white/15 text-slate-300'
              }`}
            >
              Idle 🌱
            </button>
            <button
              onClick={() => triggerAnim('laugh', '😆 हा हा हा! तुम्हारे साथ पढ़ने में बहुत मज़ा आता है!')}
              className={`shrink-0 px-3 py-1.5 rounded-xl border text-[11px] font-black shadow-[0_3px_0_rgba(0,0,0,0.5)] transition-all cursor-pointer ${
                currentAnim === 'laugh'
                  ? 'bg-emerald-600 border-emerald-400 text-white'
                  : 'bg-white/10 hover:bg-white/20 border-white/15 text-slate-300'
              }`}
            >
              Laugh 😆
            </button>
            <button
              onClick={() => triggerAnim('cry', '😢 कोई बात नहीं! गलती ही सीखने की पहली सीढ़ी है!')}
              className={`shrink-0 px-3 py-1.5 rounded-xl border text-[11px] font-black shadow-[0_3px_0_rgba(0,0,0,0.5)] transition-all cursor-pointer ${
                currentAnim === 'cry'
                  ? 'bg-red-600 border-red-400 text-white'
                  : 'bg-white/10 hover:bg-white/20 border-white/15 text-slate-300'
              }`}
            >
              Cry 😢
            </button>
            <button
              onClick={() => triggerAnim('cheer', '🎉 शाबाश! लेवल अप! तुमने कमाल कर दिया!')}
              className={`shrink-0 px-3 py-1.5 rounded-xl border text-[11px] font-black shadow-[0_3px_0_rgba(0,0,0,0.5)] transition-all cursor-pointer ${
                currentAnim === 'cheer'
                  ? 'bg-amber-500 border-amber-300 text-black'
                  : 'bg-white/10 hover:bg-white/20 border-white/15 text-slate-300'
              }`}
            >
              Cheer 🎉
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
