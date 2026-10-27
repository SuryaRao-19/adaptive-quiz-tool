const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('Assessment Integrity & Event Architecture', () => {
  it('deduplicates submissions with the same eventId', () => {
    const existingEvents = new Set();
    const event1 = { eventId: 'evt-unique-uuid-1', questionId: 'q1', isCorrect: true };
    const event2Duplicate = { eventId: 'evt-unique-uuid-1', questionId: 'q1', isCorrect: true };
    const event3New = { eventId: 'evt-unique-uuid-2', questionId: 'q2', isCorrect: false };

    const processSubmission = (event) => {
      if (existingEvents.has(event.eventId)) {
        return { status: 'duplicate_ignored', eventId: event.eventId };
      }
      existingEvents.add(event.eventId);
      return { status: 'recorded', eventId: event.eventId };
    };

    const res1 = processSubmission(event1);
    assert.equal(res1.status, 'recorded');

    const res2 = processSubmission(event2Duplicate);
    assert.equal(res2.status, 'duplicate_ignored');

    const res3 = processSubmission(event3New);
    assert.equal(res3.status, 'recorded');

    assert.equal(existingEvents.size, 2);
  });

  it('enforces Socratic AI Tutor disablement when a summative test is active', () => {
    const checkTutorEligibility = (isSummativeActive) => {
      if (isSummativeActive) {
        return {
          allowed: false,
          statusCode: 403,
          error: 'Socratic AI assistance is strictly disabled during active standardized assessments.'
        };
      }
      return { allowed: true, statusCode: 200 };
    };

    const inTest = checkTutorEligibility(true);
    assert.equal(inTest.allowed, false);
    assert.equal(inTest.statusCode, 403);
    assert.match(inTest.error, /disabled during active standardized assessments/);

    const inPractice = checkTutorEligibility(false);
    assert.equal(inPractice.allowed, true);
    assert.equal(inPractice.statusCode, 200);
  });

  it('categorizes Confidence-Based Marking correctly without mutating raw correctness', () => {
    const categorizeConfidence = (isCorrect, confidence) => {
      if (isCorrect && confidence === 'very_sure') return 'mastered_confident';
      if (isCorrect && confidence === 'guessing') return 'lucky_guess_needs_reinforcement';
      if (!isCorrect && confidence === 'very_sure') return 'dangerous_misconception';
      if (!isCorrect && confidence === 'guessing') return 'expected_gap';
      return 'moderate_understanding';
    };

    assert.equal(categorizeConfidence(true, 'very_sure'), 'mastered_confident');
    assert.equal(categorizeConfidence(true, 'guessing'), 'lucky_guess_needs_reinforcement');
    assert.equal(categorizeConfidence(false, 'very_sure'), 'dangerous_misconception');
    assert.equal(categorizeConfidence(false, 'guessing'), 'expected_gap');
  });

  it('enforces 50 completed practice questions requirement before unlocking summative post-test', () => {
    const PRACTICE_THRESHOLD = 50;
    const canTakeSummativePostTest = (completedPracticeCount) => {
      return completedPracticeCount >= PRACTICE_THRESHOLD;
    };

    assert.equal(canTakeSummativePostTest(12), false);
    assert.equal(canTakeSummativePostTest(49), false);
    assert.equal(canTakeSummativePostTest(50), true);
    assert.equal(canTakeSummativePostTest(75), true);
  });
});
