/**
 * Misconception Intelligence Engine QA Test Suite
 * Validates Section 20 of AdaptIQ 2.0 Master Specification
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');

const {
  MISCONCEPTION_TAXONOMY,
  analyzeStudentMisconceptions,
  analyzeClassroomMisconceptions
} = require('../services/misconceptionService');

describe('Misconception Intelligence Engine (Section 20)', () => {

  it('rejects single isolated errors to prevent false-positive misconception diagnosis', () => {
    const history = [
      {
        questionId: 'q-math-01',
        topic: 'Rational Numbers',
        isCorrect: false,
        misconceptionTag: 'sign_distribution_error'
      },
      {
        questionId: 'q-math-02',
        topic: 'Rational Numbers',
        isCorrect: true
      }
    ];

    const result = analyzeStudentMisconceptions('std-01', { history, subject: 'Mathematics' });
    assert.strictEqual(result.hasDiagnosedIssues, false);
    assert.strictEqual(result.diagnosedMisconceptions.length, 0);
    assert.ok(result.summary.includes('Isolated errors observed'));
  });

  it('confirms misconception diagnosis when >= 2 repeated errors occur with evidence & confidence', () => {
    const history = [
      {
        questionId: 'q-math-01',
        topic: 'Rational Numbers',
        isCorrect: false,
        misconceptionTag: 'sign_distribution_error'
      },
      {
        questionId: 'q-math-02',
        topic: 'Rational Numbers',
        isCorrect: true
      },
      {
        questionId: 'q-math-03',
        topic: 'Rational Numbers',
        isCorrect: false,
        misconceptionTag: 'sign_distribution_error'
      }
    ];

    const result = analyzeStudentMisconceptions('std-01', { history, subject: 'Mathematics' });
    assert.strictEqual(result.hasDiagnosedIssues, true);
    assert.strictEqual(result.diagnosedMisconceptions.length, 1);

    const m = result.diagnosedMisconceptions[0];
    assert.strictEqual(m.tag, 'sign_distribution_error');
    assert.strictEqual(m.category, MISCONCEPTION_TAXONOMY.CONCEPTUAL_MISUNDERSTANDING);
    assert.strictEqual(m.occurrencesCount, 2);
    assert.ok(m.confidence >= 0.65);
    assert.ok(m.evidence.includes('2 independent questions'));
    assert.ok(m.remedialRecommendation.includes('distributive law'));
    assert.ok(m.recommendedPracticeFilter !== undefined);
  });

  it('accurately distinguishes prerequisite deficits from calculation errors', () => {
    const history = [
      { questionId: 'q-frac-01', topic: 'Fractions', isCorrect: false, misconceptionTag: 'unlike_denominators_direct_add' },
      { questionId: 'q-frac-02', topic: 'Fractions', isCorrect: false, misconceptionTag: 'unlike_denominators_direct_add' }
    ];

    const result = analyzeStudentMisconceptions('std-02', { history });
    assert.strictEqual(result.hasDiagnosedIssues, true);
    assert.strictEqual(result.diagnosedMisconceptions[0].category, MISCONCEPTION_TAXONOMY.PREREQUISITE_DEFICIT);
    assert.ok(result.diagnosedMisconceptions[0].prerequisiteTopic.includes('LCM'));
  });

  it('aggregates classroom-wide misconceptions and prioritizes critical remedial lesson plans', () => {
    const cohortResponses = [
      { studentId: 's1', topic: 'Fractions', isCorrect: false, misconceptionTag: 'unlike_denominators_direct_add' },
      { studentId: 's2', topic: 'Fractions', isCorrect: false, misconceptionTag: 'unlike_denominators_direct_add' },
      { studentId: 's3', topic: 'Fractions', isCorrect: false, misconceptionTag: 'unlike_denominators_direct_add' },
      { studentId: 's4', topic: 'Fractions', isCorrect: false, misconceptionTag: 'unlike_denominators_direct_add' },
      { studentId: 's1', topic: 'Integers', isCorrect: false, misconceptionTag: 'sign_distribution_error' },
      { studentId: 's5', topic: 'Integers', isCorrect: false, misconceptionTag: 'sign_distribution_error' }
    ];

    const studentRoster = Array.from({ length: 10 }, (_, i) => ({ id: `s${i + 1}` }));
    const classAnalysis = analyzeClassroomMisconceptions('cls-07-a', { cohortResponses, studentRoster });

    assert.strictEqual(classAnalysis.classroomId, 'cls-07-a');
    assert.ok(classAnalysis.commonMisconceptions.length >= 2);

    const topMisconception = classAnalysis.commonMisconceptions[0];
    assert.strictEqual(topMisconception.tag, 'unlike_denominators_direct_add');
    assert.strictEqual(topMisconception.affectedStudentCount, 4);
    assert.strictEqual(topMisconception.affectedPercentage, 40);
    assert.strictEqual(topMisconception.severity, 'CRITICAL');
    assert.ok(classAnalysis.remedialLessonPlansRecommended.length > 0);
  });
});
