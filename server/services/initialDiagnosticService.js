/**
 * Initial School Diagnostic Test Blueprint Service
 * Preconfigures Grade 5-10 Demonstration Assessments
 * (12 questions: 6 Mathematics + 6 Science, 20 mins, automatic scoring,
 * Bloom's taxonomy & misconception metadata, with equivalent Pre & Post test blueprints)
 */

const { prisma } = require('../config/prisma');
const multiGradeQuestions = require('../data/multiGradeQuestions.json');

/**
 * Generate a preconfigured diagnostic assessment blueprint for a given grade level
 * @param {number} gradeLevel (5, 7, 8, 9, 10)
 * @param {'PRE_TEST'|'POST_TEST'} testType
 */
function getDiagnosticBlueprint(gradeLevel = 7, testType = 'PRE_TEST') {
  const g = parseInt(gradeLevel, 10) || 7;

  // Filter pool by grade level
  const gradePool = multiGradeQuestions.filter(q => q.gradeLevel === g);

  // Separate by subject (In Primary Wing, Environmental Studies fulfills Science)
  const mathPool = gradePool.filter(q => q.subject.toLowerCase().includes('math'));
  const sciencePool = gradePool.filter(q => 
    q.subject.toLowerCase().includes('science') || 
    q.subject.toLowerCase().includes('environ') || 
    q.subject.toLowerCase().includes('evs')
  );

  // Select 6 questions per subject: 2 Easy, 2 Medium, 2 Hard
  const selectByDifficulty = (pool, count = 6) => {
    const easy = pool.filter(q => q.difficulty === 'EASY');
    const medium = pool.filter(q => q.difficulty === 'MEDIUM');
    const hard = pool.filter(q => q.difficulty === 'HARD');

    // Pre-test uses items [0, 1] for each tier; Post-test uses separate equivalent items [2, 3] (zero overlap)
    const startIndex = testType === 'POST_TEST' ? 2 : 0;

    const selected = [];
    if (easy.length > startIndex) selected.push(easy[startIndex]);
    if (easy.length > startIndex + 1) selected.push(easy[startIndex + 1]);
    else if (easy.length > 0) selected.push(easy[startIndex % easy.length]);

    if (medium.length > startIndex) selected.push(medium[startIndex]);
    if (medium.length > startIndex + 1) selected.push(medium[startIndex + 1]);
    else if (medium.length > 0) selected.push(medium[startIndex % medium.length]);

    if (hard.length > startIndex) selected.push(hard[startIndex]);
    if (hard.length > startIndex + 1) selected.push(hard[startIndex + 1]);
    else if (hard.length > 0) selected.push(hard[startIndex % hard.length]);

    // Fill remaining if needed
    while (selected.length < count && pool.length > selected.length) {
      const remaining = pool.find(p => !selected.includes(p));
      if (remaining) selected.push(remaining);
      else break;
    }

    return selected.slice(0, count);
  };

  const selectedMath = selectByDifficulty(mathPool.length >= 6 ? mathPool : multiGradeQuestions.filter(q => q.subject.toLowerCase().includes('math')), 6);
  const selectedScience = selectByDifficulty(sciencePool.length >= 6 ? sciencePool : multiGradeQuestions.filter(q => q.subject.toLowerCase().includes('science')), 6);

  const allQuestions = [...selectedMath, ...selectedScience];

  return {
    title: `Grade ${g} Institutional STEM Diagnostic Assessment (${testType === 'PRE_TEST' ? 'Baseline Pre-Test' : 'Summative Post-Test'})`,
    gradeLevel: g,
    assessmentType: testType,
    durationMinutes: 20,
    totalMarks: 120, // 10 marks per question
    scoringRules: {
      pointsPerQuestion: 10,
      negativeMarking: 0,
      confidenceWeighting: false
    },
    questionCount: allQuestions.length,
    blueprint: {
      mathematics: selectedMath.length,
      science: selectedScience.length,
      difficultyDistribution: {
        easy: 4,
        medium: 4,
        hard: 4
      }
    },
    questions: allQuestions.map((q, idx) => ({
      itemNumber: idx + 1,
      id: q.id,
      subject: q.subject,
      topic: q.topic,
      chapter: q.chapter,
      learningObjective: q.learningObjective,
      bloomTaxonomy: q.bloomTaxonomy,
      difficulty: q.difficulty,
      questionFormat: q.questionFormat,
      questionText: q.questionText,
      options: q.options,
      correctAnswerIndex: q.correctAnswerIndex,
      explanation: q.explanation,
      misconception: q.misconception,
      points: 10
    }))
  };
}

module.exports = {
  getDiagnosticBlueprint
};
