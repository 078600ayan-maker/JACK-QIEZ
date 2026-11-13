'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Gamepad2, ArrowRight, Sparkles, Users } from 'lucide-react';

export function DualArenaHeroSection() {
  return (
    <div className="w-full space-y-3">
      {/* Two Prominent Equal-Weight Surface Containers */}
      <div className="grid grid-cols-2 gap-3">
        {/* Left Container: Study Friend Arena (Emerald accent, open book icon) */}
        <Link
          href="/battle"
          className="p-4 rounded-3xl bg-gradient-to-b from-[#0F2922] via-[#0A1D18] to-[#05110E] border-2 border-emerald-400/60 shadow-[0_12px_32px_rgba(16,185,129,0.22)] hover:border-emerald-300 transition-all cursor-pointer group flex flex-col justify-between h-44 active:scale-[0.98] select-none block"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 mb-2.5 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.35)]">
              <BookOpen className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors leading-tight">
              Study Friend <br />Arena
            </h3>
            <p className="text-[10px] text-emerald-200/70 mt-1 line-clamp-2 leading-tight">
              1v1 Academic duels &amp; synchronized timers with friends.
            </p>
          </div>

          <div className="flex items-center justify-between text-[10px] font-black text-emerald-400 pt-2 border-t border-emerald-400/20">
            <span>Enter Lobby</span>
            <span className="text-xs">→</span>
          </div>
        </Link>

        {/* Right Container: Fun Arena (Blue accent, pixel controller icon) */}
        <Link
          href="/arena"
          className="p-4 rounded-3xl bg-gradient-to-b from-[#0F223D] via-[#0B172B] to-[#070D18] border-2 border-cyan-400/60 shadow-[0_12px_32px_rgba(6,182,212,0.22)] hover:border-cyan-300 transition-all cursor-pointer group flex flex-col justify-between h-44 active:scale-[0.98] select-none block"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 mb-2.5 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.35)]">
              <Gamepad2 className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors leading-tight">
              Fun Arena <br />4 Games 3D
            </h3>
            <p className="text-[10px] text-cyan-200/70 mt-1 line-clamp-2 leading-tight">
              Carrom, Tank Blitz, Air Hockey &amp; Cannon Siege.
            </p>
          </div>

          <div className="flex items-center justify-between text-[10px] font-black text-cyan-400 pt-2 border-t border-cyan-400/20">
            <span>Play 4 Games</span>
            <span className="text-xs">→</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
