const { prisma } = require('../config/prisma');
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

    res.status(200).json({
      success: true,
      count: assessments.length,
      assessments
    });
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

module.exports = {
  listAssessments,
  createAssessment,
  startAssessmentAttempt,
  submitAnswerEvent,
  finalizeAttempt,
  getAttemptDetails
};
