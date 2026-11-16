/**
 * AdaptIQ 3.0 — Misconception & Learning Gap Engine
 * server/services/adaptive/misconceptionEngine.js
 */

const misconceptionService = require('../misconceptionService');

const {
  MISCONCEPTION_TAXONOMY,
  KNOWN_MISCONCEPTIONS,
  analyzeStudentMisconceptions,
  analyzeClassroomMisconceptions
} = misconceptionService;

/**
 * Diagnose a single attempt or response against known misconception tags and wrong option distractors.
 */
function diagnoseResponse({ questionId, selectedOption, correctOption, questionMetadata = {} }) {
  if (selectedOption === correctOption) {
    return null;
  }

  let detectedTag = questionMetadata.misconceptionTag;
  if (questionMetadata.distractorTags && questionMetadata.distractorTags[selectedOption]) {
    detectedTag = questionMetadata.distractorTags[selectedOption];
  }

  if (!detectedTag) {
    detectedTag = 'general_concept_gap';
  }

  const misconceptionInfo = KNOWN_MISCONCEPTIONS[detectedTag] || {
    tag: detectedTag,
    title: detectedTag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    category: MISCONCEPTION_TAXONOMY.CONCEPTUAL_MISUNDERSTANDING,
    description: 'System detected a gap in conceptual or procedural execution.',
    remedialFocus: 'Review fundamental definitions and step-by-step worked examples.',
    prerequisiteTopic: questionMetadata.topic || 'General Foundational Concepts'
  };

  return {
    questionId,
    selectedOption,
    correctOption,
    detectedMisconception: misconceptionInfo,
    isConfirmed: false,
    note: 'Single observation. Requires corroboration across additional items to confirm diagnosis.'
  };
}

/**
 * Compute student learning gaps across an assessment or full attempt history.
 */
function evaluateLearningGaps(studentAttempts = [], options = {}) {
  let history = [];
  let studentId = 'student_eval';

  if (Array.isArray(studentAttempts)) {
    history = studentAttempts;
  } else if (studentAttempts && typeof studentAttempts === 'object') {
    history = studentAttempts.history || [];
    studentId = studentAttempts.studentId || studentId;
  }

  const analysis = analyzeStudentMisconceptions(studentId, {
    history,
    subject: options.subject || 'Mathematics',
    gradeLevel: options.gradeLevel || 7
  });
  
  const confirmedGaps = analysis.diagnosedMisconceptions || [];
  const suspectedGaps = analysis.suspectedGaps || [];

  const remediationQueue = confirmedGaps.map(gap => ({
    misconceptionTag: gap.tag,
    title: gap.title,
    category: gap.category,
    confidence: gap.confidence,
    severity: gap.severity,
    remedialFocus: gap.remedialRecommendation,
    prerequisiteTopic: gap.prerequisiteTopic,
    suggestedAction: gap.category === MISCONCEPTION_TAXONOMY.PREREQUISITE_DEFICIT
      ? 'Assign prerequisite topic booster practice before proceeding to higher difficulty.'
      : 'Review step-by-step solutions and targeted practice items.'
  }));

  return {
    totalItemsAnalyzed: history.length,
    confirmedMisconceptionCount: confirmedGaps.length,
    suspectedMisconceptionCount: suspectedGaps.length,
    confirmedGaps,
    suspectedGaps,
    remediationQueue
  };
}

module.exports = {
  MISCONCEPTION_TAXONOMY,
  KNOWN_MISCONCEPTIONS,
  diagnoseResponse,
  evaluateLearningGaps,
  analyzeStudentMisconceptions,
  analyzeClassroomMisconceptions
};
