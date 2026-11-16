/**
 * Response Validator & Schema Guard for Gemini Structured Outputs
 * Validates, normalizes, and protects against malformed or duplicate AI output.
 */

const ALLOWED_QUESTION_TYPES = [
  'MCQ',
  'multiple_select',
  'true_false',
  'short_answer',
  'conceptual',
  'application'
];

const ALLOWED_DIFFICULTIES = ['easy', 'medium', 'hard', 'very_hard'];

/**
 * Calculates Jaccard similarity between two text strings to detect near-duplicates
 */
function calculateTextSimilarity(str1 = '', str2 = '') {
  const tokenize = s => new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean));
  const set1 = tokenize(str1);
  const set2 = tokenize(str2);

  if (set1.size === 0 && set2.size === 0) return 1.0;
  if (set1.size === 0 || set2.size === 0) return 0.0;

  let intersection = 0;
  for (const token of set1) {
    if (set2.has(token)) intersection++;
  }
  const union = new Set([...set1, ...set2]).size;
  return intersection / union;
}

/**
 * Checks a collection of questions for duplicate or near-duplicate question texts
 * @param {Array<Object>} questions
 * @param {number} [threshold=0.68]
 * @returns {{ hasDuplicates: boolean, uniqueQuestions: Array<Object>, duplicateCount: number }}
 */
function deduplicateQuestions(questions = [], threshold = 0.68) {
  const unique = [];
  let duplicates = 0;

  for (const q of questions) {
    const text = q.question || q.questionText || '';
    const isDuplicate = unique.some(existing => {
      const existingText = existing.question || existing.questionText || '';
      return calculateTextSimilarity(text, existingText) >= threshold;
    });

    if (isDuplicate) {
      duplicates++;
    } else {
      unique.push(q);
    }
  }

  return {
    hasDuplicates: duplicates > 0,
    uniqueQuestions: unique,
    duplicateCount: duplicates
  };
}

/**
 * Validates an individual generated question
 */
function validateQuestion(q, fallbackSubject = 'Math', fallbackTopic = 'General') {
  const errors = [];

  const text = (q.question || q.questionText || '').trim();
  if (!text || text.length < 8) {
    errors.push('Question text is missing or too short.');
  }

  const rawType = (q.type || q.questionType || 'MCQ').toLowerCase();
  let normalizedType = 'MCQ';
  if (rawType.includes('select') || rawType === 'multi_select' || rawType === 'multiple_select') {
    normalizedType = 'multiple_select';
  } else if (rawType.includes('true') || rawType === 'true_false' || rawType === 'tf') {
    normalizedType = 'true_false';
  } else if (rawType.includes('short') || rawType === 'short_answer') {
    normalizedType = 'short_answer';
  } else if (rawType.includes('concept')) {
    normalizedType = 'conceptual';
  } else if (rawType.includes('app')) {
    normalizedType = 'application';
  }

  let options = [];
  if (Array.isArray(q.options)) {
    options = q.options.map(o => String(o).trim()).filter(Boolean);
  }

  if (['MCQ', 'multiple_select'].includes(normalizedType)) {
    if (options.length < 3) {
      errors.push(`Multiple choice question requires at least 3 options (got ${options.length}).`);
    }
  } else if (normalizedType === 'true_false') {
    if (options.length !== 2) {
      options = ['True', 'False'];
    }
  }

  let correctAnswer = q.correctAnswer;
  let correctAnswerIndex = q.correctAnswerIndex;

  if (correctAnswerIndex !== undefined && !isNaN(Number(correctAnswerIndex))) {
    correctAnswerIndex = Number(correctAnswerIndex);
    if (options.length > 0 && (correctAnswerIndex < 0 || correctAnswerIndex >= options.length)) {
      errors.push(`correctAnswerIndex ${correctAnswerIndex} is out of bounds for options length ${options.length}.`);
    }
    if (correctAnswer === undefined && options[correctAnswerIndex]) {
      correctAnswer = options[correctAnswerIndex];
    }
  } else if (correctAnswer !== undefined) {
    const foundIdx = options.findIndex(opt => opt.toLowerCase() === String(correctAnswer).toLowerCase());
    if (foundIdx !== -1) {
      correctAnswerIndex = foundIdx;
      correctAnswer = options[foundIdx];
    } else if (['MCQ', 'true_false'].includes(normalizedType)) {
      errors.push(`correctAnswer "${correctAnswer}" does not match any of the provided options.`);
    }
  } else {
    errors.push('Missing correct answer or correct answer index.');
  }

  const explanation = (q.explanation || '').trim();
  if (!explanation || explanation.length < 6) {
    errors.push('Explanation is missing or too brief.');
  }

  const topic = (q.topic || fallbackTopic || 'General').trim();
  const difficulty = ALLOWED_DIFFICULTIES.includes((q.difficulty || '').toLowerCase())
    ? q.difficulty.toLowerCase()
    : 'medium';
  const learningObjective = (q.learningObjective || `Understand foundational concepts in ${topic}`).trim();
  const marks = Math.max(1, Math.min(20, Number(q.marks) || 1));

  const steps = Array.isArray(q.steps) && q.steps.length > 0
    ? q.steps.map((s, idx) => ({
        step: s.step || `Step ${idx + 1}`,
        desc: s.desc || s.description || '',
        math: s.math || ''
      }))
    : [
        { step: 'Step 1: Understand', desc: `Analyze given parameters in ${topic}`, math: '' },
        { step: 'Step 2: Solve', desc: explanation, math: '' }
      ];

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      questionText: text,
      question: text,
      type: normalizedType,
      options,
      correctAnswer,
      correctAnswerIndex: correctAnswerIndex !== undefined ? correctAnswerIndex : 0,
      explanation,
      steps,
      topic,
      difficulty,
      learningObjective,
      conceptSummary: q.conceptSummary || explanation.slice(0, 160),
      misconception: q.misconception || 'Common distractor misunderstanding',
      marks,
      source: 'ai_generated',
      status: 'pending_review'
    }
  };
}

/**
 * Validates a list of questions returned by AI Quiz Generator
 */
function validateQuizResponse(data, fallbackSubject = 'Math', fallbackTopic = 'General') {
  if (!data) {
    return { isValid: false, error: 'Empty AI response payload.', questions: [] };
  }

  let rawList = [];
  if (Array.isArray(data)) {
    rawList = data;
  } else if (Array.isArray(data.questions)) {
    rawList = data.questions;
  } else if (typeof data === 'object') {
    const arrayKey = Object.keys(data).find(k => Array.isArray(data[k]));
    if (arrayKey) {
      rawList = data[arrayKey];
    }
  }

  if (rawList.length === 0) {
    return {
      isValid: false,
      error: 'Model response did not contain a valid array of questions.',
      questions: []
    };
  }

  const validQuestions = [];
  const rejectedItems = [];

  for (let i = 0; i < rawList.length; i++) {
    const valResult = validateQuestion(rawList[i], fallbackSubject, fallbackTopic);
    if (valResult.isValid) {
      validQuestions.push(valResult.sanitized);
    } else {
      rejectedItems.push({ index: i, errors: valResult.errors, raw: rawList[i] });
    }
  }

  const { uniqueQuestions, duplicateCount } = deduplicateQuestions(validQuestions);

  return {
    isValid: uniqueQuestions.length > 0,
    totalRaw: rawList.length,
    validCount: uniqueQuestions.length,
    rejectedCount: rejectedItems.length,
    duplicateCount,
    rejectedItems,
    questions: uniqueQuestions
  };
}

/**
 * Validates structured Answer Explanation response
 */
function validateAnswerExplanation(data) {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Malformed explanation response.', data: null };
  }

  const correctAnswer = (data.correctAnswer || '').trim();
  const explanation = (data.explanation || data.conceptExplanation || '').trim();
  const whyIncorrect = (data.whyIncorrect || data.whySelectedIncorrect || '').trim();
  const stepByStepSolution = Array.isArray(data.stepByStepSolution)
    ? data.stepByStepSolution
    : (data.stepByStepSolution ? [String(data.stepByStepSolution)] : []);
  const simpleExample = (data.simpleExample || '').trim();
  const relatedPracticeQuestion = (data.relatedPracticeQuestion && typeof data.relatedPracticeQuestion === 'object')
    ? data.relatedPracticeQuestion
    : null;

  if (!explanation) {
    return { isValid: false, error: 'Explanation text is missing in model response.', data: null };
  }

  return {
    isValid: true,
    data: {
      correctAnswer: correctAnswer || 'Refer to solution steps',
      explanation,
      whyIncorrect: whyIncorrect || 'The selected option reflects a common conceptual misunderstanding.',
      stepByStepSolution: stepByStepSolution.length > 0 ? stepByStepSolution : [explanation],
      simpleExample: simpleExample || 'Consider a simpler case with smaller integer values.',
      relatedPracticeQuestion: relatedPracticeQuestion || {
        question: 'Try solving this similar problem: What is the first step in approaching this concept?',
        hint: 'Review the step-by-step solution above.'
      }
    }
  };
}

/**
 * Validates structured Personalized Learning Plan response
 */
function validateStudyPlan(data) {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Malformed study plan response.', data: null };
  }

  return {
    isValid: true,
    data: {
      studentSummary: data.studentSummary || 'Personalized performance diagnosis based on verified assessment records.',
      weakTopics: Array.isArray(data.weakTopics) ? data.weakTopics : [],
      strongTopics: Array.isArray(data.strongTopics) ? data.strongTopics : [],
      repeatedMistakes: Array.isArray(data.repeatedMistakes) ? data.repeatedMistakes : [],
      learningGaps: Array.isArray(data.learningGaps) ? data.learningGaps : [],
      suggestedRevisionTopics: Array.isArray(data.suggestedRevisionTopics) ? data.suggestedRevisionTopics : [],
      recommendedPracticeQuestions: Array.isArray(data.recommendedPracticeQuestions) ? data.recommendedPracticeQuestions : [],
      studyPlan: Array.isArray(data.studyPlan) ? data.studyPlan : (data.studyPlan ? [data.studyPlan] : [])
    }
  };
}

/**
 * Validates Teacher AI Assistant response
 */
function validateTeacherAssistantResponse(data) {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Malformed teacher assistant response.', data: null };
  }

  return {
    isValid: true,
    data: {
      title: data.title || 'Teacher Assistant Guidance',
      responseType: data.responseType || 'general_guidance',
      content: data.content || data.explanation || '',
      suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
      actionItems: Array.isArray(data.actionItems) ? data.actionItems : [],
      materials: Array.isArray(data.materials) ? data.materials : [],
      anonymizedInsights: data.anonymizedInsights || null
    }
  };
}

/**
 * Validates AI Performance Insights response
 */
function validatePerformanceInsights(data) {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Malformed performance insights response.', data: null };
  }

  return {
    isValid: true,
    data: {
      overview: data.overview || 'Performance assessment summary based on verified classroom scores.',
      topicPerformance: Array.isArray(data.topicPerformance) ? data.topicPerformance : [],
      commonConceptualMistakes: Array.isArray(data.commonConceptualMistakes) ? data.commonConceptualMistakes : [],
      learningRecommendations: Array.isArray(data.learningRecommendations) ? data.learningRecommendations : [],
      revisionPriorities: Array.isArray(data.revisionPriorities) ? data.revisionPriorities : [],
      classroomInsights: Array.isArray(data.classroomInsights) ? data.classroomInsights : [],
      teachingInterventions: Array.isArray(data.teachingInterventions) ? data.teachingInterventions : []
    }
  };
}

module.exports = {
  calculateTextSimilarity,
  deduplicateQuestions,
  validateQuestion,
  validateQuizResponse,
  validateAnswerExplanation,
  validateStudyPlan,
  validateTeacherAssistantResponse,
  validatePerformanceInsights
};
