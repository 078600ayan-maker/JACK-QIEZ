'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CircularTimerProps {
  secondsLeft: number;
  totalSeconds: number;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({ secondsLeft, totalSeconds }) => {
  if (totalSeconds <= 0) return null;

  const isUrgent = secondsLeft <= 5;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.max(0, Math.min(1, secondsLeft / totalSeconds));
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <motion.div
      animate={isUrgent ? { scale: [1, 1.15, 1] } : { scale: 1 }}
      transition={isUrgent ? { repeat: Infinity, duration: 0.8, ease: 'easeInOut' } : {}}
      className="relative flex items-center justify-center w-11 h-11 select-none"
    >
      <svg className="w-11 h-11 -rotate-90">
        <circle
          cx="22"
          cy="22"
          r={radius}
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="3"
          fill="rgba(15, 23, 42, 0.6)"
        />
        <circle
          cx="22"
          cy="22"
          r={radius}
          stroke={isUrgent ? '#EF4444' : '#F59E0B'}
          strokeWidth="3.5"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-linear"
        />
      </svg>
      <span
        className={`absolute text-xs font-black ${
          isUrgent ? 'text-[#EF4444] animate-pulse drop-shadow-[0_0_6px_#EF4444]' : 'text-amber-200'
        }`}
      >
        {secondsLeft}
      </span>
    </motion.div>
  );
};
