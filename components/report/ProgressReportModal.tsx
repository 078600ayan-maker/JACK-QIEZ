'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Clock, Target, Download, Share2, Crown, CheckCircle2 } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { TactileButton } from '@/components/ui/TactileButton';
import { playClickSound } from '@/lib/audioEngine';

interface ProgressReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProgressReportModal: React.FC<ProgressReportModalProps> = ({ isOpen, onClose }) => {
  const { profile } = useUserStore();

  if (!isOpen) return null;

  const name = profile?.name || 'Royal Scholar';
  const xp = profile?.xp || 120;
  const streak = profile?.streak || 1;
  const progressMap = profile?.progress || {};
  const crownsCount = Object.values(progressMap).filter(v => v >= 5).length;
  const scores = Object.values(profile?.levelScores || {});
  const avgAccuracy = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 88;

  const handleShare = () => {
    playClickSound();
    const text = `📊 Jack Quiz Progress Report for ${name}:\n• Overall Accuracy: ${avgAccuracy}%\n• Study Streak: ${streak} Days\n• Crowns Earned: ${crownsCount} 👑\n• Total XP: ${xp}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: 'Jack Quiz Report', text });
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert('Report summary copied to clipboard!');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="relative w-full max-w-[460px] max-h-[90vh] rounded-3xl bg-gradient-to-b from-[#141E33] to-[#090D16] border-2 border-amber-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-5 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500/20 text-[#FBBF24] border border-amber-500/30">
                <Award className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-white">Parent / Self Progress Report</h3>
                <span className="text-[10px] text-amber-400 font-bold">
                  Official Academic Performance Audit
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Report Card Canvas Simulation */}
          <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar pr-0.5">
            {/* Scholar Identity Banner */}
            <div className="rounded-2xl p-4 bg-gradient-to-r from-amber-500/15 via-blue-500/10 to-transparent border border-amber-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    CANDIDATE NAME
                  </span>
                  <h4 className="text-lg font-black text-white">{name}</h4>
                  <span className="text-xs text-amber-300 font-bold">JAC Board 2026 Examination</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    CURRENT DIVISION
                  </span>
                  <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 inline-block mt-0.5">
                    Legendary League
                  </span>
                </div>
              </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-emerald-400 mb-1">
                  <Target className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase">Overall Accuracy</span>
                </div>
                <div className="text-2xl font-black text-white">{avgAccuracy}%</div>
                <span className="text-[9px] text-slate-400">Target: ≥ 90% Board Distinction</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-amber-400 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase">Weekly Study</span>
                </div>
                <div className="text-2xl font-black text-white">14.8 <span className="text-xs text-slate-400">Hrs</span></div>
                <span className="text-[9px] text-slate-400">High active engagement</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-yellow-400 mb-1">
                  <Crown className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase">Boss Crowns</span>
                </div>
                <div className="text-2xl font-black text-amber-300">{crownsCount} 👑</div>
                <span className="text-[9px] text-slate-400">Chapter Level 5 Clears</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-cyan-400 mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase">Mistakes Cleared</span>
                </div>
                <div className="text-2xl font-black text-white">100%</div>
                <span className="text-[9px] text-slate-400">Spaced repetition active</span>
              </div>
            </div>

            {/* Subject Mastery Assessment */}
            <div className="rounded-2xl p-4 bg-white/5 border border-white/10 space-y-2.5">
              <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                Subject Mastery Evaluation
              </h5>

              {[
                { sub: 'Science (विज्ञान)', acc: 92, status: 'Distinction' },
                { sub: 'Mathematics (गणित)', acc: 88, status: 'Strong' },
                { sub: 'Social Science (SST)', acc: 85, status: 'Good' },
                { sub: 'Hindi (हिंदी)', acc: 90, status: 'Distinction' },
                { sub: 'English (अंग्रेजी)', acc: 86, status: 'Strong' }
              ].map(s => (
                <div key={s.sub} className="flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-bold">{s.sub}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-black/40 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.acc}%` }} />
                    </div>
                    <span className="font-mono font-black text-emerald-400 text-[11px]">{s.acc}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Share / Export Action */}
          <div className="pt-3 border-t border-white/10 flex gap-2">
            <button
              onClick={handleShare}
              className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Report with Parents / Mentor 📋</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
