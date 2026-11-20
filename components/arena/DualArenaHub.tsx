'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Gamepad2,
  BookOpen,
  ArrowLeft,
  Flame,
  Volume2,
  VolumeX,
  RotateCcw,
  Trophy,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  Sparkles,
  Users
} from 'lucide-react';
import { TactileButton } from '@/components/ui/TactileButton';
import { VerificationTick } from '@/components/ui/VerificationTick';
import { useUserStore } from '@/store/useUserStore';
import { createDuelRoom, joinDuelRoomByPin, subscribeDuelRoom } from '@/lib/socialService';

// PRNG Linear Congruential Generator matching Specification Section 4.2
function nextLcg(seed: number): { rnd: number; nextSeed: number } {
  const rnd = (seed * 1664525 + 1013904223) % 4294967296;
  return { rnd, nextSeed: rnd };
}

interface DualArenaProps {
  onBack?: () => void;
}

export function DualArenaHub({ onBack }: DualArenaProps) {
  const { profile } = useUserStore();
  const [activeMode, setActiveMode] = useState<'hub' | 'study' | 'fun'>('hub');

  // Room PIN state
  const [roomPin, setRoomPin] = useState<string>('');
  const [inputPin, setInputPin] = useState<string>('');
  const [roomStatus, setRoomStatus] = useState<string>('idle');
  const [copiedPin, setCopiedPin] = useState<boolean>(false);
  const [pinSeed, setPinSeed] = useState<number>(Date.now() % 1000000);

  // Opponent presence
  const [opponentName, setOpponentName] = useState<string>('Waiting...');
  const [opponentPhoto, setOpponentPhoto] = useState<string>('/assets/profile_photos/IMG_20261109_001602.png');
  const [opponentOnline, setOpponentOnline] = useState<boolean>(false);

  // Host room creation
  const handleCreateRoom = async (arena: 'study' | 'fun') => {
    if (!profile?.uid) return;
    setRoomStatus('creating');
    try {
      const generatedPin = String(Math.floor(1000 + Math.random() * 9000));
      setRoomPin(generatedPin);
      const room = await createDuelRoom(profile, 'sci', 'Science', {
        chapterId: 1,
        mode: 'friend',
      });
      if (room && room.pin) {
        setRoomPin(room.pin);
        setRoomStatus('waiting_guest');
        subscribeDuelRoom(room.pin, (updated) => {
          if (updated && updated.guestUid) {
            setOpponentName(updated.guestName || 'Friend');
            setOpponentPhoto(updated.guestPhoto || '/assets/profile_photos/IMG_20261109_001602.png');
            setOpponentOnline(true);
            setRoomStatus('connected');
          }
        });
      }
    } catch {
      setRoomStatus('idle');
    }
  };

  // Guest join room
  const handleJoinPin = async () => {
    if (!profile?.uid || inputPin.length !== 4) return;
    setRoomStatus('joining');
    try {
      const res = await joinDuelRoomByPin(inputPin, profile);
      if (res.ok && res.room) {
        setRoomPin(inputPin);
        setOpponentName(res.room.hostName || 'Host');
        setOpponentPhoto(res.room.hostPhoto || '/assets/profile_photos/IMG_20261109_001512.png');
        setOpponentOnline(true);
        setRoomStatus('connected');
      } else {
        alert(res.error || 'Room not found. Check PIN.');
        setRoomStatus('idle');
      }
    } catch {
      setRoomStatus('idle');
    }
  };

  return (
    <div className="w-full max-w-[480px] mx-auto space-y-4 select-none">
      {/* ARENA HEADER */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#0C1525] via-[#101C33] to-[#0A101C] border border-cyan-400/30 shadow-lg">
        <div className="flex items-center gap-2">
          {activeMode !== 'hub' && (
            <button
              onClick={() => {
                setActiveMode('hub');
                setRoomStatus('idle');
              }}
              className="p-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <span className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
            <Gamepad2 className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-white">
              {activeMode === 'hub' ? 'Study Friend & Fun Arena' : activeMode === 'study' ? 'Study Friend Arena' : 'Fun Arena Games'}
            </h2>
            <p className="text-[9px] text-cyan-300 font-bold">
              {activeMode === 'hub' ? 'Real-Time Multiplayer Engine' : 'Live Online Session'}
            </p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[9px] font-black text-emerald-300 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          LIVE v2.2
        </span>
      </div>

      {/* VIEW 1: DUAL HOME ENTRY CARDS (Equal Weight Surface Containers) */}
      {activeMode === 'hub' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Card 1: Study Friend Arena (Emerald accent, open book icon) */}
            <div
              onClick={() => setActiveMode('study')}
              className="p-4 rounded-3xl bg-gradient-to-b from-[#0F2922] via-[#0A1D18] to-[#05110E] border-2 border-emerald-400/60 shadow-[0_10px_30px_rgba(16,185,129,0.25)] hover:border-emerald-300 transition-all cursor-pointer group flex flex-col justify-between h-48 active:scale-[0.98]"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 mb-3 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors">
                  Study Friend <br />Arena
                </h3>
                <p className="text-[10px] text-emerald-200/70 mt-1 leading-tight">
                  Synchronized academic tests with friends. Deterministic timers &amp; instant scoring.
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] font-black text-emerald-400">
                <span>Play With Friend</span>
                <span className="text-xs">→</span>
              </div>
            </div>

            {/* Card 2: Fun Arena (Blue accent, pixel controller icon) */}
            <div
              onClick={() => setActiveMode('fun')}
              className="p-4 rounded-3xl bg-gradient-to-b from-[#0F223D] via-[#0B172B] to-[#070D18] border-2 border-cyan-400/60 shadow-[0_10px_30px_rgba(6,182,212,0.25)] hover:border-cyan-300 transition-all cursor-pointer group flex flex-col justify-between h-48 active:scale-[0.98]"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 mb-3 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                  <Gamepad2 className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors">
                  Fun Arena <br />2D Games
                </h3>
                <p className="text-[10px] text-cyan-200/70 mt-1 leading-tight">
                  Whirlybird, Bomb Tiles, Cricket, Snake &amp; Marble Duel physics engines.
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] font-black text-cyan-400">
                <span>5 Mini-Games</span>
                <span className="text-xs">→</span>
              </div>
            </div>
          </div>

          {/* Quick PIN Join Banner */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="Enter 4-Digit Room PIN (e.g. 4829)"
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white placeholder:text-slate-500 tracking-widest focus:outline-none focus:border-cyan-400/60"
            />
            <button
              onClick={handleJoinPin}
              disabled={inputPin.length !== 4}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black text-xs disabled:opacity-40 cursor-pointer shadow-md"
            >
              Join PIN
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: STUDY FRIEND ARENA */}
      {activeMode === 'study' && (
        <div className="p-4 rounded-3xl bg-gradient-to-br from-[#0F2922] via-[#0A1A16] to-[#06100E] border-2 border-emerald-400/50 shadow-2xl space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-base font-black text-white">Study Friend 1v1 Arena</h3>
            <p className="text-xs text-emerald-300">Synchronized questions &amp; live dual progress bars</p>
          </div>

          {/* DUAL LOBBY DISPLAY (120x120px Avatars) */}
          <div className="grid grid-cols-2 gap-3 py-2">
            {/* Player Avatar */}
            <div className="p-3 rounded-2xl bg-black/40 border border-emerald-400/40 flex flex-col items-center text-center">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] mb-2">
                <img
                  src={profile?.photoURL || '/assets/profile_photos/IMG_20261109_001512.png'}
                  alt={profile?.name || 'You'}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-[#22c55e] border-2 border-[#0A1A16] shadow-[0_0_8px_#22c55e]" />
              </div>
              <span className="text-xs font-black text-white truncate max-w-[120px]">{profile?.name || 'You'}</span>
              <span className="text-[10px] text-emerald-400 font-bold">Host • {profile?.xp || 0} XP</span>
            </div>

            {/* Guest / Opponent Slot */}
            <div className="p-3 rounded-2xl bg-black/40 border border-dashed border-emerald-400/40 flex flex-col items-center text-center justify-center">
              {roomStatus === 'connected' ? (
                <>
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] mb-2">
                    <img src={opponentPhoto} alt={opponentName} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-[#22c55e] border-2 border-[#0A1A16]" />
                  </div>
                  <span className="text-xs font-black text-white truncate max-w-[120px]">{opponentName}</span>
                  <span className="text-[10px] text-cyan-300 font-bold">Challenger Ready</span>
                </>
              ) : (
                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-emerald-400/40 bg-emerald-500/10 flex flex-col items-center justify-center text-center p-2 mb-2 animate-pulse">
                  <Users className="w-6 h-6 text-emerald-400/80 mb-1" />
                  <span className="text-[9px] font-black text-emerald-300">Waiting for Friend...</span>
                </div>
              )}
            </div>
          </div>

          {/* 4-Digit PIN Sharing & Generation */}
          {roomPin ? (
            <div className="p-3 rounded-2xl bg-black/50 border border-emerald-400/30 text-center space-y-2">
              <span className="text-[10px] uppercase font-black text-emerald-300 tracking-wider">
                Live Room 4-Digit PIN
              </span>
              <div className="flex items-center justify-center gap-2">
                {roomPin.split('').map((d, i) => (
                  <div key={i} className="w-10 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400 text-xl font-mono font-black text-emerald-300 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)]">
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
                className="py-1 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-[10px] font-black text-emerald-300 inline-flex items-center gap-1"
              >
                {copiedPin ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPin ? 'PIN Copied!' : 'Copy 4-Digit PIN'}</span>
              </button>
            </div>
          ) : (
            <TactileButton
              variant="emerald"
              fullWidth
              size="md"
              onClick={() => handleCreateRoom('study')}
              className="font-black text-xs py-3"
            >
              🎲 Create Study Room PIN
            </TactileButton>
          )}
        </div>
      )}

      {/* VIEW 3: FUN ARENA (10 3D RETRO VOXEL & MULTIPLAYER GAMES) */}
      {activeMode === 'fun' && (
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-400/30 text-center">
            <h3 className="text-xs font-black uppercase text-white tracking-wider">
              🎮 Select Fun Arena Game
            </h3>
            <p className="text-[10px] text-cyan-200 mt-0.5">
              10 Ultra-Polished 3D Pixel Voxel Games (Free Fire Lobby, Bot AI &amp; 4-PIN Multiplayer)
            </p>
          </div>

          <div className="space-y-3">
            {/* 10 ULTRA-POLISHED 3D RETRO PIXEL VOXEL GAMES */}
            {[
              {
                id: 'carrom',
                name: 'Royal Carrom 3D',
                tag: '2-Player Tabletop',
                icon: '🎯',
                bgGradient: 'from-amber-950/60 to-yellow-950/30',
                borderColor: 'border-amber-400/40',
                accentColor: 'text-amber-300',
                desc: 'Wooden voxel board, striker pull-back slingshot trajectory aiming & Queen cover rules.'
              },
              {
                id: 'tank',
                name: 'Voxel Tank Blitz 3D',
                tag: '2-Player Battle',
                icon: '🛡️',
                bgGradient: 'from-emerald-950/60 to-teal-950/30',
                borderColor: 'border-emerald-400/40',
                accentColor: 'text-emerald-300',
                desc: 'Extruded voxel mazes, vector-reflected ricochet shells & dual P1/P2 firing consoles.'
              },
              {
                id: 'hockey',
                name: 'Voxel Air Hockey 3D',
                tag: 'Fast Pace Sports',
                icon: '🏒',
                bgGradient: 'from-cyan-950/60 to-blue-950/30',
                borderColor: 'border-cyan-400/40',
                accentColor: 'text-cyan-300',
                desc: 'Multi-touch mallet control, 4x elastic collision physics & power-up freeze pads.'
              },
              {
                id: 'cannon',
                name: 'Voxel Cannon Siege 3D',
                tag: 'Artillery Duel',
                icon: '💥',
                bgGradient: 'from-rose-950/60 to-red-950/30',
                borderColor: 'border-rose-400/40',
                accentColor: 'text-rose-300',
                desc: 'Turn-based destructible voxel terrain, wind physics, cluster mortars & plasma piercers.'
              },
              {
                id: 'chess',
                name: 'Grandmaster Chess 3D',
                tag: 'Mind Relaxing',
                icon: '♟️',
                bgGradient: 'from-purple-950/60 to-indigo-950/30',
                borderColor: 'border-purple-400/40',
                accentColor: 'text-purple-300',
                desc: 'Pixelated 3D chess board, timer clocks, legal moves & AI bot grandmaster mode.'
              },
              {
                id: 'connect4',
                name: 'Voxel Four in a Row',
                tag: 'Strategy Tactic',
                icon: '🟡',
                bgGradient: 'from-yellow-950/60 to-amber-950/30',
                borderColor: 'border-yellow-400/40',
                accentColor: 'text-yellow-300',
                desc: 'Vertical 7x6 3D voxel grid, gravity drop physics, combo chains & tactical block.'
              },
              {
                id: 'snakes',
                name: 'Pixel Arena Duel 3D',
                tag: 'Arcade Survival',
                icon: '🐍',
                bgGradient: 'from-lime-950/60 to-green-950/30',
                borderColor: 'border-lime-400/40',
                accentColor: 'text-lime-300',
                desc: 'Dynamic 3D voxel snakes, power-up speed orbs & competitive multiplayer arena.'
              },
              {
                id: 'checkers',
                name: 'Royal Checkers 3D',
                tag: 'Tabletop Classic',
                icon: '👑',
                bgGradient: 'from-orange-950/60 to-red-950/30',
                borderColor: 'border-orange-400/40',
                accentColor: 'text-orange-300',
                desc: 'Diagonal multi-jump captures, crowned kings, smooth physics slide & friend lobby.'
              },
              {
                id: 'archery',
                name: 'Voxel Archery Showdown',
                tag: 'Aim & Precision',
                icon: '🏹',
                bgGradient: 'from-teal-950/60 to-emerald-950/30',
                borderColor: 'border-teal-400/40',
                accentColor: 'text-teal-300',
                desc: '3D wind deflection, moving targets, distance calculations & score duel.'
              },
              {
                id: 'boxing',
                name: 'Retro 3D Boxer Brawl',
                tag: 'Action Arcade',
                icon: '🥊',
                bgGradient: 'from-red-950/60 to-rose-950/30',
                borderColor: 'border-red-400/40',
                accentColor: 'text-red-300',
                desc: 'Minecraft-style pixelated boxing ring, jab/uppercut/dodge & stamina management.'
              }
            ].map((game) => (
              <a
                key={game.id}
                href={`/arena`}
                className={`w-full p-3.5 rounded-2xl bg-gradient-to-r ${game.bgGradient} border ${game.borderColor} flex items-center justify-between text-left transition-all cursor-pointer group shadow-lg hover:scale-[1.02] active:scale-[0.98] block`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="text-3xl p-2 rounded-2xl bg-black/50 border border-white/10 shrink-0 shadow-inner">
                    {game.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-white group-hover:text-amber-300 transition-colors truncate">
                        {game.name}
                      </h4>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full bg-white/10 ${game.accentColor} font-black border border-white/10 shrink-0`}>
                        {game.tag}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                      {game.desc}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 pl-2">
                  <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md group-hover:brightness-110">
                    Play ▶
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}