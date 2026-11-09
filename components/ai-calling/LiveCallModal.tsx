'use client';

import { CLASS_10_MASTER_SYLLABUS } from '@/lib/class10Syllabus';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  ShieldCheck,
  BookOpen,
  ChevronRight,
  Clock,
  Zap,
  CheckCircle2,
  Award
} from 'lucide-react';
import {
  playCallingRingtone,
  playHangupSound,
  playSfxByName,
  triggerHapticTick,
  triggerHapticSuccess
} from '@/lib/audioEngine';
import { getUserDailyCallCredits, deductUserDailyCallCredit } from '@/lib/geminiKeyManager';

interface LiveCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubject?: string;
  studentName?: string;
}

const CALL_SUBJECTS = CLASS_10_MASTER_SYLLABUS.map((sub) => ({
  id: sub.id,
  name: sub.title,
  hindi: sub.hindiTitle,
  color:
    sub.id === 'sci'
      ? 'from-emerald-500/20 to-teal-950/40 border-emerald-500/40 text-emerald-300'
      : sub.id === 'math'
      ? 'from-blue-500/20 to-indigo-950/40 border-blue-500/40 text-blue-300'
      : sub.id === 'sst'
      ? 'from-amber-500/20 to-yellow-950/40 border-amber-500/40 text-amber-300'
      : sub.id === 'eng'
      ? 'from-cyan-500/20 to-sky-950/40 border-cyan-500/40 text-cyan-300'
      : 'from-pink-500/20 to-rose-950/40 border-pink-500/40 text-pink-300',
  chapters: sub.chapters.map((ch) => `Ch ${ch.num}: ${ch.title}`)
}));

export const LiveCallModal: React.FC<LiveCallModalProps> = ({
  isOpen,
  onClose,
  currentSubject = 'Science',
  studentName = 'Scholar'
}) => {
  // Call States: 'setup' -> 'ringing' -> 'connected' -> 'ended'
  const [callState, setCallState] = useState<'setup' | 'ringing' | 'connected' | 'ended'>('setup');
  const [selectedSub, setSelectedSub] = useState<string>(currentSubject);
  const [selectedChap, setSelectedChap] = useState<string>('Chemical Reactions & Equations');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(300); // 5:00 min session limit
  const [creditsLeft, setCreditsLeft] = useState<number>(5);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [mascotMood, setMascotMood] = useState<'idle' | 'happy' | 'thinking' | 'celebrate' | 'laugh' | 'shock'>('idle');
  const [currentSpeech, setCurrentSpeech] = useState<string>('');
  const [userTextInput, setUserTextInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [liveScore, setLiveScore] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ringtoneRef = useRef<{ stop: () => void } | null>(null);
  const countdownIntervalRef = useRef<any>(null);

  // Sync remaining daily credits
  useEffect(() => {
    if (isOpen) {
      const creditStatus = getUserDailyCallCredits();
      setCreditsLeft(creditStatus.creditsLeft);
      setRemainingSeconds(300);
      setCallState('setup');
    }
  }, [isOpen]);

  // Audio Waveform Canvas Animation
  useEffect(() => {
    if (!isOpen || callState !== 'connected') return;

    let animId: number;
    let phase = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderWave = () => {
      phase += 0.08;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const waveColors = ['rgba(16, 185, 129, 0.7)', 'rgba(245, 158, 11, 0.5)', 'rgba(59, 130, 246, 0.4)'];
      const amplitudes = [18, 12, 8];
      const frequencies = [0.035, 0.025, 0.045];

      waveColors.forEach((color, idx) => {
        ctx.beginPath();
        ctx.lineWidth = idx === 0 ? 3 : 2;
        ctx.strokeStyle = color;

        for (let x = 0; x < width; x++) {
          const amp = isAiThinking || mascotMood !== 'idle' ? amplitudes[idx] * 1.5 : amplitudes[idx];
          const y = height / 2 + Math.sin(x * frequencies[idx] + phase + idx * 1.5) * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      animId = requestAnimationFrame(renderWave);
    };

    renderWave();
    return () => cancelAnimationFrame(animId);
  }, [isOpen, callState, isAiThinking, mascotMood]);

  // Clean TTS Voice with Best Indian/Hindi Accent
  const speakWithDelhiVoice = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeakerMuted) return;

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\[SFX:[^\]]+\]/g, '').replace(/⭐[^\n]+/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(
      (v) =>
        v.lang === 'hi-IN' ||
        v.lang === 'en-IN' ||
        v.name.includes('Swara') ||
        v.name.includes('Prabhat') ||
        v.name.includes('India') ||
        v.name.includes('Hindi')
    );

    if (indianVoice) utterance.voice = indianVoice;
    utterance.pitch = 1.05;
    utterance.rate = 1.0;

    utterance.onstart = () => {
      setMascotMood('happy');
    };
    utterance.onend = () => {
      setMascotMood('idle');
    };

    window.speechSynthesis.speak(utterance);
  };

  // Start Call Handler
  const handleInitiateCall = () => {
    triggerHapticSuccess();
    const newCredits = deductUserDailyCallCredit();
    setCreditsLeft(newCredits);

    setCallState('ringing');
    ringtoneRef.current = playCallingRingtone();

    // Auto-answer after 2 seconds
    setTimeout(() => {
      if (ringtoneRef.current) ringtoneRef.current.stop();
      setCallState('connected');
      playSfxByName('bell');

      const initialGreeting = `Haan bhai ${studentName}! Aaj ${selectedSub} ke "${selectedChap}" ka poora post-mortem karenge, scene ekdum set hai! Bata jaldi meri jaan, 2026-2027 board exam ka question sun: Is chapter ka sabse crucial principle ya formula kya hai?`;
      setCurrentSpeech(initialGreeting);
      speakWithDelhiVoice(initialGreeting);

      // Start 5:00 min timer
      countdownIntervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            handleHangup();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 2000);
  };

  // Hangup Handler
  const handleHangup = () => {
    triggerHapticTick();
    playHangupSound();
    if (ringtoneRef.current) ringtoneRef.current.stop();
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCallState('ended');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  // Send message to Delhi Master Teacher AI
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isAiThinking) return;
    triggerHapticTick();
    setIsAiThinking(true);

    try {
      const res = await fetch('/api/ai-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: text,
          currentSubject: selectedSub,
          currentChapter: selectedChap,
          studentName
        })
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.reply || "Shabash mere sher! Agla question sun mamu!";
        setCurrentSpeech(reply);

        // Check for Live Score
        const scoreMatch = reply.match(/⭐\s*Live Score:\s*([\d\.]+\/10)/i);
        if (scoreMatch) {
          setLiveScore(scoreMatch[1]);
        }

        speakWithDelhiVoice(reply);
      }
    } catch (e) {
      const fallback = `Bohot badiya prayas ${studentName}! Agla sawal dhyan se sun: Newton ka third law everyday life me kaha dikhta hai?`;
      setCurrentSpeech(fallback);
      speakWithDelhiVoice(fallback);
    } finally {
      setIsAiThinking(false);
    }
  };

  if (!isOpen) return null;

  const currentSubjectObj = CALL_SUBJECTS.find((s) => s.name === selectedSub) || CALL_SUBJECTS[0];
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-2xl select-none"
      >
        <motion.div
          initial={{ scale: 0.94, y: 16 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.94, y: 16 }}
          className="relative w-full max-w-[480px] max-h-[92dvh] rounded-[32px] bg-gradient-to-b from-[#141B2D] via-[#0D1220] to-[#080B14] border-2 border-emerald-500/50 shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden"
        >
          {/* =========================================================================
              VIEW 1: PRE-CALL SUBJECT & CHAPTER PICKER (STEP 1)
              ========================================================================= */}
          {callState === 'setup' && (
            <div className="flex-1 flex flex-col p-4 sm:p-5 overflow-y-auto space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                    <Phone className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white leading-tight">
                      Delhi Master Tutor Call
                    </h3>
                    <p className="text-[11px] font-bold text-emerald-400">
                      Live 1-on-1 Oral Board Preparation
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black">
                  <Zap className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{creditsLeft}/5 Left</span>
                </div>
              </div>

              {/* Step 1: Select Subject */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
                  1. Choose Subject for Live Call:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {CALL_SUBJECTS.map((sub) => {
                    const isSelected = selectedSub === sub.name;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          triggerHapticTick();
                          setSelectedSub(sub.name);
                          setSelectedChap(sub.chapters[0]);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/25 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.35)] scale-[1.02]'
                            : 'bg-white/5 hover:bg-white/10 border-white/10'
                        }`}
                      >
                        <span className="text-xs font-black text-white block">
                          {sub.name}
                        </span>
                        <span className="text-[10px] text-amber-300/90 font-bold block">
                          {sub.hindi}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Select Chapter */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
                  2. Choose Chapter for Oral Test:
                </span>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {currentSubjectObj.chapters.map((ch, idx) => {
                    const isChSelected = selectedChap === ch;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          triggerHapticTick();
                          setSelectedChap(ch);
                        }}
                        className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                          isChSelected
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="text-[10px] font-mono font-bold text-amber-400">
                            Ch {idx + 1}
                          </span>
                          <span className="text-xs font-bold truncate text-white">
                            {ch}
                          </span>
                        </div>
                        {isChSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Connect Call Action Button */}
              <div className="pt-2">
                <button
                  onClick={handleInitiateCall}
                  className="w-full py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_5px_20px_rgba(16,185,129,0.5)] border border-[#86EFAC] bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 active:scale-95 transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4 animate-bounce" />
                  <span>Connect Live Call ({selectedSub})</span>
                </button>
              </div>

              {/* Close Button */}
              <div className="text-center">
                <button
                  onClick={onClose}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 2: ACTIVE CALL SCREEN (RINGING / CONNECTED / 5:00 MIN TIMER)
              ========================================================================= */}
          {callState !== 'setup' && (
            <div className="flex-1 flex flex-col p-4 sm:p-5 justify-between">
              {/* Top HUD: Tutor Info + 5:00 Min Countdown + Live Score */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                    <Phone className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white leading-tight">
                      Delhi Master Tutor
                    </h4>
                    <p className="text-[10px] text-amber-300 font-bold">
                      {selectedSub} • {selectedChap}
                    </p>
                  </div>
                </div>

                {/* 5-Min Countdown Timer */}
                <div className="flex items-center gap-2">
                  {liveScore && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black animate-pulse">
                      <Award className="w-3.5 h-3.5" />
                      <span>{liveScore}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-black shadow-md">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{timeFormatted}</span>
                  </div>
                </div>
              </div>

              {/* Audio Waveform Canvas */}
              <div className="w-full h-14 my-3 px-2">
                <canvas
                  ref={canvasRef}
                  width={380}
                  height={60}
                  className="w-full h-full rounded-2xl bg-black/50 border border-white/5"
                />
              </div>

              {/* Teacher Voice Transcript Bubble */}
              <div className="flex-1 p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-center text-center shadow-lg my-1">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-1">
                  {callState === 'ringing'
                    ? '📞 Ringing Delhi Master Teacher...'
                    : isAiThinking
                    ? '⚡ Delhi Tutor is thinking...'
                    : 'Master Teacher Speaking:'}
                </span>
                <p className="text-xs font-bold text-white leading-relaxed">
                  "{currentSpeech}"
                </p>
              </div>

              {/* Text Input for Student Answer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(userTextInput);
                  setUserTextInput('');
                }}
                className="flex items-center gap-2 mt-3"
              >
                <input
                  type="text"
                  value={userTextInput}
                  onChange={(e) => setUserTextInput(e.target.value)}
                  placeholder="Type or speak answer (e.g. Option B / Quicklime)..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="submit"
                  disabled={!userTextInput.trim() || isAiThinking}
                  className="p-2.5 rounded-xl bg-emerald-500 text-black font-black hover:bg-emerald-400 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* =========================================================================
                  IN-CALL ACTION DOCK: RESIZED (44-48PX) WITH GENEROUS CLEARANCE
                  ========================================================================= */}
              <div className="flex items-center justify-around pt-4 pb-2">
                {/* Mic Toggle Button */}
                <button
                  onClick={() => {
                    triggerHapticTick();
                    setIsMicMuted(!isMicMuted);
                  }}
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all cursor-pointer ${
                    isMicMuted
                      ? 'bg-red-500/20 border-red-500 text-red-300'
                      : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                  }`}
                  title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
                >
                  {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-emerald-400" />}
                </button>

                {/* Hang Up Button (48px Height) */}
                <button
                  onClick={handleHangup}
                  className="h-12 px-7 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-2 shadow-[0_4px_0_#991B1B,0_0_20px_rgba(239,68,68,0.5)] active:translate-y-1 transition-all cursor-pointer"
                >
                  <PhoneOff className="w-5 h-5" />
                  <span>Hang Up</span>
                </button>

                {/* Speaker Toggle Button */}
                <button
                  onClick={() => {
                    triggerHapticTick();
                    setIsSpeakerMuted(!isSpeakerMuted);
                  }}
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all cursor-pointer ${
                    isSpeakerMuted
                      ? 'bg-red-500/20 border-red-500 text-red-300'
                      : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                  }`}
                  title={isSpeakerMuted ? 'Turn Speaker On' : 'Turn Speaker Off'}
                >
                  {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-amber-400" />}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
