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
    fill: string;
    ring: string;
    check: string;
    label: string;
    title: string;
    pillClass: string;
  }
> = {
  green: {
    fill: '#10B981',
    ring: '#34D399',
    check: '#FFFFFF',
    label: 'Verified Scholar',
    title: 'Green Tick — Default Verified JackQuiz Scholar',
    pillClass: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
  },
  red: {
    fill: '#EF4444',
    ring: '#F87171',
    check: '#FFFFFF',
    label: 'Red Admin Verified',
    title: 'Red Tick — Admin-Awarded Special Verification',
    pillClass: 'bg-red-500/15 border-red-500/40 text-red-300',
  },
  black: {
    fill: '#111827',
    ring: '#F59E0B',
    check: '#FDE68A',
    label: 'Black Elite Verified',
    title: 'Black Tick — Admin-Awarded Elite Verification',
    pillClass: 'bg-zinc-900 border-amber-400/50 text-amber-200',
  },
};

const SIZE_PX: Record<NonNullable<VerificationTickProps['size']>, number> = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 22,
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
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      aria-label={cfg.title}
      className={`inline-block shrink-0 ${className}`}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill={cfg.fill}
        stroke={cfg.ring}
        strokeWidth="1.8"
      />
      <path
        d="M7.8 12.4L10.6 15.1L16.4 9.1"
        stroke={cfg.check}
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
