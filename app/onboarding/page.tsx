'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useUserStore } from '@/store/useUserStore';
import { saveLocalUserProfile, getLocalUserProfile, createDefaultProfile } from '@/lib/firestore';
import { isUsernameAvailable, normalizeUsername, upsertUserInDirectory } from '@/lib/socialService';
import { markTodayActiveOnProfile } from '@/lib/streakEngine';

type StudyGoals = {
  targetScore: string;
  dailyGoal: string;
  focusSubject: string;
};

export default function OnboardingPage() {
  const router = useRouter();
  const { setProfile } = useUserStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);

  // Step 1
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [classLevel, setClassLevel] = useState('Class 10 JAC');

  // Step 2
  const [studyGoals, setStudyGoals] = useState<StudyGoals>({
    targetScore: '',
    dailyGoal: '',
    focusSubject: ''
  });

  // Step 3
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [usernameTimer, setUsernameTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseUid(user.uid);
        if (user.displayName && !firstName) {
          const parts = user.displayName.trim().split(' ');
          setFirstName(parts[0] || '');
          setLastName(parts.slice(1).join(' ') || '');
        }
      } else {
        // Check localStorage
        const local = getLocalUserProfile();
        if (local) {
          setFirebaseUid(local.uid);
        } else {
          router.replace('/login');
        }
      }
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleUsernameChange = (val: string) => {
    const sanitized = val.toLowerCase().replace(/[^a-z0-9_.]/g, '');
    setUsername(sanitized);
    setUsernameStatus('idle');
    setUsernameSuggestions([]);

    if (usernameTimer) clearTimeout(usernameTimer);
    if (sanitized.length >= 3) {
      setUsernameStatus('checking');
      const timer = setTimeout(async () => {
        try {
          const available = await isUsernameAvailable(sanitized, firebaseUid || '');
          if (available) {
            setUsernameStatus('available');
            setUsernameSuggestions([]);
          } else {
            setUsernameStatus('taken');
            const base = sanitized.replace(/[^a-z0-9_]/g, '').slice(0, 14) || 'scholar';
            setUsernameSuggestions([
              `${base}_${Math.floor(10 + Math.random() * 89)}`,
              `${base}_jac10`,
              `${base}_${new Date().getFullYear().toString().slice(-2)}`,
            ]);
          }
        } catch {
          setUsernameStatus('available'); // Offline fallback
        }
      }, 350);
      setUsernameTimer(timer);
    }
  };

  const handleComplete = async () => {
    if (!firebaseUid) return;
    if (!firstName.trim() || !lastName.trim() || !age) {
      return;
    }
    if (!studyGoals.targetScore || !studyGoals.dailyGoal || !studyGoals.focusSubject) {
      return;
    }
    if (username.length < 3 || usernameStatus === 'taken') {
      return;
    }

    setLoading(true);
    try {
      const local = getLocalUserProfile();
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const email = local?.email || auth.currentUser?.email || '';
      const cleanUser = normalizeUsername(username, firebaseUid);
      const base =
        local && local.uid === firebaseUid
          ? local
          : createDefaultProfile(firebaseUid, fullName, email);
      const freshProfile = markTodayActiveOnProfile({
        ...base,
        uid: firebaseUid,
        name: fullName,
        displayName: fullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        age: parseInt(age, 10) || base.age || 15,
        classLevel: classLevel || base.classLevel || 'Class 10 JAC',
        username: cleanUser,
        usernameLower: cleanUser.toLowerCase(),
        nameLower: fullName.toLowerCase(),
        email,
        emailLower: email.trim().toLowerCase(),
        photoURL: local?.photoURL || auth.currentUser?.photoURL || base.photoURL,
        studyGoals,
        onboardingComplete: true,
        joinedAt: base.joinedAt || new Date().toISOString(),
        isOnline: true,
        isRealUser: true,
      });

      saveLocalUserProfile(freshProfile);
      setProfile(freshProfile);

      // Sync to Firestore with a 1.2s fast cap so onboarding NEVER hangs
      await Promise.race([
        upsertUserInDirectory(freshProfile),
        new Promise<void>((resolve) => setTimeout(resolve, 1200)),
      ]);

      router.replace('/');
    } catch (err) {
      console.error('Onboarding error:', err);
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = (step / 3) * 100;

  return (
    <div className="relative min-h-[100dvh] w-full max-w-[480px] mx-auto bg-[#090D16] flex flex-col px-4 py-6 select-none overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-emerald-500/8 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-black text-white tracking-tight">
              👑 Royal Scholar Setup
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Step {step} of 3</p>
          </div>
          {/* Iframe Mascot small */}
          <iframe
            src="/mascot-widget.html"
            className="w-[70px] h-[70px] border-0 pointer-events-none"
            style={{ background: 'transparent' }}
            sandbox="allow-scripts"
            title="Mascot"
          />
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-1">
          {['Identity', 'Study Goals', '@Username'].map((label, i) => (
            <span
              key={label}
              className={`text-[9px] font-black uppercase tracking-wider ${
                i + 1 <= step ? 'text-amber-400' : 'text-slate-600'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* STEP 1: Personal Identity */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="relative z-10 flex-1 flex flex-col"
          >
            <div className="bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#090D16] border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg">
                  🎓
                </div>
                <div>
                  <h2 className="text-sm font-black text-white">Personal Identity</h2>
                  <p className="text-[10px] text-slate-400">Tell us about yourself</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider mb-1.5 block">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ayan"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider mb-1.5 block">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ali"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider mb-1.5 block">
                    Age
                  </label>
                  <select
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#0F172A]">Select your age</option>
                    {Array.from({ length: 8 }, (_, i) => i + 13).map((a) => (
                      <option key={a} value={a} className="bg-[#0F172A]">{a} years old</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider mb-1.5 block">
                    Class / Board
                  </label>
                  <select
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition appearance-none cursor-pointer"
                  >
                    <option value="Class 10 JAC" className="bg-[#0F172A]">Class 10 JAC Board (Recommended)</option>
                    <option value="Class 9 JAC" className="bg-[#0F172A]">Class 9 JAC Board</option>
                    <option value="Class 10 CBSE" className="bg-[#0F172A]">Class 10 CBSE</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (firstName.trim() && lastName.trim() && age) setStep(2);
              }}
              disabled={!firstName.trim() || !lastName.trim() || !age}
              className="mt-4 w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-sm uppercase tracking-wider shadow-[0_5px_0_#92400E] active:translate-y-1 active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Continue →
            </button>
          </motion.div>
        )}

        {/* STEP 2: Study Calibration */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="relative z-10 flex-1 flex flex-col"
          >
            <div className="bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#090D16] border border-white/10 rounded-2xl p-5 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-lg">
                  🎯
                </div>
                <div>
                  <h2 className="text-sm font-black text-white">Study Calibration</h2>
                  <p className="text-[10px] text-slate-400">3 quick questions to personalize your path</p>
                </div>
              </div>

              {/* Q1: Board Target Score */}
              <div>
                <p className="text-xs font-black text-white mb-2">1. Board Target Score?</p>
                <div className="space-y-2">
                  {[
                    { label: '80%+ Solid Pass', emoji: '✅', value: '80' },
                    { label: '90%+ Distinction', emoji: '⭐', value: '90' },
                    { label: '95%+ State Topper', emoji: '👑', value: '95' }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setStudyGoals({ ...studyGoals, targetScore: opt.value })}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all text-left ${
                        studyGoals.targetScore === opt.value
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <span>{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Q2: Daily Study Streak */}
              <div>
                <p className="text-xs font-black text-white mb-2">2. Daily Study Streak Goal?</p>
                <div className="space-y-2">
                  {[
                    { label: '15 Mins/Day', emoji: '⚡', value: '15' },
                    { label: '30 Mins/Day', emoji: '🔥', value: '30' },
                    { label: '60+ Mins/Day', emoji: '💪', value: '60' }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setStudyGoals({ ...studyGoals, dailyGoal: opt.value })}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all text-left ${
                        studyGoals.dailyGoal === opt.value
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <span>{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Q3: Focus Subject */}
              <div>
                <p className="text-xs font-black text-white mb-2">3. Focus Subject?</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Mathematics', emoji: '📐', value: 'Mathematics' },
                    { label: 'Science', emoji: '🔬', value: 'Science' },
                    { label: 'English', emoji: '📖', value: 'English' },
                    { label: 'Social Science', emoji: '🌍', value: 'Social Science' },
                    { label: 'Hindi', emoji: '📝', value: 'Hindi' }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setStudyGoals({ ...studyGoals, focusSubject: opt.value })}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                        studyGoals.focusSubject === opt.value
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <span>{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-black text-sm transition-all hover:bg-white/10"
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  if (studyGoals.targetScore && studyGoals.dailyGoal && studyGoals.focusSubject) setStep(3);
                }}
                disabled={!studyGoals.targetScore || !studyGoals.dailyGoal || !studyGoals.focusSubject}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-sm uppercase tracking-wider shadow-[0_5px_0_#92400E] active:translate-y-1 active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Continue →
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Username */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="relative z-10 flex-1 flex flex-col"
          >
            <div className="bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#090D16] border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-lg">
                  @
                </div>
                <div>
                  <h2 className="text-sm font-black text-white">Create @Username</h2>
                  <p className="text-[10px] text-slate-400">Your unique scholar identity</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 font-black text-sm">@</div>
                <input
                  type="text"
                  placeholder="yourname"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  maxLength={20}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-8 pr-4 py-3 text-sm placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition"
                />
              </div>

              {/* Username status */}
              <div className="mt-2 min-h-[20px]">
                {usernameStatus === 'checking' && (
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    Checking availability...
                  </p>
                )}
                {usernameStatus === 'available' && username.length >= 3 && (
                  <p className="text-[11px] text-emerald-400 font-black">✓ @{username} is available!</p>
                )}
                {usernameStatus === 'taken' && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-red-400 font-black">✗ @{username} is already taken</p>
                    {usernameSuggestions.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-400">Try:</span>
                        {usernameSuggestions.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleUsernameChange(s)}
                            className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black hover:bg-amber-500/30"
                          >
                            @{s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {username.length > 0 && username.length < 3 && (
                  <p className="text-[11px] text-slate-400">Username must be at least 3 characters</p>
                )}
              </div>

              <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <p className="text-[10px] text-slate-400">
                  <span className="text-amber-400 font-black">Rules: </span>
                  Lowercase letters, numbers, underscores, and dots only. Min 3 chars.
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-black text-sm transition-all hover:bg-white/10"
              >
                ← Back
              </button>
              <button
                onClick={handleComplete}
                disabled={username.length < 3 || usernameStatus === 'taken' || loading}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-sm uppercase tracking-wider shadow-[0_5px_0_#92400E] active:translate-y-1 active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                    Setting up...
                  </>
                ) : (
                  '🚀 Enter the Kingdom!'
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
