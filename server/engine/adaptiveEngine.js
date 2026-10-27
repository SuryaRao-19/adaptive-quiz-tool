const { updateBKT, categorizeBKTStatus } = require('./bktEngine');
const { calculateNextReview } = require('./spacedRepetition');

/**
 * Enhanced Adaptive Difficulty Calibration Engine (Phase 5)
 * 
 * Supports:
 * 1. Rule-based streak evaluation (3 correct -> Promote, 2 wrong -> Demote)
 * 2. Bayesian Knowledge Tracing (BKT) mastery tracking
 * 3. Spaced repetition review integration
 * 4. Metacognitive confidence-weighted analysis
 * 5. Decision explainability audit trail
 */

const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard', 'very_hard'];

/**
 * Legacy difficulty adjustment rule based on consecutive answer array.
 * Retained for zero-regression backward compatibility.
 */
function calculateNextDifficulty(recentAnswers = [], currentDifficulty = 'medium') {
  let currentIndex = DIFFICULTY_LEVELS.indexOf(currentDifficulty);
  if (currentIndex === -1) currentIndex = 1; // Default to 'medium'

  const total = recentAnswers.length;
  if (total === 0) return currentDifficulty;

  // 3 consecutive correct -> Promote
  if (
    total >= 3 &&
    recentAnswers[total - 1] === true &&
    recentAnswers[total - 2] === true &&
    recentAnswers[total - 3] === true
  ) {
    if (currentIndex < DIFFICULTY_LEVELS.length - 1) {
      return DIFFICULTY_LEVELS[currentIndex + 1];
    }
  }

  // 2 consecutive wrong -> Demote
  if (
    total >= 2 &&
    recentAnswers[total - 1] === false &&
    recentAnswers[total - 2] === false
  ) {
    if (currentIndex > 0) {
      return DIFFICULTY_LEVELS[currentIndex - 1];
    }
  }

  return currentDifficulty;
}

/**
 * Comprehensive learning-event evaluation.
 * Computes updated BKT mastery, difficulty calibration, Leitner box, and auditable reason.
 * 
 * @param {object} params
 * @param {boolean} params.isCorrect - Response correctness
 * @param {string} params.currentDifficulty - 'easy' | 'medium' | 'hard' | 'very_hard'
 * @param {number} params.consecutiveCorrect - Existing streak
 * @param {number} params.consecutiveIncorrect - Existing mistake streak
 * @param {number} params.priorBKTMastery - Existing BKT mastery probability
 * @param {number} params.currentLeitnerBox - Existing Leitner box (1-5)
 * @param {string} [params.confidence] - 'guessing' | 'somewhat_sure' | 'very_sure'
 * @returns {object} Updated mastery state, difficulty, and auditable explanation
 */
function evaluateLearningEvent({
  isCorrect,
  currentDifficulty = 'medium',
  consecutiveCorrect = 0,
  consecutiveIncorrect = 0,
  priorBKTMastery = 0.20,
  currentLeitnerBox = 1,
  confidence = 'unspecified'
}) {
  let updatedCorrectStreak = isCorrect ? consecutiveCorrect + 1 : 0;
  let updatedIncorrectStreak = isCorrect ? 0 : consecutiveIncorrect + 1;

  let nextDifficulty = currentDifficulty;
  let reason = 'Difficulty maintained: consistent learning zone.';

  let currentIndex = DIFFICULTY_LEVELS.indexOf(currentDifficulty);
  if (currentIndex === -1) currentIndex = 1;

  // Rule 1: 3 consecutive correct answers -> Promote
  if (updatedCorrectStreak >= 3) {
    if (currentIndex < DIFFICULTY_LEVELS.length - 1) {
      nextDifficulty = DIFFICULTY_LEVELS[currentIndex + 1];
      reason = `Promoted to ${nextDifficulty} due to streak of ${updatedCorrectStreak} correct answers.`;
      updatedCorrectStreak = 0; // Reset streak upon promotion to begin next tier evaluation
    } else {
      reason = 'Maintained at highest difficulty tier (very hard) with demonstrated mastery.';
    }
  }
  // Rule 2: 2 consecutive incorrect answers -> Demote to build confidence
  else if (updatedIncorrectStreak >= 2) {
    if (currentIndex > 0) {
      nextDifficulty = DIFFICULTY_LEVELS[currentIndex - 1];
      reason = `De-escalated to ${nextDifficulty} to reinforce foundational concepts after repeated errors.`;
      updatedIncorrectStreak = 0;
    } else {
      reason = 'Maintained at foundational level (easy) to reinforce core principles.';
    }
  }

  // Bayesian Knowledge Tracing Update
  const updatedBKT = updateBKT(priorBKTMastery, isCorrect);
  const status = categorizeBKTStatus(updatedBKT);

  // Spaced Repetition Leitner Box Update
  const { nextBox, nextReviewDue, intervalDays } = calculateNextReview(currentLeitnerBox, isCorrect);

  // Metacognitive Misconception Flag: Incorrect response with high confidence
  const isHighConfidenceMisconception = !isCorrect && confidence === 'very_sure';

  return {
    nextDifficulty,
    consecutiveCorrect: updatedCorrectStreak,
    consecutiveIncorrect: updatedIncorrectStreak,
    bktMastery: updatedBKT,
    status,
    leitnerBox: nextBox,
    nextReviewDue,
    intervalDays,
    isHighConfidenceMisconception,
    reason
  };
}

module.exports = {
  DIFFICULTY_LEVELS,
  calculateNextDifficulty,
  evaluateLearningEvent
};
