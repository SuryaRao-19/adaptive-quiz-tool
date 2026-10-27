const { prisma, verifyDatabaseConnection } = require('../config/prisma');

/**
 * Gateway & Offline Synchronization Service (Phases 5 & 9)
 * Manages local classroom gateway health, sync state machine, idempotent batch reconciliation,
 * and quarantine handling for unverified offline attempts.
 */

async function getGatewayHealth() {
  const dbStatus = await verifyDatabaseConnection();
  const isGatewayMode = process.env.GATEWAY_MODE === 'true';

  let pendingQuarantinedCount = 0;
  if (dbStatus.ok) {
    try {
      pendingQuarantinedCount = await prisma.syncEvent.count({
        where: { status: 'QUARANTINED' }
      });
    } catch (e) {}
  }

  return {
    status: dbStatus.ok ? 'HEALTHY' : 'DEGRADED',
    mode: isGatewayMode ? 'classroom_gateway' : 'cloud',
    database: dbStatus.status,
    localLanBind: process.env.LOCAL_LAN_BIND || '127.0.0.1',
    contentBundleVersion: process.env.CONTENT_BUNDLE_VERSION || '2.0.0-stem-offline',
    pendingQuarantineCount: pendingQuarantinedCount,
    timestamp: new Date().toISOString()
  };
}

/**
 * Reconciles a batch of offline events received from client devices or classroom gateway.
 * Guarantees idempotency via eventId and client idempotency keys.
 */
async function reconcileGatewayEvents({ gatewayId = 'local_classroom_gateway', events = [] }) {
  if (!Array.isArray(events) || events.length === 0) {
    throw new Error('Must provide a non-empty array of events to reconcile.');
  }

  const processed = [];
  const duplicates = [];
  const quarantined = [];

  for (const evt of events) {
    const eventId = evt.eventId || evt.id;

    // 1. Missing mandatory eventId -> Quarantine immediately
    if (!eventId) {
      const generatedId = `quarantine_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await prisma.syncEvent.create({
        data: {
          gatewayId,
          eventType: evt.type || 'ATTEMPT_EVENT',
          eventId: generatedId,
          payload: evt,
          status: 'QUARANTINED',
          quarantineReason: 'Missing mandatory eventId'
        }
      });
      quarantined.push({ eventId: generatedId, reason: 'Missing mandatory eventId' });
      continue;
    }

    // 2. Idempotency Check: if eventId already processed in SyncEvent or AnswerEvent
    const existingSync = await prisma.syncEvent.findUnique({ where: { eventId } });
    if (existingSync && existingSync.status === 'PROCESSED') {
      duplicates.push(eventId);
      continue;
    }

    const existingAnswer = await prisma.answerEvent.findFirst({ where: { eventId } });
    if (existingAnswer) {
      duplicates.push(eventId);
      continue;
    }

    // 3. Validate Student Identity
    let student = null;
    if (evt.studentId) {
      student = await prisma.student.findUnique({ where: { id: evt.studentId } });
    } else if (evt.rollNumber) {
      student = await prisma.student.findUnique({ where: { rollNumber: String(evt.rollNumber).trim().toUpperCase() } });
    } else if (evt.userId) {
      student = await prisma.student.findUnique({ where: { userId: evt.userId } });
    }

    if (!student) {
      await prisma.syncEvent.upsert({
        where: { eventId },
        update: {
          status: 'QUARANTINED',
          quarantineReason: 'Unrecognized student identity or roll number'
        },
        create: {
          gatewayId,
          eventType: 'ATTEMPT_EVENT',
          eventId,
          payload: evt,
          status: 'QUARANTINED',
          quarantineReason: 'Unrecognized student identity or roll number'
        }
      });
      quarantined.push({ eventId, reason: 'Unrecognized student identity or roll number' });
      continue;
    }

    // 4. Persist Validated Offline Attempt Record
    try {
      await prisma.$transaction(async (tx) => {
        let attempt = await tx.attempt.create({
          data: {
            eventId,
            studentId: student.id,
            mode: 'PRACTICE',
            status: 'SUBMITTED',
            startedAt: evt.timestamp ? new Date(evt.timestamp) : new Date(),
            submittedAt: new Date(),
            durationSeconds: Number(evt.timeTaken) || 0,
            isCorrect: Boolean(evt.isCorrect),
            source: 'gateway_sync'
          }
        });

        if (evt.questionId) {
          await tx.answerEvent.create({
            data: {
              eventId,
              attemptId: attempt.id,
              questionId: evt.questionId,
              selectedOptionIndex: evt.selectedAnswerIndex !== undefined ? Number(evt.selectedAnswerIndex) : null,
              isCorrect: Boolean(evt.isCorrect),
              timeSpentSeconds: Number(evt.timeTaken) || 0,
              confidence: evt.confidence || 'UNSPECIFIED',
              source: 'gateway_sync'
            }
          });
        }

        await tx.syncEvent.upsert({
          where: { eventId },
          update: {
            status: 'PROCESSED',
            processedAt: new Date(),
            quarantineReason: null
          },
          create: {
            gatewayId,
            eventType: 'ATTEMPT_EVENT',
            eventId,
            payload: evt,
            status: 'PROCESSED',
            processedAt: new Date()
          }
        });
      });

      processed.push(eventId);
    } catch (insertError) {
      if (insertError.code === 'P2002') {
        // Unique constraint violation: duplicate event replay
        duplicates.push(eventId);
      } else {
        await prisma.syncEvent.upsert({
          where: { eventId },
          update: {
            status: 'QUARANTINED',
            quarantineReason: insertError.message
          },
          create: {
            gatewayId,
            eventType: 'ATTEMPT_EVENT',
            eventId,
            payload: evt,
            status: 'QUARANTINED',
            quarantineReason: insertError.message
          }
        });
        quarantined.push({ eventId, reason: insertError.message });
      }
    }
  }

  return {
    success: true,
    gatewayId,
    totalReceived: events.length,
    processedCount: processed.length,
    duplicateCount: duplicates.length,
    quarantinedCount: quarantined.length,
    results: {
      processed,
      duplicates,
      quarantined
    }
  };
}

async function getQuarantinedEvents() {
  const list = await prisma.syncEvent.findMany({
    where: { status: 'QUARANTINED' },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  return {
    success: true,
    count: list.length,
    quarantined: list
  };
}

module.exports = {
  getGatewayHealth,
  reconcileGatewayEvents,
  getQuarantinedEvents
};
