'use client';

import React, { useEffect } from 'react';
import { RotateCcw, Home } from 'lucide-react';
import { TactileButton } from '@/components/ui/TactileButton';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error Boundary caught exception:', error);
  }, [error]);

  return (
    <div className="relative min-h-[100dvh] w-full max-w-[480px] mx-auto bg-[#090D16] flex flex-col items-center justify-center px-4 py-8 select-none">
      <div className="w-full p-6 rounded-3xl bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#090D16] border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.8)] text-center space-y-4">
        {/* Mascot */}
        <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          🐙
        </div>

        <div>
          <h2 className="text-lg font-black text-white tracking-tight">Something Went Wrong</h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            A small glitch occurred, but your study progress is safely preserved.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <TactileButton
            variant="gold"
            fullWidth
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 text-xs font-black py-3.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </TactileButton>

          <button
            onClick={() => { window.location.href = '/'; }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Lobby</span>
          </button>
        </div>
      </div>
    </div>
  );
}
