'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ExternalLink, ShieldCheck, ArrowLeft, User, AtSign } from 'lucide-react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useUserStore } from '@/store/useUserStore';
import { getLocalUserProfile, saveLocalUserProfile } from '@/lib/firestore';
import { upsertUserInDirectory, normalizeUsername, isUsernameAvailable } from '@/lib/socialService';
import { TactileButton } from '@/components/ui/TactileButton';
import { playClickSound } from '@/lib/audioEngine';

export default function LoginPage() {
  const router = useRouter();
  const { initUser, setProfile } = useUserStore();

  const [showEmailDrawer, setShowEmailDrawer] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [handleInput, setHandleInput] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const syncAndRedirect = async (
    uid: string,
    name?: string,
    userEmail?: string,
    photoURL?: string,
    preferredUsername?: string,
    isAnonymous?: boolean
  ) => {
    await initUser(uid, name, userEmail);
    const current = useUserStore.getState().profile;
    if (current) {
      const updated = await upsertUserInDirectory({
        ...current,
        name: name || current.name,
        displayName: name || current.displayName || current.name,
        email: userEmail || current.email,
        photoURL: photoURL || current.photoURL,
        username: preferredUsername
          ? normalizeUsername(preferredUsername, uid)
          : current.username || normalizeUsername(name || current.name, uid),
        isRealUser: !isAnonymous,
        isAnonymous: Boolean(isAnonymous),
      });
      setProfile(updated);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('sbr_session_verified', 'true');
    }
    router.replace('/');
  };

  // 1. Silent Auth Check on Boot
  useEffect(() => {
    const fastTimer = setTimeout(() => {
      const verified = typeof window !== 'undefined' && localStorage.getItem('sbr_session_verified') === 'true';
      const local = getLocalUserProfile();
      if (verified && local && local.uid) {
        initUser(local.uid, local.name, local.email);
        router.replace('/');
      } else {
        setCheckingSession(false);
      }
    }, 600);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(fastTimer);
      if (user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('sbr_session_verified', 'true');
        }
        await initUser(user.uid, user.displayName || undefined, user.email || undefined);
        const cur = useUserStore.getState().profile;
        if (cur) {
          const synced = await upsertUserInDirectory(cur);
          setProfile(synced);
        }
        router.replace('/');
      } else {
        const verified = typeof window !== 'undefined' && localStorage.getItem('sbr_session_verified') === 'true';
        const local = getLocalUserProfile();
        if (verified && local && local.uid) {
          await initUser(local.uid, local.name, local.email);
          router.replace('/');
        } else {
          setCheckingSession(false);
        }
      }
    });

    return () => {
      clearTimeout(fastTimer);
      unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. High-Speed Google Sign-In Flow synced with Firestore Users Directory
  const handleGoogleSignIn = async () => {
    playClickSound();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        await syncAndRedirect(
          res.user.uid,
          res.user.displayName || 'Royal Scholar',
          res.user.email || '',
          res.user.photoURL || undefined
        );
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setErrorMsg('Google sign-in popup was closed. Try again or use Email/Cloud Scholar.');
      } else if (code === 'auth/unauthorized-domain') {
        setErrorMsg('This domain is not whitelisted for Google Popup. Use Email Sign-In or Cloud Scholar below.');
      } else {
        setErrorMsg('Google popup failed on this browser. Try Email Sign-In or Cloud Scholar.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 3. Instant Cloud Scholar Sign-In (Uses Firebase Anonymous Auth + Firestore Directory)
  const handleQuickScholarLogin = async (customName?: string) => {
    playClickSound();
    setLoading(true);
    setErrorMsg('');
    try {
      const scholarName = (customName || '').trim() || `Scholar ${Math.floor(100 + Math.random() * 900)}`;
      try {
        const anon = await signInAnonymously(auth);
        if (anon.user) {
          await syncAndRedirect(
            anon.user.uid,
            scholarName,
            `${normalizeUsername(scholarName, anon.user.uid)}@jackquiz.cloud`,
            undefined,
            undefined,
            true
          );
          return;
        }
      } catch (anonErr) {
        console.warn('Firebase anonymous auth unavailable, falling back to cloud-indexed UID:', anonErr);
      }

      const existing = getLocalUserProfile();
      const uid = existing?.uid && existing.uid !== 'scholar_guest'
        ? existing.uid
        : `scholar_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
      await syncAndRedirect(
        uid,
        existing?.name || scholarName,
        existing?.email || `${normalizeUsername(scholarName, uid)}@jackquiz.cloud`,
        existing?.photoURL,
        existing?.username,
        true
      );
      const local = getLocalUserProfile();
      if (local) {
        local.lastActive = new Date().toISOString().split('T')[0];
        saveLocalUserProfile(local);
      }
    } catch {
      setErrorMsg('Could not create cloud scholar session. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Email & Password Sign In / Sign Up Flow with @username Claim
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    playClickSound();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isSignUp) {
        const desiredHandle = normalizeUsername(handleInput || fullName || email.split('@')[0], Date.now().toString(36));
        const available = await isUsernameAvailable(desiredHandle, 'new_user_check');
        if (!available) {
          setErrorMsg(`Username @${desiredHandle} is already taken. Choose another handle.`);
          setLoading(false);
          return;
        }
        const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const chosenName = fullName.trim() || email.split('@')[0];
        if (res.user) {
          await updateProfile(res.user, { displayName: chosenName }).catch(() => {});
          await syncAndRedirect(res.user.uid, chosenName, email.trim(), undefined, desiredHandle, false);
        }
      } else {
        const res = await signInWithEmailAndPassword(auth, email.trim(), password);
        if (res.user) {
          await syncAndRedirect(
            res.user.uid,
            res.user.displayName || email.split('@')[0],
            res.user.email || email.trim(),
            res.user.photoURL || undefined,
            undefined,
            false
          );
        }
      }
    } catch (err: unknown) {
      console.warn('Email auth error:', err);
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErrorMsg('Invalid email or password.');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMsg('Email already in use. Please sign in instead.');
      } else if (code === 'auth/weak-password') {
        setErrorMsg('Password must be at least 6 characters.');
      } else {
        setErrorMsg('Authentication error. Please check your network.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMsg('Please enter your email address first.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg('Reset email sent! Check your inbox.');
      setErrorMsg('');
    } catch {
      setErrorMsg('Could not send reset email. Verify your email address.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="relative min-h-[100dvh] w-full max-w-[440px] mx-auto bg-[#090D16] flex flex-col items-center justify-center px-4 select-none">
        <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin mb-3" />
        <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">
          Verifying Permanent Session...
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] h-[100dvh] w-full max-w-[420px] mx-auto bg-[#090D16] flex flex-col justify-between px-4 py-2.5 select-none overflow-y-auto">
      {/* Background Radial Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-6 right-0 w-52 h-52 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* TOP BAR: Creator Attribution */}
      <div className="relative z-10 flex items-center justify-between py-1 px-3 rounded-full bg-white/5 border border-white/10 shadow-sm shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs">👑</span>
          <span className="text-[10px] font-black tracking-wide text-slate-300 truncate">
            Created by <span className="text-[#FBBF24]">Ayan Ali</span> &bull; JAC Class 10
          </span>
        </div>
        <a
          href="https://youtube.com/@jack_quiz?si=fT6w3HfWnB5a_oSl"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playClickSound()}
          className="text-[9px] font-black text-red-400 hover:text-red-300 ml-2 flex items-center gap-0.5 shrink-0"
        >
          <span>YouTube</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>

      {/* CENTER: Compact Hero, Octopops 3D Mascot & Buttons (Elevated & Perfectly Centered) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center py-1 my-auto max-w-[360px] mx-auto w-full">
        {/* Floating Mascot Widget (Compact & Scaled) */}
        <div className="relative flex flex-col items-center">
          <div className="w-[84px] h-[84px] rounded-2xl overflow-hidden flex items-center justify-center relative">
            <iframe
              src="/mascot-widget.html"
              className="w-[84px] h-[84px] border-0 bg-transparent pointer-events-none"
              style={{ background: 'transparent' }}
              sandbox="allow-scripts"
              title="Octopops Mascot"
            />
          </div>
          <div className="mt-0.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-[8.5px] font-black text-emerald-300 uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            <span>🐾</span>
            <span>Octopops Study Companion</span>
          </div>
        </div>

        {/* Headline */}
        <div className="mt-2">
          <h1 className="text-lg sm:text-xl font-black text-white tracking-tight leading-tight">
            Master Class 10 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#80FF44] via-[#FBBF24] to-[#10B981]">
              with Jack Quiz
            </span>
          </h1>
          <p className="text-[10px] text-slate-400 font-medium px-2 mt-0.5 leading-tight">
            Jharkhand Academic Council (JAC) Board 2027 Ecosystem
          </p>
        </div>

        {/* Status Alerts (Dismissible & Compact) */}
        {errorMsg && (
          <div className="mt-2 p-2 rounded-xl bg-red-950/80 border border-red-500/40 text-[10.5px] text-red-200 w-full flex items-center justify-between gap-1 shadow-sm">
            <span className="leading-snug">{errorMsg}</span>
            <button
              onClick={() => setErrorMsg('')}
              className="text-red-400 hover:text-white text-xs px-1 font-bold shrink-0"
            >
              ✕
            </button>
          </div>
        )}
        {successMsg && (
          <div className="mt-2 p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-[10.5px] text-emerald-200 w-full flex items-center justify-between gap-1 shadow-sm">
            <span className="leading-snug">{successMsg}</span>
            <button
              onClick={() => setSuccessMsg('')}
              className="text-emerald-400 hover:text-white text-xs px-1 font-bold shrink-0"
            >
              ✕
            </button>
          </div>
        )}

        {/* =========================================================================
            TWO MAIN PILLARS: GOOGLE AUTH & EMAIL AUTH (LIFTED DIRECTLY INTO VIEW)
            ========================================================================= */}
        <div className="w-full space-y-2 mt-3 px-1">
          {!showEmailDrawer ? (
            <>
              {/* PILLAR 1: Continue with Google */}
              <TactileButton
                variant="gold"
                fullWidth
                size="md"
                disabled={loading}
                onClick={handleGoogleSignIn}
                className="flex items-center justify-center gap-2.5 text-xs font-black shadow-[0_4px_0_#92400E] py-3 transition-all"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.42l4.04-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span>{loading ? 'Connecting Google Account...' : 'Continue with Google'}</span>
              </TactileButton>

              {/* PILLAR 2: 1-Tap Instant Scholar Login (Zero-Fail Duolingo Onboarding) */}
              <button
                onClick={() => handleQuickScholarLogin()}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 border border-emerald-400/50 text-xs font-black text-white shadow-[0_3px_0_#065F46] transition-all active:scale-95"
              >
                <span>⚡</span>
                <span>{loading ? 'Authenticating Scholar...' : '1-Tap Instant Scholar Login'}</span>
              </button>

              {/* PILLAR 3: Sign in with Email & Password */}
              <button
                onClick={() => { playClickSound(); setShowEmailDrawer(true); }}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all active:scale-95"
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Sign in with Email &amp; Password</span>
              </button>

              {/* PILLAR 4: Create Account / Claim @username */}
              <button
                onClick={() => {
                  playClickSound();
                  setIsSignUp(true);
                  setShowEmailDrawer(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 text-xs font-bold text-amber-300 hover:text-amber-200 transition-all active:scale-95"
              >
                <AtSign className="w-3.5 h-3.5 text-amber-400" />
                <span>Create Scholar Account &amp; @username</span>
              </button>
            </>
          ) : (
            /* Email Drawer Form */
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#141A2D]/90 backdrop-blur-md border border-white/15 rounded-2xl p-3 space-y-2 text-left shadow-lg"
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => { setShowEmailDrawer(false); setErrorMsg(''); setSuccessMsg(''); }}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
                  className="text-[10px] font-black text-amber-400 hover:text-amber-300"
                >
                  {isSignUp ? 'Sign In Instead' : 'Need Account? Sign Up'}
                </button>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-2">
                {isSignUp && (
                  <>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Full Name (e.g. Riya Sharma)"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 transition"
                      />
                    </div>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-400" />
                      <input
                        type="text"
                        placeholder="Choose @username (e.g. riya_jac10)"
                        value={handleInput}
                        onChange={(e) => setHandleInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="w-full bg-white/5 border border-white/10 text-amber-300 rounded-xl pl-9 pr-3 py-2 text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 transition"
                      />
                    </div>
                  </>
                )}

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-9 pr-3 py-2 text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 transition"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-9 pr-9 py-2 text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {!isSignUp && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[10px] text-amber-400 hover:text-amber-300 font-bold"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                <TactileButton
                  variant="gold"
                  fullWidth
                  size="sm"
                  disabled={loading}
                  className="font-black text-xs py-2 shadow-[0_3px_0_#92400E]"
                >
                  {loading ? 'Please wait...' : (isSignUp ? '🚀 Create Account' : '🔓 Sign In')}
                </TactileButton>
              </form>
            </motion.div>
          )}

          <div className="flex items-center justify-center gap-1.5 pt-0.5 text-[9.5px] text-slate-400">
            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Permanent Session Persistence &bull; Zero Guest Policy</span>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="relative z-10 text-center text-[8.5px] text-slate-500 py-1 border-t border-white/5 shrink-0">
        <span>Jack Quiz v2.2 &bull; Official JAC Class 10 Ecosystem</span>
      </footer>
    </div>
  );
}
