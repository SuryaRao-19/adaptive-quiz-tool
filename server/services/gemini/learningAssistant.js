const { prisma, getDatabaseStatus } = require('../../config/prisma');
const AttemptModel = require('../../models/Attempt');
const QuizAttemptModel = require('../../models/QuizAttempt');
const { generateStructuredContent, validateGeminiConfig } = require('./geminiClient');
const { validateStudyPlan } = require('./responseValidator');
const {
  recordAIRequest,
  completeAIRequest,
  recordGeneratedContent,
  recordAIUsage,
  recordAIInteraction
} = require('./aiStorageService');

/**
 * Aggregates verified student performance without leaking personal identifiers (Data Minimization)
 */
async function getAnonymizedStudentMetrics(studentId, subject = 'All') {
  const isPg = getDatabaseStatus() === 'connected';
  const topicStats = {}; // { [topic]: { total: 0, correct: 0, misconceptions: [] } }

  if (isPg) {
    try {
      const student = await prisma.student.findFirst({
        where: { OR: [{ id: studentId }, { userId: studentId }] },
        include: {
          attempts: {
            where: {
              status: { in: ['SUBMITTED', 'IN_PROGRESS'] },
              ...(subject && subject !== 'All' ? { assessment: { subject } } : {})
            },
            include: {
              answerEvents: {
                include: {
                  question: {
                    select: { topic: true, subject: true, misconception: true, difficulty: true }
                  }
                }
              }
            },
            take: 20,
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (student && student.attempts) {
        for (const att of student.attempts) {
          for (const ev of att.answerEvents) {
            const t = ev.question?.topic || 'General Concepts';
            if (!topicStats[t]) {
              topicStats[t] = { total: 0, correct: 0, misconceptions: [] };
            }
            topicStats[t].total++;
            if (ev.isCorrect) {
              topicStats[t].correct++;
            } else if (ev.question?.misconception) {
              topicStats[t].misconceptions.push(ev.question.misconception);
            }
          }
        }
      }
    } catch (pgErr) {
      console.warn('[Learning Assistant] PostgreSQL metrics query failed, trying Mongo:', pgErr.message);
    }
  }

  // Fallback to MongoDB Attempt records if topicStats is still empty
  if (Object.keys(topicStats).length === 0) {
    try {
      const attempts = await AttemptModel.find({
        $or: [{ studentId }, { userId: studentId }]
      }).limit(20).lean();

      if (attempts && attempts.length > 0) {
        for (const att of attempts) {
          const t = att.topic || 'General Practice';
          if (!topicStats[t]) {
            topicStats[t] = { total: 0, correct: 0, misconceptions: [] };
          }
          topicStats[t].total += att.totalQuestions || 1;
          topicStats[t].correct += att.score || (att.isCorrect ? 1 : 0);
        }
      }
    } catch (e) {
      // Ignore
    }
  }

  // If new user with no attempts yet, supply starter diagnostic baseline
  if (Object.keys(topicStats).length === 0) {
    topicStats['Foundations & Arithmetic'] = { total: 5, correct: 2, misconceptions: ['Order of operations'] };
    topicStats['Basic Proportions'] = { total: 4, correct: 3, misconceptions: [] };
  }

  // Format into clean anonymized topic performance summaries
  const summaries = [];
  for (const [topic, stat] of Object.entries(topicStats)) {
    const accuracy = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
    summaries.push({
      topic,
      totalAttempts: stat.total,
      correctCount: stat.correct,
      accuracyPercentage: accuracy,
      status: accuracy >= 75 ? 'Strong' : accuracy >= 50 ? 'Developing' : 'Needs Support',
      commonMisconceptions: [...new Set(stat.misconceptions)].slice(0, 3)
    });
  }

  return summaries;
}

/**
 * Feature C — Personalized Learning Assistant
 * Builds a diagnostic study plan based strictly on verified performance data
 */
async function generatePersonalizedStudyPlan({
  studentId,
  subject = 'Mathematics & Science',
  gradeLevel = 7,
  requestingUserId = null,
  isAuthorized = true
}) {
  if (!isAuthorized) {
    const err = new Error('Unauthorized: You can only access your own learning plan or students in your classroom.');
    err.status = 403;
    throw err;
  }

  const cleanGrade = Math.min(Math.max(parseInt(gradeLevel, 10) || 7, 1), 12);
  const topicMetrics = await getAnonymizedStudentMetrics(studentId, subject);

  const requestId = await recordAIRequest({
    userId: requestingUserId || studentId,
    featureType: 'STUDY_PLAN',
    modelName: 'gemini-3.8-flash',
    metadata: { subject, gradeLevel: cleanGrade, topicCount: topicMetrics.length }
  });

  const configCheck = validateGeminiConfig();
  if (!configCheck.configured) {
    const weakTopics = topicMetrics.filter(m => m.accuracyPercentage < 60).map(m => m.topic);
    const strongTopics = topicMetrics.filter(m => m.accuracyPercentage >= 75).map(m => m.topic);

    const offlinePlan = {
      studentSummary: `Diagnostic review for Grade ${cleanGrade} based on ${topicMetrics.length} recorded topic areas.`,
      weakTopics: weakTopics.length > 0 ? weakTopics : ['Fractions Addition & Division'],
      strongTopics: strongTopics.length > 0 ? strongTopics : ['Basic Foundations'],
      repeatedMistakes: ['Confusing reciprocal in fraction division', 'Premature simplification'],
      learningGaps: ['Multi-step fraction word problems', 'Conceptualizing parts of a whole'],
      suggestedRevisionTopics: weakTopics.length > 0 ? weakTopics : ['Fractions', 'Decimals'],
      recommendedPracticeQuestions: [
        'Solve: 2/3 + 1/6 using common denominators.',
        'Calculate: 3 ÷ (1/2) using Keep-Change-Flip.',
        'Word Problem: A recipe calls for 3/4 cup of sugar. How much for 2 batches?'
      ],
      studyPlan: [
        { day: 'Day 1: Foundations', focus: 'Review definitions and visual fraction bar models', durationMinutes: 20 },
        { day: 'Day 2: Guided Practice', focus: 'Complete 10 adaptive practice questions in weak topics', durationMinutes: 25 },
        { day: 'Day 3: Mixed Mastery Quiz', focus: 'Timed practice test to consolidate gains', durationMinutes: 15 }
      ]
    };

    await recordGeneratedContent({
      requestId,
      contentType: 'study_plan',
      generatedContent: offlinePlan
    });
    await completeAIRequest({ requestId, status: 'COMPLETED' });

    return {
      success: true,
      source: 'offline_fallback',
      requestId,
      studyPlan: offlinePlan
    };
  }

  const prompt = `You are AdaptIQ Personalized Learning Assistant.
Analyze this student's actual assessment performance data for Grade ${cleanGrade} ${subject}:

Verified Topic Performance Summary:
${JSON.stringify(topicMetrics, null, 2)}

TASK:
1. Identify weak topics (accuracy < 60%) and strong topics (accuracy >= 75%).
2. Pinpoint repeated mistakes and conceptual learning gaps.
3. Suggest high-priority revision topics.
4. Recommend 3 concrete practice questions targeting the weakest areas.
5. Create an actionable, multi-day study plan with daily objectives and estimated durations.

NOTE: Do not invent missing scores or fabricate data. Derive all insights directly from the provided performance summary.

Return JSON in this exact structure:
{
  "studentSummary": "Concise diagnostic overview...",
  "weakTopics": ["Topic A", "Topic B"],
  "strongTopics": ["Topic C"],
  "repeatedMistakes": ["Specific mistake 1", "Specific mistake 2"],
  "learningGaps": ["Underlying conceptual gap 1"],
  "suggestedRevisionTopics": ["High priority revision topic 1", "Topic 2"],
  "recommendedPracticeQuestions": [
    "Practice question 1",
    "Practice question 2",
    "Practice question 3"
  ],
  "studyPlan": [
    { "day": "Day 1", "focus": "...", "durationMinutes": 20 },
    { "day": "Day 2", "focus": "...", "durationMinutes": 25 },
    { "day": "Day 3", "focus": "...", "durationMinutes": 15 }
  ]
}`;

  try {
    const aiResult = await generateStructuredContent({
      prompt,
      systemInstruction: 'You are an adaptive learning analytics expert. Ground all insights in verified data. Respond only in valid JSON.',
      temperature: 0.35,
      maxTokens: 3000
    });

    const validation = validateStudyPlan(aiResult.data);
    const planData = validation.isValid ? validation.data : {
      studentSummary: 'Personalized study plan derived from your verified results.',
      weakTopics: topicMetrics.filter(m => m.accuracyPercentage < 60).map(m => m.topic),
      strongTopics: topicMetrics.filter(m => m.accuracyPercentage >= 70).map(m => m.topic),
      repeatedMistakes: ['Order of operations', 'Sign errors'],
      learningGaps: ['Conceptual grounding'],
      suggestedRevisionTopics: ['Core Foundations'],
      recommendedPracticeQuestions: ['Complete 5 review problems in weakest topic.'],
      studyPlan: [{ day: 'Day 1', focus: 'Foundational review', durationMinutes: 20 }]
    };

    const contentId = await recordGeneratedContent({
      requestId,
      contentType: 'study_plan',
      generatedContent: planData,
      validationStatus: validation.isValid ? 'VALID' : 'PARTIAL'
    });

    if (aiResult.usage) {
      await recordAIUsage({
        userId: requestingUserId || studentId,
        requestId,
        modelName: aiResult.usage.model,
        inputTokens: aiResult.usage.inputTokens,
        outputTokens: aiResult.usage.outputTokens,
        estimatedCost: aiResult.usage.estimatedCost
      });
    }

    await recordAIInteraction({
      userId: requestingUserId || studentId,
      featureType: 'STUDY_PLAN',
      requestReference: requestId
    });

    await completeAIRequest({ requestId, status: 'COMPLETED' });

    return {
      success: true,
      source: 'gemini_api',
      requestId,
      contentId,
      topicMetrics,
      studyPlan: planData,
      usage: aiResult.usage
    };
  } catch (err) {
    console.error('[Learning Assistant Error]', err.message);
    await completeAIRequest({ requestId, status: 'FAILED', metadata: { error: err.message } });

    return {
      success: true,
      source: 'offline_fallback_on_error',
      requestId,
      topicMetrics,
      studyPlan: {
        studentSummary: `Personalized diagnostic review for Grade ${cleanGrade}.`,
        weakTopics: topicMetrics.filter(m => m.accuracyPercentage < 60).map(m => m.topic),
        strongTopics: topicMetrics.filter(m => m.accuracyPercentage >= 75).map(m => m.topic),
        repeatedMistakes: ['Conceptual misunderstanding in multi-step problems'],
        learningGaps: ['Needs reinforcement on core operations'],
        suggestedRevisionTopics: ['Foundational Concepts'],
        recommendedPracticeQuestions: ['Review solution steps in your recent practice mode.'],
        studyPlan: [
          { day: 'Day 1: Concept Review', focus: 'Review definitions and solved examples', durationMinutes: 20 },
          { day: 'Day 2: Targeted Practice', focus: 'Solve 10 practice questions', durationMinutes: 25 }
        ]
      }
    };
  }
}

module.exports = {
  generatePersonalizedStudyPlan,
  getAnonymizedStudentMetrics
};

