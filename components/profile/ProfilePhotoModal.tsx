'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Upload, Check, ZoomIn, ZoomOut, RotateCcw, Sparkles } from 'lucide-react';
import { playClickSound, playCorrectDing } from '@/lib/audioEngine';

interface ProfilePhotoModalProps {
  isOpen: boolean;
  currentPhoto?: string;
  onSave: (photoURL: string) => void;
  onClose: () => void;
}

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({
  isOpen,
  currentPhoto,
  onSave,
  onClose
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>(
    currentPhoto || '/images/profile/custom_reference.png'
  );
  const [zoom, setZoom] = useState<number>(1.0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPreviewUrl(reader.result);
          playCorrectDing();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetToReference = () => {
    playClickSound();
    setPreviewUrl('/images/profile/custom_reference.png');
    setZoom(1.0);
  };

  const handleSave = () => {
    playCorrectDing();
    onSave(previewUrl);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-2xl select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          className="relative w-full max-w-[420px] rounded-[28px] bg-gradient-to-b from-[#141C2E] via-[#0D1424] to-[#090D16] border-2 border-amber-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-5 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Sparkles className="w-4 h-4 fill-amber-400" />
              </span>
              <div>
                <h3 className="text-sm font-black text-white">Student Profile DP</h3>
                <p className="text-[10px] text-slate-400 font-semibold">
                  Gold Rotating Glass Ring • 512x512
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Photo Display with Rotating Gold Ring Frame */}
          <div className="relative flex flex-col items-center justify-center my-4">
            <div className="relative w-36 h-36 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 shadow-[0_0_30px_rgba(245,158,11,0.4)] animate-spin-slow">
              <div className="w-full h-full rounded-full overflow-hidden bg-black/80 border-2 border-slate-900 relative">
                <div
                  className="w-full h-full transition-transform duration-100 ease-out flex items-center justify-center"
                  style={{ transform: `scale(${zoom})` }}
                >
                  <Image
                    src={previewUrl}
                    alt="Student DP Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            <span className="text-[11px] font-mono font-bold text-amber-300 mt-3">
              Official Scholar Identity
            </span>
          </div>

          {/* Zoom Slider */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2 mb-4">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
              <span className="flex items-center gap-1">
                <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                <span>Scale / Zoom</span>
              </span>
              <span className="font-mono text-amber-300">{zoom.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.05"
              value={zoom}
              onChange={e => setZoom(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* File Upload & Reset Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => {
                playClickSound();
                fileInputRef.current?.click();
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-black transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Upload Photo</span>
            </button>

            <button
              onClick={handleResetToReference}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Use Reference</span>
            </button>
          </div>

          {/* Save Action */}
          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-[0_4px_16px_rgba(245,158,11,0.4)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Apply as Profile DP</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
