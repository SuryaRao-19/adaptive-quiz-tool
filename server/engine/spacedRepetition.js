/**
 * Spaced Repetition (Leitner 5-Box) Engine (Phase 6.1)
 * 
 * Provides memory consolidation scheduling separate from summative scoring:
 * - Box 1: Immediate / 1-day interval (Newly introduced or recently missed)
 * - Box 2: 3-day interval
 * - Box 3: 7-day interval
 * - Box 4: 14-day interval
 * - Box 5: 30-day interval (Long-term retention)
 */

const LEITNER_INTERVALS_DAYS = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30
};

/**
 * Calculates next Leitner review box and due date.
 * 
 * @param {number} currentBox - Current Leitner box (1 to 5)
 * @param {boolean} isCorrect - Did student answer correctly during review?
 * @returns {{ nextBox: number, nextReviewDue: Date, intervalDays: number }}
 */
function calculateNextReview(currentBox = 1, isCorrect = false) {
  const box = Math.max(1, Math.min(5, parseInt(currentBox, 10) || 1));

  let nextBox;
  if (isCorrect) {
    // Correct review promotes to next box up to Box 5
    nextBox = Math.min(5, box + 1);
  } else {
    // Incorrect review resets to Box 1 for foundational reinforcement
    nextBox = 1;
  }

  const intervalDays = LEITNER_INTERVALS_DAYS[nextBox] || 1;
  const nextReviewDue = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);

  return {
    nextBox,
    nextReviewDue,
    intervalDays
  };
}

/**
 * Checks if a topic is overdue for review.
 * 
 * @param {Date|string} nextReviewDueDate 
 * @returns {boolean}
 */
function isReviewOverdue(nextReviewDueDate) {
  if (!nextReviewDueDate) return true;
  return new Date(nextReviewDueDate) <= new Date();
}

module.exports = {
  LEITNER_INTERVALS_DAYS,
  calculateNextReview,
  isReviewOverdue
};
