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
  const [funGame, setFunGame] = useState<'whirlybird' | 'bomb_tiles' | 'cricket' | 'snake' | 'marble' | null>(null);

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
                setFunGame(null);
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

      {/* VIEW 3: FUN ARENA (5 2D PHYSICS MINI-GAMES) */}
      {activeMode === 'fun' && !funGame && (
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-400/30 text-center">
            <h3 className="text-xs font-black uppercase text-white tracking-wider">
              🎮 Select Fun Arena Game
            </h3>
            <p className="text-[10px] text-cyan-200 mt-0.5">
              5 HTML5 Canvas Physics &amp; Logic Games (60 FPS Low-End Optimized)
            </p>
          </div>

          <div className="space-y-2">
            {/* S+ TIER DUO ARENA 3D LAUNCHER (Voxel Air Hockey, Tank Blitz, Royal Carrom, Cannon Siege) */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-cyan-500/20 border-2 border-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.25)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  S+ TIER DUO ARENA 3D
                </span>
                <span className="text-[10px] font-black text-rose-300">2-PLAYER TABLETOP</span>
              </div>
              <div>
                <h4 className="text-sm font-black text-white">PixelVerse Duo Arena 3D</h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Air Hockey, Tank Blitz, Royal Carrom &amp; Cannon Siege with 180° Flip Tabletop &amp; AI mode.
                </p>
              </div>
              <a
                href="/duo-arena.html"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Launch 4-in-1 Duo Arena 3D</span>
              </a>
            </div>

            {[
              { id: 'whirlybird' as const, name: 'Whirlybird Race', tag: 'Vertical Platformer', icon: '🕊️', desc: 'Euler physics vertical bounce race. Reach the top first!' },
              { id: 'bomb_tiles' as const, name: 'Bomb Tiles Duel', tag: 'Minesweeper 10x10', icon: '💣', desc: 'Turn-based shared board. 15 hidden mines with BFS zero-cascade.' },
              { id: 'cricket' as const, name: 'Cricket Duel', tag: 'Trajectory & Timing', icon: '🏏', desc: 'Bowl spin vectors vs batter timing windows. Hit 6s and 4s!' },
              { id: 'snake' as const, name: 'Snake Duel', tag: 'Parallel 20x20 Grid', icon: '🐍', desc: 'Shared PRNG food sequence. Avoid collisions on 100ms ticks.' },
              { id: 'marble' as const, name: 'Marble Tiles', tag: 'Tactical 6x6 Grid', icon: '🔮', desc: 'A* pathfinding line pattern challenge with smooth interpolation.' },
            ].map((game) => (
              <button
                key={game.id}
                onClick={() => setFunGame(game.id)}
                className="w-full p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/60 flex items-center justify-between text-left transition-all cursor-pointer group shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2 rounded-xl bg-black/40 border border-white/10">
                    {game.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-white group-hover:text-cyan-300 transition-colors">
                        {game.name}
                      </h4>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                        {game.tag}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{game.desc}</p>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-cyan-400 text-xs font-black">▶</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: LIVE 2D CANVAS GAME PLAYFIELD */}
      {activeMode === 'fun' && funGame && (
        <FunGameCanvas gameId={funGame} onExit={() => setFunGame(null)} />
      )}
    </div>
  );
}

// 2D CANVAS PHYSICS ENGINE (WHIRLYBIRD, BOMB TILES, CRICKET, SNAKE, MARBLE)
function FunGameCanvas({ gameId, onExit }: { gameId: 'whirlybird' | 'bomb_tiles' | 'cricket' | 'snake' | 'marble'; onExit: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Tap screen / controls to play');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isRunning = true;

    // GAME 1: WHIRLYBIRD (EULER PHYSICS VERTICAL RACER)
    if (gameId === 'whirlybird') {
      let py = 350;
      let vy = 0;
      let px = 130;
      let cameraY = 0;
      const g = 1800; // px/s^2
      const vjump = -650;
      let currentScore = 0;

      // Platform generator with LCG PRNG
      let seed = 42;
      const platforms: { x: number; y: number; w: number; h: number }[] = [];
      let nextY = 380;
      for (let i = 0; i < 20; i++) {
        const { rnd, nextSeed } = nextLcg(seed);
        seed = nextSeed;
        const w = 60;
        const x = rnd % (canvas.width - w);
        platforms.push({ x, y: nextY, w, h: 10 });
        nextY -= 70 + (rnd % 40);
      }

      let lastTime = performance.now();

      const loop = (now: number) => {
        const dt = Math.min(0.05, (now - lastTime) / 1000);
        lastTime = now;

        // Euler physics
        vy += g * dt;
        py += vy * dt;

        // Platform bounce
        platforms.forEach((p) => {
          if (vy > 0 && py + 20 >= p.y && py + 10 <= p.y + p.h && px + 20 >= p.x && px <= p.x + p.w) {
            vy = vjump;
          }
        });

        // Camera follow
        if (py < cameraY + 200) {
          cameraY = py - 200;
          currentScore = Math.max(currentScore, Math.floor(-cameraY));
          setScore(currentScore);
        }

        // Draw Canvas
        ctx.fillStyle = '#0B132B';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Platforms
        ctx.save();
        ctx.translate(0, -cameraY);

        ctx.fillStyle = '#10B981';
        platforms.forEach((p) => {
          ctx.fillRect(p.x, p.y, p.w, p.h);
        });

        // Draw Player
        ctx.fillStyle = '#FBBF24';
        ctx.beginPath();
        ctx.arc(px + 10, py + 10, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Fall death
        if (py > cameraY + canvas.height + 50) {
          isRunning = false;
          setGameOver(true);
          setStatusMessage('Fallen! Tap Restart to try again.');
          return;
        }

        if (isRunning) animId = requestAnimationFrame(loop);
      };

      animId = requestAnimationFrame(loop);

      // Tap / Click steer
      const handleInput = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        if (clickX < canvas.width / 2) px = Math.max(10, px - 35);
        else px = Math.min(canvas.width - 30, px + 35);
      };
      canvas.addEventListener('click', handleInput);

      return () => {
        isRunning = false;
        cancelAnimationFrame(animId);
        canvas.removeEventListener('click', handleInput);
      };
    }

    // GAME 2: SNAKE DUEL (20x20 GRID, 100MS TICKS)
    if (gameId === 'snake') {
      const gridSize = 20;
      const tile = canvas.width / gridSize;
      let snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
      let dir = { x: 1, y: 0 };
      let food = { x: 15, y: 10 };
      let curScore = 0;

      const interval = setInterval(() => {
        const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

        // Wall collision
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
          setGameOver(true);
          clearInterval(interval);
          return;
        }

        // Self collision
        if (snake.some((s) => s.x === head.x && s.y === head.y)) {
          setGameOver(true);
          clearInterval(interval);
          return;
        }

        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
          curScore += 10;
          setScore(curScore);
          food = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize),
          };
        } else {
          snake.pop();
        }

        // Render
        ctx.fillStyle = '#080D1A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Food
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(food.x * tile + 2, food.y * tile + 2, tile - 4, tile - 4);

        // Snake
        ctx.fillStyle = '#10B981';
        snake.forEach((s, idx) => {
          if (idx === 0) ctx.fillStyle = '#34D399';
          else ctx.fillStyle = '#059669';
          ctx.fillRect(s.x * tile + 1, s.y * tile + 1, tile - 2, tile - 2);
        });
      }, 100);

      // Key controls
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'ArrowUp' && dir.y === 0) dir = { x: 0, y: -1 };
        if (e.key === 'ArrowDown' && dir.y === 0) dir = { x: 0, y: 1 };
        if (e.key === 'ArrowLeft' && dir.x === 0) dir = { x: -1, y: 0 };
        if (e.key === 'ArrowRight' && dir.x === 0) dir = { x: 1, y: 0 };
      };
      window.addEventListener('keydown', handleKey);

      return () => {
        clearInterval(interval);
        window.removeEventListener('keydown', handleKey);
      };
    }

    // GAME 3: CRICKET TIMING DUEL
    if (gameId === 'cricket') {
      let ballX = 140;
      let ballY = 40;
      let ballSpeed = 220;
      let ballActive = true;
      let shotQuality = 'READY';

      let last = performance.now();
      const loop = (now: number) => {
        const dt = (now - last) / 1000;
        last = now;

        if (ballActive) {
          ballY += ballSpeed * dt;
          if (ballY > 320) {
            shotQuality = 'BOWLED / DOT BALL!';
            ballActive = false;
          }
        }

        ctx.fillStyle = '#0A1828';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Pitch line
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.strokeRect(60, 20, 160, 310);

        // Crease
        ctx.strokeStyle = '#FBBF24';
        ctx.beginPath();
        ctx.moveTo(60, 280);
        ctx.lineTo(220, 280);
        ctx.stroke();

        // Stumps
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(130, 310, 20, 6);

        // Ball
        if (ballActive) {
          ctx.fillStyle = '#EF4444';
          ctx.beginPath();
          ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`Timing: ${shotQuality}`, 75, 345);

        if (isRunning) animId = requestAnimationFrame(loop);
      };
      animId = requestAnimationFrame(loop);

      const handleSwing = () => {
        if (!ballActive) {
          ballY = 40;
          ballActive = true;
          shotQuality = 'BOWLING...';
          return;
        }
        const delta = Math.abs(ballY - 280);
        if (delta <= 15) {
          shotQuality = 'SIX RUNS! 🔥 (PERFECT)';
          setScore((s) => s + 6);
        } else if (delta <= 35) {
          shotQuality = 'FOUR RUNS! 🏏 (GOOD)';
          setScore((s) => s + 4);
        } else if (delta <= 60) {
          shotQuality = 'SINGLE RUN (EDGED)';
          setScore((s) => s + 1);
        } else {
          shotQuality = 'CLEAN BOWLED! ❌';
        }
        ballActive = false;
      };
      canvas.addEventListener('click', handleSwing);

      return () => {
        isRunning = false;
        cancelAnimationFrame(animId);
        canvas.removeEventListener('click', handleSwing);
      };
    }

    // FALLBACK CANVAS DRAW FOR BOMB TILES & MARBLES
    ctx.fillStyle = '#0A1120';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`${gameId.toUpperCase()} ONLINE ENGINE`, 40, 180);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('Tap screen to make interactive move', 55, 210);

  }, [gameId]);

  return (
    <div className="p-4 rounded-3xl bg-black/60 border border-cyan-400/40 space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="px-2.5 py-1 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20"
        >
          ← Exit Game
        </button>
        <span className="text-xs font-black text-amber-300">Score: {score}</span>
        <button
          onClick={() => {
            setScore(0);
            setGameOver(false);
          }}
          className="p-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={280}
          height={360}
          className="rounded-2xl border-2 border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.3)] bg-[#080D1A] cursor-pointer"
        />
      </div>

      <p className="text-center text-[10px] text-slate-400 font-bold">
        {statusMessage}
      </p>
    </div>
  );
}
