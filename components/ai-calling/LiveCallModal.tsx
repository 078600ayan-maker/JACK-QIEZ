'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Sparkles, Send, ShieldCheck } from 'lucide-react';
import { MinecraftAvatar3D } from '@/components/avatar/MinecraftAvatar3D';
import {
  playCallingRingtone,
  playHangupSound,
  playSfxByName,
  triggerHapticTick,
  triggerHapticSuccess
} from '@/lib/audioEngine';

interface LiveCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubject?: string;
  studentName?: string;
}

export const LiveCallModal: React.FC<LiveCallModalProps> = ({
  isOpen,
  onClose,
  currentSubject = 'Science & Mathematics',
  studentName = 'Scholar'
}) => {
  const [callState, setCallState] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [callDuration, setCallDuration] = useState(0);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [mascotMood, setMascotMood] = useState<'idle' | 'happy' | 'thinking' | 'celebrate' | 'laugh' | 'shock'>('idle');
  const [transcriptHistory, setTranscriptHistory] = useState<Array<{ role: 'buddy' | 'user'; text: string }>>([
    {
      role: 'buddy',
      text: `Ha bhai ${studentName}! Scene ekdum set hai! Bata jaldi, Calcium Oxide me paani milane par kaunsi reaction hoti hai, meri jaan?`
    }
  ]);
  const [currentSpeech, setCurrentSpeech] = useState<string>(
    `Ha bhai ${studentName}! Scene ekdum set hai! Padh le yaar, bata jaldi Calcium Oxide me paani milane par kya hota hai?`
  );
  const [userTextInput, setUserTextInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const ringtoneRef = useRef<{ stop: () => void } | null>(null);

  // Initialize Speech Synthesis & Calling sequence
  useEffect(() => {
    if (!isOpen) return;

    setCallState('ringing');
    setCallDuration(0);
    setMascotMood('idle');

    // Ringtone
    ringtoneRef.current = playCallingRingtone();

    // Auto-answer after 2.4 seconds
    const answerTimer = setTimeout(() => {
      if (ringtoneRef.current) ringtoneRef.current.stop();
      setCallState('connected');
      playSfxByName('bell');
      speakWithCuteChildVoice(
        `Ha bhai ${studentName}! Scene ekdum set hai! Bata jaldi, Calcium Oxide me paani milane par kaunsi reaction hoti hai, meri jaan?`
      );
    }, 2400);

    return () => {
      clearTimeout(answerTimer);
      if (ringtoneRef.current) ringtoneRef.current.stop();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen, studentName]);

  // Call Duration Timer
  useEffect(() => {
    if (callState !== 'connected') return;
    const interval = setInterval(() => {
      setCallDuration(d => d + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callState]);

  // Audio Waveform Visualizer Animation (60 FPS Canvas)
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

      // Render 3 layered audio waves
      const waveColors = ['rgba(16, 185, 129, 0.7)', 'rgba(245, 158, 11, 0.5)', 'rgba(59, 130, 246, 0.4)'];
      const amplitudes = [18, 12, 8];
      const frequencies = [0.035, 0.025, 0.045];

      waveColors.forEach((color, idx) => {
        ctx.beginPath();
        ctx.lineWidth = idx === 0 ? 3 : 2;
        ctx.strokeStyle = color;

        for (let x = 0; x < width; x++) {
          const amp = isAiThinking || mascotMood !== 'idle' ? amplitudes[idx] * 1.6 : amplitudes[idx];
          const y = height / 2 + Math.sin(x * frequencies[idx] + phase + idx * 1.5) * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      animId = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isOpen, callState, isAiThinking, mascotMood]);

  // Web Speech Recognition for User Input
  useEffect(() => {
    if (!isOpen || callState !== 'connected' || isMicMuted) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'hi-IN';

        recognition.onresult = (event: any) => {
          const lastIdx = event.results.length - 1;
          const transcript = event.results[lastIdx][0].transcript;
          if (transcript.trim()) {
            handleUserMessage(transcript);
          }
        };

        recognition.onstart = () => setIsUserSpeaking(true);
        recognition.onend = () => {
          setIsUserSpeaking(false);
          if (isOpen && callState === 'connected' && !isMicMuted) {
            try { recognition.start(); } catch {}
          }
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
      } catch (err) {
        console.warn('Speech recognition fallback:', err);
      }
    }

    return () => {
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch {}
      }
    };
  }, [isOpen, callState, isMicMuted]);

  // Cute Child Native Android TTS Synthesizer
  const speakWithCuteChildVoice = (text: string) => {
    if (isSpeakerMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\[SFX:\s*\w+\]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Cute, high-pitched smart child tuning
    utterance.pitch = 1.35;
    utterance.rate = 1.05;

    // Pick Indian Hindi or English voice if available
    const voices = window.speechSynthesis.getVoices();
    const childOrIndianVoice =
      voices.find(v => v.lang.includes('hi') || v.lang.includes('IN')) ||
      voices.find(v => v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('natural')) ||
      voices[0];

    if (childOrIndianVoice) {
      utterance.voice = childOrIndianVoice;
    }

    utterance.onstart = () => {
      setMascotMood('celebrate');
    };

    utterance.onend = () => {
      setMascotMood('idle');
    };

    window.speechSynthesis.speak(utterance);
  };

  // Submit User Message to Backend Cloud Proxy
  const handleUserMessage = async (msgText: string) => {
    if (!msgText.trim()) return;

    triggerHapticTick();
    setTranscriptHistory(prev => [...prev, { role: 'user', text: msgText }]);
    setIsAiThinking(true);
    setMascotMood('thinking');

    try {
      const res = await fetch('/api/ai-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: msgText,
          history: transcriptHistory.slice(-4),
          currentSubject
        })
      });

      const data = await res.json();
      if (data && data.reply) {
        setCurrentSpeech(data.reply);
        setTranscriptHistory(prev => [...prev, { role: 'buddy', text: data.reply }]);

        // Play procedural SFX from backend tag
        if (data.sfx) {
          playSfxByName(data.sfx);
        }

        // Adjust mood based on sfx
        if (data.sfx === 'cheer' || data.sfx === '8bit') {
          setMascotMood('celebrate');
          triggerHapticSuccess();
        } else if (data.sfx === 'laugh') {
          setMascotMood('laugh');
        } else {
          setMascotMood('happy');
        }

        speakWithCuteChildVoice(data.reply);
      }
    } catch (err) {
      console.warn('Backend proxy call fallback:', err);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleHangup = () => {
    playHangupSound();
    triggerHapticTick();
    if (ringtoneRef.current) ringtoneRef.current.stop();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch {}
    }
    setCallState('ended');
    setTimeout(() => {
      onClose();
    }, 400);
  };

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-2xl select-none"
      >
        <motion.div
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 30 }}
          transition={{ type: 'spring', stiffness: 350, damping: 26 }}
          className="relative w-full max-w-[440px] h-[92vh] max-h-[820px] rounded-3xl bg-gradient-to-b from-[#131D31] via-[#090D16] to-[#04060B] border-2 border-emerald-500/40 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(16,185,129,0.2)] p-5 flex flex-col justify-between overflow-hidden"
        >
          {/* Top HUD: Caller Identity & Duration */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{callState === 'ringing' ? 'Connecting Call...' : 'Live Delhi Voice Call'}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono font-black text-emerald-400">
              <span>{formatTime(callDuration)}</span>
            </div>
          </div>

          {/* Center Mascot & Waveform Stage */}
          <div className="flex-1 flex flex-col items-center justify-center my-1 relative">
            {/* Pulsing Aura */}
            <div className="absolute w-60 h-60 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

            {/* 3D Minecraft Study Buddy */}
            <div className="relative z-10 scale-95">
              <MinecraftAvatar3D
                animation={
                  mascotMood === 'celebrate' || mascotMood === 'happy'
                    ? 'cheer'
                    : mascotMood === 'shock'
                    ? 'cry'
                    : 'idle'
                }
                size={190}
                showPedestal={true}
              />
            </div>

            {/* Mascot Title */}
            <div className="mt-2 text-center">
              <h3 className="text-lg font-black text-white tracking-tight flex items-center justify-center gap-1.5">
                <span>Steve & Alex</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-400/40">
                  Delhi Study Buddy
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                JAC Class 10 &bull; {currentSubject}
              </p>
            </div>

            {/* Live Audio Sine Wave Canvas */}
            <div className="w-full h-14 mt-2 px-4">
              <canvas
                ref={canvasRef}
                width={380}
                height={60}
                className="w-full h-full rounded-2xl bg-black/40 border border-white/5"
              />
            </div>

            {/* Speech Transcript Bubble */}
            <div className="w-full max-w-[380px] mt-3 p-3 rounded-2xl bg-white/5 border border-white/10 text-center shadow-lg">
              <span className="text-[10px] font-bold text-amber-400 block mb-1 uppercase tracking-wider">
                {isAiThinking ? '⚡ Thinking in Delhi Slang...' : 'Study Buddy Speaking:'}
              </span>
              <p className="text-xs font-bold text-white leading-relaxed">
                "{currentSpeech}"
              </p>
            </div>
          </div>

          {/* Quick Voice / Text Input Bar */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUserMessage(userTextInput);
                setUserTextInput('');
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={userTextInput}
                onChange={(e) => setUserTextInput(e.target.value)}
                placeholder="Type or speak your answer (e.g., Option B)..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                disabled={!userTextInput.trim()}
                className="p-2.5 rounded-xl bg-emerald-500 text-black font-black hover:bg-emerald-400 disabled:opacity-40 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* In-Call Action Dock: Mute, Speaker, Hangup */}
            <div className="flex items-center justify-around px-4 pt-1">
              {/* Mic Toggle */}
              <button
                onClick={() => {
                  triggerHapticTick();
                  setIsMicMuted(!isMicMuted);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isMicMuted
                    ? 'bg-red-500/20 border-red-500 text-red-300'
                    : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                }`}
                title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-emerald-400" />}
              </button>

              {/* Red Tactile Hangup Button */}
              <button
                onClick={handleHangup}
                className="px-8 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-2 shadow-[0_5px_0_#991B1B,0_0_20px_rgba(239,68,68,0.5)] active:translate-y-1 active:shadow-[0_2px_0_#991B1B] transition-all cursor-pointer"
              >
                <PhoneOff className="w-5 h-5" />
                <span>Hang Up</span>
              </button>

              {/* Speaker Toggle */}
              <button
                onClick={() => {
                  triggerHapticTick();
                  setIsSpeakerMuted(!isSpeakerMuted);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
