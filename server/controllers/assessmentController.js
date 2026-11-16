const { prisma, getDatabaseStatus } = require('../config/prisma');
const syntheticStore = require('../services/syntheticStore');
const {
  startAttempt,
  recordAnswerEvent,
  submitAttempt,
  abandonAttempt
} = require('../services/assessmentService');

/**
 * Assessment & Attempt Controller (Phases 4 & 7)
 */

// @desc List assessments (Filterable by classroom, subject, assessmentType)
// @route GET /api/assessments
const listAssessments = async (req, res, next) => {
  try {
    if (getDatabaseStatus() === 'connected') {
      try {
        const { classroomId, subject, assessmentType } = req.query;
        const where = {};

        if (classroomId) where.classroomId = classroomId;
        if (subject && subject !== 'All') where.subject = subject;
        if (assessmentType) where.assessmentType = assessmentType;

        const assessments = await prisma.assessment.findMany({
          where,
          include: {
            items: {
              include: {
                question: {
                  select: {
                    id: true,
                    subject: true,
                    topic: true,
                    difficulty: true,
                    questionText: true,
                    options: true
                  }
                }
              },
              orderBy: { itemOrder: 'asc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        if (assessments.length > 0) {
          return res.status(200).json({
            success: true,
            count: assessments.length,
            assessments
          });
        }
      } catch (err) {
        console.warn('[AssessmentController] Prisma list query fallback:', err.message);
      }
    }

    // SyntheticStore fallback
    const synAssessments = syntheticStore.getAssessments();
    return res.status(200).json({
      success: true,
      count: synAssessments.length,
      assessments: synAssessments
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single assessment details by ID
// @route GET /api/assessments/:id
const getAssessmentDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const synAssessment = syntheticStore.getAssessments().find(a => a.id === id);
    if (synAssessment) {
      return res.status(200).json({
        success: true,
        assessment: synAssessment
      });
    }

    if (getDatabaseStatus() === 'connected') {
      const assessment = await prisma.assessment.findUnique({
        where: { id },
        include: {
          items: {
            include: { question: true },
            orderBy: { itemOrder: 'asc' }
          }
        }
      });
      if (assessment) {
        return res.status(200).json({ success: true, assessment });
      }
    }

    return res.status(404).json({ success: false, message: 'Assessment not found.' });
  } catch (error) {
    next(error);
  }
};

// @desc Create a new assessment (Teacher/Admin)
// @route POST /api/assessments
const createAssessment = async (req, res, next) => {
  try {
    const { title, subject, topic, assessmentType, durationMinutes, maxScore, passingScore, classroomId, questionIds } = req.body;

    if (!title || !subject) {
      return res.status(400).json({ success: false, message: 'Assessment title and subject are required.' });
    }

    const type = ['PRE_TEST', 'POST_TEST', 'PRACTICE', 'FORMATIVE_TEST'].includes(assessmentType)
      ? assessmentType
      : 'PRACTICE';

    const newAssessment = await prisma.assessment.create({
      data: {
        title: title.trim(),
        subject,
        topic: topic ? topic.trim() : null,
        assessmentType: type,
        durationMinutes: Number(durationMinutes) || 15,
        maxScore: Number(maxScore) || 100.0,
        passingScore: Number(passingScore) || 60.0,
        classroomId: classroomId || null,
        createdById: req.user.id
      }
    });

    // Attach questions if provided
    if (Array.isArray(questionIds) && questionIds.length > 0) {
      for (let i = 0; i < questionIds.length; i++) {
        await prisma.assessmentItem.create({
          data: {
            assessmentId: newAssessment.id,
            questionId: questionIds[i],
            itemOrder: i + 1,
            points: Math.round((100 / questionIds.length) * 10) / 10
          }
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully.',
      assessment: newAssessment
    });
  } catch (error) {
    next(error);
  }
};

// @desc Start an assessment attempt
// @route POST /api/assessments/:id/start
const startAssessmentAttempt = async (req, res, next) => {
  try {
    const assessmentId = req.params.id;
    const studentId = req.user.studentProfile?.id || req.body.studentId;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student profile required to start assessment attempt.' });
    }

    const attempt = await startAttempt({
      studentId,
      assessmentId,
      mode: req.body.mode || 'TEST'
    });

    res.status(201).json({
      success: true,
      attemptId: attempt.id,
      startedAt: attempt.startedAt,
      status: attempt.status
    });
  } catch (error) {
    next(error);
  }
};

// @desc Record an answer event with idempotency
// @route POST /api/attempts/:id/answer
const submitAnswerEvent = async (req, res, next) => {
  try {
    const attemptId = req.params.id;
    const {
      questionId,
      selectedOptionIndex,
      timeSpentSeconds,
      confidence,
      eventId,
      idempotencyKey,
      clientTimestamp
    } = req.body;

    if (!questionId || selectedOptionIndex === undefined) {
      return res.status(400).json({ success: false, message: 'questionId and selectedOptionIndex are required.' });
    }

    const result = await recordAnswerEvent({
      attemptId,
      questionId,
      selectedOptionIndex,
      timeSpentSeconds,
      confidence,
      eventId,
      idempotencyKey,
      clientTimestamp
    });

    res.status(result.duplicate ? 200 : 201).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

// @desc Finalize and submit an attempt authoritatively in a transaction
// @route POST /api/attempts/:id/submit
const finalizeAttempt = async (req, res, next) => {
  try {
    const attemptId = req.params.id;
    const studentId = req.user.studentProfile?.id || null;

    const result = await submitAttempt({ attemptId, studentId });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

// @desc Retrieve an attempt with detailed score & feedback
// @route GET /api/attempts/:id
const getAttemptDetails = async (req, res, next) => {
  try {
    const attempt = await prisma.attempt.findUnique({
      where: { id: req.params.id },
      include: {
        assessment: true,
        answerEvents: {
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                options: true,
                correctAnswerIndex: true,
                explanation: true,
                steps: true,
                conceptSummary: true,
                misconception: true
              }
            }
          }
        }
      }
    });

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found.' });
    }

    res.status(200).json({
      success: true,
      attempt
    });
  } catch (error) {
    next(error);
  }
};

// @desc Direct assessment submission & auto-scoring endpoint
// @route POST /api/assessments/:id/submit
const submitAssessmentHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      studentId,
      studentName,
      rollNumber,
      answers = {},
      score,
      maxScore = 20,
      scorePercentage,
      weakTopic,
      weakTopics
    } = req.body;

    const assessment = syntheticStore.getAssessments().find(a => a.id === id);
    const questions = assessment?.questions || [];

    // Server-side recalculation/verification of score if questions exist
    let verifiedCorrect = 0;
    const topicStats = {};

    questions.forEach(q => {
      const correctIdx = q.correctAnswerIndex ?? q.correctIndex;
      const userSelected = answers[q.id];
      const isCorrect = userSelected !== undefined && Number(userSelected) === correctIdx;
      if (isCorrect) verifiedCorrect++;

      const t = q.topic || 'General Mathematics';
      if (!topicStats[t]) topicStats[t] = { correct: 0, total: 0 };
      topicStats[t].total++;
      if (isCorrect) topicStats[t].correct++;
    });

    const finalCorrect = questions.length > 0 ? verifiedCorrect : (score ?? 0);
    const finalMax = questions.length > 0 ? questions.length : maxScore;
    const finalPercentage = Math.round((finalCorrect / finalMax) * 100);

    // Identify weak topic (lowest accuracy)
    let computedWeakTopic = weakTopic;
    if (!computedWeakTopic && Object.keys(topicStats).length > 0) {
      let lowest = 1.0;
      Object.entries(topicStats).forEach(([top, stats]) => {
        const acc = stats.total > 0 ? (stats.correct / stats.total) : 0;
        if (acc < lowest) {
          lowest = acc;
          computedWeakTopic = top;
        }
      });
    }

    const computedWeakTopics = Object.entries(topicStats)
      .filter(([_, stats]) => (stats.correct / stats.total) < 0.70)
      .map(([top]) => top);

    const attempt = syntheticStore.addAttempt({
      assessmentId: id,
      assessmentTitle: assessment?.title || 'Asian Public School — Grade 7 Mathematics Diagnostic Assessment',
      studentId: studentId || req.user?.id || req.user?._id || 'stu-g7-001',
      studentName: studentName || req.user?.name || req.user?.fullName || 'Aarav Patel',
      rollNumber: rollNumber || req.user?.rollNumber || 'APS-07-001',
      gradeLevel: assessment?.gradeLevel || 7,
      score: finalCorrect,
      totalScore: finalCorrect,
      maxScore: finalMax,
      scorePercentage: finalPercentage,
      correctCount: finalCorrect,
      totalQuestions: finalMax,
      finalBktMastery: finalPercentage / 100,
      weakTopic: computedWeakTopic || 'Fractions and Decimals',
      weakTopics: computedWeakTopics.length > 0 ? computedWeakTopics : (computedWeakTopic ? [computedWeakTopic] : []),
      autoSubmitted: Boolean(req.body.autoSubmitted),
      violationCount: Number(req.body.violationCount) || 0,
      violationReason: req.body.violationReason || null,
      status: req.body.autoSubmitted ? 'AUTO_SUBMITTED_VIOLATION' : 'SUBMITTED'
    });

    return res.status(200).json({
      success: true,
      message: 'Assessment attempt submitted and graded successfully.',
      attempt,
      metrics: {
        score: finalCorrect,
        maxScore: finalMax,
        percentage: finalPercentage,
        weakTopic: computedWeakTopic || 'Fractions and Decimals',
        weakTopics: computedWeakTopics,
        reason: `Your diagnostic results show that ${computedWeakTopic || 'this topic'} needs more practice. Let's begin with foundational questions.`
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listAssessments,
  getAssessmentDetails,
  submitAssessmentHandler,
  createAssessment,
  startAssessmentAttempt,
  submitAnswerEvent,
  finalizeAttempt,
  getAttemptDetails
};
