'use client';

import React from 'react';
import { playClickSound } from '@/lib/audioEngine';
import { triggerHaptic } from '@/lib/haptics';

interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'emerald' | 'ruby' | 'obsidian' | 'blue' | 'purple';
  children: React.ReactNode;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  variant = 'gold',
  children,
  fullWidth = false,
  size = 'md',
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  const getColors = () => {
    switch (variant) {
      case 'emerald':
        return {
          bg: 'bg-gradient-to-b from-[#10B981] to-[#059669]',
          border: 'border-[#34D399]/40',
          shadow: 'shadow-[0_5px_0_#047857]',
          activeShadow: 'active:shadow-[0_1px_0_#047857]',
          text: 'text-white'
        };
      case 'ruby':
        return {
          bg: 'bg-gradient-to-b from-[#EF4444] to-[#DC2626]',
          border: 'border-[#F87171]/40',
          shadow: 'shadow-[0_5px_0_#991B1B]',
          activeShadow: 'active:shadow-[0_1px_0_#991B1B]',
          text: 'text-white'
        };
      case 'obsidian':
        return {
          bg: 'bg-gradient-to-b from-[#1E293B] to-[#0F172A]',
          border: 'border-white/10',
          shadow: 'shadow-[0_5px_0_#090D16]',
          activeShadow: 'active:shadow-[0_1px_0_#090D16]',
          text: 'text-slate-200'
        };
      case 'blue':
        return {
          bg: 'bg-gradient-to-b from-[#3B82F6] to-[#2563EB]',
          border: 'border-[#60A5FA]/40',
          shadow: 'shadow-[0_5px_0_#1D4ED8]',
          activeShadow: 'active:shadow-[0_1px_0_#1D4ED8]',
          text: 'text-white'
        };
      case 'purple':
        return {
          bg: 'bg-gradient-to-b from-[#8B5CF6] to-[#7C3AED]',
          border: 'border-[#A78BFA]/40',
          shadow: 'shadow-[0_5px_0_#6D28D9]',
          activeShadow: 'active:shadow-[0_1px_0_#6D28D9]',
          text: 'text-white'
        };
      case 'gold':
      default:
        return {
          bg: 'bg-gradient-to-b from-[#FBBF24] via-[#F59E0B] to-[#D97706]',
          border: 'border-[#FDE68A]/50',
          shadow: 'shadow-[0_5px_0_#92400E]',
          activeShadow: 'active:shadow-[0_1px_0_#92400E]',
          text: 'text-slate-950 font-bold'
        };
    }
  };

  const c = getColors();

  const sizeClasses = {
    sm: 'py-2 px-3.5 text-xs rounded-xl',
    md: 'py-3.5 px-6 text-sm font-semibold rounded-2xl',
    lg: 'py-4 px-8 text-base font-bold rounded-2xl tracking-wide'
  }[size];

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    playClickSound();
    triggerHaptic('light');
    onClick?.(e);
  };

  return (
    <button
      className={`
        relative inline-flex items-center justify-center select-none
        border-t border-x
        ${c.bg} ${c.border} ${c.text} ${c.shadow} ${c.activeShadow}
        ${sizeClasses}
        transform transition-all duration-75 ease-out
        active:translate-y-[4px]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {/* Specular Top Rim */}
      <span className="absolute inset-x-0 top-0 h-[1.5px] bg-white/40 rounded-t-xl pointer-events-none" />
      {children}
    </button>
  );
};
