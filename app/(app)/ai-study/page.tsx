'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  Bot,
  Send,
  Image as ImageIcon,
  BookOpen,
  Check,
  ChevronRight,
  RotateCcw,
  Sliders,
  Cpu,
  Layers,
  HelpCircle,
  Copy,
  ThumbsUp,
  Volume2
} from 'lucide-react';
import {
  AI_PRESETS,
  AIPreset,
  EXPLANATION_LEVELS,
  ExplanationDepth,
  TONE_STYLES,
  LanguageTone,
  STUDY_SUBJECTS
} from '@/lib/aiPresets';
import { playClickSound, playPop, playCorrectDing } from '@/lib/audioEngine';
import { useUserStore } from '@/store/useUserStore';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  providerLabel?: string;
  model?: string;
  timestamp: string;
}

export default function AIStudyPage() {
  const { profile } = useUserStore();

  // Navigation steps: 'catalog' -> 'confirm' -> 'chat'
  const [viewStep, setViewStep] = useState<'catalog' | 'confirm' | 'chat'>('catalog');

  // Selected configs
  const [selectedPreset, setSelectedPreset] = useState<AIPreset>(AI_PRESETS[0]);
  const [selectedLevel, setSelectedLevel] = useState<ExplanationDepth>('normal');
  const [selectedTone, setSelectedTone] = useState<LanguageTone>('hinglish');
  const [selectedSubject, setSelectedSubject] = useState(STUDY_SUBJECTS[0]);
  const [selectedChapter, setSelectedChapter] = useState(STUDY_SUBJECTS[0].chapters[0]);
  const [selectedProvider, setSelectedProvider] = useState<string>('auto');

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [activeProviderLabel, setActiveProviderLabel] = useState<string>('Google Gemini & Multi-Provider');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const handleSelectPreset = (preset: AIPreset) => {
    playClickSound();
    setSelectedPreset(preset);
    setViewStep('confirm');
  };

  const handleStartExperience = () => {
    playCorrectDing();
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: `Namaste ${profile?.name?.split(' ')[0] || 'Scholar'}! Main aapka JAC Class 10 AI Study Companion hoon.\n\n🎯 **Active Mode**: ${selectedPreset.name} (${selectedPreset.title})\n📚 **Subject**: ${selectedSubject.name} - ${selectedChapter.name}\n⚡ **Depth**: ${selectedLevel.toUpperCase()} | **Tone**: ${selectedTone}\n\nAap is chapter se koi bhi question, definition ya numerical poochiye!`,
        providerLabel: 'Study Buddy AI',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setViewStep('chat');
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && !selectedImage) return;
    const userPrompt = inputText.trim();
    const currentImg = selectedImage;

    setInputText('');
    setSelectedImage(null);
    setSending(true);
    playPop();

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      text: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch('/api/ai-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
          presetCode: selectedPreset.code,
          level: selectedLevel,
          tone: selectedTone,
          subject: selectedSubject.name,
          chapter: selectedChapter.name,
          imageDataUrl: currentImg || undefined,
          requestedProvider: selectedProvider
        })
      });

      const data = await res.json();
      if (data.ok && data.reply) {
        if (data.providerLabel) setActiveProviderLabel(data.providerLabel);
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            role: 'assistant',
            text: data.reply,
            providerLabel: data.providerLabel,
            model: data.model,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            role: 'assistant',
            text: `⚠️ Error: ${data.error || 'Server failed to respond. Please try again.'}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          text: '⚠️ Network connection timeout. Please check your connection and retry.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('Image size must be under 3MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // STEP 2: CONFIRMATION STEP BEFORE LAUNCH
  if (viewStep === 'confirm') {
    return (
      <div className="w-full max-w-[500px] mx-auto min-h-screen p-4 pb-28 select-none space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0D1525] border border-white/10 shadow-lg">
          <button
            onClick={() => setViewStep('catalog')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-black cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Presets</span>
          </button>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-black text-white uppercase tracking-wider">Configure Study Session</h2>
          </div>
          <span className="text-xl">{selectedPreset.icon}</span>
        </div>

        {/* Selected Preset Card */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-cyan-950/70 via-[#0B1728] to-[#050B14] border-2 border-cyan-400/50 shadow-xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[9px] font-black border border-cyan-400/40">
              {selectedPreset.badge}
            </span>
            <span className="text-[10px] text-slate-400 font-mono font-bold">{selectedPreset.code}</span>
          </div>
          <h3 className="text-base font-black text-white">{selectedPreset.name}</h3>
          <p className="text-xs text-slate-300 leading-relaxed">{selectedPreset.definition}</p>
          <p className="text-[11px] text-amber-300 font-medium italic pt-1">"{selectedPreset.hinglishDesc}"</p>
        </div>

        {/* 5-Level Explanation Depth Selector */}
        <div className="p-4 rounded-3xl bg-black/40 border border-white/10 space-y-2.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
            1. Select Explanation Depth (5 Levels):
          </span>
          <div className="grid grid-cols-5 gap-1.5">
            {EXPLANATION_LEVELS.map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => { playClickSound(); setSelectedLevel(lvl.id); }}
                className={`p-2 rounded-2xl flex flex-col items-center text-center border transition-all cursor-pointer ${
                  selectedLevel === lvl.id
                    ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-lg scale-105'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <span className="text-sm">{lvl.icon}</span>
                <span className="text-[9px] font-black uppercase mt-1">{lvl.label}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 px-1">
            {EXPLANATION_LEVELS.find((l) => l.id === selectedLevel)?.desc}
          </p>
        </div>

        {/* Tone & Style Selector */}
        <div className="p-4 rounded-3xl bg-black/40 border border-white/10 space-y-2.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 block">
            2. Language &amp; Regional Tone:
          </span>
          <div className="grid grid-cols-3 gap-2">
            {TONE_STYLES.slice(0, 3).map((t) => (
              <button
                key={t.id}
                onClick={() => { playClickSound(); setSelectedTone(t.id); }}
                className={`p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                  selectedTone === t.id
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-black shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <span className="text-[10px] font-black block">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Subject & Chapter Link */}
        <div className="p-4 rounded-3xl bg-black/40 border border-white/10 space-y-2.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block">
            3. Subject &amp; Chapter Target:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] text-slate-400 font-bold block mb-1">Subject</label>
              <select
                value={selectedSubject.id}
                onChange={(e) => {
                  const s = STUDY_SUBJECTS.find((sub) => sub.id === e.target.value) || STUDY_SUBJECTS[0];
                  setSelectedSubject(s);
                  setSelectedChapter(s.chapters[0]);
                }}
                className="w-full p-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs font-bold focus:outline-none"
              >
                {STUDY_SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#0F172A]">
                    {s.icon} {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-slate-400 font-bold block mb-1">Chapter</label>
              <select
                value={selectedChapter.id}
                onChange={(e) => {
                  const ch = selectedSubject.chapters.find((c) => c.id === parseInt(e.target.value, 10)) || selectedSubject.chapters[0];
                  setSelectedChapter(ch);
                }}
                className="w-full p-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs font-bold focus:outline-none truncate"
              >
                {selectedSubject.chapters.map((ch) => (
                  <option key={ch.id} value={ch.id} className="bg-[#0F172A]">
                    Ch {ch.id}: {ch.name.slice(0, 24)}...
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 4. AI Provider & Model Selector */}
        <div className="p-4 rounded-3xl bg-black/40 border border-violet-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-violet-300 block">
              4. AI Engine &amp; Model Selection:
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-mono font-bold border border-violet-400/30">
              MULTI-VAULT
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'auto', label: 'Auto (Failover)', badge: 'SMART', icon: '⚡' },
              { id: 'openrouter', label: 'OpenRouter GPT', badge: 'TOP', icon: '🌐' },
              { id: 'cohere', label: 'Cohere R+', badge: 'REASONING', icon: '🧠' },
              { id: 'llm7', label: 'LLM7 Nemo', badge: 'SPEED', icon: '🚀' },
              { id: 'gemini', label: 'Google Gemini', badge: 'VISION', icon: '✨' },
              { id: 'groq', label: 'Groq LPU', badge: 'INSTANT', icon: '⚡' },
            ].map((prov) => (
              <button
                key={prov.id}
                type="button"
                onClick={() => {
                  playClickSound();
                  setSelectedProvider(prov.id);
                }}
                className={`p-2 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                  selectedProvider === prov.id
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-400 font-black shadow-lg shadow-violet-500/25 scale-[1.02]'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs">{prov.icon}</span>
                  <span className="text-[9px] font-black truncate">{prov.label}</span>
                </div>
                <span className="text-[7px] font-mono px-1 rounded bg-black/30 mt-1 uppercase text-slate-300">
                  {prov.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartExperience}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#92400E] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>🚀 Launch AI Workspace</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // STEP 3: LIVE AI CHAT EXPERIENCE
  if (viewStep === 'chat') {
    return (
      <div className="w-full max-w-[520px] mx-auto h-[92vh] flex flex-col justify-between p-3 select-none">
        {/* Chat Top Bar */}
        <div className="p-3 rounded-2xl bg-[#0C1525] border border-cyan-400/40 shadow-lg flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setViewStep('confirm')}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shrink-0"
              title="Change Preset or Level"
            >
              <Sliders className="w-4 h-4 text-cyan-300" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white truncate">{selectedPreset.name}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[8px] font-black uppercase">
                  {selectedLevel}
                </span>
              </div>
              <span className="text-[9px] text-slate-400 block truncate">
                {selectedSubject.name.split(' ')[0]} • Ch {selectedChapter.id} • {activeProviderLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={selectedProvider}
              onChange={(e) => {
                playClickSound();
                setSelectedProvider(e.target.value);
              }}
              className="py-1 px-2 rounded-xl bg-violet-600/30 border border-violet-400/50 text-violet-200 text-[10px] font-black focus:outline-none cursor-pointer"
              title="Switch Active AI Engine"
            >
              <option value="auto" className="bg-[#0C1525]">⚡ Auto Failover</option>
              <option value="openrouter" className="bg-[#0C1525]">🌐 OpenRouter GPT</option>
              <option value="cohere" className="bg-[#0C1525]">🧠 Cohere R+</option>
              <option value="llm7" className="bg-[#0C1525]">🚀 LLM7 Nemo</option>
              <option value="gemini" className="bg-[#0C1525]">✨ Google Gemini</option>
              <option value="groq" className="bg-[#0C1525]">⚡ Groq LPU</option>
            </select>

            <button
              onClick={() => setViewStep('catalog')}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-[10px] font-black"
            >
              Library
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[85%] rounded-3xl p-3.5 text-xs leading-relaxed space-y-2 shadow-md ${
                    isUser
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-xs'
                      : 'bg-[#101A2E] border border-white/15 text-slate-100 rounded-bl-xs'
                  }`}
                >
                  {!isUser && (
                    <div className="flex items-center justify-between pb-1 border-b border-white/10 text-[9px] text-cyan-300 font-bold">
                      <span className="flex items-center gap-1">
                        <Bot className="w-3 h-3" />
                        <span>{m.providerLabel || 'Study Buddy AI'}</span>
                      </span>
                      {m.model && <span className="text-slate-400 font-mono text-[8px]">{m.model}</span>}
                    </div>
                  )}

                  <div className="whitespace-pre-wrap font-sans select-text">{m.text}</div>

                  <div className="flex items-center justify-end text-[8px] text-slate-400 pt-0.5">
                    <span>{m.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {sending && (
            <div className="flex items-start">
              <div className="rounded-2xl p-3 bg-white/10 border border-white/15 text-xs text-cyan-300 flex items-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Thinking with Multi-Provider AI Vault...</span>
              </div>
            </div>
          )}
        </div>

        {/* Image Attachment Preview */}
        {selectedImage && (
          <div className="p-2 bg-black/60 border-t border-white/10 flex items-center justify-between rounded-xl mb-1">
            <div className="flex items-center gap-2">
              <img src={selectedImage} alt="Attachment" className="w-10 h-10 rounded-lg object-cover border border-cyan-400" />
              <span className="text-[10px] text-cyan-300 font-bold">Image attached for AI Vision</span>
            </div>
            <button onClick={() => setSelectedImage(null)} className="p-1 rounded-full bg-white/10 text-white">✕</button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-2 rounded-2xl bg-[#090F1E] border border-white/15 flex items-center gap-2 shrink-0 shadow-xl">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-cyan-300 transition cursor-pointer"
            title="Upload Question Photo"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="Poochho apna doubt ya numerical..."
            className="flex-1 bg-transparent text-white text-xs px-2 py-2 focus:outline-none placeholder-slate-400"
          />

          <button
            type="button"
            disabled={sending || (!inputText.trim() && !selectedImage)}
            onClick={handleSendMessage}
            className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-lg disabled:opacity-40 transition active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // STEP 1: PRESET CATALOGUE (20 UNIVERSAL SECRET PROMPT CODES)
  return (
    <div className="w-full max-w-[500px] mx-auto min-h-screen p-4 pb-28 select-none space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0D1525] border border-cyan-400/40 shadow-xl">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-black cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-cyan-400" />
          <h1 className="text-sm font-black uppercase tracking-wider text-white">AI Study Workspace</h1>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-black border border-amber-400/40">
          20 MODES
        </span>
      </div>

      <div className="text-center py-1">
        <h2 className="text-base font-black text-white">Universal AI Secret Prompt Library</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Choose any of the 20 pedagogical presets backed by multi-provider AI vault.
        </p>
      </div>

      {/* 20 Presets Grid */}
      <div className="grid grid-cols-1 gap-3">
        {AI_PRESETS.map((preset) => (
          <div
            key={preset.code}
            onClick={() => handleSelectPreset(preset)}
            className="p-4 rounded-3xl bg-gradient-to-r from-[#111A2E] via-[#0C1424] to-[#070D18] border border-white/10 hover:border-cyan-400/50 shadow-xl flex items-center justify-between transition-all cursor-pointer group hover:scale-[1.01] active:scale-[0.98]"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="text-3xl p-2.5 rounded-2xl bg-black/60 border border-white/10 shrink-0 group-hover:scale-105 transition-transform">
                {preset.icon}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 ${preset.accentColor}`}>
                    {preset.badge}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">{preset.code}</span>
                </div>
                <h3 className="text-xs font-black text-white mt-0.5 truncate">{preset.name}</h3>
                <p className="text-[10px] text-slate-300 line-clamp-2 mt-0.5 leading-relaxed">
                  {preset.definition}
                </p>
              </div>
            </div>

            <div className="pl-2 shrink-0">
              <span className="px-3 py-1.5 rounded-xl bg-white/10 group-hover:bg-cyan-500 group-hover:text-slate-950 text-white font-black text-xs transition shadow">
                Select
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
