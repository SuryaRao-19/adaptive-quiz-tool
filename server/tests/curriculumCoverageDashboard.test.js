const { describe, it } = require('node:test');
const assert = require('node:assert');
const coverageService = require('../services/curriculumCoverageService');

describe('Academic Content & Curriculum Coverage Dashboard QA', () => {
  it('1. Returns 8 database-driven KPI overview metrics', () => {
    const data = coverageService.getOverviewMetrics();
    assert.strictEqual(data.totalGrades, 12);
    assert.ok(data.totalSubjects > 0);
    assert.ok(data.totalChapters > 0);
    assert.ok(data.totalQuestions > 0);
    assert.ok(data.verifiedQuestions >= 0);
    assert.ok(data.publishedQuestions >= 0);
    assert.strictEqual(typeof data.contentCompletionPercent, 'number');
    assert.ok(data.textbookCitationsCount >= 20);
    assert.strictEqual(data.activeCurriculumProfile, 'GPS-CBSE-2026');
  });

  it('2. Returns 12 grade rows with accurate calculation', () => {
    const data = coverageService.getGradeWiseCoverage();
    assert.strictEqual(data.length, 12);

    const grade7 = data.find(g => g.gradeLevel === 7);
    assert.ok(grade7);
    assert.strictEqual(grade7.gradeName, 'Grade 7');
    assert.strictEqual(grade7.stage, 'MIDDLE');
    assert.ok(grade7.subjectsCount >= 5);
    assert.ok(grade7.totalQuestions > 0);
    assert.ok(grade7.coveragePercentage >= 0);
  });

  it('3. Returns subject details and assigned teachers for Class 7', () => {
    const data = coverageService.getSubjectWiseCoverage(7);
    assert.ok(data.length > 0);

    const math = data.find(s => s.subjectName === 'Mathematics');
    assert.ok(math);
    assert.strictEqual(math.assignedTeacher, 'Mrs. Ananya Sharma');
    assert.ok(math.totalChapters > 0);
    assert.ok(math.totalQuestions > 0);
  });

  it('4. Returns granular chapter-level content tracking', () => {
    const data = coverageService.getChapterLevelCoverage(7, 'Mathematics');
    assert.ok(data.length > 0);

    const ch1 = data[0];
    assert.ok(ch1.chapterTitle);
    assert.ok(ch1.editorialApproval);
    assert.ok(ch1.publicationStatus);
    assert.strictEqual(typeof ch1.practiceQuestionsCount, 'number');
    assert.ok(ch1.learningObjectivesStatus);
  });

  it('5. Detects actionable missing content gaps', () => {
    const data = coverageService.detectContentGaps();
    assert.ok(data.totalGaps > 0);
    assert.ok(Array.isArray(data.gaps));
    assert.ok(data.criticalCount >= 0);
  });

  it('6. Returns teacher accountability metrics and active assignments', () => {
    const data = coverageService.getTeacherAccountabilityMetrics();
    assert.ok(data.teachers.length > 0);
    assert.ok(data.activeAssignments.length > 0);

    const ananya = data.teachers.find(t => t.name === 'Mrs. Ananya Sharma');
    assert.ok(ananya);
    assert.ok(ananya.questionsSubmitted > 0);
  });

  it('7. Assigns content responsibility to a teacher', () => {
    const payload = {
      teacherName: 'Mrs. Ananya Sharma',
      teacherEmail: 'sharma.math@greenwoodgurgaon.com',
      gradeLevel: 7,
      subject: 'Mathematics',
      chapter: 'Fractions and Decimals',
      task: 'Author 5 word problems on division of fractions with misconception notes',
      deadline: '2026-12-05',
      assignedBy: 'Dr. K. S. Raman'
    };
    const assignment = coverageService.assignContentResponsibility(payload);
    assert.ok(assignment.id);
    assert.strictEqual(assignment.task, payload.task);
    assert.strictEqual(assignment.status, 'ASSIGNED');
  });
});
