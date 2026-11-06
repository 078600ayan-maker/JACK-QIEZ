'use client';

import React from 'react';
import { NativeOctopops3D, MascotAnimation } from './NativeOctopops3D';

interface StudyBuddy3DViewProps {
  mode?: 'lobby' | 'floating' | 'card';
  initialAction?: string;
  initialMood?: string;
  height?: number | string;
  showControls?: boolean;
  className?: string;
}

/**
 * Native Three.js WebGL Mascot Wrapper (Zero iframes, 100% Native 60 FPS)
 */
export const StudyBuddy3DView: React.FC<StudyBuddy3DViewProps> = ({
  mode = 'lobby',
  initialAction = 'idle',
  height = 320,
  showControls = true,
  className = ''
}) => {
  const anim: MascotAnimation =
    initialAction === 'laugh' || initialAction === 'cry' || initialAction === 'cheer'
      ? (initialAction as MascotAnimation)
      : 'idle';

  return (
    <NativeOctopops3D
      size={height}
      animation={anim}
      showControls={showControls && mode !== 'floating'}
      className={className}
    />
  );
};
