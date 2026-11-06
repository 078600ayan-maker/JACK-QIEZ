'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Flame, Volume2 } from 'lucide-react';
import { getJackVoice } from '@/lib/jackVoiceSynthesizer';
import {
  playClickSound,
  playCorrectDing,
  playWrongThud,
  playTrophyCelebration,
  playPop
} from '@/lib/audioEngine';

export type DuolingoEmotionState = 'idle' | 'thinking' | 'happy' | 'sad' | 'streak';

interface DuolingoOctopus3DProps {
  emotion?: DuolingoEmotionState;
  streakCount?: number;
  speechText?: string;
  size?: number | string;
  interactive?: boolean;
  showBubble?: boolean;
  className?: string;
  onTap?: () => void;
}

export const DuolingoOctopus3D: React.FC<DuolingoOctopus3DProps> = ({
  emotion = 'idle',
  streakCount = 0,
  speechText,
  size = 280,
  interactive = true,
  showBubble = true,
  className = '',
  onTap
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<DuolingoEmotionState>(emotion);
  const [bubbleMessage, setBubbleMessage] = useState<string>(
    speechText || 'Chalo shuru karte hain! 🚀'
  );
  const [isTalking, setIsTalking] = useState<boolean>(false);

  // Sync external emotion prop
  useEffect(() => {
    setCurrentEmotion(emotion);
    if (emotion === 'happy') {
      setBubbleMessage('Wah! Gazab answer diya! 🎉');
      playCorrectDing();
    } else if (emotion === 'sad') {
      setBubbleMessage('Koi baat nahi meri jaan, agla sahi hoga! 💪');
      playWrongThud();
    } else if (emotion === 'streak') {
      setBubbleMessage(`🔥 ${streakCount || 5} STREAK! Aag laga di!`);
      playTrophyCelebration();
    } else if (emotion === 'thinking') {
      setBubbleMessage('Socho socho... sahi answer kya hoga? 🤔');
    }
  }, [emotion, streakCount]);

  useEffect(() => {
    if (speechText) setBubbleMessage(speechText);
  }, [speechText]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 320;
    const height = typeof size === 'number' ? size : 280;

    // 1. Scene & Transparent Renderer
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.75, 10.5);
    camera.lookAt(0, 0.2, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.appendChild(renderer.domElement);

    // 2. Cinematic Royal Obsidian Lighting
    const ambientLight = new THREE.AmbientLight(0xd8ffe4, 0.95);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
    keyLight.position.set(6, 12, 9);
    scene.add(keyLight);

    const rimLightLeft = new THREE.DirectionalLight(0x80ffdb, 0.65);
    rimLightLeft.position.set(-8, 5, -6);
    scene.add(rimLightLeft);

    const rimLightRight = new THREE.PointLight(0x58cc02, 0.9, 18);
    rimLightRight.position.set(5, 3, 4);
    scene.add(rimLightRight);

    // Warm Gold Streak Light
    const streakLight = new THREE.PointLight(0xf59e0b, 0, 15);
    streakLight.position.set(0, 2, 3);
    scene.add(streakLight);

    const worldGroup = new THREE.Group();
    worldGroup.position.y = -0.15;
    scene.add(worldGroup);

    // 3. Pixel Side Skin Texture Generator
    function makePixelTexture(drawFn: (ctx: CanvasRenderingContext2D, size: number) => void, s = 64) {
      const c = document.createElement('canvas');
      c.width = s;
      c.height = s;
      const ctx = c.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;
      drawFn(ctx, s);
      const tex = new THREE.CanvasTexture(c);
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      tex.needsUpdate = true;
      return { tex, canvas: c, ctx };
    }

    const bodySideSkin = makePixelTexture((ctx, s) => {
      const g = 8;
      const step = s / g;
      const palette = [
        ['#9BFF38','#8CF82B','#7CE828','#7CE828','#7CE828','#7CE828','#8CF82B','#9BFF38'],
        ['#8CF82B','#66D814','#58CC02','#58CC02','#58CC02','#58CC02','#66D814','#7CE828'],
        ['#7CE828','#58CC02','#46B002','#46B002','#46B002','#46B002','#58CC02','#66D814'],
        ['#66D814','#46B002','#3E9E02','#3E9E02','#3E9E02','#3E9E02','#46B002','#58CC02'],
        ['#58CC02','#46B002','#3E9E02','#368D02','#368D02','#3E9E02','#46B002','#58CC02'],
        ['#58CC02','#3E9E02','#368D02','#2E7C02','#2E7C02','#368D02','#3E9E02','#46B002'],
        ['#46B002','#368D02','#2E7C02','#266B02','#266B02','#2E7C02','#368D02','#3E9E02'],
        ['#368D02','#266B02','#1E5802','#1E5802','#1E5802','#1E5802','#266B02','#2E7C02']
      ];
      for (let y = 0; y < g; y++) {
        for (let x = 0; x < g; x++) {
          ctx.fillStyle = palette[y][x];
          ctx.fillRect(x * step, y * step, step, step);
        }
      }
      ctx.strokeStyle = '#A8FF48';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, s - 2, s - 2);
    }, 64);

    // 4. Dynamic Face Canvas Texture (Supporting All Emotion States)
    const faceCanvasObj = makePixelTexture(() => {}, 128);

    function updateFaceTexture(mood: DuolingoEmotionState, talkFrame = 0) {
      const ctx = faceCanvasObj.ctx;
      const s = 128;
      ctx.clearRect(0, 0, s, s);

      ctx.fillStyle = '#52C402';
      ctx.fillRect(0, 0, s, s);

      ctx.fillStyle = '#88FA2E';
      ctx.fillRect(0, 0, s, 8);
      ctx.fillRect(0, 0, 8, s);
      ctx.fillStyle = '#2B7A04';
      ctx.fillRect(0, s - 8, s, 8);
      ctx.fillRect(s - 8, 0, 8, s);

      ctx.fillStyle = '#1E8E04';
      ctx.fillRect(16, 16, 96, 96);

      ctx.fillStyle = 'rgba(184, 255, 80, 0.18)';
      ctx.fillRect(20, 20, 28, 6);
      ctx.fillRect(20, 26, 12, 6);

      if (mood === 'happy' || mood === 'streak') {
        // Joyful sparkling eyes
        ctx.fillStyle = '#040B06';
        ctx.fillRect(26, 36, 26, 26);
        ctx.fillRect(76, 36, 26, 26);
        ctx.fillStyle = '#E8FFF0';
        ctx.fillRect(30, 40, 8, 8);
        ctx.fillRect(80, 40, 8, 8);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(40, 50, 4, 4);
        ctx.fillRect(90, 50, 4, 4);

        // Cheerful open smiling mouth
        const mouthOpen = (talkFrame % 2 === 0) ? 14 : 8;
        ctx.fillStyle = '#040B06';
        ctx.fillRect(48, 74, 32, mouthOpen);
        ctx.fillStyle = '#FF5C8A';
        ctx.fillRect(52, 78, 24, 6);
      } else if (mood === 'thinking') {
        // Curious slanted eyebrows & focused eyes looking up/right
        ctx.fillStyle = '#040B06';
        ctx.fillRect(26, 40, 26, 22);
        ctx.fillRect(76, 38, 26, 22);
        ctx.fillStyle = '#E8FFF0';
        ctx.fillRect(36, 42, 8, 8);
        ctx.fillRect(86, 40, 8, 8);

        // Pensive closed mouth
        ctx.fillStyle = '#0D4F02';
        ctx.fillRect(52, 78, 24, 4);
      } else if (mood === 'sad') {
        // Drooping sad eyes with cyan tears
        ctx.fillStyle = '#040B06';
        ctx.fillRect(26, 40, 26, 22);
        ctx.fillRect(76, 40, 26, 22);
        ctx.fillStyle = '#4DD8FF';
        ctx.fillRect(34, 62, 8, 16);
        ctx.fillRect(84, 62, 8, 16);

        // Sad downturned mouth
        ctx.fillStyle = '#040B06';
        ctx.fillRect(52, 78, 24, 6);
        ctx.fillRect(46, 84, 6, 6);
        ctx.fillRect(76, 84, 6, 6);
      } else {
        // Idle: Regular observant pixel eyes
        ctx.fillStyle = '#040B06';
        ctx.fillRect(26, 36, 26, 26);
        ctx.fillRect(76, 36, 26, 26);
        ctx.fillStyle = '#E8FFF0';
        ctx.fillRect(30, 40, 6, 6);
        ctx.fillRect(80, 40, 6, 6);

        // Little cute mouth
        ctx.fillStyle = '#040B06';
        ctx.fillRect(56, 76, 16, 4);
      }

      // Center Pixel Nose
      ctx.fillStyle = '#0D4F02';
      ctx.fillRect(60, 62, 8, 5);

      faceCanvasObj.tex.needsUpdate = true;
    }

    updateFaceTexture(currentEmotion, 0);

    // 5. Build Anatomy: Head/Torso, Ears, Arms, Legs, Tail
    const characterGroup = new THREE.Group();
    worldGroup.add(characterGroup);

    const skinMat = new THREE.MeshStandardMaterial({
      map: bodySideSkin.tex,
      roughness: 0.32,
      metalness: 0.08
    });
    const faceMat = new THREE.MeshStandardMaterial({
      map: faceCanvasObj.tex,
      roughness: 0.25,
      metalness: 0.05
    });
    const limeHighlightMat = new THREE.MeshStandardMaterial({ color: 0xb8ff3b, roughness: 0.3 });
    const midGreenMat = new THREE.MeshStandardMaterial({ color: 0x58cc02, roughness: 0.35 });
    const darkGreenMat = new THREE.MeshStandardMaterial({ color: 0x2b8a04, roughness: 0.4 });
    const pinkAccentMat = new THREE.MeshStandardMaterial({ color: 0xff5ca8, roughness: 0.3 });
    const whiteFootMat = new THREE.MeshStandardMaterial({ color: 0xf8fff9, roughness: 0.25 });

    const bodyMaterials = [skinMat, skinMat, skinMat, skinMat, faceMat, skinMat];
    const torsoGeo = new THREE.BoxGeometry(2.9, 2.5, 2.3);
    const torsoMesh = new THREE.Mesh(torsoGeo, bodyMaterials);
    torsoMesh.position.set(0, 0.35, 0);
    characterGroup.add(torsoMesh);

    // Outer Glassmorphic Protective Shield Shell
    const glassShellGeo = new THREE.BoxGeometry(2.98, 2.58, 2.38);
    const glassShellMat = new THREE.MeshPhysicalMaterial({
      color: 0xb8ff50,
      transparent: true,
      opacity: 0.12,
      roughness: 0.08,
      clearcoat: 1.0
    });
    const glassShell = new THREE.Mesh(glassShellGeo, glassShellMat);
    torsoMesh.add(glassShell);

    // 2 Voxel Bunny Ears
    function createVoxelEar(isLeft: boolean) {
      const earGroup = new THREE.Group();
      const xPos = isLeft ? -0.82 : 0.82;
      earGroup.position.set(xPos, 1.6, 0.05);

      const base = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.42, 0.54), midGreenMat);
      base.position.y = 0.21;
      earGroup.add(base);

      const mid = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.72, 0.48), midGreenMat);
      mid.position.y = 0.78;
      earGroup.add(mid);

      const innerPink = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.36, 0.52), pinkAccentMat);
      innerPink.position.set(0, 0.72, 0.02);
      earGroup.add(innerPink);

      const tip = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.42), limeHighlightMat);
      tip.position.y = 1.30;
      earGroup.add(tip);

      return earGroup;
    }

    const earLeft = createVoxelEar(true);
    const earRight = createVoxelEar(false);
    characterGroup.add(earLeft, earRight);

    // 2 Articulated Pixel Arms
    function createSideArm(isLeft: boolean) {
      const armGroup = new THREE.Group();
      const dir = isLeft ? -1 : 1;
      armGroup.position.set(dir * 1.48, 0.32, 0);

      const armBlock = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.96, 0.68), midGreenMat);
      armBlock.position.set(dir * 0.22, -0.18, 0);
      armGroup.add(armBlock);

      const topCap = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.24, 0.70), limeHighlightMat);
      topCap.position.set(dir * 0.22, 0.40, 0);
      armGroup.add(topCap);

      const handTip = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.22, 0.72), darkGreenMat);
      handTip.position.set(dir * 0.22, -0.72, 0);
      armGroup.add(handTip);

      return armGroup;
    }

    const armLeft = createSideArm(true);
    const armRight = createSideArm(false);
    characterGroup.add(armLeft, armRight);

    // 4 Quadruped Boots
    function createQuadLeg(x: number, z: number) {
      const legGroup = new THREE.Group();
      legGroup.position.set(x, -0.9, z);

      const cuff = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.22, 0.68), limeHighlightMat);
      cuff.position.y = -0.08;
      legGroup.add(cuff);

      const lowerLeg = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.74, 0.66), whiteFootMat);
      lowerLeg.position.y = -0.54;
      legGroup.add(lowerLeg);

      const greenStripe = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.13, 0.70), midGreenMat);
      greenStripe.position.y = -0.36;
      legGroup.add(greenStripe);

      return legGroup;
    }

    const legFL = createQuadLeg(-0.82, 0.58);
    const legFR = createQuadLeg(0.82, 0.58);
    const legBL = createQuadLeg(-0.82, -0.58);
    const legBR = createQuadLeg(0.82, -0.58);
    characterGroup.add(legFL, legFR, legBL, legBR);

    // Wagging Pixel Tail
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, -0.32, -1.16);
    characterGroup.add(tailGroup);

    const tailSeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.42, 0.48), midGreenMat);
    tailSeg1.position.set(0, 0.05, -0.22);
    tailGroup.add(tailSeg1);

    const tailSeg2 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.46), midGreenMat);
    tailSeg2.position.set(0, 0.26, -0.54);
    tailGroup.add(tailSeg2);

    const tailTip = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.34), limeHighlightMat);
    tailTip.position.y = 0.48;
    tailTip.position.z = -0.78;
    tailGroup.add(tailTip);

    // 6. Interactive Drag & Tap Impulse
    let rotY = 0.18;
    let tiltX = 0.04;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let jumpVelocity = 0;
    let jumpOffset = 0;

    const handlePointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      rotY += dx * 0.008;
      tiltX = Math.max(-0.25, Math.min(0.3, tiltX + dy * 0.004));
    };

    const handlePointerUp = () => {
      if (!isDragging) return;
      isDragging = false;
      // Trigger playful jump tap
      jumpVelocity = 0.45;
      playPop();
      if (onTap) onTap();
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // 7. 60FPS Hardware Kinematics Loop
    let animId: number;
    const clock = new THREE.Clock();
    let tick = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      tick++;

      // Face update every 4 frames
      if (tick % 4 === 0) {
        updateFaceTexture(currentEmotion, Math.floor(t * 8));
      }

      // Smooth Rotation Lerp
      worldGroup.rotation.y += (rotY - worldGroup.rotation.y) * 0.12;
      worldGroup.rotation.x += (tiltX - worldGroup.rotation.x) * 0.12;

      // Jump Physics
      if (jumpOffset > 0 || jumpVelocity !== 0) {
        jumpOffset += jumpVelocity;
        jumpVelocity -= 0.038;
        if (jumpOffset <= 0) {
          jumpOffset = 0;
          jumpVelocity = 0;
        }
      }

      // Duolingo Emotion Motion States
      let breath = Math.sin(t * 2.8) * 0.05;
      let bounce = 0;

      if (currentEmotion === 'happy' || currentEmotion === 'streak') {
        bounce = Math.abs(Math.sin(t * 7.5)) * 0.28;
        streakLight.intensity = currentEmotion === 'streak' ? 2.5 : 0.8;
      } else if (currentEmotion === 'thinking') {
        breath = Math.sin(t * 1.5) * 0.03;
        characterGroup.rotation.z = Math.sin(t * 2.0) * 0.06;
      } else if (currentEmotion === 'sad') {
        characterGroup.rotation.x = 0.12;
        breath = -0.05;
      } else {
        characterGroup.rotation.z = 0;
        characterGroup.rotation.x = 0;
        streakLight.intensity = 0;
      }

      characterGroup.position.y = breath + jumpOffset + bounce;

      // Arm Animation
      if (currentEmotion === 'happy' || currentEmotion === 'streak') {
        armRight.rotation.z = 0.8 + Math.sin(t * 10) * 0.35;
        armLeft.rotation.z = -0.8 - Math.sin(t * 10) * 0.35;
      } else if (currentEmotion === 'thinking') {
        armRight.rotation.x = -0.8 + Math.sin(t * 3) * 0.15;
        armLeft.rotation.z = -0.15;
      } else if (currentEmotion === 'sad') {
        armRight.rotation.z = 0.15;
        armLeft.rotation.z = -0.15;
      } else {
        armRight.rotation.z = Math.sin(t * 2.2) * 0.06;
        armLeft.rotation.z = -Math.sin(t * 2.2) * 0.06;
      }

      // Ear Physics
      const earWiggle = currentEmotion === 'streak' ? 12 : 2.5;
      earLeft.rotation.z = Math.sin(t * earWiggle) * 0.08;
      earRight.rotation.z = -Math.sin(t * earWiggle) * 0.08;

      // Tail Physics
      tailGroup.rotation.y = Math.sin(t * 4.5) * 0.25;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [currentEmotion, size, interactive, onTap]);

  const handleCompanionVoice = () => {
    playClickSound();
    setIsTalking(true);
    try {
      const voice = getJackVoice();
      voice.speakHinglish(bubbleMessage);
    } catch {}
    setTimeout(() => setIsTalking(false), 2400);
  };

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Speech Bubble with Voice Synth Tap */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.92 }}
            onClick={handleCompanionVoice}
            className="mb-2 cursor-pointer max-w-[280px] px-3.5 py-2 rounded-2xl bg-[rgba(15,23,42,0.92)] backdrop-blur-xl border border-emerald-500/40 shadow-[0_8px_24px_rgba(0,0,0,0.6),0_0_15px_rgba(16,185,129,0.25)] flex items-center gap-2"
          >
            <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs font-black text-white leading-tight">
              {bubbleMessage}
            </p>
            <button
              title="Speak"
              className="ml-auto text-emerald-400 hover:text-emerald-300 p-0.5"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Canvas Viewport */}
      <div
        ref={containerRef}
        style={{ width: '100%', height: typeof size === 'number' ? `${size}px` : size }}
        className="relative flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
      />
    </div>
  );
};
