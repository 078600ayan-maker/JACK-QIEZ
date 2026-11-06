import { create } from 'zustand';
import { Question } from '@/types/question';
import { playCorrectSound, playWrongSound, playClickSound, playVictoryFanfare } from '@/lib/audioEngine';

export interface QuizState {
  questions: Question[];
  currentIndex: number;
  level: number;
  chapterId: string;
  chapterName: string;
  subjectId: string;
  
  // Gameplay State
  selectedOption: number | null;
  isAnswerSubmitted: boolean;
  isCorrect: boolean | null;
  scoreCount: number;
  earnedXp: number;
  hearts: number;
  maxHearts: number;
  eliminatedOptions: number[]; // 50:50 lifeline
  mistakeIdsInSession: number[];
  
  // Streak & Multipliers
  comboStreak: number;
  maxCombo: number;
  
  // Timer
  timerSeconds: number;
  initialTimerSeconds: number;
  isTimerActive: boolean;

  // Status
  isFinished: boolean;
  isFailed: boolean;
  isBossLevel: boolean;

  // Actions
  startQuiz: (params: {
    questions: Question[];
    level: number;
    chapterId: string;
    chapterName: string;
    subjectId: string;
    userHearts?: number;
  }) => void;
  selectOption: (index: number) => void;
  submitAnswer: () => void;
  nextQuestion: () => void;
  tickTimer: () => void;
  useFiftyFifty: () => boolean;
  restartQuiz: () => void;
  updateQuestions: (questions: Question[]) => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  questions: [],
  currentIndex: 0,
  level: 1,
  chapterId: '',
  chapterName: '',
  subjectId: 'sci',

  selectedOption: null,
  isAnswerSubmitted: false,
  isCorrect: null,
  scoreCount: 0,
  earnedXp: 0,
  hearts: 5,
  maxHearts: 5,
  eliminatedOptions: [],
  mistakeIdsInSession: [],

  comboStreak: 0,
  maxCombo: 0,

  timerSeconds: 0,
  initialTimerSeconds: 0,
  isTimerActive: false,

  isFinished: false,
  isFailed: false,
  isBossLevel: false,

  updateQuestions: (questions: Question[]) => set({ questions }),

  startQuiz: ({ questions, level, chapterId, chapterName, subjectId, userHearts = 5 }) => {
    const isBoss = level === 5;
    // Timer per question based on level
    let timePerQ = 0;
    if (level === 2) timePerQ = 30;
    else if (level === 3) timePerQ = 20;
    else if (level === 4) timePerQ = 15;
    else if (level === 5) timePerQ = 12;

    const initialHearts = isBoss ? 3 : Math.min(5, Math.max(1, userHearts));

    set({
      questions,
      currentIndex: 0,
      level,
      chapterId,
      chapterName,
      subjectId,
      selectedOption: null,
      isAnswerSubmitted: false,
      isCorrect: null,
      scoreCount: 0,
      earnedXp: 0,
      hearts: initialHearts,
      maxHearts: initialHearts,
      eliminatedOptions: [],
      mistakeIdsInSession: [],
      comboStreak: 0,
      maxCombo: 0,
      timerSeconds: timePerQ,
      initialTimerSeconds: timePerQ,
      isTimerActive: timePerQ > 0,
      isFinished: false,
      isFailed: false,
      isBossLevel: isBoss
    });
  },

  selectOption: (index: number) => {
    const { isAnswerSubmitted, eliminatedOptions } = get();
    if (isAnswerSubmitted || eliminatedOptions.includes(index)) return;
    playClickSound();
    set({ selectedOption: index });
  },

  submitAnswer: () => {
    const { questions, currentIndex, selectedOption, isAnswerSubmitted, hearts, comboStreak, maxCombo, earnedXp, scoreCount, mistakeIdsInSession, level } = get();
    if (isAnswerSubmitted || selectedOption === null) return;

    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const correct = selectedOption === currentQ.a;

    if (correct) {
      playCorrectSound();
      const newCombo = comboStreak + 1;
      let multiplier = 1.0;
      if (newCombo >= 10) multiplier = 3.0;
      else if (newCombo >= 5) multiplier = 2.0;
      else if (newCombo >= 3) multiplier = 1.5;

      const baseQuestionXp = currentQ.d === 1 ? 5 : currentQ.d === 2 ? 8 : currentQ.d === 3 ? 12 : currentQ.d === 4 ? 15 : 20;
      const questionGain = Math.round(baseQuestionXp * multiplier);

      set({
        isAnswerSubmitted: true,
        isCorrect: true,
        isTimerActive: false,
        scoreCount: scoreCount + 1,
        comboStreak: newCombo,
        maxCombo: Math.max(maxCombo, newCombo),
        earnedXp: earnedXp + questionGain
      });
    } else {
      playWrongSound();
      const newHearts = hearts - 1;
      const isNowFailed = newHearts <= 0;

      set({
        isAnswerSubmitted: true,
        isCorrect: false,
        isTimerActive: false,
        hearts: Math.max(0, newHearts),
        comboStreak: 0,
        mistakeIdsInSession: [...mistakeIdsInSession, currentQ.i],
        isFailed: isNowFailed
      });
    }
  },

  nextQuestion: () => {
    const { questions, currentIndex, hearts, initialTimerSeconds } = get();
    playClickSound();

    if (hearts <= 0) {
      set({ isFailed: true, isFinished: true });
      return;
    }

    const nextIdx = currentIndex + 1;
    if (nextIdx >= questions.length) {
      playVictoryFanfare();
      set({ isFinished: true, isTimerActive: false });
    } else {
      set({
        currentIndex: nextIdx,
        selectedOption: null,
        isAnswerSubmitted: false,
        isCorrect: null,
        eliminatedOptions: [],
        timerSeconds: initialTimerSeconds,
        isTimerActive: initialTimerSeconds > 0
      });
    }
  },

  tickTimer: () => {
    const { timerSeconds, isTimerActive, isAnswerSubmitted, submitAnswer } = get();
    if (!isTimerActive || isAnswerSubmitted) return;

    if (timerSeconds <= 1) {
      // Time up -> count as wrong answer
      set({ selectedOption: -1 }); // None selected
      submitAnswer();
    } else {
      set({ timerSeconds: timerSeconds - 1 });
    }
  },

  useFiftyFifty: () => {
    const { questions, currentIndex, isAnswerSubmitted, eliminatedOptions } = get();
    if (isAnswerSubmitted || eliminatedOptions.length > 0) return false;

    const currentQ = questions[currentIndex];
    if (!currentQ) return false;

    // Pick 2 incorrect options to eliminate
    const wrongIndices = [0, 1, 2, 3].filter(idx => idx !== currentQ.a);
    // Shuffle and pick 2
    const toEliminate = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);

    playClickSound();
    set({ eliminatedOptions: toEliminate });
    return true;
  },

  restartQuiz: () => {
    const { questions, level, chapterId, chapterName, subjectId, maxHearts } = get();
    get().startQuiz({ questions, level, chapterId, chapterName, subjectId, userHearts: maxHearts });
  }
}));
