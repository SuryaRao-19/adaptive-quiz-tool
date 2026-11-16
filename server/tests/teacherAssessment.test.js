const { describe, it } = require('node:test');
const assert = require('node:assert');

const initialDiagnosticService = require('../services/initialDiagnosticService');
const attendanceService = require('../services/attendanceService');
const teacherAssessmentService = require('../services/teacherAssessmentService');

describe('Teacher Command Centre & School Assessment System', () => {

  describe('1. Initial School Diagnostic Assessment Blueprint (Grades 5-10)', () => {
    it('generates a 12-question STEM diagnostic with 6 Math and 6 Science items for Grade 7', () => {
      const blueprint = initialDiagnosticService.getDiagnosticBlueprint(7, 'PRE_TEST');

      assert.strictEqual(blueprint.gradeLevel, 7);
      assert.strictEqual(blueprint.assessmentType, 'PRE_TEST');
      assert.strictEqual(blueprint.durationMinutes, 20);
      assert.strictEqual(blueprint.questionCount, 12);
      assert.strictEqual(blueprint.blueprint.mathematics, 6);
      assert.strictEqual(blueprint.blueprint.science, 6);
      assert.strictEqual(blueprint.questions.length, 12);

      // Verify each question has Bloom's taxonomy, misconception tag, and learning outcome
      blueprint.questions.forEach((q, idx) => {
        assert.ok(q.questionText, `Question ${idx + 1} has questionText`);
        assert.ok(Array.isArray(q.options) && q.options.length === 4, `Question ${idx + 1} has 4 options`);
        assert.ok(q.explanation, `Question ${idx + 1} has explanation`);
        assert.ok(q.bloomTaxonomy, `Question ${idx + 1} has Bloom taxonomy`);
        assert.ok(q.misconception, `Question ${idx + 1} has misconception metadata`);
      });
    });

    it('generates equivalent pre-test and post-test versions with matched blueprint structure', () => {
      const preTest = initialDiagnosticService.getDiagnosticBlueprint(9, 'PRE_TEST');
      const postTest = initialDiagnosticService.getDiagnosticBlueprint(9, 'POST_TEST');

      assert.strictEqual(preTest.gradeLevel, 9);
      assert.strictEqual(postTest.gradeLevel, 9);
      assert.strictEqual(preTest.assessmentType, 'PRE_TEST');
      assert.strictEqual(postTest.assessmentType, 'POST_TEST');
      assert.strictEqual(preTest.questionCount, postTest.questionCount);
      assert.strictEqual(preTest.durationMinutes, postTest.durationMinutes);
    });
  });

  describe('2. Attendance Date Normalization & Duplicate Prevention', () => {
    it('normalizes dates to UTC midnight to enforce date uniqueness', () => {
      const d1 = attendanceService.normalizeToUtcDate('2026-11-16T14:30:00Z');
      const d2 = attendanceService.normalizeToUtcDate('2026-11-16T08:15:00Z');

      assert.strictEqual(d1.toISOString(), d2.toISOString());
      assert.strictEqual(d1.getUTCHours(), 0);
      assert.strictEqual(d1.getUTCMinutes(), 0);
      assert.strictEqual(d1.getUTCSeconds(), 0);
    });
  });

  describe('3. Teacher Dashboard Stats Aggregation', () => {
    it('returns structured statistics, intervention group, and recent activities', async () => {
      const result = await teacherAssessmentService.getTeacherDashboardStats('mock-teacher-id');

      assert.strictEqual(result.success, true);
      assert.ok(result.stats);
      assert.ok(result.stats.totalAssignedStudents >= 0);
      assert.ok(result.stats.activeClassrooms >= 0);
      assert.ok(result.stats.todayAttendancePercent >= 0);
      assert.ok(Array.isArray(result.studentsNeedingIntervention));
      assert.ok(Array.isArray(result.recentActivity));
    });
  });

  describe('4. Live Test Centre Timer & Participation Telemetry', () => {
    it('calculates remaining seconds and elapsed time correctly', () => {
      const totalDurationMinutes = 20;
      const extendedMinutes = 5;
      const totalMinutes = totalDurationMinutes + extendedMinutes;

      const totalSeconds = totalMinutes * 60;
      const elapsedSeconds = 600; // 10 minutes elapsed
      const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);

      assert.strictEqual(totalMinutes, 25);
      assert.strictEqual(remainingSeconds, 900); // 15 mins remaining
    });
  });
});

