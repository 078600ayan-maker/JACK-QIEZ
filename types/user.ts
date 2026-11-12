import { AvatarCustomization } from './avatar';

export interface SpacedMistakeItem {
  questionId: number;
  subjectId: string;
  chapterId: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  userWrongAnswer: number;
  explanation: string;
  boxLevel: number; // Leitner Box 1 (1 day), 2 (3 days), 3 (7 days), 4 (14 days), 5 (Mastered)
  lastReviewed: string; // ISO timestamp
  nextReviewDue: string; // ISO timestamp
  reviewCount: number;
}

export interface SpeedDrillRecord {
  id: string;
  timestamp: string;
  subjectId: string;
  subjectTitle: string;
  score: number;
  totalAnswered: number;
  accuracy: number;
  earnedXp: number;
}

export interface UserProfile {
  uid: string;
  name: string;
  displayName?: string;
  email: string;
  photoURL?: string;
  languagePreference?: 'hi' | 'en';
  oreRank?: string; // 'Coal' | 'Copper' | 'Iron' | 'Gold' | 'Redstone' | 'Lapis' | 'Diamond' | 'Emerald' | 'Amethyst' | 'Netherite'
  oreRankScore?: number;
  currentStreak?: number;
  connectedFriends?: string[];
  updatedAt?: string;
  avatarId?: string; // Minecraft Steve/Eve or Pompi variant
  customAvatar?: AvatarCustomization;
  xp: number;
  streak: number;
  streakShieldActive?: boolean;
  lastActive: string; // YYYY-MM-DD
  hearts: number; // 0 to 5
  isRealUser?: boolean;
  progress: Record<string, number>; // e.g., { "sci_ch01": 5, "sci_ch02": 2 }
  levelScores?: Record<string, number>; // e.g., { "sci_ch01_lvl1": 90 }
  mistakes: number[]; // legacy ID array
  detailedMistakes?: SpacedMistakeItem[]; // Upgraded Spaced Repetition items
  drillHistory?: SpeedDrillRecord[]; // Firebase synced drills
  offlineCachedSubjects?: string[];
  firstName?: string;
  lastName?: string;
  username?: string;
  usernameLower?: string;
  nameLower?: string;
  bio?: string;
  role?: string;
  age?: number;
  onboardingComplete?: boolean;
  studyGoals?: {
    targetScore: string;
    dailyGoal: string;
    focusSubject: string;
  };
  followersUids?: string[];
  followingUids?: string[];
  followersCount?: number;
  followingCount?: number;
  dailyCallCredits?: number;
  dailyCallCreditsDate?: string;
  lastGiftClaimDate?: string;
  duelWins?: number;
  duelPlayed?: number;
  isAnonymous?: boolean;
  isOnline?: boolean;
  lastSeenAt?: string;
  emailLower?: string;
  trustScore?: number;
  rankedDuelsEnabled?: boolean;
  recentOpponentUids?: string[];
  activeDates?: string[];
  longestStreak?: number;
  streakFreezes?: number;
  classLevel?: string;
  joinedAt?: string;
  weeklyXp?: number;
}
