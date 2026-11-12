'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ExternalLink, ShieldCheck, ArrowLeft, User } from 'lucide-react';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useUserStore } from '@/store/useUserStore';
import { getLocalUserProfile, createDefaultProfile, fetchUserProfile } from '@/lib/firestore';
import { upsertUserInDirectory, normalizeUsername } from '@/lib/socialService';
import { markTodayActiveOnProfile } from '@/lib/streakEngine';
import { TactileButton } from '@/components/ui/TactileButton';
import { playClickSound } from '@/lib/audioEngine';

export default function LoginPage() {
  const router = useRouter();
  const { initUser, setProfile } = useUserStore();
  const manualAuthInFlight = useRef(false);

  const [showEmailDrawer, setShowEmailDrawer] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
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
    forceOnboarding = false
  ) => {
    const existingLocal = getLocalUserProfile();
    const isFreshLocal = !(existingLocal && existingLocal.uid === uid);
    const base = !isFreshLocal
      ? existingLocal
      : createDefaultProfile(uid, name, userEmail);

    const cleanName = name || base.name || 'Royal Scholar';
    const cleanEmail = userEmail || base.email || '';
    const instantProfile = markTodayActiveOnProfile({
      ...base,
      uid,
      name: cleanName,
      displayName: cleanName,
      email: cleanEmail,
      emailLower: cleanEmail.trim().toLowerCase(),
      photoURL: photoURL || base.photoURL,
      username: base.username || normalizeUsername(cleanName || cleanEmail.split('@')[0], uid),
      usernameLower: (base.username || normalizeUsername(cleanName || cleanEmail.split('@')[0], uid)).toLowerCase(),
      nameLower: cleanName.toLowerCase(),
      isRealUser: true,
      isAnonymous: false,
      isOnline: true,
      lastSeenAt: new Date().toISOString(),
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('sbr_session_verified', 'true');
    }

    if (forceOnboarding) {
      setProfile(instantProfile);
      router.replace('/onboarding');
      void upsertUserInDirectory(instantProfile).catch(() => {});
      return;
    }

    // Wait up to 5s for cloud profile so existing Gmail accounts ALWAYS restore old username, XP, and progress
    let needsOnboarding = false;
    try {
      const remote = await Promise.race([
        fetchUserProfile(uid, cleanName, cleanEmail),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
      ]);
      if (remote) {
        const merged = markTodayActiveOnProfile({
          ...remote,
          name: remote.name || cleanName,
          displayName: remote.displayName || remote.name || cleanName,
          email: remote.email || cleanEmail || instantProfile.email,
          emailLower: (remote.email || cleanEmail || instantProfile.email || '').trim().toLowerCase(),
          username: remote.username || instantProfile.username,
          usernameLower: (remote.usernameLower || remote.username || instantProfile.username || '').toLowerCase(),
          photoURL: remote.photoURL || photoURL || instantProfile.photoURL,
          isRealUser: true,
          isAnonymous: false,
          isOnline: true,
        });
        setProfile(merged);
        needsOnboarding =
          merged.onboardingComplete === false ||
          (!merged.onboardingComplete &&
            (merged.xp || 0) === 0 &&
            Object.keys(merged.progress || {}).length <= 1);
      } else {
        setProfile(instantProfile);
        needsOnboarding = isFreshLocal && !instantProfile.onboardingComplete;
      }
    } catch {
      setProfile(instantProfile);
      needsOnboarding = false;
    }

    router.replace(needsOnboarding ? '/onboarding' : '/');
  };

  // 1. Fast Auth & Google Redirect Result Check on Boot
  useEffect(() => {
    let active = true;
    router.prefetch('/');

    const verified = typeof window !== 'undefined' && localStorage.getItem('sbr_session_verified') === 'true';
    const local = getLocalUserProfile();
    if (verified && local && local.uid) {
      setProfile(local);
      router.replace('/');
      return () => { active = false; };
    }

    const fastTimer = setTimeout(() => {
      if (!active || manualAuthInFlight.current) return;
      setCheckingSession(false);
    }, 350);

    if (auth.currentUser) {
      clearTimeout(fastTimer);
      manualAuthInFlight.current = true;
      void syncAndRedirect(
        auth.currentUser.uid,
        auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Royal Scholar',
        auth.currentUser.email || '',
        auth.currentUser.photoURL || undefined
      );
      return () => { active = false; };
    }

    getRedirectResult(auth)
      .then(async (redirectRes) => {
        if (!active) return;
        if (redirectRes?.user) {
          clearTimeout(fastTimer);
          manualAuthInFlight.current = true;
          setLoading(true);
          await syncAndRedirect(
            redirectRes.user.uid,
            redirectRes.user.displayName || redirectRes.user.email?.split('@')[0] || 'Royal Scholar',
            redirectRes.user.email || '',
            redirectRes.user.photoURL || undefined
          );
        }
      })
      .catch((err: unknown) => {
        if (!active) return;
        const code = (err as { code?: string })?.code || '';
        if (code === 'auth/unauthorized-domain') {
          const host = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
          setErrorMsg(`Add "${host}" in Firebase Console → Authentication → Settings → Authorized domains for Google Sign-In, or use Email & Password below.`);
        } else if (code && code !== 'auth/no-current-user') {
          setErrorMsg('Google sign-in could not complete. Please select your Google email again or sign in with Email & Password.');
        }
        setCheckingSession(false);
      });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!active || manualAuthInFlight.current) return;
      clearTimeout(fastTimer);
      if (user) {
        await syncAndRedirect(
          user.uid,
          user.displayName || user.email?.split('@')[0] || 'Royal Scholar',
          user.email || '',
          user.photoURL || undefined
        );
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
      active = false;
      clearTimeout(fastTimer);
      unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Direct Google Sign-In Flow (Popup + Automatic Mobile Redirect Fallback)
  const handleGoogleSignIn = async () => {
    playClickSound();
    manualAuthInFlight.current = true;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    googleProvider.setCustomParameters({ prompt: 'select_account' });

    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        await syncAndRedirect(
          res.user.uid,
          res.user.displayName || res.user.email?.split('@')[0] || 'Royal Scholar',
          res.user.email || '',
          res.user.photoURL || undefined
        );
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (
        code === 'auth/popup-blocked' ||
        code === 'auth/operation-not-supported-in-this-environment' ||
        code === 'auth/cancelled-popup-request'
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirErr: unknown) {
          const redirCode = (redirErr as { code?: string })?.code || '';
          if (redirCode === 'auth/unauthorized-domain') {
            const host = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
            setErrorMsg(`Google Sign-In requires "${host}" in Firebase Console → Authentication → Settings → Authorized domains. Use Email & Password below.`);
          } else {
            setErrorMsg('Google redirect failed. Please use Sign in with Email & Password below.');
          }
        }
      } else if (code === 'auth/popup-closed-by-user') {
        setErrorMsg('Google sign-in popup was closed. Tap Continue with Google to select your email.');
      } else if (code === 'auth/unauthorized-domain') {
        const host = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
        setErrorMsg(`Google Sign-In requires "${host}" in Firebase Console → Authentication → Settings → Authorized domains. Or sign in with Email & Password below.`);
      } else {
        setErrorMsg('Google sign-in failed on this browser. Please try again or use Email & Password below.');
      }
      manualAuthInFlight.current = false;
      setLoading(false);
    }
  };

  // 3. Email & Password Sign In / Sign Up Flow synced to Firestore
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    playClickSound();
    manualAuthInFlight.current = true;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const chosenName = fullName.trim() || email.trim().split('@')[0];
        if (res.user) {
          await updateProfile(res.user, { displayName: chosenName }).catch(() => {});
          await syncAndRedirect(res.user.uid, chosenName, email.trim(), undefined, true);
        }
      } else {
        const res = await signInWithEmailAndPassword(auth, email.trim(), password);
        if (res.user) {
          await syncAndRedirect(
            res.user.uid,
            res.user.displayName || email.trim().split('@')[0],
            res.user.email || email.trim(),
            res.user.photoURL || undefined
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
      manualAuthInFlight.current = false;
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
            TWO MAIN PILLARS: DIRECT GOOGLE EMAIL SIGN-IN & EMAIL/PASSWORD AUTH
            ========================================================================= */}
        <div className="w-full space-y-2.5 mt-3 px-1">
          {!showEmailDrawer ? (
            <>
              {/* PILLAR 1: Continue with Google (Direct Google Account Selector) */}
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

              {/* PILLAR 2: Sign in with Email & Password */}
              <button
                onClick={() => { playClickSound(); setIsSignUp(false); setShowEmailDrawer(true); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-slate-200 hover:text-white transition-all active:scale-95"
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Sign in with Email &amp; Password</span>
              </button>
            </>
          ) : (
            /* Email & Password Drawer Form */
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
