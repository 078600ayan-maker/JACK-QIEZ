'use client';

import { CLASS_10_MASTER_SYLLABUS } from '@/lib/class10Syllabus';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Clock,
  Zap,
  CheckCircle2,
  Award,
  KeyRound,
  Lock,
  MessageSquarePlus,
  Mail,
  Sparkles,
  X,
  Radio,
} from 'lucide-react';
import {
  playCallingRingtone,
  playHangupSound,
  playSfxByName,
  triggerHapticTick,
  triggerHapticSuccess
} from '@/lib/audioEngine';
import { getUserDailyCallCredits, deductUserDailyCallCredit } from '@/lib/geminiKeyManager';
import { useUserStore } from '@/store/useUserStore';
import { syncCallCreditsInCloud, logLiveCallSessionInCloud } from '@/lib/socialService';

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

const QUICK_GENZ_CHIPS = [
  'Zero se samjhao 💡',
  'Short example do 🎯',
  'Next Question ➡️',
  'Short Trick ⚡',
];

const FEEDBACK_CATEGORIES = [
  'AI Teaching',
  'Bug / Lag',
  'Feature Idea',
  'Question Error',
];

export const LiveCallModal: React.FC<LiveCallModalProps> = ({
  isOpen,
  onClose,
  currentSubject = 'Science',
  studentName = 'Scholar'
}) => {
  const { profile, setProfile } = useUserStore();
  const initialSubjectObj =
    CALL_SUBJECTS.find(
      (s) =>
        s.name.toLowerCase().includes(currentSubject.toLowerCase()) ||
        s.id.toLowerCase() === currentSubject.toLowerCase()
    ) || CALL_SUBJECTS[0];

  // Call States: 'setup' -> 'ringing' -> 'connected' -> 'ended'
  const [callState, setCallState] = useState<'setup' | 'ringing' | 'connected' | 'ended'>('setup');
  const [selectedSub, setSelectedSub] = useState<string>(initialSubjectObj.name);
  const [selectedChap, setSelectedChap] = useState<string>(initialSubjectObj.chapters[0]);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(300); // 5:00 min session limit
  const [creditsLeft, setCreditsLeft] = useState<number>(5);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [handsFreeMode, setHandsFreeMode] = useState(true);
  const [mascotMood, setMascotMood] = useState<'idle' | 'happy' | 'thinking' | 'celebrate' | 'laugh' | 'shock'>('idle');
  const [currentSpeech, setCurrentSpeech] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [userTextInput, setUserTextInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [liveScore, setLiveScore] = useState<string | null>(null);
  const [activeProviderLabel, setActiveProviderLabel] = useState<string>('Calm Mentor AI');

  // Hidden 10-Key AI Vault (masked password inputs, sessionStorage only, never shown in plaintext)
  const [serverVaultCount, setServerVaultCount] = useState<number>(0);
  const [showVaultDrawer, setShowVaultDrawer] = useState(false);
  const [vaultKeys, setVaultKeys] = useState<string[]>(() => Array(10).fill(''));

  // Feedback Drawer State
  const [showFeedback, setShowFeedback] = useState(false);
  const [fbCategory, setFbCategory] = useState<string>('AI Teaching');
  const [fbRating, setFbRating] = useState<number>(5);
  const [fbMessage, setFbMessage] = useState<string>('');
  const [fbSending, setFbSending] = useState(false);
  const [fbStatus, setFbStatus] = useState<{ text: string; mailtoHref?: string } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ringtoneRef = useRef<{ stop: () => void } | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);
  const callLoggedRef = useRef<boolean>(false);
  const callStateRef = useRef(callState);
  const handsFreeRef = useRef(handsFreeMode);
  const isSpeakerMutedRef = useRef(isSpeakerMuted);

  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  useEffect(() => {
    handsFreeRef.current = handsFreeMode;
  }, [handsFreeMode]);

  useEffect(() => {
    isSpeakerMutedRef.current = isSpeakerMuted;
  }, [isSpeakerMuted]);

  const buildVaultHeader = useCallback((): string => {
    return vaultKeys
      .map((k) => k.trim())
      .filter(Boolean)
      .slice(0, 10)
      .join(',');
  }, [vaultKeys]);

  // Sync remaining daily credits + masked server AI vault summary on open
  useEffect(() => {
    if (!isOpen) return;
    callLoggedRef.current = false;
    setRemainingSeconds(300);
    setCallState('setup');
    setShowFeedback(false);
    setFbStatus(null);
    setLiveScore(null);

    const localCreds = getUserDailyCallCredits();
    setCreditsLeft(localCreds.creditsLeft);

    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('jq_ai_vault_slots');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const next = Array(10)
              .fill('')
              .map((_, i) => (typeof parsed[i] === 'string' ? parsed[i] : ''));
            setVaultKeys(next);
          }
        }
      } catch {
        // Ignore sessionStorage read errors
      }
    }

    fetch('/api/ai-call')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.vaultConfiguredCount === 'number') {
          setServerVaultCount(data.vaultConfiguredCount);
        }
      })
      .catch(() => {});

    if (profile?.uid) {
      syncCallCreditsInCloud(profile.uid, 'read', 5).then((cloudLeft) => {
        setCreditsLeft(cloudLeft);
      });
    }
  }, [isOpen, profile?.uid]);

  const updateVaultSlot = (idx: number, val: string) => {
    setVaultKeys((prev) => {
      const next = [...prev];
      next[idx] = val;
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('jq_ai_vault_slots', JSON.stringify(next));
        } catch {
          // Ignore storage errors
        }
      }
      return next;
    });
  };

  // Waveform Canvas Loop
  useEffect(() => {
    if (!isOpen || callState === 'setup') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const renderWave = () => {
      phase += isAiThinking ? 0.14 : mascotMood === 'happy' || isListening ? 0.18 : 0.06;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const bars = 32;
      const barWidth = w / bars;
      for (let i = 0; i < bars; i++) {
        const amp =
          callState === 'ringing'
            ? 8 + Math.sin(phase + i * 0.4) * 6
            : isAiThinking
            ? 14 + Math.cos(phase + i * 0.5) * 12
            : mascotMood === 'happy' || isListening
            ? 18 + Math.sin(phase + i * 0.7) * 16
            : 5 + Math.sin(phase + i * 0.3) * 3;

        const y = (h - amp) / 2;
        ctx.fillStyle = isListening
          ? '#38BDF8'
          : mascotMood === 'happy'
          ? '#34D399'
          : isAiThinking
          ? '#FBBF24'
          : '#64748B';
        ctx.beginPath();
        ctx.roundRect(i * barWidth + 2, y, barWidth - 4, Math.max(3, amp), 3);
        ctx.fill();
      }
      animId = requestAnimationFrame(renderWave);
    };

    renderWave();
    return () => cancelAnimationFrame(animId);
  }, [isOpen, callState, isAiThinking, mascotMood, isListening]);

  // Clean Speech-to-Text Capture (Web Speech API)
  const startListening = useCallback((sendFn: (msg: string) => void) => {
    if (typeof window === 'undefined') return;
    const w = window as unknown as {
      SpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onerror: (() => void) | null;
        onend: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onerror: (() => void) | null;
        onend: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
    };
    const SpeechRec = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRec) return;

    try {
      const rec = new SpeechRec();
      rec.lang = 'en-IN';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (event) => {
        const spoken = event.results?.[0]?.[0]?.transcript || '';
        if (spoken.trim()) {
          sendFn(spoken.trim());
        }
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      recognitionRef.current = rec;
      setIsMicMuted(false);
      setIsListening(true);
      rec.start();
    } catch {
      setIsListening(false);
    }
  }, []);

  // Send message to Calm Mentor AI (locked strictly to selected Subject & Chapter)
  const handleSendMessage = async (text: string) => {
    const clean = text.trim();
    if (!clean || isAiThinking) return;
    triggerHapticTick();
    setIsAiThinking(true);

    const nextHistory = [...conversationHistory, { role: 'user' as const, text: clean }];
    setConversationHistory(nextHistory);

    try {
      const vaultHeader = buildVaultHeader();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (vaultHeader) headers['x-ai-vault'] = vaultHeader;

      const res = await fetch('/api/ai-call', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userMessage: clean,
          history: nextHistory,
          currentSubject: selectedSub,
          currentChapter: selectedChap,
          studentName
        })
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.reply || `Shabash ${studentName}! "${selectedChap}" ke agle concept par bol!`;
        if (data.providerLabel) setActiveProviderLabel(data.providerLabel);
        setCurrentSpeech(reply);
        setConversationHistory((prev) => [...prev, { role: 'assistant', text: reply }]);

        const scoreMatch = reply.match(/⭐\s*Live Score:\s*([\d\.]+\/10)/i);
        if (scoreMatch) {
          setLiveScore(scoreMatch[1]);
        }

        speakWithDelhiVoice(reply);
      }
    } catch {
      const fallback = `Aaram se ${studentName}, "${selectedChap}" ka basic concept bilkul zero se samajhte hain — apna doubt ya answer bol!`;
      setCurrentSpeech(fallback);
      setConversationHistory((prev) => [...prev, { role: 'assistant', text: fallback }]);
      speakWithDelhiVoice(fallback);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Clean TTS Voice with Indian/Hindi Accent + Hands-Free Auto-Listen loop
  const speakWithDelhiVoice = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeakerMutedRef.current) return;

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
    utterance.pitch = 1.04;
    utterance.rate = 0.98;

    utterance.onstart = () => {
      setMascotMood('happy');
    };
    utterance.onend = () => {
      setMascotMood('idle');
      if (
        callStateRef.current === 'connected' &&
        handsFreeRef.current &&
        !isSpeakerMutedRef.current
      ) {
        setTimeout(() => {
          if (callStateRef.current === 'connected' && handsFreeRef.current) {
            startListening((spoken) => handleSendMessage(spoken));
          }
        }, 350);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Start Call Handler
  const handleInitiateCall = async () => {
    if (creditsLeft <= 0) return;
    triggerHapticSuccess();
    const localNext = deductUserDailyCallCredit();
    setCreditsLeft(localNext);
    if (profile?.uid) {
      syncCallCreditsInCloud(profile.uid, 'deduct', 5).then((cloudLeft) => {
        setCreditsLeft(cloudLeft);
      });
    }

    setCallState('ringing');
    ringtoneRef.current = playCallingRingtone();

    setTimeout(async () => {
      if (ringtoneRef.current) ringtoneRef.current.stop();
      setCallState('connected');
      playSfxByName('bell');

      const defaultGreeting = `Hey ${studentName}! Bilkul relax hoke baitho. Aaj hum ${selectedSub} ka "${selectedChap}" bilkul zero se, super easy examples ke saath samjhenge. Ready? Pehla chhota sa question puchhu?`;
      setCurrentSpeech(defaultGreeting);
      setConversationHistory([{ role: 'assistant', text: defaultGreeting }]);
      speakWithDelhiVoice(defaultGreeting);

      try {
        const vaultHeader = buildVaultHeader();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (vaultHeader) headers['x-ai-vault'] = vaultHeader;

        const res = await fetch('/api/ai-call', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            userMessage: `Start teaching ${selectedSub} (${selectedChap}) from zero in short, easy, creative style and ask the first simple question.`,
            history: [],
            currentSubject: selectedSub,
            currentChapter: selectedChap,
            studentName
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.providerLabel) setActiveProviderLabel(data.providerLabel);
          if (data.reply) {
            setCurrentSpeech(data.reply);
            setConversationHistory([{ role: 'assistant', text: data.reply }]);
            speakWithDelhiVoice(data.reply);
          }
        }
      } catch {
        // defaultGreeting stays active if offline
      }

      countdownIntervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            handleHangup();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 1800);
  };

  // Hangup Handler with Firestore Viva Session Log
  const handleHangup = () => {
    triggerHapticTick();
    playHangupSound();
    if (ringtoneRef.current) ringtoneRef.current.stop();
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const userTurns = conversationHistory.filter((m) => m.role === 'user').length;
    if (profile?.uid && userTurns > 0 && !callLoggedRef.current) {
      callLoggedRef.current = true;
      logLiveCallSessionInCloud(
        profile.uid,
        selectedSub,
        selectedChap,
        userTurns,
        Math.max(1, 300 - remainingSeconds)
      ).then((earnedXp) => {
        if (earnedXp > 0 && profile) {
          setProfile({ ...profile, xp: (profile.xp || 0) + earnedXp });
        }
      });
    }

    setCallState('ended');
  };

  const handleToggleMic = () => {
    triggerHapticTick();
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      setIsMicMuted(true);
      return;
    }
    startListening((spoken) => handleSendMessage(spoken));
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbMessage.trim() || fbSending) return;
    setFbSending(true);
    setFbStatus(null);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: profile?.name || studentName,
          studentEmail: profile?.email || '',
          uid: profile?.uid || '',
          category: fbCategory,
          rating: fbRating,
          subject: selectedSub,
          chapter: selectedChap,
          message: fbMessage.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setFbMessage('');
        setFbStatus({
          text:
            data.deliveryMode === 'resend'
              ? `Sent directly to admin inbox under folder [${data.folderTag}]!`
              : `Organized under folder [${data.folderTag}]! Tap below to send via your Email App.`,
          mailtoHref: data.mailtoHref,
        });
      } else {
        setFbStatus({ text: data.error || 'Could not send feedback.' });
      }
    } catch {
      setFbStatus({ text: 'Network error while sending feedback.' });
    } finally {
      setFbSending(false);
    }
  };

  if (!isOpen) return null;

  const currentSubjectObj = CALL_SUBJECTS.find((s) => s.name === selectedSub) || CALL_SUBJECTS[0];
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  const localRuntimeCount = vaultKeys.filter((k) => k.trim().length > 0).length;
  const totalHiddenKeys = Math.min(10, serverVaultCount + localRuntimeCount);

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
              VIEW 1: PRE-CALL SUBJECT & CHAPTER PICKER
              ========================================================================= */}
          {callState === 'setup' && (
            <div className="flex-1 flex flex-col p-4 sm:p-5 overflow-y-auto space-y-3.5">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                    <Phone className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white leading-tight">
                      Live Study Call
                    </h3>
                    <p className="text-[11px] font-bold text-emerald-400">
                      Zero-to-Hero Calm AI Mentor
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      triggerHapticTick();
                      setShowFeedback((v) => !v);
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sky-300 transition-all cursor-pointer"
                    title="Send App Feedback"
                  >
                    <MessageSquarePlus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      triggerHapticTick();
                      setShowVaultDrawer((v) => !v);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-emerald-300 text-[10px] font-black cursor-pointer"
                    title="Hidden 10-Key AI Vault"
                  >
                    <Lock className="w-3 h-3" />
                    <span>{totalHiddenKeys}/10</span>
                  </button>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black">
                    <Zap className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{creditsLeft}/5</span>
                  </div>
                </div>
              </div>

              {/* Hidden 10-Key AI Vault (Masked Inputs Only) */}
              {showVaultDrawer && (
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5" />
                      Hidden 10-Key AI Vault (Gemini / Groq / OpenAI / OpenRouter)
                    </span>
                    <button
                      onClick={() => setShowVaultDrawer(false)}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Server keys: <span className="text-emerald-300 font-bold">{serverVaultCount} hidden</span>. Add up to 10 masked fallback keys below for this session (never shown in plain text):
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {vaultKeys.map((val, idx) => (
                      <input
                        key={idx}
                        type="password"
                        autoComplete="off"
                        value={val}
                        onChange={(e) => updateVaultSlot(idx, e.target.value)}
                        placeholder={`Key Slot #${idx + 1} (Hidden)`}
                        className="px-2.5 py-1.5 rounded-lg bg-black/70 border border-white/10 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback Drawer */}
              {showFeedback && (
                <form
                  onSubmit={handleSubmitFeedback}
                  className="p-3 rounded-2xl bg-sky-950/30 border border-sky-500/30 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      Feedback • Folder: JackQuiz_App_Feedback
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowFeedback(false)}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {FEEDBACK_CATEGORIES.map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setFbCategory(cat)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border cursor-pointer ${
                          fbCategory === cat
                            ? 'bg-sky-500 text-slate-950 border-sky-400'
                            : 'bg-white/5 text-slate-300 border-white/10'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-amber-300 font-bold">
                    <span>Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFbRating(star)}
                        className={`px-1.5 py-0.5 rounded cursor-pointer ${
                          fbRating >= star ? 'text-amber-400' : 'text-slate-600'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={2}
                    value={fbMessage}
                    onChange={(e) => setFbMessage(e.target.value)}
                    placeholder="Write your feedback or suggestion..."
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                  />
                  <button
                    type="submit"
                    disabled={fbSending || !fbMessage.trim()}
                    className="w-full py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs disabled:opacity-40 cursor-pointer"
                  >
                    {fbSending ? 'Organizing & Sending...' : 'Send Feedback'}
                  </button>
                  {fbStatus && (
                    <div className="text-[11px] text-emerald-300 font-bold space-y-1">
                      <p>{fbStatus.text}</p>
                      {fbStatus.mailtoHref && (
                        <a
                          href={fbStatus.mailtoHref}
                          className="inline-flex items-center gap-1 underline text-sky-300"
                        >
                          <Mail className="w-3 h-3" /> Open in Email App
                        </a>
                      )}
                    </div>
                  )}
                </form>
              )}

              {/* Step 1: Select Subject */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
                  1. Choose Subject (AI stays strictly on this topic):
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
                  2. Choose Chapter for Q&A + Doubt Clearing:
                </span>
                <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
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
              <div className="pt-1">
                <button
                  onClick={handleInitiateCall}
                  disabled={creditsLeft <= 0}
                  className="w-full py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_5px_20px_rgba(16,185,129,0.5)] border border-[#86EFAC] bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4 animate-bounce" />
                  <span>{creditsLeft <= 0 ? 'Daily Call Credits Exhausted' : `Start Live Call (${selectedSub})`}</span>
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={onClose}
                  className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 2: ACTIVE CALL SCREEN (GOOGLE-LIVE ORB + HANDS-FREE VOICE + 5:00 TIMER)
              ========================================================================= */}
          {callState !== 'setup' && callState !== 'ended' && (
            <div className="flex-1 flex flex-col p-4 sm:p-5 justify-between overflow-y-auto">
              {/* Top HUD */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shrink-0">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-white leading-tight truncate">
                      {activeProviderLabel} • Locked Topic
                    </h4>
                    <p className="text-[10px] text-amber-300 font-bold truncate">
                      {selectedSub} • {selectedChap}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {liveScore && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black">
                      <Award className="w-3 h-3" />
                      <span>{liveScore}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-black">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{timeFormatted}</span>
                  </div>
                </div>
              </div>

              {/* Google Live-Style Pulsing Orb */}
              <div className="flex flex-col items-center justify-center py-3">
                <motion.div
                  animate={{
                    scale:
                      mascotMood === 'happy' || isListening
                        ? [1, 1.12, 1]
                        : isAiThinking
                        ? [1, 1.06, 0.96, 1]
                        : [1, 1.03, 1],
                  }}
                  transition={{ repeat: Infinity, duration: isListening ? 1.1 : 2.2 }}
                  className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl border-2 ${
                    isListening
                      ? 'bg-gradient-to-br from-sky-400 via-cyan-500 to-blue-600 border-sky-200 shadow-[0_0_40px_rgba(56,189,248,0.65)]'
                      : isAiThinking
                      ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 border-amber-200 shadow-[0_0_35px_rgba(251,191,36,0.55)]'
                      : 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 border-emerald-200 shadow-[0_0_35px_rgba(16,185,129,0.55)]'
                  }`}
                >
                  <Sparkles className="w-9 h-9 text-slate-950" />
                </motion.div>
                <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {callState === 'ringing'
                    ? 'Connecting Live Tutor...'
                    : isListening
                    ? 'Listening to you...'
                    : isAiThinking
                    ? 'Preparing easy explanation...'
                    : mascotMood === 'happy'
                    ? 'Tutor Speaking...'
                    : handsFreeMode
                    ? 'Hands-Free Live Mode On'
                    : 'Tap Mic or Type Below'}
                </span>
              </div>

              {/* Audio Waveform Canvas */}
              <div className="w-full h-11 mb-2 px-1">
                <canvas
                  ref={canvasRef}
                  width={380}
                  height={44}
                  className="w-full h-full rounded-2xl bg-black/50 border border-white/5"
                />
              </div>

              {/* Teacher Voice Transcript Bubble */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center shadow-lg mb-2">
                <p className="text-xs font-bold text-white leading-relaxed">
                  &ldquo;{currentSpeech}&rdquo;
                </p>
              </div>

              {/* Quick Gen-Z Chips */}
              <div className="flex flex-wrap gap-1.5 justify-center mb-2">
                {QUICK_GENZ_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    disabled={isAiThinking || callState !== 'connected'}
                    onClick={() => handleSendMessage(chip)}
                    className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-400/50 text-[10px] font-bold text-slate-200 transition-all disabled:opacity-40 cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Text Input for Student Answer or Doubt */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(userTextInput);
                  setUserTextInput('');
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={userTextInput}
                  onChange={(e) => setUserTextInput(e.target.value)}
                  placeholder={`Ask doubt or answer on ${selectedSub}...`}
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

              {/* In-Call Action Dock */}
              <div className="flex items-center justify-around pt-3 pb-1">
                <button
                  onClick={handleToggleMic}
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all cursor-pointer ${
                    isListening
                      ? 'bg-sky-500/30 border-sky-400 text-sky-300 animate-pulse shadow-[0_0_15px_rgba(56,189,248,0.6)]'
                      : isMicMuted
                      ? 'bg-red-500/20 border-red-500 text-red-300'
                      : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                  }`}
                  title={isListening ? 'Listening... Tap to stop' : 'Speak Answer'}
                >
                  {isMicMuted && !isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-emerald-400" />}
                </button>

                <button
                  onClick={() => {
                    triggerHapticTick();
                    setHandsFreeMode((v) => !v);
                  }}
                  className={`px-3 h-10 rounded-xl border text-[10px] font-black transition-all cursor-pointer ${
                    handsFreeMode
                      ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                  title="Auto-listen after Tutor finishes speaking"
                >
                  {handsFreeMode ? 'Hands-Free ON' : 'Hands-Free OFF'}
                </button>

                <button
                  onClick={handleHangup}
                  className="h-12 px-5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-2 shadow-[0_4px_0_#991B1B,0_0_20px_rgba(239,68,68,0.5)] active:translate-y-1 transition-all cursor-pointer"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End</span>
                </button>

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

          {/* =========================================================================
              VIEW 3: CALL ENDED + QUICK FEEDBACK TO SINGLE EMAIL FOLDER
              ========================================================================= */}
          {callState === 'ended' && (
            <div className="flex-1 flex flex-col p-5 space-y-4 overflow-y-auto">
              <div className="text-center space-y-1 pt-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-white">Live Session Complete!</h3>
                <p className="text-xs text-slate-400">
                  {selectedSub} • {selectedChap} {liveScore ? `• ${liveScore}` : ''}
                </p>
              </div>

              <form
                onSubmit={handleSubmitFeedback}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5"
              >
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Quick Feedback (Folder: JackQuiz_App_Feedback)
                </span>
                <textarea
                  rows={2}
                  value={fbMessage}
                  onChange={(e) => setFbMessage(e.target.value)}
                  placeholder="How was the explanation? Any feedback..."
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                />
                <button
                  type="submit"
                  disabled={fbSending || !fbMessage.trim()}
                  className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs disabled:opacity-40 cursor-pointer"
                >
                  {fbSending ? 'Sending...' : 'Send Feedback'}
                </button>
                {fbStatus && (
                  <div className="text-[11px] text-emerald-300 font-bold space-y-1">
                    <p>{fbStatus.text}</p>
                    {fbStatus.mailtoHref && (
                      <a href={fbStatus.mailtoHref} className="inline-flex items-center gap-1 underline text-sky-300">
                        <Mail className="w-3 h-3" /> Open in Email App
                      </a>
                    )}
                  </div>
                )}
              </form>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
