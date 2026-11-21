'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, PhoneCall, Sparkles, X, Zap, Shield, ArrowRight, Bot } from 'lucide-react';
import { playClickSound, playCorrectDing } from '@/lib/audioEngine';
import { getUserDailyCallCredits } from '@/lib/geminiKeyManager';
import { useUserStore } from '@/store/useUserStore';

interface AICompanionHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLiveCall: () => void;
}

export const AICompanionHubModal: React.FC<AICompanionHubModalProps> = ({
  isOpen,
  onClose,
  onOpenLiveCall
}) => {
  const router = useRouter();
  const { profile } = useUserStore();
  const [credits, setCredits] = useState({ creditsLeft: 5, totalPerDay: 5 });

  useEffect(() => {
    if (isOpen) {
      setCredits(getUserDailyCallCredits());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isHindi = profile?.languagePreference !== 'en';

  const handleOpenChat = () => {
    playClickSound();
    onClose();
    router.push('/ai-study');
  };

  const handleOpenCall = () => {
    playClickSound();
    onClose();
    onOpenLiveCall();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', stiffness: 360, damping: 26 }}
          className="relative w-full max-w-[440px] rounded-3xl bg-gradient-to-b from-[#16213A] via-[#0F172A] to-[#0A0E18] border-2 border-violet-500/50 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(139,92,246,0.3)] p-5 text-white overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white leading-tight">
                  {isHindi ? 'JAC 10th AI स्टडी कम्पेनियन' : 'JAC 10th AI Study Companion'}
                </h3>
                <p className="text-[10px] text-violet-300 font-bold">
                  {isHindi ? 'लाइव चैट या वॉइस कॉल चुनें' : 'Choose Live Voice Call or Chat'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Daily Limit Credit Meter */}
          <div className="mb-4 p-3 rounded-2xl bg-violet-950/40 border border-violet-400/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <div>
                <span className="text-[11px] font-black text-white block">
                  {isHindi ? 'दैनिक AI स्टडी क्रेडिट्स' : 'Daily AI Study Credits'}
                </span>
                <span className="text-[9px] text-slate-400">
                  {isHindi ? 'मध्यरात्रि 12:00 AM IST पर रीसेट' : 'Resets daily at 12:00 AM IST'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-mono font-black text-amber-300">
                {credits.creditsLeft} / {credits.totalPerDay}
              </span>
              <span className="text-[9px] text-emerald-400 block font-bold">
                {isHindi ? 'उपलब्ध' : 'Active'}
              </span>
            </div>
          </div>

          {/* 2 Primary Modes: Chat vs Live Voice Call */}
          <div className="space-y-3">
            {/* OPTION 1: 💬 AI STUDY CHAT */}
            <button
              onClick={handleOpenChat}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-violet-600/20 via-purple-600/15 to-transparent hover:from-violet-600/30 hover:via-purple-600/25 border-2 border-violet-400/40 hover:border-violet-300 text-left transition-all group cursor-pointer shadow-lg active:scale-[0.98]"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-400/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-violet-200 transition-colors">
                      {isHindi ? 'AI स्टडी चैट (Study Chat)' : 'AI Study Chat (Text Q&A)'}
                    </h4>
                    <span className="text-[10px] text-violet-300 font-bold">
                      {isHindi ? '20 गुप्त मोड्स • फ़ॉर्मूला बैंक • स्टेप-बाय-स्टेप' : '20 Secret Modes • Formulas • Step-by-Step'}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-violet-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[10px] text-slate-300 pl-11">
                {isHindi
                  ? 'गणित, विज्ञान और सामाजिक के कठिन प्रश्न पूछें और तुरंत उत्तर पाएं।'
                  : 'Ask any JAC Board chapter doubts, definitions, numericals and get instant solutions.'}
              </p>
            </button>

            {/* OPTION 2: 📞 AI LIVE VOICE CALL */}
            <button
              onClick={handleOpenCall}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-600/20 via-teal-600/15 to-transparent hover:from-emerald-600/30 hover:via-teal-600/25 border-2 border-emerald-400/40 hover:border-emerald-300 text-left transition-all group cursor-pointer shadow-lg active:scale-[0.98]"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PhoneCall className="w-4 h-4 text-emerald-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-emerald-200 transition-colors">
                        {isHindi ? 'लाइव AI वॉइस कॉलिंग (Voice Call)' : 'Live AI Voice Call (Voice Companion)'}
                      </h4>
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-200 text-[8px] font-mono font-black border border-emerald-400/40">
                        LIVE
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-300 font-bold">
                      {isHindi ? 'दिल्ली स्टडी बडी • रियल-टाइम वॉइस • ज़ीरो से समझें' : 'Delhi Study Buddy • Real-time Speech • 1-on-1 Audio'}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[10px] text-slate-300 pl-11">
                {isHindi
                  ? 'सीधा फोन कॉल की तरह बोलकर बात करें — AI अपनी आवाज़ में समझाएगा।'
                  : 'Speak naturally like a phone call — Study Buddy explains back aloud in real-time voice.'}
              </p>
            </button>
          </div>

          {/* Footer Info */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>Multi-AI Key Vault Active</span>
            </span>
            <span className="text-amber-400 font-bold">100% Free for Scholars</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
