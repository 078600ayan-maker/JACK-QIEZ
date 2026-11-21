'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, FileText, Check, X, ArrowRight, Sparkles } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { playClickSound, playCorrectDing } from '@/lib/audioEngine';

interface StudyMediumModalProps {
  isOpen: boolean;
  targetType: 'notes' | 'practice' | null;
  onClose: () => void;
}

export const StudyMediumModal: React.FC<StudyMediumModalProps> = ({
  isOpen,
  targetType,
  onClose
}) => {
  const router = useRouter();
  const { profile, setLanguagePreference } = useUserStore();

  if (!isOpen || !targetType) return null;

  const currentLang = profile?.languagePreference || 'hi';
  const isNotes = targetType === 'notes';

  const titleText = isNotes
    ? 'रिवीजन नोट्स & फॉर्मूला बैंक'
    : 'अभ्यास प्रश्न पत्र & चैप्टर क्विज';
  const subtitleText = isNotes
    ? 'Formula Bank & Quick Revision Notes'
    : 'Chapter Practice Sets & Board Model Papers';

  const handleSelectLanguage = async (lang: 'hi' | 'en') => {
    playCorrectDing();
    await setLanguagePreference(lang);
    onClose();

    if (isNotes) {
      router.push('/vault');
    } else {
      router.push('/subjects');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', stiffness: 360, damping: 26 }}
          className="relative w-full max-w-[420px] rounded-3xl bg-gradient-to-b from-[#18233C] via-[#0F172A] to-[#0A0E18] border-2 border-amber-500/50 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(245,158,11,0.25)] p-5 text-white overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                {isNotes ? <BookOpen className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-black text-white leading-tight">{titleText}</h3>
                <p className="text-[10px] text-amber-300 font-bold">{subtitleText}</p>
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

          {/* Medium Selection Prompt */}
          <div className="mb-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              स्टेप 1: अध्ययन माध्यम चुनें (Select Language Medium)
            </span>
            <p className="text-xs text-slate-200">
              आप किस माध्यम में {isNotes ? 'नोट्स पढ़ना' : 'प्रैक्टिस सेट हल करना'} चाहते हैं?
            </p>
          </div>

          {/* 2 Medium Buttons: Hindi vs English */}
          <div className="space-y-3">
            {/* OPTION 1: 🇮🇳 HINDI MEDIUM */}
            <button
              onClick={() => handleSelectLanguage('hi')}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all group cursor-pointer shadow-lg active:scale-[0.98] ${
                currentLang === 'hi'
                  ? 'bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-transparent border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'bg-white/5 border-white/10 hover:border-amber-400/50 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇮🇳</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-black text-white group-hover:text-amber-200">
                        हिंदी माध्यम (Hindi Medium)
                      </h4>
                      {currentLang === 'hi' && (
                        <span className="p-0.5 rounded-full bg-amber-400 text-slate-950">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-amber-300 font-bold">
                      JAC बोर्ड 10वीं शुद्ध हिंदी सिलेबस
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[10px] text-slate-300 pl-9">
                {isNotes
                  ? 'सभी 69 अध्यायों के हिंदी नोट्स, रासायनिक समीकरण व गणितीय सूत्र बैंक।'
                  : 'JAC बोर्ड परीक्षा पैटर्न पर आधारित हिंदी अभ्यास प्रश्न पत्र व मॉक टेस्ट।'}
              </p>
            </button>

            {/* OPTION 2: 🇬🇧 ENGLISH MEDIUM */}
            <button
              onClick={() => handleSelectLanguage('en')}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all group cursor-pointer shadow-lg active:scale-[0.98] ${
                currentLang === 'en'
                  ? 'bg-gradient-to-r from-sky-500/25 via-blue-500/20 to-transparent border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                  : 'bg-white/5 border-white/10 hover:border-sky-400/50 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇬🇧</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-black text-white group-hover:text-sky-200">
                        English Medium
                      </h4>
                      {currentLang === 'en' && (
                        <span className="p-0.5 rounded-full bg-sky-400 text-slate-950">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-sky-300 font-bold">
                      Complete Class 10 English Syllabus
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-sky-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[10px] text-slate-300 pl-9">
                {isNotes
                  ? 'Class 10 Science, Maths, Social & English notes with formula flashcards.'
                  : 'Full English chapter quizzes, speed drills and JAC board model papers.'}
              </p>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
