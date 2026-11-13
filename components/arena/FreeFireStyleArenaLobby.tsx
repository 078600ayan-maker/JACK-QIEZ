'use client';

import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Users,
  Bot,
  Flame,
  Trophy,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Swords,
  ChevronRight,
  Maximize2,
  X
} from 'lucide-react';
import { TactileButton } from '@/components/ui/TactileButton';
import { VerificationTick } from '@/components/ui/VerificationTick';
import { useUserStore } from '@/store/useUserStore';
import { createDuelRoom, joinDuelRoomByPin, subscribeDuelRoom } from '@/lib/socialService';

export interface GameMetadata {
  id: 'carrom' | 'tank' | 'hockey' | 'cannon';
  name: string;
  tag: string;
  icon: string;
  badge: string;
  desc: string;
  themeColor: string;
  borderColor: string;
  bgGradient: string;
}

export const ARENA_GAMES: GameMetadata[] = [
  {
    id: 'carrom',
    name: 'Royal Carrom 3D',
    tag: 'Tabletop Physics',
    icon: '🎯',
    badge: 'CLASSIC DUO',
    desc: 'Wooden voxel board, striker pull-back slingshot trajectory aiming & Queen cover rules.',
    themeColor: '#F59E0B',
    borderColor: 'border-amber-400/50',
    bgGradient: 'from-amber-950/70 via-[#18120B] to-[#0A0704]',
  },
  {
    id: 'tank',
    name: 'Voxel Tank Blitz 3D',
    tag: 'Battle Arcade',
    icon: '🛡️',
    badge: 'TACTICAL DUEL',
    desc: 'Extruded voxel mazes, 4-bounce vector-reflected shells & dual P1/P2 firing consoles.',
    themeColor: '#10B981',
    borderColor: 'border-emerald-400/50',
    bgGradient: 'from-emerald-950/70 via-[#0C1A14] to-[#050C09]',
  },
  {
    id: 'hockey',
    name: 'Voxel Air Hockey 3D',
    tag: '60 FPS Sports',
    icon: '🏒',
    badge: 'SUPER SPEED',
    desc: 'Multi-touch mallet control, 4x sub-stepped elastic collision physics & turbo puck pads.',
    themeColor: '#06B6D4',
    borderColor: 'border-cyan-400/50',
    bgGradient: 'from-cyan-950/70 via-[#0B1728] to-[#050B14]',
  },
  {
    id: 'cannon',
    name: 'Voxel Cannon Siege 3D',
    tag: 'Artillery Turn',
    icon: '💥',
    badge: 'DESTRUCTION',
    desc: 'Turn-based destructible voxel terrain, wind physics, cluster mortars & plasma piercers.',
    themeColor: '#F43F5E',
    borderColor: 'border-rose-400/50',
    bgGradient: 'from-rose-950/70 via-[#1F0E13] to-[#0D0507]',
  },
];

export function FreeFireStyleArenaLobby() {
  const { profile } = useUserStore();
  const [selectedGame, setSelectedGame] = useState<GameMetadata | null>(null);
  const [lobbyMode, setLobbyMode] = useState<'selection' | 'bot' | 'friend_lobby' | 'playing'>('selection');

  // Bot mode configuration
  const [botDifficulty, setBotDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');

  // 4-Digit PIN Online Room State (Free Fire style lobby)
  const [roomPin, setRoomPin] = useState<string>('');
  const [inputPin, setInputPin] = useState<string>('');
  const [isHost, setIsHost] = useState<boolean>(true);
  const [lobbyStatus, setLobbyStatus] = useState<'idle' | 'waiting' | 'ready'>('idle');
  const [copiedPin, setCopiedPin] = useState<boolean>(false);

  // Opponent player profile in lobby
  const [opponent, setOpponent] = useState<{
    name: string;
    photoURL: string;
    xp: number;
    isReady: boolean;
    isBot?: boolean;
  } | null>(null);

  // 1. Host creates 4-Digit PIN Room
  const handleHostRoom = async (game: GameMetadata) => {
    if (!profile?.uid) return;
    setIsHost(true);
    setLobbyStatus('waiting');
    const generated = String(Math.floor(1000 + Math.random() * 9000));
    setRoomPin(generated);

    try {
      const room = await createDuelRoom(profile, 'sci', game.name, {
        chapterId: 1,
        mode: 'friend',
      });
      if (room?.pin) {
        setRoomPin(room.pin);
        // Subscribe to live guest join
        subscribeDuelRoom(room.pin, (updated) => {
          if (updated && updated.guestUid) {
            setOpponent({
              name: updated.guestName || 'Friend Challenger',
              photoURL: updated.guestPhoto || '/assets/profile_photos/IMG_20261109_001602.png',
              xp: updated.guestXp || 120,
              isReady: Boolean(updated.guestReady),
            });
            setLobbyStatus('ready');
          }
        });
      }
    } catch {
      // Fallback local wait
    }
  };

  // 2. Join with 4-Digit PIN
  const handleJoinPin = async () => {
    if (!profile?.uid || inputPin.replace(/\D/g, '').length !== 4) return;
    const clean = inputPin.replace(/\D/g, '').trim();
    setIsHost(false);
    setLobbyStatus('waiting');

    try {
      const res = await joinDuelRoomByPin(clean, profile);
      if (res.ok && res.room) {
        setRoomPin(clean);
        setOpponent({
          name: res.room.hostName || 'Host Leader',
          photoURL: res.room.hostPhoto || '/assets/profile_photos/IMG_20261109_001512.png',
          xp: res.room.hostXp || 250,
          isReady: Boolean(res.room.hostReady),
        });
        setLobbyStatus('ready');
      } else {
        alert(res.error || 'Room not found. Check 4-digit PIN.');
        setLobbyStatus('idle');
      }
    } catch {
      setLobbyStatus('idle');
    }
  };

  // 3. Start vs Bot
  const handleStartBot = (game: GameMetadata, diff: 'easy' | 'normal' | 'hard') => {
    setBotDifficulty(diff);
    setOpponent({
      name: `OctoBot (${diff.toUpperCase()})`,
      photoURL: '/assets/profile_photos/IMG_20261109_001712.png',
      xp: diff === 'easy' ? 100 : diff === 'normal' ? 350 : 800,
      isReady: true,
      isBot: true,
    });
    setLobbyMode('playing');
  };

  // VIEW: PLAYING EMBEDDED ARENA (IN-APP WITHOUT FULL RELOAD)
  if (lobbyMode === 'playing' && selectedGame) {
    return (
      <div className="w-full rounded-3xl overflow-hidden border-2 border-cyan-400/50 bg-[#050811] shadow-2xl p-2 space-y-2">
        {/* Top Battle Match Status Bar */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-black/60 border border-white/10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setLobbyMode('selection');
                setSelectedGame(null);
                setRoomPin('');
                setOpponent(null);
              }}
              className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20 text-xs font-bold"
            >
              ← Leave Match
            </button>
            <span className="text-xs font-black text-amber-300">
              {selectedGame.name} • {opponent?.isBot ? `vs ${opponent.name}` : `PIN #${roomPin}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-bold text-emerald-300">LIVE SYNC</span>
          </div>
        </div>

        {/* Embedded HTML5 Game Arena */}
        <div className="w-full h-[620px] rounded-2xl overflow-hidden relative border border-white/10">
          <iframe
            src={`/duo-arena.html#${selectedGame.id}`}
            className="w-full h-full border-0 absolute inset-0"
            title={selectedGame.name}
            allow="autoplay; fullscreen; accelerometer; gyroscope"
          />
        </div>
      </div>
    );
  }

  // VIEW: FREE FIRE STYLE 4-DIGIT PIN LOBBY
  if (lobbyMode === 'friend_lobby' && selectedGame) {
    return (
      <div className="w-full p-4 rounded-3xl bg-gradient-to-b from-[#0F1A30] via-[#091120] to-[#040810] border-2 border-amber-400/60 shadow-[0_15px_40px_rgba(0,0,0,0.8)] space-y-4 animate-in fade-in zoom-in-95">
        {/* Lobby Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setLobbyMode('selection');
              setRoomPin('');
              setOpponent(null);
            }}
            className="px-2.5 py-1 rounded-xl bg-white/10 text-white text-xs font-bold flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <span className="text-[9px] uppercase tracking-widest font-black text-amber-400 block">
              FREE FIRE 1v1 LOBBY
            </span>
            <h3 className="text-sm font-black text-white">{selectedGame.name}</h3>
          </div>

          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-400/40">
            ONLINE PIN
          </span>
        </div>

        {/* 4-Digit Room PIN Display / Input */}
        {roomPin ? (
          <div className="p-3.5 rounded-2xl bg-black/50 border border-amber-400/40 text-center space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
              Share 4-Digit Room PIN with Friend
            </span>
            <div className="flex items-center justify-center gap-2.5">
              {roomPin.split('').map((d, i) => (
                <div
                  key={i}
                  className="w-12 h-14 rounded-2xl bg-gradient-to-b from-amber-400/20 to-black/80 border-2 border-amber-400 text-2xl font-mono font-black text-amber-300 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                >
                  {d}
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                navigator.clipboard?.writeText(roomPin);
                setCopiedPin(true);
                setTimeout(() => setCopiedPin(false), 2000);
              }}
              className="py-1 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-[10px] font-black text-amber-300 inline-flex items-center gap-1.5"
            >
              {copiedPin ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPin ? 'PIN Copied!' : 'Copy 4-Digit PIN'}</span>
            </button>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
            <span className="text-[10px] font-bold text-slate-300 block text-center">
              Join existing room or create a new 4-digit PIN room:
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="Enter 4-Digit PIN (e.g. 4829)"
                value={inputPin}
                onChange={(e) => setInputPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white placeholder:text-slate-500 tracking-widest focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={handleJoinPin}
                disabled={inputPin.length !== 4}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs disabled:opacity-40"
              >
                Join PIN
              </button>
            </div>
            <button
              onClick={() => handleHostRoom(selectedGame)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:brightness-110 active:scale-[0.99] transition-all"
            >
              🎲 Generate My 4-Digit Room PIN
            </button>
          </div>
        )}

        {/* 2-Player Side-by-Side Free Fire Lobby Cards */}
        <div className="grid grid-cols-2 gap-3 py-2">
          {/* Player 1 Card (Host) */}
          <div className="p-3 rounded-2xl bg-gradient-to-b from-white/10 to-black/50 border border-emerald-400/50 flex flex-col items-center text-center">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] mb-1.5">
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
            <span className="text-[10px] text-emerald-400 font-bold">
              {profile?.xp || 0} XP &bull; Leader
            </span>
            <span className="mt-1 px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-black">
              READY ✓
            </span>
          </div>

          {/* Player 2 Card (Friend) */}
          <div className="p-3 rounded-2xl bg-gradient-to-b from-white/10 to-black/50 border border-amber-400/50 flex flex-col items-center text-center justify-center">
            {opponent ? (
              <>
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] mb-1.5">
                  <img src={opponent.photoURL} alt={opponent.name} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-[#22c55e] border-2 border-black" />
                </div>
                <span className="text-xs font-black text-white truncate max-w-[120px]">
                  {opponent.name}
                </span>
                <span className="text-[10px] text-amber-300 font-bold">
                  {opponent.xp} XP &bull; Challenger
                </span>
                <span className="mt-1 px-2 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black">
                  CONNECTED ✓
                </span>
              </>
            ) : (
              <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-amber-400/40 bg-amber-500/10 flex flex-col items-center justify-center text-center p-1.5 animate-pulse mb-1.5">
                <Users className="w-6 h-6 text-amber-400/80 mb-0.5" />
                <span className="text-[8px] font-black text-amber-300 leading-tight">Waiting Friend...</span>
              </div>
            )}
          </div>
        </div>

        {/* Start Game Action */}
        <button
          onClick={() => setLobbyMode('playing')}
          disabled={!opponent}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-40 disabled:grayscale"
        >
          {opponent ? '⚔️ Launch 1v1 Online Battle' : '⏳ Waiting for 2nd Player...'}
        </button>
      </div>
    );
  }

  // VIEW: BOT DIFFICULTY SELECTOR
  if (lobbyMode === 'bot' && selectedGame) {
    return (
      <div className="w-full p-4 rounded-3xl bg-gradient-to-b from-[#141E33] via-[#0E1626] to-[#070B13] border-2 border-cyan-400/50 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setLobbyMode('selection')}
            className="px-2.5 py-1 rounded-xl bg-white/10 text-white text-xs font-bold flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <div className="text-center">
            <span className="text-[9px] uppercase tracking-widest font-black text-cyan-400 block">
              SOLO PRACTICE
            </span>
            <h3 className="text-sm font-black text-white">{selectedGame.name}</h3>
          </div>
          <span className="text-xs">🤖</span>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black text-slate-300 uppercase tracking-wider block">
            Select OctoBot AI Difficulty:
          </span>

          {[
            { id: 'easy' as const, name: 'Easy Bot (आसान)', desc: 'Relaxed reactions & forgiving shots.', color: 'border-emerald-400/60 bg-emerald-950/40 text-emerald-300' },
            { id: 'normal' as const, name: 'Normal Bot (मध्यम)', desc: 'Balanced competitive speed & accuracy.', color: 'border-amber-400/60 bg-amber-950/40 text-amber-300' },
            { id: 'hard' as const, name: 'Master Bot (कठिन)', desc: 'Near-instant reactions & calculated trickshots.', color: 'border-rose-400/60 bg-rose-950/40 text-rose-300' },
          ].map((b) => (
            <button
              key={b.id}
              onClick={() => handleStartBot(selectedGame, b.id)}
              className={`w-full p-3 rounded-2xl border ${b.color} text-left flex items-center justify-between hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer`}
            >
              <div>
                <h4 className="text-xs font-black text-white">{b.name}</h4>
                <p className="text-[10px] text-slate-300 mt-0.5">{b.desc}</p>
              </div>
              <span className="text-xs font-black">▶ Play</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // DEFAULT VIEW: 4 HIGH-DEF GAMES WITH BUTTONS & LOGOS
  return (
    <div className="space-y-3">
      {/* Lobby Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-cyan-400 font-black text-xs">🎮</span>
          <h3 className="text-xs font-black uppercase tracking-wider text-white">
            PixelVerse 4-in-1 Arena
          </h3>
        </div>
        <span className="text-[9px] font-black text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40">
          FREE FIRE LOBBY READY
        </span>
      </div>

      {/* 4 Games Grid with Detailed Logo Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ARENA_GAMES.map((game) => (
          <div
            key={game.id}
            className={`p-4 rounded-3xl bg-gradient-to-br ${game.bgGradient} border-2 ${game.borderColor} shadow-lg flex flex-col justify-between space-y-3`}
          >
            <div className="flex items-start gap-3">
              <span className="text-4xl p-2.5 rounded-2xl bg-black/60 border border-white/15 shadow-inner shrink-0">
                {game.icon}
              </span>
              <div className="min-w-0">
                <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                  {game.badge}
                </span>
                <h4 className="text-sm font-black text-white mt-1 truncate">{game.name}</h4>
                <p className="text-[10px] text-slate-300 line-clamp-2 mt-0.5 leading-relaxed">
                  {game.desc}
                </p>
              </div>
            </div>

            {/* Two Action Buttons: 🤖 Play with Bot & 👥 Play with Friend */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
              <button
                onClick={() => {
                  setSelectedGame(game);
                  setLobbyMode('bot');
                }}
                className="py-2 px-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-[10px] font-black flex items-center justify-center gap-1 border border-white/10 active:scale-95 transition-all"
              >
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span>Play Bot</span>
              </button>

              <button
                onClick={() => {
                  setSelectedGame(game);
                  setLobbyMode('friend_lobby');
                }}
                className="py-2 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-black flex items-center justify-center gap-1 shadow-md active:scale-95 transition-all"
              >
                <Users className="w-3.5 h-3.5" />
                <span>1v1 Friend PIN</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
