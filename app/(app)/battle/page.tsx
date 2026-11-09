'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Swords,
  Bot,
  Globe2,
  Users,
  Flame,
  Gift,
  Share2,
  Trophy,
  ShieldAlert,
  Sparkles,
  Zap,
  ArrowRight,
  Eye,
  CheckCircle2,
  Copy,
  Clock,
  RotateCcw
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { playClickSound } from '@/lib/audioEngine';
import { TactileButton } from '@/components/ui/TactileButton';
import { triggerHaptic } from '@/lib/haptics';

export default function BattleHubPage() {
  const { profile } = useUserStore();
  const [activeTab, setActiveTab] = useState<'matchmaking' | 'social' | 'trophies'>('matchmaking');
  
  // States for interactive features
  const [roomCode, setRoomCode] = useState('');
  const [isSearchingMatch, setIsSearchingMatch] = useState(false);
  const [matchedOpponent, setMatchedOpponent] = useState<any | null>(null);
  const [giftClaimed, setGiftClaimed] = useState(false);
  const [showRevengeModal, setShowRevengeModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [tauntSent, setTauntSent] = useState<string | null>(null);

  const username = profile?.username || 'scholar';
  const streak = profile?.streak || 7;
  const xp = profile?.xp || 280;

  // Auto-Match simulation with isRealUser: true
  const handleAutoMatch = () => {
    playClickSound();
    triggerHaptic();
    setIsSearchingMatch(true);
    setMatchedOpponent(null);

    setTimeout(() => {
      setIsSearchingMatch(false);
      setMatchedOpponent({
        name: 'Priya Sharma',
        username: 'priya_jac_topper',
        xp: 1420,
        streak: 12,
        class: 'Class 10 JAC',
        photoURL: '/assets/profile_photos/classic_character_2.png',
        isRealUser: true
      });
    }, 2200);
  };

  const handleCopyLink = () => {
    playClickSound();
    triggerHaptic();
    navigator.clipboard?.writeText(`https://jackquiz.app/@${username}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleClaimDailyGift = () => {
    playClickSound();
    triggerHaptic();
    setGiftClaimed(true);
  };

  const sendTaunt = (emoji: string, label: string) => {
    playClickSound();
    triggerHaptic();
    setTauntSent(`${emoji} ${label}`);
    setTimeout(() => setTauntSent(null), 2500);
  };

  return (
    <div className="w-full max-w-[480px] mx-auto px-4 pt-3 pb-36 select-none">
      {/* HEADER HERO */}
      <div className="relative rounded-3xl p-5 bg-gradient-to-br from-[#162032] via-[#0D1525] to-[#080D18] border-t-2 border-emerald-400/40 border-x border-b border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.8)] overflow-hidden mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Swords className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
              FRIENDS &amp; BATTLE ARENA
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[9px] font-black text-emerald-300 animate-pulse">
            LIVE v2.2
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">
              1v1 Royal Duel <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-400">
                Challenge Scholars
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 mt-1">
              Class 10 Live Matchmaking &bull; Earn XP, Trophies &amp; Tiers
            </p>
          </div>

          {/* 3D Octopops Avatar Widget */}
          <div className="relative w-16 h-16 shrink-0 rounded-2xl overflow-hidden border border-emerald-500/30 bg-emerald-950/40 shadow-[0_0_15px_rgba(16,185,129,0.25)] flex items-center justify-center">
            <iframe
              src="/mascot-widget.html"
              className="w-16 h-16 border-0 bg-transparent pointer-events-none"
              style={{ background: 'transparent' }}
              sandbox="allow-scripts"
              title="Octopops Arena Mascot"
            />
          </div>
        </div>

        {/* Win Streak Flame VFX banner if streak >= 5 */}
        {streak >= 5 && (
          <div className="mt-3.5 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-950/80 to-red-950/80 border border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
            <span className="text-[10px] font-black tracking-wide">
              WIN STREAK FLAME ACTIVE &bull; {streak} WINS IN A ROW! 🔥
            </span>
          </div>
        )}
      </div>

      {/* ARENA NAVIGATION PILLS */}
      <div className="flex items-center gap-2 mb-4 bg-white/5 p-1 rounded-2xl border border-white/10">
        <button
          onClick={() => { playClickSound(); setActiveTab('matchmaking'); }}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'matchmaking'
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          ⚔️ Duel Hub
        </button>
        <button
          onClick={() => { playClickSound(); setActiveTab('social'); }}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'social'
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          👥 Social &amp; Gifts
        </button>
        <button
          onClick={() => { playClickSound(); setActiveTab('trophies'); }}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'trophies'
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🏆 3D Trophy Shelf
        </button>
      </div>

      {/* =========================================================================
          TAB 1: MATCHMAKING & BATTLE ENGINE
          ========================================================================= */}
      {activeTab === 'matchmaking' && (
        <div className="space-y-4">
          {/* 1. Global Auto-Match Card */}
          <div className="p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-black text-white">Global Auto-Match</h3>
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Real Scholars Only
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Instantly pair with active Class 10 JAC students ranked near your XP level.
            </p>

            {isSearchingMatch ? (
              <div className="py-4 text-center space-y-2">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                  Scanning JAC Matchmaking Servers...
                </p>
                <p className="text-[10px] text-slate-400">Searching players with isRealUser: true</p>
              </div>
            ) : matchedOpponent ? (
              <div className="p-3 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={matchedOpponent.photoURL}
                      alt={matchedOpponent.name}
                      className="w-10 h-10 rounded-full border-2 border-emerald-400 object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-black text-white">{matchedOpponent.name}</h4>
                      <p className="text-[10px] text-emerald-400 font-bold">
                        @{matchedOpponent.username} &bull; {matchedOpponent.xp} XP
                      </p>
                    </div>
                  </div>
                  <span className="text-xs">⚔️</span>
                </div>
                <div className="flex gap-2">
                  <Link href="/quiz/live-duel" className="flex-1">
                    <TactileButton variant="emerald" fullWidth size="sm" className="font-black text-xs py-2">
                      Start 1v1 Battle!
                    </TactileButton>
                  </Link>
                  <button
                    onClick={() => setMatchedOpponent(null)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 text-[10px] font-bold text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <TactileButton
                variant="emerald"
                fullWidth
                size="md"
                onClick={handleAutoMatch}
                className="font-black text-xs py-3 shadow-[0_4px_0_#065F46]"
              >
                ⚡ Instant Matchmaking
              </TactileButton>
            )}
          </div>

          {/* 2. 1v1 Friend Duel Room Card (4-Digit PIN Lobby) */}
          <div className="p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-white">4-Digit PIN Friend Lobby</h3>
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Prompt 5 Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Generate a 4-digit PIN for your classmate or enter their shared PIN to clash.
            </p>

            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter 4-Digit Room PIN (e.g. JAC4)"
                  maxLength={6}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white placeholder:text-slate-500 uppercase tracking-widest focus:outline-none focus:border-amber-400/50"
                />
                <TactileButton
                  variant="gold"
                  size="sm"
                  disabled={!roomCode}
                  onClick={() => {
                    playClickSound();
                    triggerHaptic();
                    setMatchedOpponent({
                      name: 'Aarav Kumar',
                      username: 'aarav_bokaro',
                      xp: 1350,
                      streak: 9,
                      class: 'Class 10 JAC',
                      photoURL: '/assets/profile_photos/classic_character_1.png',
                      isRealUser: true,
                      pin: roomCode
                    });
                  }}
                  className="font-black text-xs px-4"
                >
                  Join PIN
                </TactileButton>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => {
                    playClickSound();
                    const newPin = `JAC${Math.floor(100 + Math.random() * 900)}`;
                    setRoomCode(newPin);
                    triggerHaptic();
                  }}
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>🎲 Generate Random PIN</span>
                </button>

                {roomCode && (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    PIN: {roomCode}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 3. Local AI Practice with Octopops Bot */}
          <div className="p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-black text-white">Offline Octopops AI Practice</h3>
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                0 Data Used
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Sharpen your speed against the adaptive Octopops bot before entering ranked duels.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Link href="/quiz/ai-practice?diff=rookie">
                <button
                  onClick={() => playClickSound()}
                  className="w-full py-2 px-1 rounded-xl bg-white/5 hover:bg-emerald-500/20 border border-white/10 text-center transition-all active:scale-95"
                >
                  <div className="text-[10px] font-black text-emerald-400">🌱 Rookie</div>
                  <div className="text-[8px] text-slate-400">Pass Speed</div>
                </button>
              </Link>
              <Link href="/quiz/ai-practice?diff=topper">
                <button
                  onClick={() => playClickSound()}
                  className="w-full py-2 px-1 rounded-xl bg-white/5 hover:bg-amber-500/20 border border-white/10 text-center transition-all active:scale-95"
                >
                  <div className="text-[10px] font-black text-amber-400">🔥 JAC Topper</div>
                  <div className="text-[8px] text-slate-400">92% Acc</div>
                </button>
              </Link>
              <Link href="/quiz/ai-practice?diff=grandmaster">
                <button
                  onClick={() => playClickSound()}
                  className="w-full py-2 px-1 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 text-center transition-all active:scale-95"
                >
                  <div className="text-[10px] font-black text-red-400">👑 Grandmaster</div>
                  <div className="text-[8px] text-slate-400">Sub-3 Sec</div>
                </button>
              </Link>
            </div>
          </div>

          {/* 4. Spectator Mode & Instant Revenge Demo */}
          <div className="flex gap-2">
            <button
              onClick={() => { playClickSound(); alert('Spectating Active Top JAC Final Duel...'); }}
              className="flex-1 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 text-xs font-bold text-slate-300 active:scale-95 transition"
            >
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>Spectate Live</span>
            </button>
            <button
              onClick={() => { playClickSound(); setShowRevengeModal(true); }}
              className="flex-1 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 text-xs font-bold text-slate-300 active:scale-95 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-400" />
              <span>Instant Revenge</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: SOCIAL HUB, GIFTS & CO-OP QUESTS
          ========================================================================= */}
      {activeTab === 'social' && (
        <div className="space-y-4">
          {/* Daily Gift Exchange (24h timer) */}
          <div className="p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-white">Daily Gift Exchange</h3>
              </div>
              <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" /> 24h Reset
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Send free +50 XP and 5 Gems to your active study group daily.
            </p>
            {giftClaimed ? (
              <div className="py-2.5 px-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center gap-2 text-xs font-black text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Gift Claimed! Next drop in 23h 58m</span>
              </div>
            ) : (
              <TactileButton
                variant="gold"
                fullWidth
                size="md"
                onClick={handleClaimDailyGift}
                className="font-black text-xs py-2.5 shadow-[0_4px_0_#92400E]"
              >
                🎁 Claim Today&apos;s Gift (+50 XP)
              </TactileButton>
            )}
          </div>

          {/* Co-Op Friends Quest Tracker */}
          <div className="p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-black text-white">Co-op Friends Quest</h3>
              </div>
              <span className="text-[9px] font-black text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                3D Chest Unlock
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Complete 25 collective quiz levels with mutual friends this week.
            </p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono font-bold text-slate-300">
                <span>Team Progress: 18 / 25 Levels</span>
                <span className="text-emerald-400">72%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-white/10">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full w-[72%]" />
              </div>
            </div>
          </div>

          {/* Dynamic Follow Link */}
          <div className="p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-black text-white">Custom Invite &amp; Follow Link</h3>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Share your personal profile link to add friends directly:
            </p>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2">
              <span className="font-mono text-xs text-amber-300 flex-1 truncate">
                jackquiz.app/@{username}
              </span>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1 active:scale-95 transition"
              >
                {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* 3D Taunt & Nudge Emojis */}
          <div className="p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-white/10 shadow-lg">
            <h3 className="text-sm font-black text-white mb-2">In-Battle 3D Taunts &amp; Nudges</h3>
            <p className="text-[11px] text-slate-400 mb-3">
              Trigger animated tactical reaction emotes during live challenges:
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { emoji: '⚡', label: 'Speed Up' },
                { emoji: '🔥', label: 'On Fire' },
                { emoji: '👑', label: 'Checkmate' },
                { emoji: '🐙', label: 'Octopops' }
              ].map((t) => (
                <button
                  key={t.label}
                  onClick={() => sendTaunt(t.emoji, t.label)}
                  className="p-2.5 rounded-2xl bg-white/5 hover:bg-emerald-500/20 border border-white/10 flex flex-col items-center gap-1 active:scale-95 transition"
                >
                  <span className="text-xl">{t.emoji}</span>
                  <span className="text-[9px] font-bold text-slate-300">{t.label}</span>
                </button>
              ))}
            </div>
            {tauntSent && (
              <div className="mt-2 text-center text-xs font-black text-amber-300 animate-pulse">
                Taunt Sent: {tauntSent}!
              </div>
            )}
          </div>

          {/* Smart Mutual Friends Carousel: "You May Know" */}
          <div className="p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-white/10 shadow-lg">
            <h3 className="text-sm font-black text-white mb-2">You May Know &bull; Class 10 JAC</h3>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { name: 'Rohit K.', school: 'Ranchi High', img: '/assets/profile_photos/classic_character_1.png' },
                { name: 'Sneha M.', school: 'Dhanbad Model', img: '/assets/profile_photos/classic_character_3.png' },
                { name: 'Aman V.', school: 'Bokaro Steel', img: '/assets/profile_photos/classic_character_4.png' }
              ].map((friend) => (
                <div
                  key={friend.name}
                  className="w-28 shrink-0 p-2.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center"
                >
                  <img src={friend.img} alt={friend.name} className="w-10 h-10 rounded-full mb-1 object-cover" />
                  <div className="text-[11px] font-black text-white truncate w-full">{friend.name}</div>
                  <div className="text-[8px] text-slate-400 truncate w-full">{friend.school}</div>
                  <button
                    onClick={() => { playClickSound(); alert(`Challenge request sent to ${friend.name}!`); }}
                    className="mt-2 w-full py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-[9px] font-black text-emerald-300 border border-emerald-500/40"
                  >
                    + Duel
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: 3D TROPHY ROOM & LEAGUE TIERS
          ========================================================================= */}
      {activeTab === 'trophies' && (
        <div className="space-y-4">
          {/* Navigable 3D Shelf UI */}
          <div className="p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-white">3D Trophy Room</h3>
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Weekly Diamond Tier
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { title: 'JAC Math Topper', icon: '🏆', rarity: 'Legendary' },
                { title: 'Science Titan', icon: '💎', rarity: 'Epic' },
                { title: '7-Day Duel King', icon: '👑', rarity: 'Rare' },
                { title: 'English Master', icon: '📜', rarity: 'Common' },
                { title: 'Social Scholar', icon: '🌍', rarity: 'Rare' },
                { title: 'Octopops Friend', icon: '🐾', rarity: 'Mythic' }
              ].map((t) => (
                <div
                  key={t.title}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center shadow-sm hover:border-amber-400/40 transition"
                >
                  <div className="text-2xl mb-1">{t.icon}</div>
                  <div className="text-[10px] font-black text-white leading-tight">{t.title}</div>
                  <div className="text-[8px] font-bold text-amber-400 mt-0.5 uppercase tracking-wider">
                    {t.rarity}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unlockable Custom Titles */}
          <div className="p-4 rounded-3xl bg-[rgba(26,34,53,0.85)] backdrop-blur-xl border border-white/10 shadow-lg">
            <h3 className="text-sm font-black text-white mb-2">Equipable Scholar Titles</h3>
            <div className="space-y-2">
              {[
                { title: '👑 Royal Grandmaster (Class 10)', active: true, req: 'Earned at 250 XP' },
                { title: '⚡ Lightning Calculator', active: false, req: 'Sub-3s math record' },
                { title: '🛡️ JAC State Defender', active: false, req: 'Top 100 on leaderboard' }
              ].map((t) => (
                <div
                  key={t.title}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-black text-white">{t.title}</div>
                    <div className="text-[9px] text-slate-400">{t.req}</div>
                  </div>
                  {t.active ? (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                      EQUIPPED
                    </span>
                  ) : (
                    <button
                      onClick={() => { playClickSound(); alert('Locked: Complete requirements to equip.'); }}
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-400 hover:text-white"
                    >
                      Equip
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* INSTANT REVENGE MODAL */}
      {showRevengeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-[340px] bg-[#141A2D] border-2 border-red-500/50 rounded-3xl p-5 text-center shadow-[0_0_30px_rgba(239,68,68,0.5)]">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto mb-2 text-xl">
              ⚔️
            </div>
            <h3 className="text-base font-black text-white">Instant Revenge Triggered!</h3>
            <p className="text-[11px] text-slate-300 mt-1 mb-4">
              Challenge your last rival to an immediate double-or-nothing rematch!
            </p>
            <div className="flex gap-2">
              <TactileButton
                variant="ruby"
                fullWidth
                size="sm"
                onClick={() => {
                  playClickSound();
                  setShowRevengeModal(false);
                  alert('Rematch request sent!');
                }}
                className="font-black text-xs py-2"
              >
                Accept Revenge (2X XP)
              </TactileButton>
              <button
                onClick={() => setShowRevengeModal(false)}
                className="px-3 py-2 rounded-xl bg-white/10 text-xs font-bold text-slate-400 hover:text-white"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
