'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Gamepad2, Sparkles, Maximize2 } from 'lucide-react';

export default function ArenaPage() {
  return (
    <div className="w-full max-w-[500px] mx-auto min-h-screen flex flex-col p-3 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0B1325] border border-cyan-400/40 shadow-xl mb-3">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-black transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Lobby</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <Gamepad2 className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-black uppercase tracking-wider text-white">
            PixelVerse Duo Arena 3D
          </span>
        </div>
        <a
          href="/duo-arena.html"
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500/30 transition-all"
          title="Fullscreen Mode"
        >
          <Maximize2 className="w-4 h-4" />
        </a>
      </div>

      {/* Embedded High-Performance HTML5 Arena Frame */}
      <div className="flex-1 w-full rounded-3xl overflow-hidden border-2 border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.25)] bg-[#050811] relative min-h-[620px]">
        <iframe
          src="/duo-arena.html"
          className="w-full h-full border-0 absolute inset-0"
          title="PixelVerse Duo Arena 3D Arcade"
          allow="autoplay; fullscreen; accelerometer; gyroscope"
        />
      </div>
    </div>
  );
}
