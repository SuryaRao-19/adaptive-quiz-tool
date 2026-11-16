const { describe, it } = require('node:test');
const assert = require('node:assert');

const schoolService = require('../services/schoolService');
const curriculumService = require('../services/curriculumService');
const assignmentService = require('../services/assignmentService');
const { buildTutorSystemPrompt, getGradePedagogyDirectives } = require('../services/ai/services/tutoringService');

describe('AdaptIQ 2.0 — Multi-Grade School Intelligence & Asian Public School Architecture', () => {

  it('1. School Profile & Asian Public School Admin Metrics', async () => {
    const profile = await schoolService.getSchoolProfile('APS-2026');
    assert.strictEqual(profile.name, 'Asian Public School');
    assert.strictEqual(profile.board, 'CBSE');

    const metrics = await schoolService.getSchoolAdminMetrics('APS-2026');
    assert.ok(metrics.kpis.totalStudents >= 100, 'Should track institutional enrollment');
    assert.ok(metrics.gradeDistribution.length >= 5, 'Should track multiple grade cohorts');
    assert.ok(metrics.subjectPerformance.some(s => s.subject === 'Mathematics'));
    assert.ok(metrics.learningGaps.length > 0, 'Should identify actionable learning gaps');
  });

  it('2. Multi-Grade Spectrum Support (Grades 1–12)', () => {
    const grades = curriculumService.getSupportedGrades();
    assert.strictEqual(grades.length, 12, 'Must support all 12 K-12 grades');
    assert.strictEqual(grades[0].level, 1);
    assert.strictEqual(grades[11].level, 12);
  });

  it('3. Grade-Specific Subject Catalog', () => {
    const grade7Subjects = curriculumService.getSubjectsForGrade(7);
    assert.ok(grade7Subjects.length >= 3);
    const names = grade7Subjects.map(s => s.name);
    assert.ok(names.includes('Mathematics'));
    assert.ok(names.includes('Science'));
    assert.ok(names.includes('English'));
  });

  it('4. Structured Curriculum Hierarchy (Chapters & Learning Outcomes)', () => {
    const mathCurriculum = curriculumService.getCurriculumByGradeAndSubject(7, 'Mathematics');
    assert.strictEqual(mathCurriculum.gradeLevel, 7);
    assert.ok(mathCurriculum.chapters.length > 0);
    const chapter1 = mathCurriculum.chapters[0];
    assert.ok(chapter1.title.length > 0);
    assert.ok(chapter1.topics.length > 0);
    assert.ok(chapter1.topics[0].learningOutcomes.length > 0);
    assert.ok(chapter1.topics[0].learningOutcomes[0].code.startsWith('LO-'));
  });

  it('5. Multi-Grade Question Bank Formats & Filtering', () => {
    const allQuestions = curriculumService.getQuestionsByFilter({});
    assert.ok(allQuestions.length >= 10, 'Question bank should have demo items');

    // Test Grade 7 Math questions
    const g7Math = curriculumService.getQuestionsByFilter({ gradeLevel: 7, subject: 'Mathematics' });
    assert.ok(g7Math.length > 0);
    assert.strictEqual(g7Math[0].gradeLevel, 7);

    // Verify presence of diverse question formats
    const formats = new Set(allQuestions.map(q => q.questionFormat));
    assert.ok(formats.has('MCQ'), 'Should support MCQ');
    assert.ok(formats.has('NUMERICAL'), 'Should support Numerical');
    assert.ok(formats.has('MULTIPLE_SELECT'), 'Should support Multiple-Select');
  });

  it('6. Grade-Aware AI Tutor Language & Pedagogical Scaffolding', () => {
    // Primary level (Grade 4)
    const promptG4 = buildTutorSystemPrompt({
      mode: 'explain',
      subject: 'Science',
      topic: 'Plants',
      gradeLevel: 'Grade 4'
    });
    assert.ok(promptG4.includes('Grade 4'));
    assert.ok(promptG4.includes('Primary / Elementary'));

    // Secondary level (Grade 10)
    const promptG10 = buildTutorSystemPrompt({
      mode: 'socratic',
      subject: 'Mathematics',
      topic: 'Quadratic Equations',
      gradeLevel: 'Grade 10',
      chapter: 'Real Numbers & Quadratics',
      learningObjective: 'LO-M10-1.2'
    });
    assert.ok(promptG10.includes('Grade 10'));
    assert.ok(promptG10.includes('Secondary / High School'));
    assert.ok(promptG10.includes('Quadratic Equations'));
    assert.ok(promptG10.includes('DO NOT reveal the final answer'));
  });

  it('7. Assignment Lifecycle Management', () => {
    const studentAssignments = assignmentService.getAssignmentsForStudent(7, '7-A');
    assert.ok(studentAssignments.length > 0, 'Grade 7 student should have assignments');

    const created = assignmentService.createAssignment({
      gradeLevel: 8,
      section: '8-A',
      subject: 'Mathematics',
      title: 'Exponents Drill',
      assignedBy: 'Mrs. Ananya Sharma'
    });
    assert.strictEqual(created.title, 'Exponents Drill');
    assert.strictEqual(created.status, 'ACTIVE');

    const g8Assignments = assignmentService.getAssignmentsForStudent(8, '8-A');
    assert.ok(g8Assignments.some(a => a.id === created.id));
  });

});

