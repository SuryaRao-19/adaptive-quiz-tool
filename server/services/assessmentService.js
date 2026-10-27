const { prisma } = require('../config/prisma');

/**
 * Starts a new assessment attempt for a student.
 * Initializes the attempt in IN_PROGRESS status with UTC timestamps and stable UUID.
 */
async function startAttempt({ studentId, assessmentId, mode = 'PRACTICE', metadata = null }) {
  const student = await prisma.student.findUnique({
    where: { id: studentId }
  });

  if (!student) {
    throw new Error('Student record not found.');
  }

  let assessment = null;
  if (assessmentId) {
    assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId }
    });
  }

  const attempt = await prisma.attempt.create({
    data: {
      studentId: student.id,
      assessmentId: assessment ? assessment.id : null,
      mode: ['PRACTICE', 'PRE_TEST', 'POST_TEST', 'TEST'].includes(mode) ? mode : 'PRACTICE',
      status: 'IN_PROGRESS',
      startedAt: new Date(),
      metadata: metadata || undefined
    }
  });

  return attempt;
}

/**
 * Records an individual answer event with idempotent deduplication and version preservation.
 */
async function recordAnswerEvent({
  attemptId,
  questionId,
  selectedOptionIndex,
  timeSpentSeconds = 0,
  confidence = 'UNSPECIFIED',
  eventId = null,
  idempotencyKey = null,
  clientTimestamp = null
}) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId }
  });

  if (!attempt) {
    throw new Error('Attempt not found.');
  }

  if (attempt.status !== 'IN_PROGRESS') {
    throw new Error(`Cannot record answer on attempt with status '${attempt.status}'. Attempt is closed.`);
  }

  // 1. Idempotency Check by eventId or idempotencyKey
  if (eventId || idempotencyKey) {
    const existingEvent = await prisma.answerEvent.findFirst({
      where: {
        OR: [
          eventId ? { eventId } : undefined,
          idempotencyKey ? { idempotencyKey } : undefined
        ].filter(Boolean)
      }
    });

    if (existingEvent) {
      return {
        duplicate: true,
        answerEventId: existingEvent.id,
        isCorrect: existingEvent.isCorrect,
        message: 'Answer event already processed.'
      };
    }
  }

  // 2. Fetch authoritative Question and latest QuestionVersion
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: {
      versions: {
        orderBy: { version: 'desc' },
        take: 1
      }
    }
  });

  if (!question) {
    throw new Error('Question not found.');
  }

  const activeVersion = question.versions[0];
  const authoritativeCorrectIndex = question.correctAnswerIndex;
  const isCorrect = Number(selectedOptionIndex) === authoritativeCorrectIndex;

  const validConfidence = ['UNSPECIFIED', 'GUESSING', 'SOMEWHAT_SURE', 'VERY_SURE'].includes(confidence)
    ? confidence
    : 'UNSPECIFIED';

  const answerEvent = await prisma.answerEvent.create({
    data: {
      attemptId: attempt.id,
      questionId: question.id,
      questionVersionId: activeVersion ? activeVersion.id : null,
      selectedOptionIndex: selectedOptionIndex !== undefined ? Number(selectedOptionIndex) : null,
      isCorrect,
      timeSpentSeconds: Number(timeSpentSeconds) || 0,
      confidence: validConfidence,
      eventId: eventId || null,
      idempotencyKey: idempotencyKey || null,
      clientTimestamp: clientTimestamp ? new Date(clientTimestamp) : null,
      serverTimestamp: new Date(),
      source: 'online'
    }
  });

  return {
    duplicate: false,
    answerEventId: answerEvent.id,
    isCorrect,
    correctAnswerIndex: authoritativeCorrectIndex,
    explanation: question.explanation,
    steps: question.steps,
    conceptSummary: question.conceptSummary,
    misconception: question.misconception
  };
}

/**
 * Authoritative transactional submission of an attempt.
 * Locks the attempt, computes authoritative scores, finalizes gradebook entry,
 * and updates question response telemetry.
 */
async function submitAttempt({ attemptId, studentId }) {
  return await prisma.$transaction(async (tx) => {
    const attempt = await tx.attempt.findUnique({
      where: { id: attemptId },
      include: {
        assessment: true,
        answerEvents: {
          include: { question: true }
        }
      }
    });

    if (!attempt) {
      throw new Error('Attempt not found.');
    }

    if (studentId && attempt.studentId !== studentId) {
      throw new Error('Unauthorized: Student does not own this attempt.');
    }

    if (attempt.status === 'SUBMITTED') {
      return {
        alreadySubmitted: true,
        attemptId: attempt.id,
        scorePercentage: attempt.scorePercentage,
        submittedAt: attempt.submittedAt,
        message: 'Attempt has already been finalized.'
      };
    }

    const answerEvents = attempt.answerEvents;
    const totalCount = answerEvents.length;
    const correctCount = answerEvents.filter(a => a.isCorrect).length;

    const scorePercentage = totalCount > 0
      ? Math.round((correctCount / totalCount) * 100)
      : 0;

    const maxScore = attempt.assessment?.maxScore || 100.0;
    const authoritativeScore = Math.round((scorePercentage / 100) * maxScore * 10) / 10;
    const now = new Date();
    const durationSeconds = Math.round((now.getTime() - attempt.startedAt.getTime()) / 1000);

    // Finalize attempt
    const updatedAttempt = await tx.attempt.update({
      where: { id: attempt.id },
      data: {
        status: 'SUBMITTED',
        submittedAt: now,
        durationSeconds,
        score: authoritativeScore,
        maxScore,
        scorePercentage,
        isCorrect: correctCount === totalCount
      }
    });

    // Finalize Gradebook Entry if associated with an assessment and classroom
    if (attempt.assessment && attempt.assessment.classroomId) {
      await tx.gradebookEntry.upsert({
        where: {
          classroomId_studentId_assessmentId: {
            classroomId: attempt.assessment.classroomId,
            studentId: attempt.studentId,
            assessmentId: attempt.assessment.id
          }
        },
        update: {
          attemptId: attempt.id,
          postScore: scorePercentage,
          masteryPercentage: scorePercentage,
          status: 'FINALIZED',
          finalizedAt: now
        },
        create: {
          classroomId: attempt.assessment.classroomId,
          studentId: attempt.studentId,
          assessmentId: attempt.assessment.id,
          attemptId: attempt.id,
          postScore: scorePercentage,
          masteryPercentage: scorePercentage,
          status: 'FINALIZED',
          finalizedAt: now
        }
      });
    }

    // Update Question Statistics for all answered questions
    for (const event of answerEvents) {
      await tx.questionStatistic.upsert({
        where: {
          questionId_questionVersion: {
            questionId: event.questionId,
            questionVersion: 1
          }
        },
        update: {
          totalResponses: { increment: 1 },
          correctResponses: { increment: event.isCorrect ? 1 : 0 },
          calculatedAt: now
        },
        create: {
          questionId: event.questionId,
          questionVersion: 1,
          totalResponses: 1,
          correctResponses: event.isCorrect ? 1 : 0,
          calculatedAt: now
        }
      });
    }

    return {
      success: true,
      attemptId: updatedAttempt.id,
      totalQuestions: totalCount,
      correctAnswers: correctCount,
      score: authoritativeScore,
      maxScore,
      scorePercentage,
      submittedAt: now
    };
  });
}

/**
 * Transitions an in-progress attempt to ABANDONED.
 */
async function abandonAttempt({ attemptId, studentId }) {
  const attempt = await prisma.attempt.findUnique({ where: { id: attemptId } });
  if (!attempt) throw new Error('Attempt not found.');
  if (studentId && attempt.studentId !== studentId) throw new Error('Unauthorized.');
  if (attempt.status !== 'IN_PROGRESS') return attempt;

  return await prisma.attempt.update({
    where: { id: attemptId },
    data: { status: 'ABANDONED', updatedAt: new Date() }
  });
}

module.exports = {
  startAttempt,
  recordAnswerEvent,
  submitAttempt,
  abandonAttempt
};
