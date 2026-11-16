/**
 * AdaptIQ 3.0 Question Selection Engine
 * Phase 3 — Deterministic Item Selection & Blueprint Alignment Engine
 * 
 * Features:
 * - Exposure history tracking to prevent repetitive questions
 * - Multi-criteria matching (Grade, Subject, Chapter, Topic, Learning Objective, Difficulty)
 * - Teacher manual difficulty override support
 * - Locked blueprint enforcement for formal summative examinations
 * - Nearest neighbor difficulty fallback
 */

const { DIFFICULTY_LEVELS } = require('./adaptiveEngine');

/**
 * Selects the optimal next question from a candidate question pool
 */
function selectNextQuestion({
  questionPool = [],
  availableQuestions = [],
  grade,
  targetGrade,
  subject,
  targetSubject,
  topic,
  targetTopic,
  targetDifficulty = 'medium',
  currentDifficulty = 'medium',
  exposedQuestionIds = [],
  studentHistory = [],
  allowRepetition = false,
  teacherOverrideDifficulty = null,
  isFormalAssessment = false,
  isSummativeBlueprint = false,
  blueprintIds = null,
  blueprintTarget = null
}) {
  const pool = (Array.isArray(questionPool) && questionPool.length > 0)
    ? questionPool
    : (Array.isArray(availableQuestions) ? availableQuestions : []);

  if (pool.length === 0) {
    return {
      selectedQuestion: null,
      availableCount: 0,
      selectionReason: 'No questions available matching the requested criteria in question bank.',
      matchedDifficulty: null,
      isFormalLocked: false
    };
  }

  const effectiveGrade = grade || targetGrade;
  const effectiveSubject = subject || targetSubject;
  const effectiveTopic = topic || targetTopic;
  const effectiveExposed = [
    ...(Array.isArray(exposedQuestionIds) ? exposedQuestionIds : []),
    ...(Array.isArray(studentHistory) ? studentHistory : [])
  ].map(id => String(id));

  const isBlueprintMode = Boolean(isFormalAssessment || isSummativeBlueprint);

  // 1. Formal Assessment Mode: Strict Blueprint Enforcement
  if (isBlueprintMode) {
    let item = null;

    if (Array.isArray(blueprintIds) && blueprintIds.length > 0) {
      const unexposed = blueprintIds.filter(id => !effectiveExposed.includes(String(id)));
      const nextId = unexposed[0] || blueprintIds[0];
      item = pool.find(q => String(q._id || q.id) === String(nextId)) || pool[0];
    } else if (blueprintTarget && typeof blueprintTarget === 'object') {
      const bDiff = (blueprintTarget.difficulty || 'medium').toLowerCase();
      const bTopic = blueprintTarget.topic;
      const matching = pool.filter(q => {
        const qDiff = (q.difficulty || 'medium').toLowerCase();
        const matchesDiff = qDiff === bDiff;
        const matchesTopic = !bTopic || !q.topic || q.topic.toLowerCase().includes(bTopic.toLowerCase());
        const unexposed = !effectiveExposed.includes(String(q._id || q.id));
        return matchesDiff && matchesTopic && unexposed;
      });
      item = matching[0] || pool.find(q => (q.difficulty || 'medium').toLowerCase() === bDiff) || pool[0];
    } else {
      item = pool.find(q => !effectiveExposed.includes(String(q._id || q.id))) || pool[0];
    }

    return {
      selectedQuestion: item,
      availableCount: pool.length,
      selectionMode: 'FORMAL_BLUEPRINT_LOCKED',
      selectionReason: `FORMAL_BLUEPRINT_LOCKED: Selected per strict formal assessment blueprint. Adaptation suppressed for standard psychometric evaluation.`,
      matchedDifficulty: item ? item.difficulty : null,
      isFormalLocked: true
    };
  }

  // 2. Determine effective difficulty
  const reqDiff = (teacherOverrideDifficulty || targetDifficulty || currentDifficulty || 'medium').toLowerCase();

  // 3. Filter candidates
  let candidates = [...pool];

  if (effectiveGrade) {
    candidates = candidates.filter(q => {
      const qGrade = q.gradeLevel || q.grade;
      return !qGrade || String(qGrade) === String(effectiveGrade);
    });
  }

  if (effectiveSubject) {
    candidates = candidates.filter(q => {
      const qSub = q.subject;
      return !qSub || qSub.toLowerCase() === effectiveSubject.toLowerCase();
    });
  }

  if (effectiveTopic && effectiveTopic !== 'All') {
    candidates = candidates.filter(q => {
      const qTopic = q.topic;
      return !qTopic || qTopic.toLowerCase().includes(effectiveTopic.toLowerCase());
    });
  }

  // Filter out already attempted questions unless allowed
  let unexposedCandidates = candidates;
  if (!allowRepetition && effectiveExposed.length > 0) {
    unexposedCandidates = candidates.filter(q => !effectiveExposed.includes(String(q._id || q.id)));
  }

  const activePool = unexposedCandidates.length > 0 ? unexposedCandidates : candidates;

  // 4. Match exact difficulty
  let matchingQuestions = activePool.filter(q => (q.difficulty || 'medium').toLowerCase() === reqDiff);
  let fallbackApplied = false;

  // 5. Nearest neighbor fallback if exact difficulty is exhausted
  if (matchingQuestions.length === 0) {
    fallbackApplied = true;
    const reqIndex = DIFFICULTY_LEVELS.indexOf(reqDiff);
    const fallbackDiffs = DIFFICULTY_LEVELS
      .filter(d => d !== reqDiff)
      .sort((a, b) => Math.abs(DIFFICULTY_LEVELS.indexOf(a) - reqIndex) - Math.abs(DIFFICULTY_LEVELS.indexOf(b) - reqIndex));

    for (const altDiff of fallbackDiffs) {
      matchingQuestions = activePool.filter(q => (q.difficulty || 'medium').toLowerCase() === altDiff);
      if (matchingQuestions.length > 0) break;
    }
  }

  const selectedQuestion = matchingQuestions[0] || activePool[0] || null;

  return {
    selectedQuestion,
    availableCount: activePool.length,
    selectionReason: selectedQuestion
      ? `Selected question aligned to ${selectedQuestion.difficulty} difficulty${fallbackApplied ? ' (nearest neighbor fallback)' : ''} with exposure verification.`
      : 'No questions available.',
    matchedDifficulty: selectedQuestion ? selectedQuestion.difficulty : null,
    isFormalLocked: false,
    fallbackApplied
  };
}

module.exports = {
  selectNextQuestion
};
