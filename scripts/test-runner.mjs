import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Import lockState functions
import { isLevelUnlocked, isLevelCompleted, hasChapterCrown } from '../lib/lockState.js';
import { getQuestionsForLevel } from '../lib/questionLoader.js';

test('Manifest & Question Schema Verification', async (t) => {
  const manifestPath = path.resolve('./public/data/manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  assert.equal(manifest.subjects.length, 5, 'Must have exactly 5 subjects');

  const sci = manifest.subjects.find(s => s.id === 'sci');
  assert.ok(sci, 'Science subject must exist');
  assert.equal(sci.totalChapters, 13, 'Science must have 13 chapters');

  // Verify Chapter 1 JSON
  const ch1Path = path.resolve('./public/data/science/ch_01.json');
  assert.ok(fs.existsSync(ch1Path), 'Science ch_01.json must exist');

  const ch1Questions = JSON.parse(fs.readFileSync(ch1Path, 'utf-8'));
  assert.ok(Array.isArray(ch1Questions), 'ch_01.json must contain array of questions');
  assert.ok(ch1Questions.length >= 10, 'ch_01.json must have at least 10 questions');

  // Verify ultra-compact tuple keys
  const sampleQ = ch1Questions[0];
  assert.ok('i' in sampleQ, 'Question must have unique ID i');
  assert.ok('d' in sampleQ, 'Question must have difficulty d (1-5)');
  assert.ok('q' in sampleQ, 'Question must have statement q');
  assert.ok('o' in sampleQ && Array.isArray(sampleQ.o), 'Question must have options array o');
  assert.equal(sampleQ.o.length, 4, 'Question must have exactly 4 options');
  assert.ok('a' in sampleQ && typeof sampleQ.a === 'number', 'Question must have 0-indexed answer a');
  assert.ok('e' in sampleQ, 'Question must have explanation e');
});

test('Question Slicing and Difficulty Level Filtering', async (t) => {
  const ch1Path = path.resolve('./public/data/science/ch_01.json');
  const ch1Questions = JSON.parse(fs.readFileSync(ch1Path, 'utf-8'));

  const l1Questions = getQuestionsForLevel(ch1Questions, 1);
  assert.ok(l1Questions.length > 0, 'Level 1 must return questions');
  assert.equal(l1Questions[0].d, 1, 'Level 1 first question should be difficulty 1');

  const l5Questions = getQuestionsForLevel(ch1Questions, 5);
  assert.ok(l5Questions.length > 0, 'Level 5 must return questions');
});

test('Lock/Unlock State Machine: Strict 75% Score Gate', async (t) => {
  // Test 1: Chapter 1, Level 1 is always unlocked
  const emptyState = { progress: {}, levelScores: {} };
  assert.equal(
    isLevelUnlocked('sci_ch01', 1, 1, 'sci', emptyState),
    true,
    'Chapter 1, Level 1 must be unlocked by default'
  );

  // Test 2: Chapter 1, Level 2 is locked if Level 1 is not completed
  assert.equal(
    isLevelUnlocked('sci_ch01', 2, 1, 'sci', emptyState),
    false,
    'Chapter 1, Level 2 must be locked when Level 1 is incomplete'
  );

  // Test 3: Chapter 1, Level 2 is locked if Level 1 score was below 75%
  const failedL1State = {
    progress: { sci_ch01: 1 },
    levelScores: { 'sci_ch01_lvl1': 60 } // only 60%
  };
  assert.equal(
    isLevelUnlocked('sci_ch01', 2, 1, 'sci', failedL1State),
    false,
    'Chapter 1, Level 2 must remain locked if Level 1 score < 75%'
  );

  // Test 4: Chapter 1, Level 2 unlocks if Level 1 score is >= 75%
  const passedL1State = {
    progress: { sci_ch01: 1 },
    levelScores: { 'sci_ch01_lvl1': 80 } // 80% >= 75%
  };
  assert.equal(
    isLevelUnlocked('sci_ch01', 2, 1, 'sci', passedL1State),
    true,
    'Chapter 1, Level 2 must unlock when Level 1 score >= 75%'
  );

  // Test 5: Chapter 2, Level 1 is locked if Chapter 1 Boss (Level 5) is incomplete
  const ch1IncompleteState = {
    progress: { sci_ch01: 4 },
    levelScores: { 'sci_ch01_lvl4': 85 }
  };
  assert.equal(
    isLevelUnlocked('sci_ch02', 1, 2, 'sci', ch1IncompleteState),
    false,
    'Chapter 2, Level 1 must be locked if Chapter 1 Level 5 is incomplete'
  );

  // Test 6: Chapter 2, Level 1 unlocks when Chapter 1 Boss (Level 5) is cleared with >= 75%
  const ch1BossClearedState = {
    progress: { sci_ch01: 5 },
    levelScores: { 'sci_ch01_lvl5': 90 }
  };
  assert.equal(
    isLevelUnlocked('sci_ch02', 1, 2, 'sci', ch1BossClearedState),
    true,
    'Chapter 2, Level 1 must unlock when Chapter 1 Boss is cleared >= 75%'
  );

  // Test 7: Crown awarded on Level 5 completion
  assert.equal(
    hasChapterCrown('sci_ch01', ch1BossClearedState),
    true,
    'Chapter Crown must be awarded when Level 5 is completed'
  );
  assert.equal(
    hasChapterCrown('sci_ch02', ch1BossClearedState),
    false,
    'Chapter Crown must not be awarded if Level 5 is not completed'
  );
});
