'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Gamepad2,
  Users,
  Bot,
  Maximize2,
  Sparkles,
  Trophy,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { createDuelRoom, joinDuelRoomByPin, subscribeDuelRoom } from '@/lib/socialService';

interface GameInfo {
  id: 'carrom' | 'tank' | 'hockey' | 'cannon' | 'chess' | 'connect4' | 'snakes' | 'checkers' | 'archery' | 'boxing';
  name: string;
  tag: string;
  badge: string;
  icon: string;
  desc: string;
  bgGradient: string;
  borderColor: string;
  accentColor: string;
}

const GAMES: GameInfo[] = [
  {
    id: 'carrom',
    name: 'Royal Carrom 3D',
    tag: 'Classic Tabletop',
    badge: 'BOARD 3D',
    icon: '🎯',
    desc: 'Wooden voxel board, striker pull-back slingshot trajectory aiming & Queen cover rules.',
    bgGradient: 'from-amber-950/70 via-[#18120B] to-[#0A0704]',
    borderColor: 'border-amber-400/50',
    accentColor: 'text-amber-300',
  },
  {
    id: 'tank',
    name: 'Voxel Tank Blitz 3D',
    tag: 'Tactical Battle',
    badge: 'WAR 2.5D',
    icon: '🛡️',
    desc: 'Extruded voxel mazes, 4-bounce vector-reflected shells & dual P1/P2 firing consoles.',
    bgGradient: 'from-emerald-950/70 via-[#0C1A14] to-[#050C09]',
    borderColor: 'border-emerald-400/50',
    accentColor: 'text-emerald-300',
  },
  {
    id: 'hockey',
    name: 'Voxel Air Hockey 3D',
    tag: 'Fast Pace Sports',
    badge: '60 FPS',
    icon: '🏒',
    desc: 'Multi-touch mallet control, 4x sub-stepped elastic collision physics & turbo puck pads.',
    bgGradient: 'from-cyan-950/70 via-[#0B1728] to-[#050B14]',
    borderColor: 'border-cyan-400/50',
    accentColor: 'text-cyan-300',
  },
  {
    id: 'cannon',
    name: 'Voxel Cannon Siege 3D',
    tag: 'Artillery Duel',
    badge: 'SIEGE',
    icon: '💥',
    desc: 'Turn-based destructible voxel terrain, wind physics, cluster mortars & plasma piercers.',
    bgGradient: 'from-rose-950/70 via-[#1F0E13] to-[#0D0507]',
    borderColor: 'border-rose-400/50',
    accentColor: 'text-rose-300',
  },
  {
    id: 'chess',
    name: 'Grandmaster Chess 3D',
    tag: 'Strategy Mind Relaxing',
    badge: 'TACTIC 3D',
    icon: '♟️',
    desc: 'Pixelated 3D chess board, real-time move engine, timer clocks & AI bot grandmaster mode.',
    bgGradient: 'from-purple-950/70 via-[#190C28] to-[#0A0512]',
    borderColor: 'border-purple-400/50',
    accentColor: 'text-purple-300',
  },
  {
    id: 'connect4',
    name: 'Voxel Four in a Row',
    tag: 'Mind Battle',
    badge: 'SOLVER',
    icon: '🟡',
    desc: 'Vertical 7x6 3D voxel grid, gravity drop physics, combo chains & tactical block prediction.',
    bgGradient: 'from-yellow-950/70 via-[#261E0A] to-[#0D0A04]',
    borderColor: 'border-yellow-400/50',
    accentColor: 'text-yellow-300',
  },
  {
    id: 'snakes',
    name: 'Pixel Arena Duel 3D',
    tag: 'Arcade Survival',
    badge: 'FAST 60FPS',
    icon: '🐍',
    desc: 'Dynamic 3D voxel snakes, power-up speed orbs, wall wraps & competitive survival duels.',
    bgGradient: 'from-lime-950/70 via-[#14230C] to-[#070D04]',
    borderColor: 'border-lime-400/50',
    accentColor: 'text-lime-300',
  },
  {
    id: 'checkers',
    name: 'Royal Checkers 3D',
    tag: 'Tabletop Classic',
    badge: 'JUMP 3D',
    icon: '👑',
    desc: 'Diagonal multi-jump captures, crowned kings, smooth physics slide & 2-player lobby.',
    bgGradient: 'from-orange-950/70 via-[#28130B] to-[#0F0704]',
    borderColor: 'border-orange-400/50',
    accentColor: 'text-orange-300',
  },
  {
    id: 'archery',
    name: 'Voxel Archery Showdown',
    tag: 'Aim & Precision',
    badge: 'BULLSEYE',
    icon: '🏹',
    desc: '3D wind trajectory deflection, moving targets, distance calculations & precision score duel.',
    bgGradient: 'from-teal-950/70 via-[#0A2422] to-[#030E0D]',
    borderColor: 'border-teal-400/50',
    accentColor: 'text-teal-300',
  },
  {
    id: 'boxing',
    name: 'Retro 3D Boxer Brawl',
    tag: 'Action Arcade',
    badge: 'KNOCKOUT',
    icon: '🥊',
    desc: 'Pixelated Minecraft-style boxing ring, jab/uppercut/dodge mechanics & stamina management.',
    bgGradient: 'from-red-950/70 via-[#2A0C0E] to-[#120405]',
    borderColor: 'border-red-400/50',
    accentColor: 'text-red-300',
  },
];

export default function ArenaPage() {
  const { profile } = useUserStore();
  const [activeGame, setActiveGame] = useState<GameInfo | null>(null);
  const [playMode, setPlayMode] = useState<'bot' | 'friend' | null>(null);
  const [botDiff, setBotDiff] = useState<'easy' | 'normal' | 'hard'>('normal');

  // 4-Digit PIN State
  const [pin, setPin] = useState<string>('');
  const [joinPinInput, setJoinPinInput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [opponent, setOpponent] = useState<{ name: string; photoURL: string; xp: number } | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  // Host PIN generation
  const handleHost = async (game: GameInfo) => {
    if (!profile?.uid) return;
    const generated = String(Math.floor(1000 + Math.random() * 9000));
    setPin(generated);
    try {
      const res = await createDuelRoom(profile, 'sci', game.name, {
        chapterId: 1,
        mode: 'friend',
      });
      if (res?.pin) {
        setPin(res.pin);
        subscribeDuelRoom(res.pin, (updated) => {
          if (updated && updated.guestUid) {
            setOpponent({
              name: updated.guestName || 'Challenger',
              photoURL: updated.guestPhoto || '/assets/profile_photos/IMG_20261109_001602.png',
              xp: updated.guestXp || 150,
            });
          }
        });
      }
    } catch {}
  };

  // Join PIN
  const handleJoin = async () => {
    if (!profile?.uid || joinPinInput.length !== 4) return;
    try {
      const res = await joinDuelRoomByPin(joinPinInput, profile);
      if (res.ok && res.room) {
        setPin(joinPinInput);
        setOpponent({
          name: res.room.hostName || 'Host Leader',
          photoURL: res.room.hostPhoto || '/assets/profile_photos/IMG_20261109_001512.png',
          xp: res.room.hostXp || 250,
        });
      } else {
        alert(res.error || 'Room not found.');
      }
    } catch {}
  };

  // VIEW 1: IN-GAME FULL SCREEN VIEW
  if (activeGame && gameStarted) {
    return (
      <div className="w-full max-w-[540px] mx-auto min-h-screen p-2 flex flex-col space-y-2 select-none">
        {/* In-Game Top Bar */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#090F1E] border border-cyan-400/40">
          <button
            onClick={() => {
              setGameStarted(false);
              setPin('');
              setOpponent(null);
            }}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold"
          >
            ← Exit Arena
          </button>
          <div className="text-center">
            <span className="text-xs font-black text-amber-300">{activeGame.name}</span>
            <span className="text-[10px] text-slate-400 block">
              {playMode === 'bot' ? `vs OctoBot (${botDiff.toUpperCase()})` : `1v1 Room #${pin}`}
            </span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        </div>

        {/* Embedded Fullscreen 3D Arena Frame */}
        <div className="flex-1 w-full rounded-3xl overflow-hidden border-2 border-cyan-400/50 shadow-[0_0_35px_rgba(6,182,212,0.3)] bg-[#050811] relative min-h-[660px]">
          <iframe
            src={`/duo-arena.html#${activeGame.id}`}
            className="w-full h-full border-0 absolute inset-0"
            title={activeGame.name}
            allow="autoplay; fullscreen; accelerometer; gyroscope"
          />
        </div>
      </div>
    );
  }

  // VIEW 2: FREE FIRE STYLE 1v1 LOBBY (WHEN A GAME IS CLICKED)
  if (activeGame) {
    return (
      <div className="w-full max-w-[500px] mx-auto min-h-screen p-4 flex flex-col justify-between space-y-4 select-none animate-in fade-in zoom-in-95">
        {/* Lobby Header */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0D1525] border border-white/10 shadow-lg">
          <button
            onClick={() => {
              setActiveGame(null);
              setPlayMode(null);
              setPin('');
              setOpponent(null);
            }}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-black flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Games</span>
          </button>
          <div className="text-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 block">
              FREE FIRE 1v1 LOBBY
            </span>
            <h2 className="text-sm font-black text-white">{activeGame.name}</h2>
          </div>
          <span className="text-xl">{activeGame.icon}</span>
        </div>

        {/* Game Mode Selector: 🤖 Solo Bot vs 👥 1v1 Friend PIN */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              setPlayMode('bot');
              setOpponent({
                name: `OctoBot AI (${botDiff.toUpperCase()})`,
                photoURL: '/assets/profile_photos/IMG_20261109_001712.png',
                xp: 500,
              });
            }}
            className={`p-3.5 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer relative overflow-hidden ${
              playMode === 'bot'
                ? 'bg-gradient-to-b from-cyan-500/30 to-blue-600/20 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center mb-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <Bot className="w-6 h-6 text-cyan-300 animate-pulse" />
            </div>
            <span className="text-xs font-black flex items-center gap-1">
              <span>🤖 Play vs AI Bot</span>
            </span>
            <span className="text-[9px] text-cyan-300 font-bold">Single Player 3D Voxel AI</span>
          </button>

          <button
            onClick={() => {
              setPlayMode('friend');
              setOpponent(null);
              handleHost(activeGame);
            }}
            className={`p-3.5 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
              playMode === 'friend'
                ? 'bg-amber-500/20 border-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center mb-1.5 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              <Users className="w-6 h-6 text-amber-300" />
            </div>
            <span className="text-xs font-black">👥 1v1 Friend PIN</span>
            <span className="text-[9px] text-amber-300 font-bold">Online Real-Time Lobby</span>
          </button>
        </div>

        {/* Bot Difficulty Selector (If Bot Mode Selected) */}
        {playMode === 'bot' && (
          <div className="p-4 rounded-3xl bg-black/50 border border-cyan-400/40 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Bot Neural Level</span>
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                ACTIVE
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'normal', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setBotDiff(d);
                    setOpponent({
                      name: `OctoBot AI (${d.toUpperCase()})`,
                      photoURL: '/assets/profile_photos/IMG_20261109_001712.png',
                      xp: d === 'easy' ? 150 : d === 'normal' ? 500 : 1200,
                    });
                  }}
                  className={`py-2.5 rounded-xl text-xs font-black uppercase border transition-all cursor-pointer ${
                    botDiff === d
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.6)] scale-[1.02]'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {d === 'easy' ? '🟢 Easy' : d === 'normal' ? '🟡 Medium' : '🔴 Hard'}
                </button>
              ))}
            </div>

            {/* Instant Play vs AI Bot Button */}
            <button
              onClick={() => setGameStarted(true)}
              className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-slate-950" />
              <span>▶ Play Against AI Bot Now</span>
            </button>
          </div>
        )}

        {/* 4-Digit PIN Controls (If Friend Mode Selected) */}
        {playMode === 'friend' && (
          <div className="p-4 rounded-3xl bg-black/50 border border-amber-400/50 space-y-3">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
                Room 4-Digit PIN
              </span>
              <div className="flex items-center justify-center gap-2">
                {(pin || '____').split('').map((ch, idx) => (
                  <div
                    key={idx}
                    className="w-11 h-13 rounded-xl bg-gradient-to-b from-amber-400/20 to-black/80 border-2 border-amber-400 text-xl font-mono font-black text-amber-300 flex items-center justify-center shadow-lg"
                  >
                    {ch === '_' ? '' : ch}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(pin);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'PIN Copied!' : 'Copy PIN'}</span>
              </button>
            </div>

            {/* Friend PIN Input Box */}
            <div className="pt-2 border-t border-white/10 flex gap-2">
              <input
                type="text"
                maxLength={4}
                placeholder="Enter 4-Digit PIN"
                value={joinPinInput}
                onChange={(e) => setJoinPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white text-center tracking-widest focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={handleJoin}
                disabled={joinPinInput.length !== 4}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs disabled:opacity-40"
              >
                Join
              </button>
            </div>
          </div>
        )}

        {/* Free Fire Style 2-Player Side-by-Side Lobby Cards */}
        <div className="grid grid-cols-2 gap-3 py-2">
          {/* Player 1 Card (Host) */}
          <div className="p-3.5 rounded-3xl bg-gradient-to-b from-white/10 to-black/60 border border-emerald-400/50 flex flex-col items-center text-center">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] mb-2">
              <img
                src={profile?.photoURL || '/assets/profile_photos/IMG_20261109_001512.png'}
                alt={profile?.name || 'You'}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-[#22c55e] border-2 border-black" />
            </div>
            <span className="text-xs font-black text-white truncate max-w-[120px]">
              {profile?.name || 'You'}
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">{profile?.xp || 0} XP</span>
            <span className="mt-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-black">
              READY ✓
            </span>
          </div>

          {/* Player 2 Card (Bot or Friend) */}
          <div className="p-3.5 rounded-3xl bg-gradient-to-b from-white/10 to-black/60 border border-amber-400/50 flex flex-col items-center text-center justify-center">
            {opponent ? (
              <>
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] mb-2">
                  <img src={opponent.photoURL} alt={opponent.name} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-[#22c55e] border-2 border-black" />
                </div>
                <span className="text-xs font-black text-white truncate max-w-[120px]">
                  {opponent.name}
                </span>
                <span className="text-[10px] text-amber-300 font-bold">{opponent.xp} XP</span>
                <span className="mt-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black">
                  READY ✓
                </span>
              </>
            ) : (
              <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-amber-400/40 bg-amber-500/10 flex flex-col items-center justify-center text-center p-2 mb-2 animate-pulse">
                <Users className="w-6 h-6 text-amber-400/80 mb-1" />
                <span className="text-[9px] font-black text-amber-300">Waiting for 2nd Player...</span>
              </div>
            )}
          </div>
        </div>

        {/* Launch Button */}
        <button
          onClick={() => setGameStarted(true)}
          disabled={!opponent}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:grayscale cursor-pointer"
        >
          {opponent ? '⚔️ Enter 1v1 Full Screen Arena' : '⏳ Select Mode or Connect Friend'}
        </button>
      </div>
    );
  }

  // VIEW 3: MAIN FUN ARENA GAMES DIRECTORY (LARGE HERO CARDS WITH AI LOGOS)
  return (
    <div className="w-full max-w-[500px] mx-auto min-h-screen p-4 pb-28 space-y-4 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0D1525] border border-cyan-400/40 shadow-xl">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-black"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-cyan-400" />
          <h1 className="text-sm font-black uppercase tracking-wider text-white">
            Fun Arena 3D
          </h1>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black border border-emerald-400/40">
          60 FPS VOXEL
        </span>
      </div>

      <div className="text-center py-1">
        <h2 className="text-base font-black text-white">Choose Your 1v1 Arena Game</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Select any game to open Free Fire 4-PIN lobby or solo AI bot mode.
        </p>
      </div>

      {/* 10 Games Cards Grid */}
      <div className="grid grid-cols-1 gap-3.5">
        {GAMES.map((game) => (
          <div
            key={game.id}
            onClick={() => {
              setActiveGame(game);
              setPlayMode('bot');
              setOpponent({
                name: 'OctoBot AI (NORMAL)',
                photoURL: '/assets/profile_photos/IMG_20261109_001712.png',
                xp: 500,
              });
            }}
            className={`p-4 rounded-3xl bg-gradient-to-r ${game.bgGradient} border-2 ${game.borderColor} shadow-xl flex items-center justify-between transition-all cursor-pointer group hover:scale-[1.01] active:scale-[0.98]`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="text-4xl p-2.5 rounded-2xl bg-black/60 border border-white/15 shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                {game.icon}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 ${game.accentColor}`}>
                    {game.badge}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{game.tag}</span>
                </div>
                <h3 className="text-sm font-black text-white mt-0.5 truncate">{game.name}</h3>
                <p className="text-[10px] text-slate-300 line-clamp-1 mt-0.5">
                  {game.desc}
                </p>
              </div>
            </div>

            <div className="pl-3 shrink-0 flex flex-col items-end gap-1">
              <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-md group-hover:brightness-110 flex items-center gap-1">
                <span>Play</span>
                <span>▶</span>
              </span>
              <span className="text-[8px] font-black text-cyan-300 flex items-center gap-0.5">
                <Bot className="w-2.5 h-2.5" />
                <span>AI + PIN</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
