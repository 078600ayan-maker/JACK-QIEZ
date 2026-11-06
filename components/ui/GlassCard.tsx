import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  isInteractive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glowColor,
  isInteractive = false,
  ...props
}) => {
  return (
    <div
      className={`
        relative rounded-[18px] p-5
        bg-[rgba(30,41,59,0.65)]
        backdrop-blur-[20px] backdrop-saturate-[180%]
        border-t border-[rgba(255,255,255,0.18)]
        border-x border-b border-[rgba(255,255,255,0.06)]
        shadow-[0_12px_32px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.15)]
        transition-all duration-200
        ${isInteractive ? 'hover:scale-[1.01] hover:border-[rgba(255,255,255,0.25)] active:scale-[0.99]' : ''}
        ${className}
      `}
      style={{
        boxShadow: glowColor
          ? `0 12px 32px rgba(0,0,0,0.45), 0 0 24px ${glowColor}33, inset 0 1px 1px rgba(255,255,255,0.15)`
          : undefined
      }}
      {...props}
    >
      {children}
    </div>
  );
};
