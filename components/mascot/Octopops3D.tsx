'use client';

import React, { useEffect, useRef } from 'react';

interface Octopops3DProps {
  isSpeaking?: boolean;
  mood?: 'idle' | 'happy' | 'thinking' | 'celebrate' | 'laugh' | 'shock';
  size?: number; // width/height in px
  showPlatform?: boolean;
}

export const Octopops3D: React.FC<Octopops3DProps> = ({
  isSpeaking = false,
  mood = 'idle',
  size = 140,
  showPlatform = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Isometric 3D Voxel projection
    const isoX = (x: number, y: number, z: number, cx: number) => {
      return cx + (x - z) * 3.8;
    };
    const isoY = (x: number, y: number, z: number, cy: number) => {
      return cy + (x + z) * 1.9 - y * 4.4;
    };

    // Render a single 3D Voxel (Cube) with shading
    const drawVoxel = (
      x: number,
      y: number,
      z: number,
      topColor: string,
      leftColor: string,
      rightColor: string,
      cx: number,
      cy: number,
      vSize = 4.2
    ) => {
      const px = isoX(x, y, z, cx);
      const py = isoY(x, y, z, cy);

      const dx = vSize * 1.8;
      const dy = vSize * 0.9;
      const h = vSize * 2.2;

      // Top face
      ctx.beginPath();
      ctx.moveTo(px, py - h);
      ctx.lineTo(px + dx, py - dy - h);
      ctx.lineTo(px, py - 2 * dy - h);
      ctx.lineTo(px - dx, py - dy - h);
      ctx.closePath();
      ctx.fillStyle = topColor;
      ctx.fill();

      // Left face
      ctx.beginPath();
      ctx.moveTo(px - dx, py - dy - h);
      ctx.lineTo(px, py - h);
      ctx.lineTo(px, py);
      ctx.lineTo(px - dx, py - dy);
      ctx.closePath();
      ctx.fillStyle = leftColor;
      ctx.fill();

      // Right face
      ctx.beginPath();
      ctx.moveTo(px, py - h);
      ctx.lineTo(px + dx, py - dy - h);
      ctx.lineTo(px + dx, py - dy);
      ctx.lineTo(px, py);
      ctx.closePath();
      ctx.fillStyle = rightColor;
      ctx.fill();
    };

    const render = () => {
      time += 0.045;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      // Idle breathing float
      const floatY = Math.sin(time * 2.8) * 3.5;
      const cy = canvas.height / 2 + 12 + floatY;

      // Color Palette: Exact Green Voxel Study Buddy ("Octopops")
      // Primary Emerald: #58CC02 / #80FF44 / #1E8E04 / #B8FF3B
      const greenTop = '#80FF44';
      const greenLeft = '#58CC02';
      const greenRight = '#389B02';

      const neonTop = '#D4FF70';
      const neonLeft = '#B8FF3B';
      const neonRight = '#8AE61A';

      const pinkTop = '#FFA3C8';
      const pinkLeft = '#FF5CA8';
      const pinkRight = '#D42D7C';

      const whiteTop = '#FFFFFF';
      const whiteLeft = '#F0FDF4';
      const whiteRight = '#CBD5E1';

      // 1. Optional Glassmorphic Turntable Platform Below
      if (showPlatform) {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(cx, cy + 34, 48, 14, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(7, 24, 15, 0.7)';
        ctx.fill();
        ctx.strokeStyle = '#58CC02';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Neon Glow Ring
        ctx.beginPath();
        ctx.ellipse(cx, cy + 34, 42, 11, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(184, 255, 80, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      // 2. Four Sturdy Quadruped Legs with White Pixel Boots & Green Stripe
      const legPositions = [
        { x: -3.2, z: 1.5 },  // Front-Left
        { x: 3.2, z: 1.5 },   // Front-Right
        { x: -3.2, z: -2.0 }, // Back-Left
        { x: 3.2, z: -2.0 }   // Back-Right
      ];

      legPositions.forEach((pos, idx) => {
        // Leg marching wiggle
        const marchOffset = Math.sin(time * 4 + idx * Math.PI) * 0.8;

        // Top green cuff
        drawVoxel(pos.x, -2.5 + marchOffset, pos.z, neonTop, neonLeft, neonRight, cx, cy, 1.8);
        // White pixel boot body
        drawVoxel(pos.x, -4.2 + marchOffset, pos.z, whiteTop, whiteLeft, whiteRight, cx, cy, 2.0);
        // Green horizontal stripe on boot
        drawVoxel(pos.x, -3.4 + marchOffset, pos.z + 0.2, greenTop, greenLeft, greenRight, cx, cy, 1.4);
      });

      // 3. Cute 3D Pixel Tail on the Back
      const tailWag = Math.sin(time * 6) * 1.8;
      drawVoxel(tailWag * 0.5, 0.5, -4.2, greenTop, greenLeft, greenRight, cx, cy, 1.8);
      drawVoxel(tailWag * 0.9, 1.8, -5.2, greenTop, greenLeft, greenRight, cx, cy, 1.5);
      drawVoxel(tailWag * 1.3, 2.8, -6.0, neonTop, neonLeft, neonRight, cx, cy, 1.2);

      // 4. Main Cubic Voxel Torso / Head
      // 5x5 Voxel Block in Green with Screen Inset
      for (let y = -1; y <= 4; y++) {
        for (let x = -4; x <= 4; x++) {
          for (let z = -3; z <= 3; z++) {
            // Front face screen inset is darker green
            const isScreenFront = z === 3 && x >= -3 && x <= 3 && y >= 0 && y <= 3;
            if (isScreenFront) {
              drawVoxel(x, y, z, '#389B02', '#226D01', '#1A5301', cx, cy, 1.8);
            } else if (Math.abs(x) === 4 || Math.abs(z) === 3 || y === -1 || y === 4) {
              // Outer voxel shell (bright emerald green)
              drawVoxel(x, y, z, greenTop, greenLeft, greenRight, cx, cy, 1.8);
            }
          }
        }
      }

      // 5. Side Arms / Fins with Neon Top Caps (Picsart reference)
      // Left Arm
      drawVoxel(-5.6, 1.0, 0, greenTop, greenLeft, greenRight, cx, cy, 2.0);
      drawVoxel(-5.6, 2.4, 0, neonTop, neonLeft, neonRight, cx, cy, 2.1);
      // Right Arm
      drawVoxel(5.6, 1.0, 0, greenTop, greenLeft, greenRight, cx, cy, 2.0);
      drawVoxel(5.6, 2.4, 0, neonTop, neonLeft, neonRight, cx, cy, 2.1);

      // 6. Tall 3D Bunny Ears with Pink Interior & Yellow/Neon Tips (from Main_Character_3D_Study_Buddy)
      const earEarWiggle = Math.sin(time * 3) * 0.4;

      // Left Ear
      drawVoxel(-2.5, 5.2, 0.5 + earEarWiggle, greenTop, greenLeft, greenRight, cx, cy, 1.9);
      drawVoxel(-2.5, 6.8, 0.5 + earEarWiggle, greenTop, greenLeft, greenRight, cx, cy, 1.8);
      drawVoxel(-2.5, 6.8, 0.9 + earEarWiggle, pinkTop, pinkLeft, pinkRight, cx, cy, 1.3); // Pink inside
      drawVoxel(-2.5, 8.4, 0.5 + earEarWiggle, neonTop, neonLeft, neonRight, cx, cy, 1.5); // Yellow/Neon Tip

      // Right Ear
      drawVoxel(2.5, 5.2, 0.5 - earEarWiggle, greenTop, greenLeft, greenRight, cx, cy, 1.9);
      drawVoxel(2.5, 6.8, 0.5 - earEarWiggle, greenTop, greenLeft, greenRight, cx, cy, 1.8);
      drawVoxel(2.5, 6.8, 0.9 - earEarWiggle, pinkTop, pinkLeft, pinkRight, cx, cy, 1.3); // Pink inside
      drawVoxel(2.5, 8.4, 0.5 - earEarWiggle, neonTop, neonLeft, neonRight, cx, cy, 1.5); // Yellow/Neon Tip

      // 7. Big Black Square Pixel Eyes with White Glints (Exact match to Green Character image!)
      const blink = Math.sin(time * 0.9) > 0.96;
      if (!blink) {
        // Left Eye (Square Black Block)
        drawVoxel(-2.0, 2.2, 3.8, '#040B06', '#020603', '#000000', cx, cy, 1.9);
        // White reflection pixel in top-left
        drawVoxel(-2.3, 2.6, 4.2, '#FFFFFF', '#F8FAFC', '#E2E8F0', cx, cy, 0.8);

        // Right Eye (Square Black Block)
        drawVoxel(2.0, 2.2, 3.8, '#040B06', '#020603', '#000000', cx, cy, 1.9);
        // White reflection pixel in top-left
        drawVoxel(1.7, 2.6, 4.2, '#FFFFFF', '#F8FAFC', '#E2E8F0', cx, cy, 0.8);
      } else {
        // Blinking line
        drawVoxel(-2.0, 2.2, 3.8, '#040B06', '#020603', '#000000', cx, cy, 1.2);
        drawVoxel(2.0, 2.2, 3.8, '#040B06', '#020603', '#000000', cx, cy, 1.2);
      }

      // 8. Mascot Mouth Logic (CRITICAL RULE):
      // "Silent closed mouth during idle; animated opening mouth triggered only during speech events."
      if (isSpeaking) {
        // Animated open mouth cycle
        const mouthOpen = (Math.sin(time * 14) + 1) / 2;
        // Cavity
        drawVoxel(0, 0.4, 3.9, '#450A0A', '#7F1D1D', '#991B1B', cx, cy, 1.6);
        // White upper teeth bar
        drawVoxel(0, 0.9, 4.1, whiteTop, whiteLeft, whiteRight, cx, cy, 1.2);
        // Pink tongue inside
        if (mouthOpen > 0.35) {
          drawVoxel(0, 0.1, 4.1, '#FB7185', '#F43F5E', '#E11D48', cx, cy, 0.9);
        }
        // Cute pink blush cheeks when speaking
        drawVoxel(-3.2, 0.8, 3.6, '#FDA4AF', '#FB7185', '#F43F5E', cx, cy, 0.9);
        drawVoxel(3.2, 0.8, 3.6, '#FDA4AF', '#FB7185', '#F43F5E', cx, cy, 0.9);
      } else {
        // In Silent Idle: mouth is a clean subtle closed line or silent (matching green reference!)
        drawVoxel(0, 0.5, 3.7, '#1E6B07', '#124803', '#0E3702', cx, cy, 0.9);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSpeaking, mood, showPlatform]);

  return (
    <div className="relative inline-flex items-center justify-center select-none drop-shadow-[0_10px_24px_rgba(88,204,2,0.4)]">
      <canvas
        ref={canvasRef}
        width={size * 2}
        height={size * 2}
        style={{ width: size, height: size }}
        className="pointer-events-none"
      />
    </div>
  );
};
