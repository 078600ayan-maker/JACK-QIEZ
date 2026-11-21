'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MessageCircle,
  Send,
  Image as ImageIcon,
  X,
  CheckCheck,
  ArrowLeft,
  Paperclip,
  File as FileIcon,
  Search,
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import {
  ChatMessage,
  subscribeUserMessages,
  sendDirectMessageInCloud,
  markDirectMessageAsRead,
} from '@/lib/socialService';
import { playClickSound, playPop } from '@/lib/audioEngine';

interface DirectMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: {
    uid: string;
    name: string;
    username: string;
    photoURL: string;
  } | null;
}

interface ConversationThread {
  partnerUid: string;
  partnerName: string;
  partnerUsername: string;
  partnerPhoto: string;
  lastMessage: ChatMessage;
  unreadCount: number;
  messages: ChatMessage[];
}

export const DirectMessageModal: React.FC<DirectMessageModalProps> = ({
  isOpen,
  onClose,
  targetUser,
}) => {
  const { profile } = useUserStore();
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: 'photo' | 'doc'; name?: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [activeThread, setActiveThread] = useState<ConversationThread | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Open to targetUser's thread if passed
  useEffect(() => {
    if (!targetUser || !profile?.uid) return;
    // Build a synthetic thread for targetUser even with no messages yet
    const threadMessages = allMessages.filter(
      (m) =>
        (m.senderUid === profile.uid && m.recipientUid === targetUser.uid) ||
        (m.senderUid === targetUser.uid && m.recipientUid === profile.uid)
    );
    setActiveThread({
      partnerUid: targetUser.uid,
      partnerName: targetUser.name,
      partnerUsername: targetUser.username,
      partnerPhoto: targetUser.photoURL,
      lastMessage: threadMessages[threadMessages.length - 1] || ({} as ChatMessage),
      unreadCount: 0,
      messages: threadMessages,
    });
  }, [targetUser, profile?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe to all messages
  useEffect(() => {
    if (!profile?.uid) return;
    const unsub = subscribeUserMessages(profile.uid, (list) => {
      setAllMessages(list);
    });
    return () => unsub();
  }, [profile?.uid]);

  // Scroll to bottom of conversation
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeThread?.messages, selectedMedia]);

  // Keep active thread messages in sync
  useEffect(() => {
    if (!activeThread || !profile?.uid) return;
    const updated = allMessages.filter(
      (m) =>
        (m.senderUid === profile.uid && m.recipientUid === activeThread.partnerUid) ||
        (m.senderUid === activeThread.partnerUid && m.recipientUid === profile.uid)
    );
    setActiveThread((prev) => prev ? { ...prev, messages: updated } : null);
  }, [allMessages]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build conversation threads (Instagram inbox style)
  const threads = useMemo<ConversationThread[]>(() => {
    if (!profile?.uid) return [];
    const threadMap = new Map<string, ConversationThread>();

    for (const msg of allMessages) {
      const isIncoming = msg.recipientUid === profile.uid;
      const partnerUid = isIncoming ? msg.senderUid : msg.recipientUid;
      if (!partnerUid || partnerUid === profile.uid) continue;

      const existing = threadMap.get(partnerUid);
      if (!existing) {
        threadMap.set(partnerUid, {
          partnerUid,
          partnerName: isIncoming ? msg.senderName : 'You → ' + (msg.recipientUid || '?'),
          partnerUsername: isIncoming ? (msg.senderUsername || '') : '',
          partnerPhoto: isIncoming ? (msg.senderPhoto || '') : (profile.photoURL || ''),
          lastMessage: msg,
          unreadCount: isIncoming && !msg.read ? 1 : 0,
          messages: [msg],
        });
      } else {
        existing.messages.push(msg);
        if (msg.createdAt > existing.lastMessage.createdAt) {
          existing.lastMessage = msg;
          if (isIncoming) existing.partnerName = msg.senderName;
          if (isIncoming) existing.partnerPhoto = msg.senderPhoto || existing.partnerPhoto;
        }
        if (isIncoming && !msg.read) existing.unreadCount += 1;
      }
    }

    return Array.from(threadMap.values()).sort(
      (a, b) => (b.lastMessage?.createdAt || '').localeCompare(a.lastMessage?.createdAt || '')
    );
  }, [allMessages, profile?.uid]);

  const filteredThreads = useMemo(() => {
    if (!searchTerm.trim()) return threads;
    const q = searchTerm.toLowerCase();
    return threads.filter(
      (t) =>
        t.partnerName.toLowerCase().includes(q) ||
        t.partnerUsername.toLowerCase().includes(q)
    );
  }, [threads, searchTerm]);

  if (!isOpen) return null;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Photo must be less than 5MB'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedMedia({ url: reader.result, type: 'photo' });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDocSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('Document must be less than 10MB'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedMedia({ url: reader.result, type: 'doc', name: file.name });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if (!profile || !activeThread) return;
    if (!inputText.trim() && !selectedMedia) return;
    setSending(true);
    playPop();
    try {
      await sendDirectMessageInCloud(
        profile,
        activeThread.partnerUid,
        inputText,
        selectedMedia?.type === 'photo' ? selectedMedia.url : undefined
      );
      setInputText('');
      setSelectedMedia(null);
    } finally {
      setSending(false);
    }
  };

  const openThread = (thread: ConversationThread) => {
    playClickSound();
    // Mark unread as read
    thread.messages
      .filter((m) => m.recipientUid === profile?.uid && !m.read)
      .forEach((m) => markDirectMessageAsRead(m.id));
    setActiveThread({ ...thread, unreadCount: 0 });
  };

  const backToInbox = () => {
    setActiveThread(null);
    setInputText('');
    setSelectedMedia(null);
  };

  const totalUnread = threads.reduce((s, t) => s + t.unreadCount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xl select-none">
      <div className="relative w-full max-w-[440px] h-[88vh] flex flex-col rounded-3xl bg-gradient-to-b from-[#16213A] via-[#0F172A] to-[#0A0E18] border-2 border-pink-500/40 shadow-2xl overflow-hidden">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between p-3.5 bg-black/40 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {activeThread ? (
              <button
                onClick={backToInbox}
                className="p-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            {activeThread ? (
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={activeThread.partnerPhoto || '/assets/profile_photos/IMG_20261109_001512.png'}
                    alt={activeThread.partnerName}
                    className="w-9 h-9 rounded-full object-cover border border-pink-400"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22c55e] border border-black shadow-[0_0_5px_#22c55e]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-black text-white truncate">{activeThread.partnerName}</h3>
                  {activeThread.partnerUsername && (
                    <p className="text-[10px] text-pink-300 font-bold truncate">@{activeThread.partnerUsername}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-pink-400" />
                <h3 className="text-xs font-black text-white">
                  Direct Messages
                  {totalUnread > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full bg-pink-500 text-white text-[9px] font-black">
                      {totalUnread}
                    </span>
                  )}
                </h3>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── INBOX VIEW (no active thread) ── */}
        {!activeThread && (
          <>
            {/* Search bar */}
            <div className="px-3 py-2 bg-black/20 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-2 bg-white/5 rounded-2xl px-3 py-2 border border-white/10">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search conversations..."
                  className="flex-1 bg-transparent text-white text-xs focus:outline-none placeholder-slate-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                💬 Inbox
              </span>
              {filteredThreads.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-pink-500/15 text-pink-400 border border-pink-400/30 mx-auto flex items-center justify-center">
                    <MessageCircle className="w-7 h-7" />
                  </div>
                  <p className="text-xs text-slate-400 max-w-[220px] mx-auto">
                    No messages yet. Tap any scholar's profile to DM them!
                  </p>
                </div>
              ) : (
                filteredThreads.map((thread) => (
                  <div
                    key={thread.partnerUid}
                    onClick={() => openThread(thread)}
                    className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition active:scale-[0.98] ${
                      thread.unreadCount > 0
                        ? 'bg-pink-500/15 border-pink-400/50 shadow-[0_0_12px_rgba(236,72,153,0.15)]'
                        : 'bg-white/5 border-white/10 hover:bg-white/8'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={thread.partnerPhoto || '/assets/profile_photos/IMG_20261109_001512.png'}
                        alt={thread.partnerName}
                        className="w-11 h-11 rounded-full object-cover border border-white/20"
                      />
                      {thread.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-pink-500 text-white text-[8px] font-black flex items-center justify-center px-1 border border-black">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-black truncate ${thread.unreadCount > 0 ? 'text-white' : 'text-slate-200'}`}>
                          {thread.partnerName}
                        </p>
                        <span className="text-[9px] text-slate-400 font-bold shrink-0 ml-2">
                          {thread.lastMessage?.createdAt
                            ? new Date(thread.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </span>
                      </div>
                      <p className={`text-[10px] truncate mt-0.5 ${thread.unreadCount > 0 ? 'text-pink-200 font-semibold' : 'text-slate-400'}`}>
                        {thread.lastMessage?.senderUid === profile?.uid ? 'You: ' : ''}
                        {thread.lastMessage?.photoDataUrl ? '📷 Photo' : thread.lastMessage?.text || ''}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ── CONVERSATION THREAD VIEW ── */}
        {activeThread && (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeThread.messages.length === 0 ? (
                <div className="text-center py-14 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 border border-pink-400/40 mx-auto flex items-center justify-center">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-black text-white">Say hello to {activeThread.partnerName}!</h4>
                  <p className="text-[10px] text-slate-400 max-w-[240px] mx-auto">
                    Start an authentic study conversation, share notes & photos.
                  </p>
                </div>
              ) : (
                activeThread.messages.map((msg) => {
                  const isMine = msg.senderUid === profile?.uid;
                  return isMine ? (
                    /* ── OUTGOING MESSAGE: RIGHT ALIGNED WITH SENDER'S AVATAR ── */
                    <div key={msg.id} className="flex justify-end items-end gap-2 my-1">
                      <div className="max-w-[78%] rounded-2xl rounded-br-xs p-3 text-xs leading-relaxed space-y-1.5 shadow-md bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 text-white">
                        {msg.photoDataUrl && (
                          <div
                            onClick={() => setPreviewImage(msg.photoDataUrl!)}
                            className="rounded-xl overflow-hidden border border-white/20 max-h-56 cursor-pointer hover:opacity-95 transition"
                            title="Click to view full photo"
                          >
                            <img
                              src={msg.photoDataUrl}
                              alt="Attachment"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {msg.text && <p className="font-semibold break-words">{msg.text}</p>}
                        <div className="flex items-center justify-end gap-1 text-[8px] text-white/80 pt-0.5">
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-300" />
                        </div>
                      </div>
                      {/* Sender Avatar */}
                      <img
                        src={profile?.photoURL || '/assets/profile_photos/IMG_20261109_001512.png'}
                        alt="You"
                        onClick={() => setPreviewImage(profile?.photoURL || '/assets/profile_photos/IMG_20261109_001512.png')}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-pink-400 shrink-0 cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-all"
                        title="Click to view full photo"
                      />
                    </div>
                  ) : (
                    /* ── INCOMING MESSAGE: LEFT ALIGNED WITH PARTNER'S AVATAR ── */
                    <div key={msg.id} className="flex justify-start items-end gap-2 my-1">
                      {/* Partner Avatar */}
                      <img
                        src={activeThread.partnerPhoto || '/assets/profile_photos/IMG_20261109_001512.png'}
                        alt={activeThread.partnerName}
                        onClick={() => setPreviewImage(activeThread.partnerPhoto || '/assets/profile_photos/IMG_20261109_001512.png')}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-cyan-400 shrink-0 cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-all"
                        title="Click to view full photo"
                      />
                      <div className="max-w-[78%] rounded-2xl rounded-bl-xs p-3 text-xs leading-relaxed space-y-1.5 shadow-md bg-[#16213A] border border-white/10 text-white">
                        <span className="text-[9px] font-black text-cyan-300 block">
                          {activeThread.partnerName}
                        </span>
                        {msg.photoDataUrl && (
                          <div
                            onClick={() => setPreviewImage(msg.photoDataUrl!)}
                            className="rounded-xl overflow-hidden border border-white/20 max-h-56 cursor-pointer hover:opacity-95 transition"
                            title="Click to view full photo"
                          >
                            <img
                              src={msg.photoDataUrl}
                              alt="Attachment"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {msg.text && <p className="font-semibold break-words">{msg.text}</p>}
                        <div className="flex items-center justify-end gap-1 text-[8px] text-slate-400 pt-0.5">
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Attachment preview */}
            {selectedMedia && (
              <div className="px-4 py-2 bg-black/60 border-t border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  {selectedMedia.type === 'photo' ? (
                    <img
                      src={selectedMedia.url}
                      alt="Preview"
                      className="w-10 h-10 rounded-xl object-cover border border-pink-400"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/50 flex items-center justify-center">
                      <FileIcon className="w-5 h-5 text-blue-300" />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] text-pink-300 font-bold block">
                      {selectedMedia.type === 'photo' ? 'Photo attached' : 'Document attached'}
                    </span>
                    {selectedMedia.name && (
                      <span className="text-[9px] text-slate-400 truncate max-w-[180px] block">{selectedMedia.name}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="p-1 rounded-full bg-white/10 text-slate-300 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 bg-black/50 border-t border-white/10 flex items-center gap-2 shrink-0">
              <input type="file" ref={photoInputRef} accept="image/*" onChange={handlePhotoSelect} className="hidden" />
              <input type="file" ref={docInputRef} accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx" onChange={handleDocSelect} className="hidden" />

              {/* Photo attach */}
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-pink-400 border border-white/10 transition cursor-pointer"
                title="Attach Photo"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              {/* Document attach */}
              <button
                type="button"
                onClick={() => docInputRef.current?.click()}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-blue-400 border border-white/10 transition cursor-pointer"
                title="Attach Document / PDF"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                placeholder="Message..."
                className="flex-1 bg-white/5 border border-white/10 text-white rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:border-pink-500/50 transition"
              />

              <button
                type="button"
                disabled={sending || (!inputText.trim() && !selectedMedia)}
                onClick={handleSend}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black shadow-lg disabled:opacity-40 transition active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* ── FULL-SCREEN ENLARGED PHOTO PREVIEW LIGHTBOX MODAL ── */}
        {previewImage && (
          <div
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 cursor-pointer animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-sm font-black cursor-pointer shadow-lg transition"
              >
                ✕
              </button>
            </div>
            <div className="relative max-w-lg max-h-[85vh] rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black/50 p-2">
              <img
                src={previewImage}
                alt="Enlarged view"
                className="w-full h-full max-h-[78vh] object-contain rounded-2xl mx-auto"
              />
            </div>
            <p className="text-xs text-slate-300 mt-3 font-semibold">Tap anywhere to close</p>
          </div>
        )}
      </div>
    </div>
  );
};
