'use client';

import React from 'react';

export type VerificationTickColor = 'green' | 'red' | 'black';

interface VerificationTickProps {
  tick?: VerificationTickColor | string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

const TICK_CONFIG: Record<
  VerificationTickColor,
  {
    src: string;
    label: string;
    title: string;
    pillClass: string;
  }
> = {
  green: {
    src: '/assets/badges/tick-green.png',
    label: 'Verified Scholar',
    title: 'Green Badge — Default Verified JackQuiz Scholar',
    pillClass: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
  },
  red: {
    src: '/assets/badges/tick-red.png',
    label: 'Red Admin Verified',
    title: 'Red Badge — Admin-Awarded Special Verification',
    pillClass: 'bg-red-500/15 border-red-500/40 text-red-300',
  },
  black: {
    src: '/assets/badges/tick-black.png',
    label: 'Black Elite Verified',
    title: 'Black Badge — Admin-Awarded Elite Verification',
    pillClass: 'bg-zinc-900 border-amber-400/50 text-amber-200',
  },
};

const SIZE_PX: Record<NonNullable<VerificationTickProps['size']>, number> = {
  xs: 15,
  sm: 18,
  md: 21,
  lg: 26,
};

export function normalizeVerificationTick(tick?: string): VerificationTickColor {
  if (tick === 'red' || tick === 'black') return tick;
  return 'green';
}

export const VerificationTick: React.FC<VerificationTickProps> = ({
  tick,
  size = 'sm',
  className = '',
  showLabel = false,
}) => {
  const color = normalizeVerificationTick(tick);
  const cfg = TICK_CONFIG[color];
  const px = SIZE_PX[size];

  const badge = (
    <img
      src={cfg.src}
      alt={cfg.label}
      width={px}
      height={px}
      style={{ width: px, height: px }}
      className={`inline-block shrink-0 object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)] ${className}`}
    />
  );

  if (!showLabel) {
    return (
      <span title={cfg.title} className="inline-flex items-center shrink-0">
        {badge}
      </span>
    );
  }

  return (
    <span
      title={cfg.title}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-black ${cfg.pillClass}`}
    >
      {badge}
      <span>{cfg.label}</span>
    </span>
  );
};
