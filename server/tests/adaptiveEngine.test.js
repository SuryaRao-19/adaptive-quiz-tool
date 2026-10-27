const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { updateBKT, categorizeBKTStatus, DEFAULT_BKT_PARAMS } = require('../engine/bktEngine');
const { calculateNextReview, isReviewOverdue, LEITNER_INTERVALS_DAYS } = require('../engine/spacedRepetition');
const { evaluateLearningEvent, calculateNextDifficulty } = require('../engine/adaptiveEngine');

describe('Bayesian Knowledge Tracing (BKT) Engine', () => {
  it('should initialize with default parameters within bounds [0, 1]', () => {
    assert.ok(DEFAULT_BKT_PARAMS.pInit >= 0 && DEFAULT_BKT_PARAMS.pInit <= 1);
    assert.ok(DEFAULT_BKT_PARAMS.pLearn >= 0 && DEFAULT_BKT_PARAMS.pLearn <= 1);
    assert.ok(DEFAULT_BKT_PARAMS.pGuess >= 0 && DEFAULT_BKT_PARAMS.pGuess <= 1);
    assert.ok(DEFAULT_BKT_PARAMS.pSlip >= 0 && DEFAULT_BKT_PARAMS.pSlip <= 1);
  });

  it('should increase mastery probability when response is correct', () => {
    const prior = 0.3;
    const postMastery = updateBKT(prior, true);
    assert.ok(postMastery > prior, `Expected postMastery (${postMastery}) > prior (${prior})`);
    assert.ok(postMastery <= 1.0, 'Mastery should never exceed 1.0');
  });

  it('should decrease or constrain mastery probability when response is incorrect', () => {
    const prior = 0.7;
    const postMastery = updateBKT(prior, false);
    assert.ok(postMastery < prior, `Expected postMastery (${postMastery}) < prior (${prior})`);
    assert.ok(postMastery >= 0.0, 'Mastery should never be negative');
  });

  it('should correctly categorize BKT status', () => {
    assert.equal(categorizeBKTStatus(0.2), 'needs_focus');
    assert.equal(categorizeBKTStatus(0.70), 'in_progress');
    assert.equal(categorizeBKTStatus(0.85), 'mastered');
  });

  it('should handle boundary inputs gracefully without NaN or Inf', () => {
    assert.ok(!Number.isNaN(updateBKT(0, false)));
    assert.ok(!Number.isNaN(updateBKT(1, true)));
    assert.ok(!Number.isNaN(updateBKT(-0.5, true)));
    assert.ok(!Number.isNaN(updateBKT(1.5, false)));
  });
});

describe('Spaced Repetition (Leitner 5-Box) Engine', () => {
  it('should advance to next box on correct answer up to box 5', () => {
    const res1 = calculateNextReview(1, true);
    assert.equal(res1.nextBox, 2);
    assert.equal(res1.intervalDays, LEITNER_INTERVALS_DAYS[2]);

    const res5 = calculateNextReview(5, true);
    assert.equal(res5.nextBox, 5);
  });

  it('should demote to box 1 on incorrect answer', () => {
    const res = calculateNextReview(4, false);
    assert.equal(res.nextBox, 1);
    assert.equal(res.intervalDays, LEITNER_INTERVALS_DAYS[1]);
  });

  it('should accurately detect overdue reviews', () => {
    const pastDate = new Date(Date.now() - 3600 * 1000 * 24 * 2); // 2 days ago
    const futureDate = new Date(Date.now() + 3600 * 1000 * 24 * 2); // in 2 days
    assert.equal(isReviewOverdue(pastDate), true);
    assert.equal(isReviewOverdue(futureDate), false);
    assert.equal(isReviewOverdue(null), true); // Unscheduled review is due
  });
});

describe('Unified Adaptive Learning Engine', () => {
  it('promotes difficulty from easy to medium after 3 consecutive correct answers', () => {
    const state = evaluateLearningEvent({
      currentDifficulty: 'easy',
      isCorrect: true,
      consecutiveCorrect: 2,
      consecutiveIncorrect: 0,
      priorBKTMastery: 0.4,
      currentLeitnerBox: 1
    });

    assert.equal(state.nextDifficulty, 'medium');
    assert.equal(state.consecutiveCorrect, 0); // Reset for next tier
    assert.equal(state.consecutiveIncorrect, 0);
    assert.match(state.reason, /Promoted to medium/);
  });

  it('promotes difficulty from medium to hard after 3 consecutive correct answers', () => {
    const state = evaluateLearningEvent({
      currentDifficulty: 'medium',
      isCorrect: true,
      consecutiveCorrect: 2,
      consecutiveIncorrect: 0,
      priorBKTMastery: 0.6,
      currentLeitnerBox: 2
    });

    assert.equal(state.nextDifficulty, 'hard');
    assert.equal(state.consecutiveCorrect, 0);
    assert.match(state.reason, /Promoted to hard/);
  });

  it('demotes difficulty from hard to medium after 2 consecutive incorrect answers', () => {
    const state = evaluateLearningEvent({
      currentDifficulty: 'hard',
      isCorrect: false,
      consecutiveCorrect: 0,
      consecutiveIncorrect: 1,
      priorBKTMastery: 0.7,
      currentLeitnerBox: 3
    });

    assert.equal(state.nextDifficulty, 'medium');
    assert.equal(state.consecutiveIncorrect, 0);
    assert.match(state.reason, /De-escalated to medium/);
  });

  it('demotes difficulty from medium to easy after 2 consecutive incorrect answers', () => {
    const state = evaluateLearningEvent({
      currentDifficulty: 'medium',
      isCorrect: false,
      consecutiveCorrect: 0,
      consecutiveIncorrect: 1,
      priorBKTMastery: 0.5,
      currentLeitnerBox: 2
    });

    assert.equal(state.nextDifficulty, 'easy');
    assert.equal(state.consecutiveIncorrect, 0);
    assert.match(state.reason, /De-escalated to easy/);
  });

  it('preserves legacy calculateNextDifficulty function for backward compatibility', () => {
    assert.equal(calculateNextDifficulty([true, true, true], 'easy'), 'medium');
    assert.equal(calculateNextDifficulty([false, false], 'hard'), 'medium');
    assert.equal(calculateNextDifficulty([true, false], 'medium'), 'medium');
  });
});
