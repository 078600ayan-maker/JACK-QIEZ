'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  AvatarAnimationState,
  AvatarCustomization,
  CHARACTER_PRESETS,
  SHIRTS,
  PANTS,
  SHOES,
  ELYTRA_WINGS,
  ACCESSORIES
} from '@/types/avatar';
import { playAvatarJump, playAvatarCheer, playAvatarCry, playClickSound } from '@/lib/audioEngine';

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
  const activeCustom = customization || CHARACTER_PRESETS[0].defaultCustomization;
  const [currentAnim, setCurrentAnim] = useState<AvatarAnimationState>(animation);

  // Sync animation prop changes
  useEffect(() => {
    setCurrentAnim(animation);
  }, [animation]);

  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Model parts refs for animation
  const partsRef = useRef<{
    rootGroup: THREE.Group;
    bodyGroup: THREE.Group;
    headGroup: THREE.Group;
    leftArmGroup: THREE.Group;
    rightArmGroup: THREE.Group;
    leftLegGroup: THREE.Group;
    rightLegGroup: THREE.Group;
    elytraLeft: THREE.Mesh | null;
    elytraRight: THREE.Mesh | null;
    trophyMesh: THREE.Group | null;
    particlesGroup: THREE.Group;
    headCanvasCtx: CanvasRenderingContext2D | null;
    headTexture: THREE.CanvasTexture | null;
    torsoCanvasCtx: CanvasRenderingContext2D | null;
    torsoTexture: THREE.CanvasTexture | null;
  } | null>(null);

  // Rotation & Drag state
  const dragRef = useRef({
    isDragging: false,
    prevX: 0,
    prevY: 0,
    targetRotY: 0,
    currentRotY: 0,
    targetRotX: 0,
    currentRotX: 0
  });

  // Handle click on canvas
  const handleCanvasClick = () => {
    if (onClickAvatar) {
      onClickAvatar();
      return;
    }
    // Interactive poke response
    if (currentAnim === 'idle') {
      setCurrentAnim('cheer');
      playAvatarJump();
      setTimeout(() => setCurrentAnim('idle'), 2400);
    }
  };

  // Setup Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = typeof size === 'number' ? size : 320;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 1.35, 7.8);
    camera.lookAt(0, 0.95, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 2. Cinematic Royal Obsidian Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff1dc, 1.3);
    keyLight.position.set(4, 9, 7);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const cyanRimLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
    cyanRimLight.position.set(-6, 3, -4);
    scene.add(cyanRimLight);

    const warmGroundLight = new THREE.PointLight(0xf59e0b, 0.7, 12);
    warmGroundLight.position.set(0, -0.6, 2.5);
    scene.add(warmGroundLight);

    // 3. Hierarchical Avatar Rig
    const rootGroup = new THREE.Group();
    rootGroup.position.y = -0.55;
    scene.add(rootGroup);

    // Optional Royal Obsidian Pedestal
    if (showPedestal) {
      const pedestalGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.18, 36);
      const pedestalMat = new THREE.MeshStandardMaterial({
        color: 0x0c1322,
        roughness: 0.25,
        metalness: 0.85
      });
      const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
      pedestal.position.y = -0.09;
      pedestal.receiveShadow = true;
      rootGroup.add(pedestal);

      // Golden Trim Ring
      const ringGeo = new THREE.TorusGeometry(1.62, 0.025, 12, 48);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.95,
        roughness: 0.2
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.01;
      rootGroup.add(ring);
    }

    const bodyGroup = new THREE.Group();
    rootGroup.add(bodyGroup);

    // Procedural Voxel Texture Generators
    const createPixelCanvas = (w: number, h: number) => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;
      const tex = new THREE.CanvasTexture(c);
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      return { canvas: c, ctx, tex };
    };

    // Head Texture (64x64 pixel layout)
    const headCanvas = createPixelCanvas(64, 64);
    // Torso Texture (64x64 pixel layout)
    const torsoCanvas = createPixelCanvas(64, 64);

    // Materials
    const headMaterial = new THREE.MeshStandardMaterial({
      map: headCanvas.tex,
      roughness: 0.65,
      metalness: 0.05
    });

    const torsoMaterial = new THREE.MeshStandardMaterial({
      map: torsoCanvas.tex,
      roughness: 0.6,
      metalness: 0.1
    });

    // Limb Standard Materials
    const limbMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.7,
      metalness: 0.1
    });

    // --- A. TORSO ---
    // Minecraft torso is 8 units wide, 12 units high, 4 units deep (scaled to Three.js units: 0.8 x 1.2 x 0.4)
    const torsoGeo = new THREE.BoxGeometry(0.8, 1.2, 0.4);
    const torsoMesh = new THREE.Mesh(torsoGeo, torsoMaterial);
    torsoMesh.position.y = 1.35;
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    bodyGroup.add(torsoMesh);

    // --- B. HEAD ---
    // Head pivot at top of torso: y = 1.95
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.95, 0);
    bodyGroup.add(headGroup);

    const headGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const headMesh = new THREE.Mesh(headGeo, headMaterial);
    headMesh.position.y = 0.4;
    headMesh.castShadow = true;
    headMesh.receiveShadow = true;
    headGroup.add(headMesh);

    // Hair / Hat Outer Layer Box (slightly larger 0.86 x 0.86 x 0.86 for 3D depth)
    const hairGeo = new THREE.BoxGeometry(0.86, 0.86, 0.86);
    const hairMat = new THREE.MeshStandardMaterial({
      color: activeCustom.hairColor,
      roughness: 0.8,
      transparent: true,
      opacity: activeCustom.hairStyle === 'bald' ? 0 : 0.85
    });
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.y = 0.42;
    headGroup.add(hairMesh);

    // 3D Accessory on Head (Crown / Glasses)
    let crownMesh: THREE.Group | null = null;
    if (activeCustom.accessory === 'golden_crown') {
      crownMesh = new THREE.Group();
      crownMesh.position.set(0, 0.82, 0);
      const crownBase = new THREE.CylinderGeometry(0.44, 0.44, 0.16, 8);
      const crownMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        metalness: 0.9,
        roughness: 0.2
      });
      const crownBaseMesh = new THREE.Mesh(crownBase, crownMat);
      crownMesh.add(crownBaseMesh);

      // Ruby Gems on Crown
      for (let g = 0; g < 4; g++) {
        const gemGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
        const gemMat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0x991b1b,
          roughness: 0.2
        });
        const gem = new THREE.Mesh(gemGeo, gemMat);
        const angle = (g * Math.PI) / 2;
        gem.position.set(Math.sin(angle) * 0.44, 0.02, Math.cos(angle) * 0.44);
        crownMesh.add(gem);
      }
      headGroup.add(crownMesh);
    }

    // --- C. LEFT & RIGHT ARMS ---
    // Arms are 4x12x4 (0.4 x 1.2 x 0.4). Pivot at shoulders: y = 1.85, x = +/- 0.6
    const armGeo = new THREE.BoxGeometry(0.4, 1.2, 0.4);
    armGeo.translate(0, -0.5, 0); // shift center so pivot is at top of arm

    // Left Arm
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(0.6, 1.85, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, limbMaterial.clone());
    leftArmMesh.castShadow = true;
    leftArmGroup.add(leftArmMesh);
    bodyGroup.add(leftArmGroup);

    // Right Arm
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(-0.6, 1.85, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, limbMaterial.clone());
    rightArmMesh.castShadow = true;
    rightArmGroup.add(rightArmMesh);
    bodyGroup.add(rightArmGroup);

    // 3D Trophy Mesh in Right Hand (for victory celebration)
    const trophyGroup = new THREE.Group();
    trophyGroup.position.set(0, -1.1, 0.3);
    trophyGroup.scale.set(0.85, 0.85, 0.85);

    const cupMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0x78350f
    });
    const cupBase = new THREE.CylinderGeometry(0.2, 0.25, 0.12, 16);
    const cupStem = new THREE.CylinderGeometry(0.06, 0.06, 0.25, 12);
    const cupBowl = new THREE.CylinderGeometry(0.26, 0.16, 0.35, 16);
    const mBase = new THREE.Mesh(cupBase, cupMat);
    const mStem = new THREE.Mesh(cupStem, cupMat);
    mStem.position.y = 0.16;
    const mBowl = new THREE.Mesh(cupBowl, cupMat);
    mBowl.position.y = 0.42;
    trophyGroup.add(mBase, mStem, mBowl);
    trophyGroup.visible = false;
    rightArmGroup.add(trophyGroup);

    // --- D. LEFT & RIGHT LEGS ---
    // Legs are 4x12x4 (0.4 x 1.2 x 0.4). Pivot at hips: y = 0.75, x = +/- 0.2
    const legGeo = new THREE.BoxGeometry(0.4, 1.2, 0.4);
    legGeo.translate(0, -0.6, 0); // pivot at hip

    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(0.2, 0.75, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, limbMaterial.clone());
    leftLegMesh.castShadow = true;
    leftLegMesh.receiveShadow = true;
    leftLegGroup.add(leftLegMesh);
    bodyGroup.add(leftLegGroup);

    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(-0.2, 0.75, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, limbMaterial.clone());
    rightLegMesh.castShadow = true;
    rightLegMesh.receiveShadow = true;
    rightLegGroup.add(rightLegMesh);
    bodyGroup.add(rightLegGroup);

    // --- E. ELYTRA WINGS (Articulated on Back) ---
    let elytraLeft: THREE.Mesh | null = null;
    let elytraRight: THREE.Mesh | null = null;

    if (activeCustom.elytra && activeCustom.elytra !== 'none') {
      const wingShape = new THREE.Shape();
      wingShape.moveTo(0, 0);
      wingShape.lineTo(0.38, -0.15);
      wingShape.lineTo(0.35, -0.85);
      wingShape.lineTo(0.08, -1.05);
      wingShape.lineTo(0, -0.8);
      wingShape.closePath();

      const wingGeo = new THREE.ShapeGeometry(wingShape);
      const wingConf = ELYTRA_WINGS.find(w => w.id === activeCustom.elytra);
      const wingMat = new THREE.MeshStandardMaterial({
        color: wingConf?.color ? parseInt(wingConf.color.replace('#', '0x')) : 0x1c1917,
        side: THREE.DoubleSide,
        roughness: 0.4,
        metalness: 0.5
      });

      elytraLeft = new THREE.Mesh(wingGeo, wingMat);
      elytraLeft.position.set(0.06, 1.8, -0.21);
      elytraLeft.rotation.set(0.2, -0.3, -0.1);
      bodyGroup.add(elytraLeft);

      const rightWingGeo = wingGeo.clone();
      rightWingGeo.scale(-1, 1, 1);
      elytraRight = new THREE.Mesh(rightWingGeo, wingMat);
      elytraRight.position.set(-0.06, 1.8, -0.21);
      elytraRight.rotation.set(0.2, 0.3, 0.1);
      bodyGroup.add(elytraRight);
    }

    // --- F. DYNAMIC PARTICLE SYSTEM (Teardrops, Sparkles, Confetti) ---
    const particlesGroup = new THREE.Group();
    scene.add(particlesGroup);

    const particlePool: Array<{
      mesh: THREE.Mesh;
      vx: number;
      vy: number;
      vz: number;
      life: number;
      maxLife: number;
    }> = [];

    const sparkGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);

    // Save refs
    partsRef.current = {
      rootGroup,
      bodyGroup,
      headGroup,
      leftArmGroup,
      rightArmGroup,
      leftLegGroup,
      rightLegGroup,
      elytraLeft,
      elytraRight,
      trophyMesh: trophyGroup,
      particlesGroup,
      headCanvasCtx: headCanvas.ctx,
      headTexture: headCanvas.tex,
      torsoCanvasCtx: torsoCanvas.ctx,
      torsoTexture: torsoCanvas.tex
    };

    // Render Canvas Textures once
    renderCustomTextures();

    // 4. Mouse / Touch Drag Orbit Handling
    const dom = renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      dragRef.current.isDragging = true;
      dragRef.current.prevX = e.clientX;
      dragRef.current.prevY = e.clientY;
      dom.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragRef.current.isDragging || !interactive) return;
      const dx = e.clientX - dragRef.current.prevX;
      const dy = e.clientY - dragRef.current.prevY;
      dragRef.current.prevX = e.clientX;
      dragRef.current.prevY = e.clientY;

      dragRef.current.targetRotY += dx * 0.012;
      dragRef.current.targetRotX = Math.max(
        -0.4,
        Math.min(0.4, dragRef.current.targetRotX + dy * 0.008)
      );
    };

    const onPointerUp = (e: PointerEvent) => {
      dragRef.current.isDragging = false;
      try {
        dom.releasePointerCapture(e.pointerId);
      } catch {}
    };

    dom.addEventListener('pointerdown', onPointerDown);
    dom.addEventListener('pointermove', onPointerMove);
    dom.addEventListener('pointerup', onPointerUp);

    // 5. 60FPS RAF Animation Loop with Delta-time & Physics
    let lastTime = performance.now();
    let clockTime = 0;

    const animate = (now: number) => {
      animFrameId.current = requestAnimationFrame(animate);

      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      clockTime += dt;

      const p = partsRef.current;
      if (!p) return;

      // Smooth Orbit Drag Spring
      const drag = dragRef.current;
      if (!drag.isDragging) {
        // Slowly return towards front angle if idle
        drag.targetRotY *= 0.985;
        drag.targetRotX *= 0.96;
      }
      drag.currentRotY += (drag.targetRotY - drag.currentRotY) * 0.15;
      drag.currentRotX += (drag.targetRotX - drag.currentRotX) * 0.15;
      p.rootGroup.rotation.y = drag.currentRotY;
      p.rootGroup.rotation.x = drag.currentRotX;

      // Handle Elytra Wing Flap Physics
      if (p.elytraLeft && p.elytraRight) {
        const flapRate = currentAnim === 'victory' || currentAnim === 'cheer' ? 12 : 2.5;
        const flapAngle = Math.sin(clockTime * flapRate) * 0.28 + 0.35;
        p.elytraLeft.rotation.y = -flapAngle;
        p.elytraRight.rotation.y = flapAngle;
      }

      // Handle Animations
      switch (currentAnim) {
        case 'idle': {
          if (p.trophyMesh) p.trophyMesh.visible = false;
          // Breathing bounce on torso
          p.bodyGroup.position.y = Math.sin(clockTime * 2.5) * 0.035;
          p.headGroup.rotation.y = Math.sin(clockTime * 1.2) * 0.08;
          p.headGroup.rotation.x = Math.sin(clockTime * 2.5) * 0.03;
          // Gentle arm sways
          p.leftArmGroup.rotation.x = Math.sin(clockTime * 2) * 0.08;
          p.rightArmGroup.rotation.x = -Math.sin(clockTime * 2) * 0.08;
          p.leftArmGroup.rotation.z = 0.08;
          p.rightArmGroup.rotation.z = -0.08;
          // Legs steady
          p.leftLegGroup.rotation.x = 0;
          p.rightLegGroup.rotation.x = 0;
          break;
        }

        case 'cheer': {
          if (p.trophyMesh) p.trophyMesh.visible = false;
          // Bouncy jumping spring
          const jumpPhase = Math.abs(Math.sin(clockTime * 7));
          p.bodyGroup.position.y = jumpPhase * 0.35;
          // Arms raised high in victory V
          p.leftArmGroup.rotation.x = Math.PI * 0.85;
          p.rightArmGroup.rotation.x = Math.PI * 0.85;
          p.leftArmGroup.rotation.z = 0.35 + Math.sin(clockTime * 8) * 0.15;
          p.rightArmGroup.rotation.z = -0.35 - Math.sin(clockTime * 8) * 0.15;
          // Head tilting up happily
          p.headGroup.rotation.x = -0.25;
          p.headGroup.rotation.y = Math.sin(clockTime * 6) * 0.15;

          // Spawn sparkle particles
          if (Math.random() < 0.25 && particlePool.length < 24) {
            const spk = new THREE.Mesh(
              sparkGeo,
              new THREE.MeshBasicMaterial({
                color: Math.random() > 0.5 ? 0xfacc15 : 0x10b981
              })
            );
            spk.position.set(
              (Math.random() - 0.5) * 1.2,
              1.6 + Math.random() * 0.8,
              (Math.random() - 0.5) * 0.8
            );
            p.particlesGroup.add(spk);
            particlePool.push({
              mesh: spk,
              vx: (Math.random() - 0.5) * 1.5,
              vy: 0.8 + Math.random() * 1.2,
              vz: (Math.random() - 0.5) * 1.5,
              life: 0,
              maxLife: 0.65
            });
          }
          break;
        }

        case 'laugh': {
          if (p.trophyMesh) p.trophyMesh.visible = false;
          // Head bobbing rapidly
          p.headGroup.rotation.x = Math.sin(clockTime * 14) * 0.18 - 0.1;
          p.bodyGroup.position.y = Math.abs(Math.sin(clockTime * 10)) * 0.08;
          // Arms resting on waist / hips
          p.leftArmGroup.rotation.x = 0.2;
          p.rightArmGroup.rotation.x = 0.2;
          p.leftArmGroup.rotation.z = 0.55;
          p.rightArmGroup.rotation.z = -0.55;
          break;
        }

        case 'cry': {
          if (p.trophyMesh) p.trophyMesh.visible = false;
          // Head slumped down and slight shiver
          p.headGroup.rotation.x = 0.42;
          p.headGroup.rotation.y = Math.sin(clockTime * 16) * 0.04; // shivering
          p.bodyGroup.position.y = -0.06;
          // Arms raised up to cover eyes / face
          p.leftArmGroup.rotation.x = Math.PI * 0.55;
          p.rightArmGroup.rotation.x = Math.PI * 0.55;
          p.leftArmGroup.rotation.z = 0.28;
          p.rightArmGroup.rotation.z = -0.28;

          // Spawn blue teardrop particles dropping from eyes
          if (Math.random() < 0.2 && particlePool.length < 20) {
            const tear = new THREE.Mesh(
              sparkGeo,
              new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
            );
            const side = Math.random() > 0.5 ? 0.18 : -0.18;
            tear.position.set(side, 2.2, 0.42);
            p.particlesGroup.add(tear);
            particlePool.push({
              mesh: tear,
              vx: side * 0.2,
              vy: -1.2,
              vz: 0.1,
              life: 0,
              maxLife: 0.55
            });
          }
          break;
        }

        case 'victory': {
          // Trophy held high in right hand!
          if (p.trophyMesh) p.trophyMesh.visible = true;
          // High athletic champion jump
          const jumpY = Math.abs(Math.sin(clockTime * 5)) * 0.5;
          p.bodyGroup.position.y = jumpY;
          // Right arm raised triumphantly holding trophy
          p.rightArmGroup.rotation.x = Math.PI * 0.95;
          p.rightArmGroup.rotation.z = -0.2;
          // Left arm waving
          p.leftArmGroup.rotation.x = Math.PI * 0.8;
          p.leftArmGroup.rotation.z = 0.45 + Math.sin(clockTime * 8) * 0.2;
          p.headGroup.rotation.x = -0.3;
          p.headGroup.rotation.y = Math.sin(clockTime * 4) * 0.25;

          // Confetti particles stream
          if (Math.random() < 0.4 && particlePool.length < 35) {
            const colors = [0xfacc15, 0x38bdf8, 0xef4444, 0x10b981, 0xa855f7];
            const conf = new THREE.Mesh(
              sparkGeo,
              new THREE.MeshBasicMaterial({
                color: colors[Math.floor(Math.random() * colors.length)]
              })
            );
            conf.position.set(
              (Math.random() - 0.5) * 1.8,
              1.2 + Math.random() * 1.2,
              (Math.random() - 0.5) * 1.2
            );
            p.particlesGroup.add(conf);
            particlePool.push({
              mesh: conf,
              vx: (Math.random() - 0.5) * 2.2,
              vy: 1.5 + Math.random() * 1.8,
              vz: (Math.random() - 0.5) * 2.2,
              life: 0,
              maxLife: 0.85
            });
          }
          break;
        }
      }

      // Update particle physics
      for (let i = particlePool.length - 1; i >= 0; i--) {
        const pt = particlePool[i];
        pt.life += dt;
        pt.mesh.position.x += pt.vx * dt;
        pt.mesh.position.y += pt.vy * dt;
        pt.mesh.position.z += pt.vz * dt;
        pt.vy -= 4.2 * dt; // gravity

        if (pt.life >= pt.maxLife) {
          p.particlesGroup.remove(pt.mesh);
          pt.mesh.geometry.dispose();
          particlePool.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };

    animFrameId.current = requestAnimationFrame(animate);

    // Resize observer
    const ro = new ResizeObserver(() => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth || 320;
      const h = typeof size === 'number' ? size : 320;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    });
    ro.observe(container);

    // Cleanup
    return () => {
      ro.disconnect();
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      dom.removeEventListener('pointerdown', onPointerDown);
      dom.removeEventListener('pointermove', onPointerMove);
      dom.removeEventListener('pointerup', onPointerUp);
      if (rendererRef.current?.domElement) {
        container.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, [size, showPedestal, interactive]);

  // Texture Painter helper
  const renderCustomTextures = useCallback(() => {
    const p = partsRef.current;
    if (!p || !p.headCanvasCtx || !p.torsoCanvasCtx) return;

    // --- Paint Head Texture (Face, Eyes, Lips, Hair) ---
    const hctx = p.headCanvasCtx;
    const tctx = p.torsoCanvasCtx;

    // If activeCustom has a skinPath, paint actual Minecraft skin image onto the canvases!
    if (activeCustom.skinPath) {
      if (typeof window !== 'undefined') {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = activeCustom.skinPath;
        img.onload = () => {
          try {
            hctx.clearRect(0, 0, 64, 64);
            hctx.imageSmoothingEnabled = false;
            // Draw head front from 64x64 skin (head front is 8,8, 8,8)
            hctx.drawImage(img, 8, 8, 8, 8, 0, 0, 64, 64);

            tctx.clearRect(0, 0, 64, 64);
            tctx.imageSmoothingEnabled = false;
            // Draw torso front (20, 20, 8, 12)
            tctx.drawImage(img, 20, 20, 8, 12, 0, 0, 64, 64);

            if (p.headTexture) p.headTexture.needsUpdate = true;
            if (p.torsoTexture) p.torsoTexture.needsUpdate = true;
          } catch {}
        };
      }
    }

    hctx.fillStyle = activeCustom.skinTone;
    hctx.fillRect(0, 0, 64, 64);

    // Hair Top & Fringe
    hctx.fillStyle = activeCustom.hairColor;
    hctx.fillRect(0, 0, 64, 20); // hair forehead fringe
    hctx.fillRect(0, 0, 14, 38); // left sideburn
    hctx.fillRect(50, 0, 14, 38); // right sideburn

    // Eyes
    // Left eye (white + colored iris)
    hctx.fillStyle = '#FFFFFF';
    hctx.fillRect(16, 24, 10, 8);
    hctx.fillStyle = activeCustom.eyeColor;
    hctx.fillRect(16, 26, 6, 6);

    // Right eye
    hctx.fillStyle = '#FFFFFF';
    hctx.fillRect(38, 24, 10, 8);
    hctx.fillStyle = activeCustom.eyeColor;
    hctx.fillRect(42, 26, 6, 6);

    // Eyebrows
    hctx.fillStyle = activeCustom.hairColor;
    hctx.fillRect(16, 21, 10, 3);
    hctx.fillRect(38, 21, 10, 3);

    // Lips / Mouth
    hctx.fillStyle = '#6E3A28';
    hctx.fillRect(26, 42, 12, 4);

    if (p.headTexture) p.headTexture.needsUpdate = true;

    // --- Paint Torso Texture (Shirt, Armor, Details) ---
    const shirtConf = SHIRTS.find(s => s.id === activeCustom.shirt) || SHIRTS[0];
    tctx.fillStyle = shirtConf.color;
    tctx.fillRect(0, 0, 64, 64);

    // V-neck skin cutout
    tctx.fillStyle = activeCustom.skinTone;
    tctx.beginPath();
    tctx.moveTo(22, 0);
    tctx.lineTo(42, 0);
    tctx.lineTo(32, 16);
    tctx.closePath();
    tctx.fill();

    // Shirt collar / armor trim
    tctx.fillStyle = shirtConf.trim;
    tctx.fillRect(0, 60, 64, 4); // bottom hem
    tctx.fillRect(20, 0, 2, 14);
    tctx.fillRect(42, 0, 2, 14);

    // If Diamond or Netherite plate, paint gem rivets
    if (activeCustom.shirt.includes('plate') || activeCustom.shirt.includes('gold')) {
      tctx.fillStyle = '#FFFFFF';
      tctx.fillRect(14, 24, 4, 4);
      tctx.fillRect(46, 24, 4, 4);
      tctx.fillRect(14, 44, 4, 4);
      tctx.fillRect(46, 44, 4, 4);
    }

    if (p.torsoTexture) p.torsoTexture.needsUpdate = true;
  }, [activeCustom]);

  // Re-render textures whenever customization props change
  useEffect(() => {
    renderCustomTextures();
  }, [renderCustomTextures]);

  return (
    <div
      className={`relative select-none flex flex-col items-center justify-center ${className}`}
    >
      {/* Dynamic Comic Speech Bubble */}
      {speechText && (
        <div className="absolute top-1 z-20 max-w-[85%] px-3.5 py-1.5 rounded-2xl bg-[rgba(20,27,45,0.92)] backdrop-blur-xl border border-amber-400/40 shadow-[0_8px_24px_rgba(0,0,0,0.6)] text-center animate-fade-in pointer-events-none">
          <p className="text-xs font-black text-amber-300 tracking-tight leading-snug">
            {speechText}
          </p>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[rgba(20,27,45,0.92)] border-r border-b border-amber-400/40 rotate-45" />
        </div>
      )}

      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        className="w-full flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform"
        style={{ height: typeof size === 'number' ? `${size}px` : size }}
      />
    </div>
  );
};
