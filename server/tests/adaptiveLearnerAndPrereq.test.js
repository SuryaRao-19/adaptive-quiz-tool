/**
 * AdaptIQ 3.0 — Learner Model, Prerequisite Graph & Template Generator Test Suite
 * server/tests/adaptiveLearnerAndPrereq.test.js
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  getDirectPrerequisites,
  getRemedialTrajectory,
  identifyRootPrerequisiteGap
} = require('../services/adaptive/prerequisiteGraph');

const {
  createInitialLearnerProfile,
  recordLearnerAttempt
} = require('../services/adaptive/learnerModel');

const {
  TEMPLATES,
  generateSimilarQuestion
} = require('../services/adaptive/templateQuestionGenerator');

describe('AdaptIQ 3.0 — Prerequisite Graph & Learner Model', () => {
  it('1. Retrieves direct prerequisites for CBSE curriculum topics', () => {
    const prereqs = getDirectPrerequisites('Rational Numbers');
    assert.ok(Array.isArray(prereqs), 'Prerequisites should be an array');
    assert.ok(prereqs.includes('Integer Multiplication'), 'Rational Numbers should depend on Integer Multiplication');
  });

  it('2. Computes transitive remedial trajectory without infinite cycles', () => {
    const trajectory = getRemedialTrajectory('Simple Linear Equations');
    assert.ok(Array.isArray(trajectory), 'Trajectory should be an array');
    assert.ok(trajectory.length >= 2, 'Should have multiple steps in remedial chain');
    assert.ok(trajectory.includes('Rational Numbers'), 'Should include Rational Numbers');
  });

  it('3. Identifies the root prerequisite gap when student mastery is below threshold', () => {
    const struggling = ['Simple Linear Equations'];
    const masteryMap = {
      'Simple Linear Equations': 0.45,
      'Rational Numbers': 0.50, // unmastered foundational gap
      'Integer Multiplication': 0.85,
      'Multiplication Tables': 0.90,
      'Addition with Regrouping': 0.90,
      '3-Digit Numbers & Place Value': 0.90,
      '2-digit numbers': 0.90,
      'Place value basics': 0.90,
      'Fractions & Operations': 0.90
    };

    const gap = identifyRootPrerequisiteGap(struggling, masteryMap);
    assert.ok(gap, 'Should return a gap diagnosis');
    assert.strictEqual(gap.strugglingTargetTopic, 'Simple Linear Equations');
    assert.strictEqual(gap.rootPrerequisite, 'Rational Numbers');
    assert.ok(gap.recommendedAction.includes('Rational Numbers'));
  });

  it('4. Initializes learner profile with valid default metrics', () => {
    const profile = createInitialLearnerProfile({
      studentId: 'std-03-014',
      name: 'Alex Rivera',
      grade: 3
    });

    assert.strictEqual(profile.studentId, 'std-03-014');
    assert.strictEqual(profile.grade, 3);
    assert.strictEqual(profile.totalAttempts, 0);
    assert.strictEqual(profile.totalCorrect, 0);
    assert.strictEqual(profile.currentStreak, 0);
  });

  it('5. Updates BKT mastery, streak and Rasch theta upon correct learner response', () => {
    const initial = createInitialLearnerProfile({ studentId: 'std-07-001', grade: 7 });
    const updated = recordLearnerAttempt(initial, {
      topic: 'Integer Multiplication',
      isCorrect: true,
      itemDifficulty: 'medium'
    });

    assert.strictEqual(updated.totalAttempts, 1);
    assert.strictEqual(updated.totalCorrect, 1);
    assert.strictEqual(updated.currentStreak, 1);
    assert.ok(updated.topicMastery['Integer Multiplication'].mastery > 0.50, 'Mastery should increase');
  });

  it('6. Partitions weak vs mastered topics and attaches remedial recommendation', () => {
    let profile = createInitialLearnerProfile({ studentId: 'std-10-008', grade: 10 });
    
    // 3 failed attempts on Quadratic Equations
    for (let i = 0; i < 3; i++) {
      profile = recordLearnerAttempt(profile, {
        topic: 'Quadratic Equations',
        isCorrect: false,
        itemDifficulty: 'hard'
      });
    }

    assert.strictEqual(profile.totalAttempts, 3);
    assert.strictEqual(profile.totalCorrect, 0);
    assert.ok(profile.weakTopics.includes('Quadratic Equations'), 'Should flag Quadratic Equations as weak');
    assert.ok(profile.remedialRecommendations.length > 0, 'Should generate evidence-grounded recommendation');
  });

  it('7. Deterministic template generator produces valid 4-option math questions', () => {
    const q3 = TEMPLATES['g3-addition'].generate(12345);
    assert.strictEqual(q3.grade, 3);
    assert.strictEqual(q3.options.length, 4, 'Must have exactly 4 options');
    const unique3 = new Set(q3.options);
    assert.strictEqual(unique3.size, 4, 'Options must be unique');
    assert.strictEqual(q3.options[q3.correctAnswerIndex], q3.correctAnswer);
    assert.ok(q3.workedSolution.steps.length >= 2, 'Must have worked solution steps');

    const q10 = TEMPLATES['g10-ohms-law'].generate(67890);
    assert.strictEqual(q10.grade, 10);
    assert.strictEqual(q10.options.length, 4);
    assert.strictEqual(new Set(q10.options).size, 4);
    assert.strictEqual(q10.options[q10.correctAnswerIndex], q10.correctAnswer);
  });

  it('8. generateSimilarQuestion dynamically creates age-appropriate question variant', () => {
    const baseG3 = { gradeLevel: 3, topic: 'Addition with Regrouping' };
    const similarG3 = generateSimilarQuestion(baseG3);
    assert.strictEqual(similarG3.grade, 3);
    assert.strictEqual(similarG3.options.length, 4);

    const baseG10 = { gradeLevel: 10, topic: 'Electricity and Ohm\'s Law' };
    const similarG10 = generateSimilarQuestion(baseG10);
    assert.strictEqual(similarG10.grade, 10);
    assert.strictEqual(similarG10.options.length, 4);
  });
});
