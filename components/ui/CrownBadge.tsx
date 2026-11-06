'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CrownBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const CrownBadge: React.FC<CrownBadgeProps> = ({ size = 'md', animated = false }) => {
  const dim = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-14 h-14' : 'w-9 h-9';

  const content = (
    <div className={`relative ${dim} inline-flex items-center justify-center drop-shadow-[0_4px_12px_rgba(245,158,11,0.6)]`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="crownGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF7AD" />
            <stop offset="25%" stopColor="#FFA9F9" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Crown Body */}
        <path
          d="M3 18L5 8L9.5 13L12 5L14.5 13L19 8L21 18H3Z"
          fill="url(#crownGold)"
          stroke="#F59E0B"
          strokeWidth="1.2"
          strokeLinejoin="round"
          filter="url(#goldGlow)"
        />

        {/* Jewels */}
        <circle cx="5" cy="8" r="1.5" fill="#FFFFFF" />
        <circle cx="12" cy="5" r="1.8" fill="#FFFFFF" />
        <circle cx="19" cy="8" r="1.5" fill="#FFFFFF" />

        {/* Base Rim */}
        <rect x="3" y="18" width="18" height="3" rx="1.5" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
        <circle cx="7" cy="19.5" r="0.8" fill="#FFF7AD" />
        <circle cx="12" cy="19.5" r="0.8" fill="#FFF7AD" />
        <circle cx="17" cy="19.5" r="0.8" fill="#FFF7AD" />
      </svg>
    </div>
  );

  if (animated) {
    return (
      <motion.div
        animate={{ y: [-3, 3, -3], rotate: [-2, 2, -2] }}
        transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};
