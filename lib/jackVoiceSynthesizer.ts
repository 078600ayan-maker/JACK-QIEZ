'use client';

/**
 * Phase 2 Hybrid TTS Voice Core: JackVoiceSynthesizer
 * Robotic girl-child audio timbre for drills and Hinglish encouragement.
 * Pitch: 1.45, Rate: 1.08
 */
export class JackVoiceSynthesizer {
  synth: SpeechSynthesis | null = null;
  voice: SpeechSynthesisVoice | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoice();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoice();
      }
    }
  }

  loadVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prioritize high-quality female Indian English or Hindi child/natural voices
    this.voice =
      voices.find(
        v =>
          (v.lang.includes('hi-IN') || v.lang.includes('en-IN')) &&
          (v.name.includes('Female') || v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Komal'))
      ) ||
      voices.find(v => v.lang.includes('hi') || v.lang.includes('en-IN')) ||
      voices[0] ||
      null;
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
  }

  /**
   * Questions read strictly in the selected language ('hi' -> hi-IN, 'en' -> en-IN)
   * Timbre: Pitch 1.45, Rate 1.08 (clear robotic girl-child tone)
   */
  speakQuestion(text: string, lang: 'hi' | 'en' = 'hi') {
    if (this.isMuted) return;
    // Clean markdown, brackets, or math formatting for clear speech
    const cleaned = text
      .replace(/[*_#`~]/g, '')
      .replace(/\(Level \d+\)/gi, '')
      .trim();
    this.emit(cleaned, lang === 'hi' ? 'hi-IN' : 'en-IN', 1.45, 1.08);
  }

  /**
   * Natural Hinglish praise and encouragement
   * Timbre: Pitch 1.55, Rate 1.15 (enthusiastic robotic girl-child tone)
   */
  cheerMotivational(type: 'correct' | 'streak') {
    if (this.isMuted) return;
    const bank = {
      correct: [
        'Superb meri jaan, you nailed it!',
        'Wah! Gazab answer diya!',
        'Shaandar speed!'
      ],
      streak: [
        'Unstoppable ho gaye ho meri jaan!',
        '5 streak bonus unlocked! Aag laga di!'
      ]
    };
    const phrases = bank[type] || bank.correct;
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    this.emit(phrase, 'hi-IN', 1.55, 1.15);
  }

  speakHinglish(phrase: string) {
    if (this.isMuted) return;
    this.emit(phrase, 'hi-IN', 1.55, 1.15);
  }

  emit(text: string, lang: string, pitch: number, rate: number) {
    if (!this.synth || this.isMuted) return;
    try {
      if (this.synth.speaking) this.synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (this.voice) u.voice = this.voice;
      u.lang = lang;
      u.pitch = pitch;
      u.rate = rate;
      this.synth.speak(u);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }

  cancel() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
  }
}

// Global Singleton
let voiceInstance: JackVoiceSynthesizer | null = null;
export function getJackVoice(): JackVoiceSynthesizer {
  if (!voiceInstance) {
    voiceInstance = new JackVoiceSynthesizer();
  }
  return voiceInstance;
}
