export interface ProgressState {
  progress: Record<string, number>; // chId -> highest level completed (0 to 5)
  levelScores?: Record<string, number>; // `${chId}_lvl${lvl}` -> score percent (0 to 100)
}

const UNLOCK_SCORE_THRESHOLD = 75; // 75% accuracy required

/**
 * Checks if a specific level node (1 to 5) is unlocked for a given chapter
 * @param chId e.g. "sci_ch01"
 * @param level 1 to 5
 * @param chapterNum 1 to 13
 * @param subjectId e.g. "sci"
 * @param progressState User's progress state
 */
export function isLevelUnlocked(
  chId: string,
  level: number,
  chapterNum: number,
  subjectId: string,
  progressState: ProgressState
): boolean {
  const { progress = {}, levelScores = {} } = progressState;

  // Chapter 1, Level 1 is always unlocked
  if (chapterNum === 1 && level === 1) {
    return true;
  }

  // If this is Level 1 of Chapter M (M > 1), it requires Chapter (M - 1) Level 5 completed with >= 75%
  if (level === 1 && chapterNum > 1) {
    const prevNumPad = String(chapterNum - 1).padStart(2, '0');
    const prevChId = `${subjectId}_ch${prevNumPad}`;
    const prevHighestLevel = progress[prevChId] || 0;
    
    if (prevHighestLevel >= 5) {
      const prevScore = levelScores[`${prevChId}_lvl5`];
      // If score is recorded, verify threshold; otherwise if progress is 5, it was completed
      return prevScore !== undefined ? prevScore >= UNLOCK_SCORE_THRESHOLD : true;
    }
    return false;
  }

  // For Level N (2 to 5) within the same chapter:
  // Node N requires Node N - 1 completed with >= 75% score
  const prevLevel = level - 1;
  const currentHighest = progress[chId] || 0;

  if (currentHighest >= prevLevel) {
    const prevScore = levelScores[`${chId}_lvl${prevLevel}`];
    return prevScore !== undefined ? prevScore >= UNLOCK_SCORE_THRESHOLD : true;
  }

  return false;
}

/**
 * Check if a level is already completed
 */
export function isLevelCompleted(chId: string, level: number, progressState: ProgressState): boolean {
  const highest = progressState.progress[chId] || 0;
  return highest >= level;
}

/**
 * Check if a chapter is fully mastered (Level 5 cleared) -> Awards Crown
 */
export function hasChapterCrown(chId: string, progressState: ProgressState): boolean {
  return (progressState.progress[chId] || 0) >= 5;
}
