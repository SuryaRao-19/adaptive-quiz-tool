/**
 * AdaptIQ 3.0 — Comprehensive Adaptive Learning Engine Test Suite
 * server/tests/adaptiveEngineV3.test.js
 * 
 * Verifies:
 * - Bayesian Knowledge Tracing (BKT) updates
 * - Rasch Item Response Theory (IRT) probability & ability estimation
 * - Hake's normalized gain metric
 * - 3-up / 2-down difficulty transitions & streak evaluation
 * - Question selection with exposure history & blueprint locking
 * - Leitner 5-box spaced repetition intervals & promotion/demotion
 * - Misconception diagnostics with >= 2 occurrence threshold
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const {
  updateMasteryBKT,
  evaluateDifficultyTransition,
  calculateRaschProbability,
  estimateAbilityRasch,
  calculateHakeGain,
  selectNextQuestion,
  processCardReview,
  generateRevisionSchedule,
  evaluateLearningGaps,
  diagnoseResponse
} = require('../services/adaptive');

describe('AdaptIQ 3.0 — Deterministic Adaptive Engine', () => {

  test('1. BKT updates mastery upward on correct answer and downward on incorrect answer', () => {
    const prior = 0.5;
    const correctRes = updateMasteryBKT(prior, true);
    assert.ok(correctRes.newMastery > prior, 'Correct answer must increase mastery');
    assert.strictEqual(correctRes.status, 'MASTERED');

    const incorrectRes = updateMasteryBKT(prior, false);
    assert.ok(incorrectRes.newMastery < prior, 'Incorrect answer must decrease mastery');
    assert.strictEqual(incorrectRes.status, 'NEEDS_PRACTICE');
  });

  test('2. Rasch IRT calculates exact sigmoid probability and estimates ability theta', () => {
    // When ability theta equals difficulty b, probability is exactly 0.5
    const pEqual = calculateRaschProbability(0, 0);
    assert.strictEqual(pEqual, 0.5);

    // High ability vs low difficulty yields high probability
    const pHigh = calculateRaschProbability(2.0, -1.0);
    assert.ok(pHigh > 0.9, 'High ability on easy question should exceed 90% probability');

    // Low ability vs high difficulty yields low probability
    const pLow = calculateRaschProbability(-2.0, 2.0);
    assert.ok(pLow < 0.1, 'Low ability on hard question should be below 10% probability');

    // Ability estimation from responses
    const thetaEstimate = estimateAbilityRasch(8, 10);
    assert.ok(thetaEstimate > 0, '8/10 score must yield positive latent ability theta');
  });

  test('3. Hake normalized learning gain conforms to educational research bands', () => {
    // High gain: g >= 0.7
    const highGain = calculateHakeGain(30, 85, 100);
    assert.strictEqual(highGain.category, 'HIGH_GAIN');
    assert.ok(highGain.g >= 0.7);

    // Medium gain: 0.3 <= g < 0.7
    const medGain = calculateHakeGain(40, 70, 100);
    assert.strictEqual(medGain.category, 'MEDIUM_GAIN');
    assert.ok(medGain.g >= 0.3 && medGain.g < 0.7);

    // Low gain: g < 0.3
    const lowGain = calculateHakeGain(50, 60, 100);
    assert.strictEqual(lowGain.category, 'LOW_GAIN');
  });

  test('4. Streak calibration enforces 3-up promotion and 2-down demotion rule', () => {
    // 3 consecutive correct -> Promote
    const promo = evaluateDifficultyTransition([true, true, true], 'medium');
    assert.strictEqual(promo.recommendedDifficulty, 'hard');
    assert.strictEqual(promo.action, 'PROMOTE');
    assert.ok(promo.decisionReason.includes('3 consecutive correct'));

    // Top boundary constraint (cannot promote past very_hard)
    const topCap = evaluateDifficultyTransition([true, true, true], 'very_hard');
    assert.strictEqual(topCap.recommendedDifficulty, 'very_hard');
    assert.strictEqual(topCap.action, 'MAINTAIN');

    // 2 consecutive wrong -> Demote
    const demo = evaluateDifficultyTransition([false, false], 'medium');
    assert.strictEqual(demo.recommendedDifficulty, 'easy');
    assert.strictEqual(demo.action, 'DEMOTE');
    assert.ok(demo.decisionReason.includes('2 consecutive incorrect'));

    // Bottom boundary constraint (cannot demote below easy)
    const bottomCap = evaluateDifficultyTransition([false, false], 'easy');
    assert.strictEqual(bottomCap.recommendedDifficulty, 'easy');
    assert.strictEqual(bottomCap.action, 'MAINTAIN');
  });

  test('5. Question Selector filters exposure history and prevents duplicates', () => {
    const candidates = [
      { _id: 'q1', id: 'q1', text: 'Question 1', difficulty: 'medium', topic: 'Algebra', grade: '10', subject: 'Mathematics' },
      { _id: 'q2', id: 'q2', text: 'Question 2', difficulty: 'medium', topic: 'Algebra', grade: '10', subject: 'Mathematics' },
      { _id: 'q3', id: 'q3', text: 'Question 3', difficulty: 'hard', topic: 'Algebra', grade: '10', subject: 'Mathematics' }
    ];

    // Exclude already answered question q1
    const selection = selectNextQuestion({
      availableQuestions: candidates,
      studentHistory: ['q1'],
      currentDifficulty: 'medium',
      targetGrade: '10',
      targetSubject: 'Mathematics',
      targetTopic: 'Algebra'
    });

    assert.strictEqual(selection.selectedQuestion.id, 'q2');
    assert.strictEqual(selection.selectedQuestion.difficulty, 'medium');
  });

  test('6. Formal Blueprint locking strictly preserves summative assessment blueprints', () => {
    const candidates = [
      { _id: 'q_easy', id: 'q_easy', difficulty: 'easy', grade: '10', subject: 'Science' },
      { _id: 'q_hard', id: 'q_hard', difficulty: 'hard', grade: '10', subject: 'Science' }
    ];

    // Blueprint mandates hard difficulty regardless of student current medium difficulty
    const selection = selectNextQuestion({
      availableQuestions: candidates,
      studentHistory: [],
      currentDifficulty: 'easy',
      targetGrade: '10',
      targetSubject: 'Science',
      isSummativeBlueprint: true,
      blueprintTarget: { difficulty: 'hard', topic: 'Optics' }
    });

    assert.strictEqual(selection.selectedQuestion.id, 'q_hard');
    assert.strictEqual(selection.isFormalLocked, true);
    assert.ok(selection.selectionReason.includes('FORMAL_BLUEPRINT_LOCKED'));
  });

  test('7. Spaced repetition engine executes Leitner 5-box intervals, promotion & demotion', () => {
    const card = { id: 'c1', box: 1, streak: 0, topic: 'Quadratic Equations' };

    // Correct review promotes from Box 1 to Box 2
    const promoted = processCardReview(card, true);
    assert.strictEqual(promoted.box, 2);
    assert.strictEqual(promoted.movement, 'PROMOTED');
    assert.strictEqual(promoted.streak, 1);

    // Box 4 review correct promotes to Box 5 (Mastered)
    const card4 = { id: 'c4', box: 4, streak: 3 };
    const mastered = processCardReview(card4, true);
    assert.strictEqual(mastered.box, 5);
    assert.strictEqual(mastered.isMastered, true);

    // Incorrect review demotes back to Box 1
    const demoted = processCardReview({ id: 'c5', box: 5, streak: 5 }, false);
    assert.strictEqual(demoted.box, 1);
    assert.strictEqual(demoted.movement, 'DEMOTED_TO_BOX_1');
    assert.strictEqual(demoted.streak, 0);
  });

  test('8. Spaced repetition scheduler accurately computes dueToday, upcoming, overdue, and weakTopics', () => {
    const now = Date.now();
    const cards = [
      { id: 'c1', box: 1, topic: 'Fractions', lastScore: 0, nextReviewDate: new Date(now - 10000).toISOString() },
      { id: 'c2', box: 1, topic: 'Fractions', lastScore: 0, nextReviewDate: new Date(now - 100000).toISOString() },
      { id: 'c3', box: 3, topic: 'Acids and Bases', lastScore: 1, nextReviewDate: new Date(now + 2 * 24 * 60 * 60 * 1000).toISOString() }
    ];

    const schedule = generateRevisionSchedule(cards);
    assert.ok(schedule.summary.dueTodayCount >= 2);
    assert.strictEqual(schedule.summary.upcomingCount, 1);

    // Fractions topic has 100% error rate across 2 cards, so it must trigger weak topic detection
    assert.ok(schedule.weakTopics.some(w => w.topic === 'Fractions'));
  });

  test('9. Misconception engine confirms diagnostic gap only upon meeting >= 2 occurrence threshold', () => {
    // Single error: should NOT confirm misconception yet
    const singleAttempt = [
      { questionId: 'q1', isCorrect: false, misconceptionTag: 'sign_distribution_error', topic: 'Algebra' }
    ];
    const singleResult = evaluateLearningGaps(singleAttempt);
    assert.strictEqual(singleResult.confirmedMisconceptionCount, 0, 'Single error must not confirm misconception');

    // Two consistent errors on same tag: MUST confirm misconception
    const doubleAttempt = [
      { questionId: 'q1', isCorrect: false, misconceptionTag: 'sign_distribution_error', topic: 'Algebra' },
      { questionId: 'q2', isCorrect: false, misconceptionTag: 'sign_distribution_error', topic: 'Algebra' }
    ];
    const doubleResult = evaluateLearningGaps(doubleAttempt);
    assert.strictEqual(doubleResult.confirmedMisconceptionCount, 1, 'Two consistent errors must confirm misconception');
    assert.strictEqual(doubleResult.confirmedGaps[0].tag, 'sign_distribution_error');
    assert.ok(doubleResult.remediationQueue.length > 0);
  });
});
