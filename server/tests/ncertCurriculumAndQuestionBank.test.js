const { describe, it } = require('node:test');
const assert = require('node:assert');
const curriculumService = require('../services/curriculumService');
const questionBankService = require('../services/questionBankService');

describe('Part 1 & 2: NCERT Curriculum Engine & 15-Format Question Bank', () => {

  describe('1. NCERT Curriculum Hierarchy & Official Source Reference System', () => {
    it('supports all 12 CBSE Grades with appropriate academic stages', () => {
      const grades = curriculumService.getSupportedGrades();
      assert.strictEqual(grades.length, 12);
      assert.strictEqual(grades[0].level, 1);
      assert.strictEqual(grades[0].stage, 'PRIMARY');
      assert.strictEqual(grades[6].level, 7);
      assert.strictEqual(grades[6].stage, 'MIDDLE');
      assert.strictEqual(grades[9].level, 10);
      assert.strictEqual(grades[9].stage, 'SECONDARY');
      assert.strictEqual(grades[11].level, 12);
      assert.strictEqual(grades[11].stage, 'SENIOR_SECONDARY');
    });

    it('returns verified official NCERT and CBSE source citations and metadata', () => {
      const sources = curriculumService.getOfficialSources();
      assert.ok(sources.officialSources.ncertTextbooks.url.includes('ncert.nic.in/textbook.php'));
      assert.ok(sources.officialSources.ncertSyllabus.url.includes('ncert.nic.in/syllabus.php'));
      assert.ok(sources.officialSources.cbseCurriculum.url.includes('cbseacademic.nic.in/curriculum_2027.html'));
      assert.strictEqual(sources.curriculumProfile.board, 'Central Board of Secondary Education (CBSE)');
      assert.strictEqual(sources.curriculumProfile.affiliationNumber, '530649');
      assert.strictEqual(sources.curriculumProfile.schoolCode, '40643');
    });

    it('records verifiable textbook citations across primary, middle, secondary and senior secondary', () => {
      const citations = curriculumService.getTextbookCitations();
      assert.ok(citations.length >= 10);
      
      const g7Math = citations.find(c => c.gradeLevel === 7 && c.subject === 'Mathematics');
      assert.ok(g7Math, 'Grade 7 Math citation must exist');
      assert.strictEqual(g7Math.publisher, 'NCERT');
      assert.strictEqual(g7Math.edition, '2026-2027 Rationalized');
      assert.ok(g7Math.officialUrl.startsWith('https://ncert.nic.in'));

      const g11Phy = citations.find(c => c.gradeLevel === 11 && c.subject === 'Physics');
      assert.ok(g11Phy, 'Grade 11 Physics citation must exist');
      assert.strictEqual(g11Phy.publisher, 'NCERT');
    });

    it('dynamically adapts subjects by educational level without hardcoding identical subjects', () => {
      const g2Subjects = curriculumService.getSubjectsForGrade(2).map(s => s.name);
      assert.ok(g2Subjects.includes('Mathematics'));
      assert.ok(g2Subjects.includes('Environmental Studies'));
      assert.ok(!g2Subjects.includes('Physics (042)'), 'Primary must not offer Senior Secondary Physics');

      const g7Subjects = curriculumService.getSubjectsForGrade(7).map(s => s.name);
      assert.ok(g7Subjects.includes('Science'));
      assert.ok(g7Subjects.includes('Social Science'));
      assert.ok(g7Subjects.includes('Sanskrit'));

      const g11Subjects = curriculumService.getSubjectsForGrade(11).map(s => s.name);
      assert.ok(g11Subjects.includes('Physics (042)'));
      assert.ok(g11Subjects.includes('Accountancy (055)'));
      assert.ok(g11Subjects.includes('History (027)'));
    });

    it('supports curriculum versioning and updates without application code changes', () => {
      const versions = curriculumService.getCurriculumVersions();
      assert.ok(versions.versions.length >= 2);
      assert.strictEqual(versions.versions[0].version, 'GPS-CBSE-2026-V2');
      assert.strictEqual(versions.versions[0].status, 'ACTIVE');

      const updated = curriculumService.updateCurriculumProfile({
        description: 'Updated official syllabus mapping for Term 2'
      });
      assert.strictEqual(updated.description, 'Updated official syllabus mapping for Term 2');
    });
  });

  describe('2. Comprehensive 15-Format Question Bank Validation & Editorial Lifecycle', () => {
    it('validates and recognizes all 15 official question formats', () => {
      const expectedFormats = [
        'MCQ', 'MULTIPLE_SELECT', 'TRUE_FALSE', 'FILL_BLANKS', 'MATCH_FOLLOWING',
        'SHORT_ANSWER', 'LONG_ANSWER', 'NUMERICAL', 'CASE_BASED', 'COMPETENCY_BASED',
        'ASSERTION_REASON', 'DIAGRAM_BASED', 'PRACTICAL_APPLICATION',
        'READING_COMPREHENSION', 'ORAL_ACTIVITY'
      ];
      expectedFormats.forEach(fmt => {
        assert.ok(questionBankService.VALID_QUESTION_FORMATS.includes(fmt), `Format ${fmt} must be supported`);
      });
    });

    it('strictly rejects questions with missing pedagogical explanations or invalid grades', () => {
      const invalidQ = {
        questionStatement: 'What is 5 + 5?',
        gradeLevel: 15, // Invalid grade
        subject: 'Math',
        questionFormat: 'MCQ',
        options: ['10', '12'],
        correctAnswer: 0
        // Missing explanation and learning objective
      };
      const val = questionBankService.validateQuestion(invalidQ);
      assert.strictEqual(val.isValid, false);
      assert.ok(val.errors.some(e => e.includes('Grade level must be an integer between 1 and 12')));
      assert.ok(val.errors.some(e => e.includes('Explanation must provide a meaningful pedagogical explanation')));
      assert.ok(val.errors.some(e => e.includes('Learning Objective is required')));
    });

    it('creates a validated question with full metadata in PENDING_REVIEW status', () => {
      const newQ = questionBankService.createQuestion({
        gradeLevel: 7,
        subject: 'Mathematics',
        chapter: 'Fractions and Decimals',
        topic: 'Multiplication of Fractions',
        learningObjective: 'LO-MAT7-2.1: Multiply proper fractions and simplify product to lowest terms.',
        questionStatement: 'Calculate: 3/5 × 10/9 and express in lowest fractional terms.',
        questionFormat: 'MCQ',
        options: ['2/3', '30/45', '6/9', '5/6'],
        correctAnswer: 0,
        explanation: '3/5 × 10/9 = (3 × 10) / (5 × 9) = 30/45. Dividing numerator and denominator by 15 yields 2/3.',
        difficulty: 'MODERATE',
        marks: 2,
        misconceptionTags: ['Cross-multiplying instead of direct numerator multiplication']
      }, 'Mrs. Ananya Sharma');

      assert.ok(newQ.id.startsWith('gps-q-'));
      assert.strictEqual(newQ.editorialVerificationStatus, 'PENDING_REVIEW');
      assert.strictEqual(newQ.publicationStatus, 'ACTIVE');
      assert.strictEqual(newQ.author, 'Mrs. Ananya Sharma');
    });

    it('enforces editorial workflow transition (Approve / Publish / Archive)', () => {
      const searchRes = questionBankService.searchQuestions({ limit: 1 });
      const firstQ = searchRes.questions[0];

      const approved = questionBankService.reviewQuestion(firstQ.id, {
        reviewerId: 'Dr. K. S. Raman (Principal)',
        status: 'PUBLISHED',
        remarks: 'NCERT textbook verified item.'
      });

      assert.strictEqual(approved.editorialVerificationStatus, 'PUBLISHED');
      assert.strictEqual(approved.reviewedBy, 'Dr. K. S. Raman (Principal)');
      assert.strictEqual(approved.reviewRemarks, 'NCERT textbook verified item.');
    });

    it('generates real-time coverage reports across Grades 1-12 and all formats', () => {
      const report = questionBankService.getCoverageReport();
      assert.ok(report.totalQuestions >= 600);
      assert.ok(report.verifiedPercentage >= 90);
      assert.ok(report.byGrade[7].total > 50, 'Grade 7 pilot must have robust question coverage');
      assert.ok(report.byFormat.MCQ > 0);
      assert.ok(report.byFormat.CASE_BASED > 0);
      assert.ok(report.byFormat.COMPETENCY_BASED > 0);
      assert.ok(report.byFormat.ASSERTION_REASON > 0);
    });

    it('safely validates batch question imports and flags errors on malformed items', () => {
      const batch = [
        {
          gradeLevel: 7,
          subject: 'Science',
          chapter: 'Heat',
          topic: 'Convection',
          learningObjective: 'LO-SCI7-3.2: Explain fluid convection currents.',
          questionStatement: 'Why do sea breezes occur during daytime in coastal zones?',
          questionFormat: 'SHORT_ANSWER',
          options: ['Land heats faster than water', 'Water heats faster than land'],
          correctAnswer: 'Land heats faster than water',
          explanation: 'Land has lower specific heat capacity than water, warming faster and causing air to rise.',
          difficulty: 'MODERATE'
        },
        {
          // Intentionally malformed item
          questionStatement: 'Short',
          gradeLevel: 99
        }
      ];

      const importResult = questionBankService.importQuestions(batch, 'Curriculum Lead');
      assert.strictEqual(importResult.importedCount, 1);
      assert.strictEqual(importResult.failedCount, 1);
      assert.strictEqual(importResult.errors.length, 1);
      assert.strictEqual(importResult.errors[0].line, 2);
    });
  });
});
