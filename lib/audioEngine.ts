'use client';

// ============================================================================
// JACK QUIZ: ROYAL OBSIDIAN AUDIO SYNTHESIS & SFX ENGINE (50+ PROCEDURAL SOUNDS)
// Zero-latency, 100% offline, synthesized entirely via Web Audio API + Speech API
// ============================================================================

let audioCtx: AudioContext | null = null;
let isMuted = false;
let lofiActive = false;
let lofiNodes: { stop: () => void } | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSoundMuted(muted: boolean) {
  isMuted = muted;
  if (muted && lofiActive) {
    stopLofiAmbient();
  }
}

export function getSoundMuted(): boolean {
  return isMuted;
}

// ============================================================================
// HAPTIC FEEDBACK (Native Mobile Vibration)
// ============================================================================
export function triggerHapticTick(duration = 15) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch {
      // Ignored
    }
  }
}

export function triggerHapticWrong() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([60, 40, 75]);
    } catch {
      // Ignored
    }
  }
}

export function triggerHapticSuccess() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([25, 30, 45]);
    } catch {
      // Ignored
    }
  }
}

export function triggerHapticCelebration() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([40, 40, 40, 40, 80, 50, 120]);
    } catch {
      // Ignored
    }
  }
}

// Helper tone synthesizer
function synthesizeTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.15,
  pitchBend?: { targetFreq: number; time: number }
) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (pitchBend) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, pitchBend.targetFreq), now + pitchBend.time);
    }

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  } catch (e) {
    // Audio context error handle
  }
}

// ============================================================================
// 1. WELCOME ROUTINE (Fanfare + Speech Synthesis)
// ============================================================================
export function playWelcomeRoutine(userName: string = 'Scholar') {
  if (isMuted) return;
  const ctx = getAudioContext();

  // 1. Harmonious Entrance Fanfare (C4 - E4 - G4 - C5 Chord)
  if (ctx) {
    const chords = [261.63, 329.63, 392.0, 523.25, 659.25];
    chords.forEach((freq, idx) => {
      setTimeout(() => {
        synthesizeTone(freq, 0.45, 'triangle', 0.12, { targetFreq: freq * 1.01, time: 0.4 });
      }, idx * 70);
    });
  }

  // 2. Clear, Expressive Voice Line
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      // Cancel previous pending speech
      window.speechSynthesis.cancel();

      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(`Welcome back, ${userName}! Ready for Jack Quiz?`);
        utterance.rate = 1.05;
        utterance.pitch = 1.15;
        utterance.volume = 0.85;

        // Try to pick an English voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
          v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Female'))
        );
        if (preferredVoice) utterance.voice = preferredVoice;

        window.speechSynthesis.speak(utterance);
      }, 350);
    } catch {
      // Voice synthesis fallback
    }
  }
}

// ============================================================================
// 2. BUTTON CLICKS & TACTILE CONTROLS (7 distinct)
// ============================================================================
export function playClickSound() {
  triggerHapticTick(10);
  synthesizeTone(820, 0.04, 'triangle', 0.15, { targetFreq: 320, time: 0.035 });
}

export function playWoodClick() {
  triggerHapticTick(8);
  synthesizeTone(340, 0.05, 'square', 0.08, { targetFreq: 120, time: 0.04 });
}

export function playStoneClick() {
  triggerHapticTick(12);
  synthesizeTone(540, 0.04, 'triangle', 0.12, { targetFreq: 200, time: 0.035 });
}

export function playGlassClick() {
  triggerHapticTick(10);
  synthesizeTone(1420, 0.06, 'sine', 0.14, { targetFreq: 880, time: 0.05 });
}

export function playObsidianPing() {
  triggerHapticTick(14);
  synthesizeTone(1840, 0.09, 'sine', 0.16, { targetFreq: 1100, time: 0.08 });
}

export function playPressurePlate() {
  triggerHapticTick(18);
  synthesizeTone(220, 0.07, 'sawtooth', 0.1, { targetFreq: 440, time: 0.06 });
}

export function playSnapClick() {
  triggerHapticTick(10);
  synthesizeTone(980, 0.03, 'sine', 0.18, { targetFreq: 450, time: 0.025 });
}

export function playPop() {
  triggerHapticTick(8);
  synthesizeTone(600, 0.06, 'sine', 0.15, { targetFreq: 920, time: 0.05 });
}

// ============================================================================
// 3. QUIZ ANSWER RESPONSES (8 distinct)
// ============================================================================
export function playCorrectSound() {
  playCorrectDing();
}

export function playCorrectDing() {
  triggerHapticSuccess();
  if (isMuted) return;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      synthesizeTone(freq, idx === 3 ? 0.35 : 0.09, 'sine', 0.2);
    }, idx * 55);
  });
}

export function playCorrectHarp() {
  triggerHapticSuccess();
  if (isMuted) return;
  const notes = [440, 554.37, 659.25, 880, 1108.73];
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      synthesizeTone(freq, 0.25, 'triangle', 0.15);
    }, idx * 45);
  });
}

export function playMinecraftLevelUp() {
  triggerHapticCelebration();
  if (isMuted) return;
  const notes = [440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51];
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      synthesizeTone(freq, 0.15, 'square', 0.12);
    }, idx * 40);
  });
}

export function playWrongSound() {
  playWrongThud();
}

export function playWrongThud() {
  triggerHapticWrong();
  if (isMuted) return;
  synthesizeTone(160, 0.28, 'sawtooth', 0.22, { targetFreq: 55, time: 0.25 });
  setTimeout(() => {
    synthesizeTone(110, 0.2, 'sine', 0.18, { targetFreq: 40, time: 0.18 });
  }, 90);
}

export function playWrongBuzzer() {
  triggerHapticWrong();
  if (isMuted) return;
  synthesizeTone(130, 0.18, 'sawtooth', 0.2);
  setTimeout(() => synthesizeTone(120, 0.22, 'sawtooth', 0.2), 120);
}

export function playAnvilDamage() {
  triggerHapticWrong();
  if (isMuted) return;
  synthesizeTone(420, 0.12, 'square', 0.25, { targetFreq: 80, time: 0.11 });
  synthesizeTone(210, 0.3, 'sawtooth', 0.22, { targetFreq: 45, time: 0.28 });
}

export function playGlassCrack() {
  triggerHapticWrong();
  if (isMuted) return;
  synthesizeTone(2200, 0.08, 'triangle', 0.22, { targetFreq: 400, time: 0.07 });
  setTimeout(() => synthesizeTone(1600, 0.1, 'sine', 0.18, { targetFreq: 280, time: 0.09 }), 40);
}

// ============================================================================
// 4. RANKS, ORES & REWARDS (7 distinct)
// ============================================================================
export function playOreUnlockFanfare() {
  triggerHapticCelebration();
  if (isMuted) return;
  const fanfare = [392.0, 523.25, 659.25, 783.99, 1046.5];
  fanfare.forEach((freq, idx) => {
    setTimeout(() => {
      synthesizeTone(freq, idx === fanfare.length - 1 ? 0.5 : 0.12, 'triangle', 0.22);
    }, idx * 75);
  });
}

export function playDiamondChime() {
  triggerHapticSuccess();
  if (isMuted) return;
  [1046.5, 1318.51, 1567.98, 2093.0].forEach((freq, idx) => {
    setTimeout(() => {
      synthesizeTone(freq, 0.22, 'sine', 0.16);
    }, idx * 60);
  });
}

export function playNetheriteImpact() {
  triggerHapticCelebration();
  if (isMuted) return;
  synthesizeTone(80, 0.45, 'sawtooth', 0.3, { targetFreq: 30, time: 0.4 });
  setTimeout(() => {
    synthesizeTone(587.33, 0.35, 'sine', 0.25);
    synthesizeTone(880.0, 0.4, 'triangle', 0.22);
  }, 100);
}

export function playChestOpen() {
  triggerHapticTick(15);
  if (isMuted) return;
  synthesizeTone(320, 0.16, 'triangle', 0.12, { targetFreq: 520, time: 0.14 });
  setTimeout(() => {
    synthesizeTone(784, 0.2, 'sine', 0.14, { targetFreq: 1174, time: 0.18 });
  }, 120);
}

export function playXpRollTick() {
  triggerHapticTick(5);
  synthesizeTone(1200, 0.025, 'triangle', 0.08);
}

export function playTrophyCelebration() {
  triggerHapticCelebration();
  if (isMuted) return;
  const royalMelody = [
    { f: 523.25, d: 0.12, t: 0 },
    { f: 523.25, d: 0.12, t: 100 },
    { f: 523.25, d: 0.12, t: 200 },
    { f: 659.25, d: 0.25, t: 300 },
    { f: 783.99, d: 0.45, t: 450 },
    { f: 1046.5, d: 0.65, t: 650 }
  ];
  royalMelody.forEach(({ f, d, t }) => {
    setTimeout(() => {
      synthesizeTone(f, d, 'triangle', 0.22);
    }, t);
  });
}

export function playLockRattle() {
  triggerHapticWrong();
  if (isMuted) return;
  synthesizeTone(240, 0.08, 'square', 0.12, { targetFreq: 90, time: 0.07 });
  setTimeout(() => synthesizeTone(190, 0.09, 'square', 0.1, { targetFreq: 70, time: 0.08 }), 70);
  setTimeout(() => synthesizeTone(140, 0.12, 'sawtooth', 0.1, { targetFreq: 50, time: 0.1 }), 140);
}

// ============================================================================
// 5. AVATAR INTERACTIONS (6 distinct)
// ============================================================================
export function playAvatarJump() {
  triggerHapticTick(14);
  synthesizeTone(240, 0.14, 'square', 0.14, { targetFreq: 680, time: 0.12 });
  setTimeout(() => synthesizeTone(680, 0.1, 'sine', 0.1, { targetFreq: 880, time: 0.08 }), 80);
}

export function playAvatarCheer() {
  triggerHapticSuccess();
  if (isMuted) return;
  [587.33, 739.99, 880, 1174.66].forEach((f, i) => {
    setTimeout(() => synthesizeTone(f, i === 3 ? 0.28 : 0.09, 'sine', 0.18), i * 65);
  });
}

export function playAvatarCry() {
  triggerHapticTick(15);
  if (isMuted) return;
  synthesizeTone(420, 0.25, 'triangle', 0.15, { targetFreq: 210, time: 0.22 });
  setTimeout(() => {
    synthesizeTone(340, 0.3, 'sine', 0.12, { targetFreq: 160, time: 0.28 });
  }, 140);
}

export function playItemEquip() {
  triggerHapticTick(12);
  synthesizeTone(480, 0.05, 'triangle', 0.15, { targetFreq: 820, time: 0.045 });
  setTimeout(() => synthesizeTone(1100, 0.08, 'sine', 0.18), 35);
}

export function playWingFlap() {
  triggerHapticTick(10);
  synthesizeTone(180, 0.12, 'sawtooth', 0.1, { targetFreq: 90, time: 0.11 });
}

export function playElytraGlide() {
  if (isMuted) return;
  synthesizeTone(320, 0.35, 'triangle', 0.08, { targetFreq: 180, time: 0.32 });
}

// ============================================================================
// 6. NAVIGATION & MODALS (6 distinct)
// ============================================================================
export function playBookFlip() {
  triggerHapticTick(8);
  synthesizeTone(450, 0.04, 'triangle', 0.1, { targetFreq: 220, time: 0.035 });
  setTimeout(() => synthesizeTone(320, 0.05, 'sine', 0.08, { targetFreq: 160, time: 0.04 }), 30);
}

export function playDrawerSlide() {
  triggerHapticTick(10);
  synthesizeTone(220, 0.09, 'sine', 0.12, { targetFreq: 440, time: 0.08 });
}

export function playTabSwitch() {
  triggerHapticTick(8);
  synthesizeTone(680, 0.04, 'sine', 0.12, { targetFreq: 920, time: 0.035 });
}

export function playModalOpen() {
  triggerHapticTick(12);
  synthesizeTone(392.0, 0.08, 'sine', 0.14, { targetFreq: 587.33, time: 0.07 });
  setTimeout(() => synthesizeTone(783.99, 0.12, 'sine', 0.16), 50);
}

export function playModalClose() {
  triggerHapticTick(8);
  synthesizeTone(660, 0.06, 'sine', 0.12, { targetFreq: 330, time: 0.05 });
}

export function playToggleSwitch() {
  triggerHapticTick(10);
  synthesizeTone(720, 0.035, 'triangle', 0.15, { targetFreq: 1040, time: 0.03 });
}

// ============================================================================
// 7. LIFE, COMBAT & QUIZ EVENTS (6 distinct)
// ============================================================================
export function playHeartLost() {
  triggerHapticWrong();
  if (isMuted) return;
  synthesizeTone(380, 0.14, 'triangle', 0.18, { targetFreq: 220, time: 0.12 });
  setTimeout(() => synthesizeTone(260, 0.22, 'sine', 0.15, { targetFreq: 130, time: 0.2 }), 90);
}

export function playHeartRefill() {
  triggerHapticSuccess();
  if (isMuted) return;
  [440, 554.37, 659.25, 880].forEach((f, i) => {
    setTimeout(() => synthesizeTone(f, 0.2, 'sine', 0.15), i * 50);
  });
}

export function playFiftyFiftySparkle() {
  triggerHapticTick(14);
  if (isMuted) return;
  [980, 1318.51, 1567.98, 1960.0].forEach((f, i) => {
    setTimeout(() => synthesizeTone(f, 0.12, 'sine', 0.14), i * 40);
  });
}

export function playStreakFlameBurst() {
  triggerHapticCelebration();
  if (isMuted) return;
  synthesizeTone(260, 0.15, 'sawtooth', 0.16, { targetFreq: 520, time: 0.13 });
  setTimeout(() => synthesizeTone(659.25, 0.22, 'triangle', 0.18), 80);
}

export function playTimerHeartbeat() {
  triggerHapticTick(18);
  if (isMuted) return;
  synthesizeTone(75, 0.1, 'sine', 0.22, { targetFreq: 45, time: 0.09 });
  setTimeout(() => synthesizeTone(70, 0.09, 'sine', 0.18, { targetFreq: 40, time: 0.08 }), 110);
}

export function playTimerUrgencyTick() {
  triggerHapticTick(12);
  synthesizeTone(1600, 0.035, 'triangle', 0.14);
}

// ============================================================================
// 8. COMBOS & DRILLS (6 distinct)
// ============================================================================
export function playComboMultiplier(combo: number) {
  triggerHapticSuccess();
  if (isMuted) return;
  const baseFreq = 440;
  const pitchMult = Math.min(2.5, 1 + (combo - 1) * 0.18);
  synthesizeTone(baseFreq * pitchMult, 0.12, 'sine', 0.18, {
    targetFreq: baseFreq * pitchMult * 1.25,
    time: 0.1
  });
}

export function playDrillStartCountdown(isFinal = false) {
  triggerHapticTick(isFinal ? 25 : 12);
  if (isMuted) return;
  if (isFinal) {
    synthesizeTone(1046.5, 0.35, 'sine', 0.25);
  } else {
    synthesizeTone(523.25, 0.12, 'triangle', 0.18);
  }
}

export function playOfflineCacheSuccess() {
  triggerHapticCelebration();
  if (isMuted) return;
  [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) => {
    setTimeout(() => synthesizeTone(f, 0.18, 'sine', 0.16), i * 45);
  });
}

export function playMysteriousTreasureGlow() {
  if (isMuted) return;
  synthesizeTone(620, 0.3, 'sine', 0.1, { targetFreq: 880, time: 0.28 });
  setTimeout(() => synthesizeTone(880, 0.35, 'triangle', 0.1, { targetFreq: 1100, time: 0.32 }), 100);
}

// ============================================================================
// LEGACY COMPATIBILITY & CALL AUDIO ALIASES
// ============================================================================
export const playVictorySound = playTrophyCelebration;
export const playVictoryFanfare = playOreUnlockFanfare;

export function playCallingRingtone(): { stop: () => void } {
  if (isMuted) return { stop: () => {} };
  synthesizeTone(440, 0.35, 'sine', 0.12);
  const t = setTimeout(() => synthesizeTone(480, 0.35, 'sine', 0.12), 400);
  return {
    stop: () => clearTimeout(t)
  };
}

export function playHangupSound() {
  triggerHapticTick(15);
  if (isMuted) return;
  synthesizeTone(360, 0.15, 'triangle', 0.15, { targetFreq: 180, time: 0.14 });
}

export function playSfxByName(name: string) {
  const lower = (name || '').toLowerCase();
  if (lower.includes('correct') || lower.includes('ding')) {
    playCorrectDing();
  } else if (lower.includes('wrong') || lower.includes('thud')) {
    playWrongThud();
  } else if (lower.includes('cheer') || lower.includes('jump')) {
    playAvatarCheer();
  } else if (lower.includes('cry')) {
    playAvatarCry();
  } else if (lower.includes('fanfare') || lower.includes('trophy')) {
    playTrophyCelebration();
  } else {
    playClickSound();
  }
}

// ============================================================================
// 9. LO-FI AMBIENT GENERATOR
// ============================================================================
export function toggleLofiAmbient(): boolean {
  if (lofiActive) {
    stopLofiAmbient();
    return false;
  } else {
    startLofiAmbient();
    return true;
  }
}

export function isLofiAmbientPlaying(): boolean {
  return lofiActive;
}

export function startLofiAmbient() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(130.81, ctx.currentTime); // C3

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(196.0, ctx.currentTime); // G3

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.04, ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();

    lofiActive = true;
    lofiNodes = {
      stop: () => {
        try {
          osc1.stop();
          osc2.stop();
          osc1.disconnect();
          osc2.disconnect();
        } catch {}
      }
    };
  } catch {}
}

export function stopLofiAmbient() {
  if (lofiNodes) {
    lofiNodes.stop();
    lofiNodes = null;
  }
  lofiActive = false;
}

export const playCorrectChime = playCorrectDing;
export const playLevelUpCelebration = playMinecraftLevelUp;
