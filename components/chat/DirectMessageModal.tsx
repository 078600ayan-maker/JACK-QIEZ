'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Send,
  Image as ImageIcon,
  X,
  Check,
  CheckCheck,
  User,
  Sparkles,
  ArrowLeft
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

export const DirectMessageModal: React.FC<DirectMessageModalProps> = ({
  isOpen,
  onClose,
  targetUser,
}) => {
  const { profile } = useUserStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile?.uid) return;
    const unsub = subscribeUserMessages(profile.uid, (list) => {
      setMessages(list);
    });
    return () => unsub();
  }, [profile?.uid]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedPhoto]);

  if (!isOpen) return null;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Photo must be less than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if (!profile || !targetUser?.uid) return;
    if (!inputText.trim() && !selectedPhoto) return;
    setSending(true);
    playPop();
    try {
      const ok = await sendDirectMessageInCloud(
        profile,
        targetUser.uid,
        inputText,
        selectedPhoto || undefined
      );
      if (ok) {
        setInputText('');
        setSelectedPhoto(null);
      }
    } finally {
      setSending(false);
    }
  };

  // Filter messages between current user and target user
  const conversation = messages.filter(
    (m) =>
      (m.senderUid === profile?.uid && m.recipientUid === targetUser?.uid) ||
      (m.senderUid === targetUser?.uid && m.recipientUid === profile?.uid)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xl select-none">
      <div className="relative w-full max-w-[440px] h-[85vh] flex flex-col rounded-3xl bg-gradient-to-b from-[#16213A] via-[#0F172A] to-[#0A0E18] border-2 border-pink-500/40 shadow-2xl overflow-hidden">
        {/* Top Direct Message Header (Instagram Style) */}
        <div className="flex items-center justify-between p-3.5 bg-black/40 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            {targetUser ? (
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={targetUser.photoURL || '/assets/profile_photos/IMG_20261109_001512.png'}
                    alt={targetUser.name}
                    className="w-9 h-9 rounded-full object-cover border border-pink-400"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22c55e] border border-black shadow-[0_0_5px_#22c55e]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-black text-white truncate">{targetUser.name}</h3>
                  <p className="text-[10px] text-pink-300 font-bold truncate">@{targetUser.username}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-pink-400" />
                <h3 className="text-xs font-black text-white">Direct Messages</h3>
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

        {/* Message Feed Container */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {targetUser ? (
            conversation.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 border border-pink-400/40 mx-auto flex items-center justify-center">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-black text-white">Say hello to {targetUser.name}!</h4>
                <p className="text-[10px] text-slate-400 max-w-[240px] mx-auto">
                  Start an authentic study conversation, share notes &amp; photos like Instagram.
                </p>
              </div>
            ) : (
              conversation.map((msg) => {
                const isMine = msg.senderUid === profile?.uid;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[78%] rounded-2xl p-3 text-xs leading-relaxed space-y-1.5 shadow-md ${
                        isMine
                          ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-br-xs'
                          : 'bg-white/10 border border-white/10 text-white rounded-bl-xs'
                      }`}
                    >
                      {msg.photoDataUrl && (
                        <div className="rounded-xl overflow-hidden border border-white/20 max-h-56">
                          <img
                            src={msg.photoDataUrl}
                            alt="Attachment"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      {msg.text && <p className="font-semibold break-words">{msg.text}</p>}
                      <div className="flex items-center justify-end gap-1 text-[8px] text-white/70">
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMine && <CheckCheck className="w-3 h-3 text-emerald-300" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            /* Inbox View */
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Recent Inbox
              </span>
              {messages.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  No new messages yet. Tap any scholar's profile to DM!
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      if (!m.read) markDirectMessageAsRead(m.id);
                    }}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                      !m.read
                        ? 'bg-pink-500/15 border-pink-400/50'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={m.senderPhoto}
                          alt={m.senderName}
                          className="w-10 h-10 rounded-full object-cover border border-white/20"
                        />
                        <span
                          className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-black ${
                            !m.read ? 'bg-pink-400 animate-ping' : 'bg-emerald-400'
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-white truncate">{m.senderName}</p>
                        <p className="text-[10px] text-slate-300 truncate">
                          {m.photoDataUrl ? '📷 Photo' : m.text}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold shrink-0">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Photo Preview Thumbnail if Selected */}
        {selectedPhoto && (
          <div className="px-4 py-2 bg-black/60 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={selectedPhoto}
                alt="Upload preview"
                className="w-10 h-10 rounded-xl object-cover border border-pink-400"
              />
              <span className="text-[10px] text-pink-300 font-bold">Photo attached</span>
            </div>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="p-1 rounded-full bg-white/10 text-slate-300 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Input Bar (Only if targetUser is selected) */}
        {targetUser && (
          <div className="p-3 bg-black/50 border-t border-white/10 flex items-center gap-2 shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-pink-400 border border-white/10 transition cursor-pointer"
              title="Attach Photo"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder="Message..."
              className="flex-1 bg-white/5 border border-white/10 text-white rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:border-pink-500/50 transition"
            />

            <button
              type="button"
              disabled={sending || (!inputText.trim() && !selectedPhoto)}
              onClick={handleSend}
              className="p-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black shadow-lg disabled:opacity-40 transition active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
