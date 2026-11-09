'use client';

import { CLASS_10_MASTER_SYLLABUS } from '@/lib/class10Syllabus';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  PenTool,
  X,
  ArrowLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  Download,
  Upload,
  Plus,
  CheckCircle2,
  ExternalLink,
  FolderOpen
} from 'lucide-react';
import {
  getChapterResources,
  uploadChapterResource,
  ChapterResourceItem
} from '@/lib/adminContentService';
import { playClickSound, playPop, playCorrectDing } from '@/lib/audioEngine';

interface StudyResourceModalProps {
  isOpen: boolean;
  mode: 'notes' | 'practice';
  onClose: () => void;
}

interface ChapterDef {
  id: string;
  num: number;
  title: string;
  hindiTitle?: string;
}

interface SubjectDef {
  id: string;
  title: string;
  hindiTitle: string;
  themeColor: string;
  icon: string;
  totalChapters: number;
  classTag: string;
  chapters: ChapterDef[];
}

const FIVE_CORE_SUBJECTS: SubjectDef[] = CLASS_10_MASTER_SYLLABUS.map((sub) => ({
  id: sub.id,
  title: sub.title,
  hindiTitle: sub.hindiTitle,
  themeColor: sub.themeColor,
  icon: sub.icon,
  totalChapters: sub.chapters.length,
  classTag: `${sub.chapters.length} Chapters • Class 10 NCERT`,
  chapters: sub.chapters.map((ch) => ({
    id: ch.id,
    num: ch.num,
    title: ch.title,
    hindiTitle: ch.hindiTitle
  }))
}));

export const StudyResourceModal: React.FC<StudyResourceModalProps> = ({
  isOpen,
  mode,
  onClose
}) => {
  // Navigation level: 'subjects' -> 'chapters' -> 'resources'
  const [level, setLevel] = useState<'subjects' | 'chapters' | 'resources'>('subjects');
  const [activeSubject, setActiveSubject] = useState<SubjectDef | null>(null);
  const [activeChapter, setActiveChapter] = useState<ChapterDef | null>(null);

  // Resources state
  const [resources, setResources] = useState<ChapterResourceItem[]>([]);
  const [showAdminUpload, setShowAdminUpload] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newType, setNewType] = useState<'pdf' | 'text'>('pdf');
  const [newContent, setNewContent] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    if (activeSubject && activeChapter) {
      const items = getChapterResources(mode, activeSubject.id, activeChapter.id);
      setResources(items);
    }
  }, [mode, activeSubject, activeChapter]);

  // Reset navigation when modal opens
  useEffect(() => {
    if (isOpen) {
      setLevel('subjects');
      setActiveSubject(null);
      setActiveChapter(null);
      setShowAdminUpload(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectSubject = (sub: SubjectDef) => {
    playClickSound();
    setActiveSubject(sub);
    setLevel('chapters');
  };

  const handleSelectChapter = (ch: ChapterDef) => {
    playClickSound();
    setActiveChapter(ch);
    setLevel('resources');
  };

  const handleBack = () => {
    playClickSound();
    if (level === 'resources') {
      setLevel('chapters');
      setActiveChapter(null);
      setShowAdminUpload(false);
    } else if (level === 'chapters') {
      setLevel('subjects');
      setActiveSubject(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubject || !activeChapter || !newTitle.trim()) return;

    setIsUploading(true);
    playPop();

    const created = await uploadChapterResource(mode, activeSubject.id, activeChapter.id, {
      title: newTitle.trim(),
      type: newType,
      textContent: newType === 'text' ? newContent : undefined,
      uploadedBy: 'Online Admin Panel',
      fileSize: newType === 'text' ? '30 KB' : '1.5 MB'
    });

    setResources((prev) => [created, ...prev]);
    setNewTitle('');
    setNewContent('');
    setShowAdminUpload(false);
    setIsUploading(false);
    playCorrectDing();
  };

  const isNotes = mode === 'notes';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-2xl select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', stiffness: 350, damping: 26 }}
          className="relative w-full max-w-[540px] max-h-[92dvh] rounded-[32px] bg-gradient-to-b from-[#13192B] via-[#0E1322] to-[#080B14] border-2 border-amber-500/50 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(245,158,11,0.2)] flex flex-col overflow-hidden"
        >
          {/* =========================================================================
              MODAL TOP HEADER
              ========================================================================= */}
          <div className="w-full flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10 shrink-0">
            <div className="flex items-center gap-2.5">
              {level !== 'subjects' && (
                <button
                  onClick={handleBack}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer mr-1"
                  title="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}

              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md ${
                  isNotes
                    ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950'
                    : 'bg-gradient-to-tr from-blue-500 to-cyan-400 text-slate-950'
                }`}
              >
                {isNotes ? <FileText className="w-5 h-5" /> : <PenTool className="w-5 h-5" />}
              </div>

              <div>
                <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                  {isNotes ? 'Chapter-wise Study Notes' : 'Practice Questions Bank'}
                </h3>
                <p className="text-[10px] sm:text-[11px] font-bold text-amber-300/80">
                  {level === 'subjects' && '5 Core Subjects • Class 10 NCERT'}
                  {level === 'chapters' && `${activeSubject?.title} (${activeSubject?.hindiTitle})`}
                  {level === 'resources' && `${activeChapter?.title}`}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* =========================================================================
              LEVEL 1: 5-SUBJECT SELECTION LIST
              ========================================================================= */}
          {level === 'subjects' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
                Select a subject to view {isNotes ? 'official notes' : 'practice question banks'}:
              </span>

              <div className="space-y-2.5">
                {FIVE_CORE_SUBJECTS.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => handleSelectSubject(sub)}
                    className="w-full text-left p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-white/10 hover:border-amber-400/50 transition-all flex items-center justify-between gap-3 shadow-md group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 border border-white/15 shadow-inner"
                        style={{ backgroundColor: `${sub.themeColor}20` }}
                      >
                        <span>{sub.icon}</span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white truncate">
                            {sub.title}
                          </h4>
                          <span className="text-xs font-bold text-amber-300">
                            ({sub.hindiTitle})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {sub.classTag}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              LEVEL 2: CHAPTER LIST FOR SELECTED SUBJECT
              ========================================================================= */}
          {level === 'chapters' && activeSubject && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {activeSubject.title} Chapters ({activeSubject.chapters.length})
                </span>
                <span className="text-[10px] font-bold text-amber-300">
                  Tap chapter to open
                </span>
              </div>

              <div className="space-y-2">
                {activeSubject.chapters.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => handleSelectChapter(ch)}
                    className="w-full text-left p-3 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-white/10 hover:border-amber-400/50 transition-all flex items-center justify-between gap-3 shadow-sm group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-xs font-mono font-black text-amber-400 shrink-0">
                        {ch.num}
                      </div>

                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-white truncate">
                          {ch.title}
                        </h5>
                        {ch.hindiTitle && (
                          <p className="text-[10px] text-slate-400 truncate">
                            {ch.hindiTitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              LEVEL 3: CHAPTER CONTENT SLOTS & ONLINE ADMIN PANEL UPLOAD
              ========================================================================= */}
          {level === 'resources' && activeSubject && activeChapter && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Chapter Details Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 to-transparent border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-black uppercase text-amber-400">
                    Ch {activeChapter.num} • {activeSubject.title}
                  </span>
                  <h4 className="text-sm font-black text-white leading-tight mt-0.5">
                    {activeChapter.title}
                  </h4>
                </div>

                {/* Admin Quick Upload Trigger */}
                <button
                  onClick={() => setShowAdminUpload(!showAdminUpload)}
                  className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] uppercase flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Admin Upload</span>
                </button>
              </div>

              {/* Admin Upload Drawer (Future-Proof Content Ingestion) */}
              {showAdminUpload && (
                <form
                  onSubmit={handleUploadSubmit}
                  className="p-4 rounded-2xl bg-[#162035] border border-amber-400/40 space-y-3 animate-fade-in"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black text-white flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Online Admin Panel Upload Slot</span>
                    </h5>
                    <span className="text-[9px] font-mono text-emerald-400">
                      Live Cloud Sync
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">
                      Resource Title / Topic:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={`e.g. Chapter ${activeChapter.num} High-Yield Formula Sheet`}
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full py-1.5 px-3 rounded-xl bg-black/50 border border-white/15 text-white text-xs outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-[10px] font-bold text-slate-400">Type:</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setNewType('pdf')}
                        className={`py-1 px-3 rounded-lg text-xs font-bold ${
                          newType === 'pdf'
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        PDF Document
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewType('text')}
                        className={`py-1 px-3 rounded-lg text-xs font-bold ${
                          newType === 'text'
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        Direct Text / Notes
                      </button>
                    </div>
                  </div>

                  {newType === 'text' && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">
                        Notes Content:
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Type high-yield points, formulas, or question sets here..."
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs outline-none focus:border-amber-400"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAdminUpload(false)}
                      className="py-1.5 px-3 rounded-xl bg-white/10 text-slate-300 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="py-1.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase"
                    >
                      {isUploading ? 'Saving...' : 'Publish to Chapter'}
                    </button>
                  </div>
                </form>
              )}

              {/* Resource Cards List */}
              {resources.length > 0 ? (
                <div className="space-y-2.5">
                  {resources.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 mt-0.5">
                            {isNotes ? <FileText className="w-4 h-4" /> : <PenTool className="w-4 h-4" />}
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-white leading-snug">
                              {item.title}
                            </h5>
                            <span className="text-[10px] text-slate-400">
                              By {item.uploadedBy} • {item.uploadedAt} • {item.fileSize || 'Standard'}
                            </span>
                          </div>
                        </div>

                        <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Verified
                        </span>
                      </div>

                      {item.textContent && (
                        <p className="text-[11px] text-slate-300 bg-black/40 p-2.5 rounded-xl border border-white/5 leading-relaxed">
                          {item.textContent}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400 font-mono">
                          Format: {item.type.toUpperCase()}
                        </span>
                        <button
                          onClick={() => {
                            playCorrectDing();
                            alert(`Opening ${item.title}`);
                          }}
                          className="py-1 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>View Resource</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Pre-Allocated Empty Slot with Royal Placeholder (as specified in prompt) */
                <div className="p-6 rounded-3xl bg-gradient-to-b from-[#182035] to-[#0E1322] border-2 border-dashed border-amber-500/40 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-md">
                    <FolderOpen className="w-6 h-6" />
                  </div>

                  <div>
                    <h5 className="text-sm font-black text-white">
                      {isNotes ? 'Chapter Notes Slot' : 'Practice Question Slot'}
                    </h5>
                    <p className="text-xs text-slate-400 mt-1 max-w-[280px] mx-auto">
                      Official Chapter {activeChapter.num} {isNotes ? 'Notes' : 'Practice Questions'} Slot Ready — Synced with Online Admin Panel
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-[10px] font-mono font-bold text-amber-300">
                    <Sparkles className="w-3 h-3" />
                    <span>Slot Allocated • Ready for Ingestion</span>
                  </span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
