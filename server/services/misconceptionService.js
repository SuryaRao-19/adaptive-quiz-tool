/**
 * Misconception Intelligence Engine
 * Section 20 — Explainable Misconception Analysis System
 * 
 * Provides:
 * - Deterministic, evidence-based diagnostic clustering of student errors.
 * - Minimum threshold guard (requires >= 2 consistent error instances to avoid false positives).
 * - Distinguishes Conceptual Misunderstanding, Calculation Error, Prerequisite Deficit, and Formula Confusion.
 * - Individual actionable evidence, confidence score, and remediation links.
 * - Cohort-level misconception aggregation and teacher remedial lesson suggestions.
 */

const MISCONCEPTION_TAXONOMY = {
  CONCEPTUAL_MISUNDERSTANDING: 'CONCEPTUAL_MISUNDERSTANDING',
  CALCULATION_ERROR: 'CALCULATION_ERROR',
  PREREQUISITE_DEFICIT: 'PREREQUISITE_DEFICIT',
  FORMULA_CONFUSION: 'FORMULA_CONFUSION'
};

// Known pedagogical misconceptions mapped to CBSE Grades 5-10
const KNOWN_MISCONCEPTIONS = {
  'sign_distribution_error': {
    tag: 'sign_distribution_error',
    title: 'Sign Error in Bracket Expansion / Negative Distribution',
    category: MISCONCEPTION_TAXONOMY.CONCEPTUAL_MISUNDERSTANDING,
    description: 'Student fails to distribute the negative sign to all terms inside parentheses, e.g., -(a - b) written as -a - b.',
    remedialFocus: 'Review distributive law with signed integers: -(x - y) = -x + y.',
    prerequisiteTopic: 'Integers & Signed Arithmetic'
  },
  'unlike_denominators_direct_add': {
    tag: 'unlike_denominators_direct_add',
    title: 'Direct Addition of Unlike Fraction Denominators',
    category: MISCONCEPTION_TAXONOMY.PREREQUISITE_DEFICIT,
    description: 'Adding numerator to numerator and denominator to denominator directly: a/b + c/d = (a+c)/(b+d).',
    remedialFocus: 'LCM finding and converting to equivalent like fractions before addition.',
    prerequisiteTopic: 'Equivalent Fractions & LCM'
  },
  'order_of_operations_pemdas': {
    tag: 'order_of_operations_pemdas',
    title: 'Left-to-Right Evaluation Ignoring Operator Precedence (BODMAS)',
    category: MISCONCEPTION_TAXONOMY.CALCULATION_ERROR,
    description: 'Performing addition or subtraction prior to multiplication or division without grouping brackets.',
    remedialFocus: 'Systematic application of BODMAS/PEMDAS rule step-by-step.',
    prerequisiteTopic: 'BODMAS Hierarchy'
  },
  'respiration_photosynthesis_inversion': {
    tag: 'respiration_photosynthesis_inversion',
    title: 'Confusing Plant Respiration with Photosynthesis',
    category: MISCONCEPTION_TAXONOMY.CONCEPTUAL_MISUNDERSTANDING,
    description: 'Believing plants only respire at night or only consume CO2 without 24-hour cellular respiration.',
    remedialFocus: 'Distinguishing energy production (mitochondria) from glucose synthesis (chloroplasts).',
    prerequisiteTopic: 'Cellular Respiration in Autotrophs'
  },
  'action_reaction_cancel_myth': {
    tag: 'action_reaction_cancel_myth',
    title: 'Newton Third Law Mutual Cancellation Misconception',
    category: MISCONCEPTION_TAXONOMY.CONCEPTUAL_MISUNDERSTANDING,
    description: 'Believing action-reaction pairs cancel each other out to produce zero net force.',
    remedialFocus: 'Clarifying that action and reaction forces act on two completely different bodies.',
    prerequisiteTopic: 'Newton Laws of Motion & Free Body Diagrams'
  }
};

/**
 * Analyzes an individual student's historical response stream
 * Requires >= 2 error occurrences of a specific misconception to emit a validated diagnosis
 */
function analyzeStudentMisconceptions(studentId, { history = [], subject = 'Mathematics', gradeLevel = 7 } = {}) {
  if (!Array.isArray(history) || history.length === 0) {
    return {
      studentId,
      subject,
      gradeLevel,
      diagnosedMisconceptions: [],
      hasDiagnosedIssues: false,
      analyzedAttemptsCount: 0,
      summary: 'Insufficient response data to diagnose learning misconceptions.'
    };
  }

  // Filter incorrect responses
  const incorrectResponses = history.filter(h => h.isCorrect === false);
  const tagCounts = {};
  const topicErrorCounts = {};

  incorrectResponses.forEach(r => {
    const tag = r.misconceptionTag || (r.tags && r.tags.find(t => KNOWN_MISCONCEPTIONS[t])) || 'general_conceptual_gap';
    tagCounts[tag] = tagCounts[tag] || [];
    tagCounts[tag].push(r);

    const topic = r.topic || 'General';
    topicErrorCounts[topic] = (topicErrorCounts[topic] || 0) + 1;
  });

  const diagnosedMisconceptions = [];

  Object.entries(tagCounts).forEach(([tag, occurrences]) => {
    // Strict threshold: at least 2 occurrences required to prevent false positives
    if (occurrences.length >= 2) {
      const known = KNOWN_MISCONCEPTIONS[tag] || {
        tag,
        title: tag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        category: MISCONCEPTION_TAXONOMY.CONCEPTUAL_MISUNDERSTANDING,
        description: `Repeated difficulty detected on ${tag.replace(/_/g, ' ')}.`,
        remedialFocus: 'Guided Socratic review of core concepts and step-by-step verification.',
        prerequisiteTopic: occurrences[0]?.topic || 'Foundational Principles'
      };

      const confidence = Math.min(0.96, 0.65 + (occurrences.length - 2) * 0.10);

      diagnosedMisconceptions.push({
        tag: known.tag,
        title: known.title,
        category: known.category,
        severity: occurrences.length >= 4 ? 'HIGH' : 'MEDIUM',
        confidence: Math.round(confidence * 100) / 100,
        occurrencesCount: occurrences.length,
        evidence: `Student demonstrated this specific error pattern across ${occurrences.length} independent questions (e.g., Question IDs: ${occurrences.slice(0, 3).map(o => o.questionId || 'Q-Ref').join(', ')}).`,
        explanation: known.description,
        remedialRecommendation: known.remedialFocus,
        prerequisiteTopic: known.prerequisiteTopic,
        recommendedPracticeFilter: {
          topic: occurrences[0]?.topic,
          difficulty: 'Easy',
          practiceType: 'Error Recovery'
        }
      });
    }
  });

  // Sort by severity (HIGH first) then occurrences count
  diagnosedMisconceptions.sort((a, b) => b.occurrencesCount - a.occurrencesCount);

  return {
    studentId,
    subject,
    gradeLevel,
    analyzedAttemptsCount: history.length,
    incorrectCount: incorrectResponses.length,
    hasDiagnosedIssues: diagnosedMisconceptions.length > 0,
    diagnosedMisconceptions,
    topicErrorCounts,
    summary: diagnosedMisconceptions.length > 0
      ? `Identified ${diagnosedMisconceptions.length} validated pedagogical misconception(s) requiring targeted intervention.`
      : 'No persistent misconceptions detected. Isolated errors observed without systematic pattern.'
  };
}

/**
 * Aggregates misconceptions across an entire classroom cohort
 */
function analyzeClassroomMisconceptions(classroomId, { cohortResponses = [], studentRoster = [] } = {}) {
  const clusterMap = {};
  const studentCount = studentRoster.length || 28;

  cohortResponses.forEach(r => {
    if (r.isCorrect === false) {
      const tag = r.misconceptionTag || 'general_conceptual_gap';
      clusterMap[tag] = clusterMap[tag] || {
        tag,
        students: new Set(),
        errorCount: 0,
        topic: r.topic || 'General'
      };
      clusterMap[tag].students.add(r.studentId);
      clusterMap[tag].errorCount += 1;
    }
  });

  const commonMisconceptions = Object.values(clusterMap)
    .filter(c => c.students.size >= 2) // At least 2 students affected in the class
    .map(c => {
      const known = KNOWN_MISCONCEPTIONS[c.tag] || {
        title: c.tag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        category: MISCONCEPTION_TAXONOMY.CONCEPTUAL_MISUNDERSTANDING,
        remedialFocus: 'Conduct full-class concept clarification and board demonstration.'
      };
      const affectedPercentage = Math.round((c.students.size / studentCount) * 100);

      return {
        tag: c.tag,
        title: known.title,
        category: known.category,
        topic: c.topic,
        affectedStudentCount: c.students.size,
        affectedPercentage,
        totalErrorsObserved: c.errorCount,
        severity: affectedPercentage >= 30 ? 'CRITICAL' : (affectedPercentage >= 15 ? 'HIGH' : 'MODERATE'),
        recommendedRemedialAction: known.remedialFocus
      };
    })
    .sort((a, b) => b.affectedStudentCount - a.affectedStudentCount);

  return {
    classroomId,
    totalStudents: studentCount,
    commonMisconceptions,
    remedialLessonPlansRecommended: commonMisconceptions.slice(0, 3).map(m => ({
      topic: m.topic,
      lessonFocus: m.title,
      strategy: m.recommendedRemedialAction,
      targetGroupSize: m.affectedStudentCount
    }))
  };
}

module.exports = {
  MISCONCEPTION_TAXONOMY,
  KNOWN_MISCONCEPTIONS,
  analyzeStudentMisconceptions,
  analyzeClassroomMisconceptions
};
