/**
 * Curriculum & Academic Structure Service
 * Manages Grades 1-12, Subjects, Chapters, Topics, and Learning Outcomes
 * for Greenwood Public School demonstration and multi-grade intelligence.
 */

const curriculumData = require('../data/curriculumData.json');
const multiGradeQuestions = require('../data/multiGradeQuestions.json');

/**
 * Get full list of supported grades (Grades 1-12)
 */
function getSupportedGrades() {
  return curriculumData.grades;
}

/**
 * Get all available subjects for a specific grade
 */
function getSubjectsForGrade(gradeLevel = 7) {
  const g = parseInt(gradeLevel, 10) || 7;
  return curriculumData.subjects.map(s => ({
    ...s,
    gradeLevel: g,
    hasContent: Boolean(curriculumData.gradeCurricula[String(g)]?.[s.name])
  }));
}

/**
 * Get structured curriculum chapters & topics for a specific grade and subject
 */
function getCurriculumByGradeAndSubject(gradeLevel = 7, subjectName = 'Mathematics') {
  const g = String(gradeLevel || 7);
  const subj = String(subjectName || 'Mathematics');

  const gradeMap = curriculumData.gradeCurricula[g];
  if (gradeMap && gradeMap[subj]) {
    return {
      gradeLevel: parseInt(g, 10),
      subject: subj,
      chapters: gradeMap[subj]
    };
  }

  // Fallback default structure if specific chapter data is minimal for other grades
  return {
    gradeLevel: parseInt(g, 10),
    subject: subj,
    chapters: [
      {
        chapterNumber: 1,
        title: `Foundations of Grade ${g} ${subj}`,
        topics: [
          {
            topicNumber: 1,
            title: `Core Principles and Concepts`,
            learningOutcomes: [
              { code: `LO-${subj.substring(0, 3).toUpperCase()}${g}-1.1`, statement: `Master standard grade-level core competencies for ${subj}.`, taxonomyLevel: 'APPLY' }
            ]
          }
        ]
      }
    ]
  };
}

/**
 * Query questions from the multi-grade question bank
 */
function getQuestionsByFilter({ gradeLevel, subject, difficulty, format, limit = 100 } = {}) {
  let list = [...multiGradeQuestions];

  if (gradeLevel) {
    const g = parseInt(gradeLevel, 10);
    list = list.filter(q => q.gradeLevel === g);
  }

  if (subject) {
    const s = subject.toLowerCase();
    list = list.filter(q => q.subject.toLowerCase() === s);
  }

  if (difficulty) {
    const d = difficulty.toUpperCase();
    list = list.filter(q => q.difficulty === d);
  }

  if (format) {
    const f = format.toUpperCase();
    list = list.filter(q => q.questionFormat === f);
  }

  return list.slice(0, limit);
}

module.exports = {
  getSupportedGrades,
  getSubjectsForGrade,
  getCurriculumByGradeAndSubject,
  getQuestionsByFilter,
  curriculumProfile: curriculumData.curriculumProfile
};
