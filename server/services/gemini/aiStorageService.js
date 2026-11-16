const mongoose = require('mongoose');
const { prisma, getDatabaseStatus } = require('../../config/prisma');
const AIRequestModel = require('../../models/AIRequest');
const AIGeneratedContentModel = require('../../models/AIGeneratedContent');
const AIUsageModel = require('../../models/AIUsage');
const AIInteractionModel = require('../../models/AIInteraction');
const QuestionModel = require('../../models/Question');

/**
 * AI Storage Service
 * Manages operational persistence, audit trails, and teacher approval lifecycles across PostgreSQL, MongoDB, and local memory.
 */

const inMemoryStore = {
  requests: new Map(),
  contents: new Map(),
  usages: [],
  interactions: [],
  questions: []
};

function isMongoConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

function isPostgresConnected() {
  return getDatabaseStatus() === 'connected';
}

async function recordAIRequest({ userId = null, featureType, modelName, metadata = null }) {
  if (isPostgresConnected()) {
    try {
      const record = await prisma.aIRequest.create({
        data: {
          userId,
          featureType,
          modelName,
          status: 'PENDING',
          metadata: metadata || undefined
        }
      });
      return record.id;
    } catch (pgErr) {
      console.warn('[AI Storage] PostgreSQL create request failed, falling back to Mongo:', pgErr.message);
    }
  }

  if (isMongoConnected()) {
    try {
      const record = await AIRequestModel.create({
        userId,
        featureType,
        modelName,
        status: 'PENDING',
        metadata
      });
      return record._id.toString();
    } catch (err) {
      console.warn('[AI Storage] AIRequest recording failed:', err.message);
    }
  }

  // Fast in-memory fallback
  const id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  inMemoryStore.requests.set(id, {
    id,
    userId,
    featureType,
    modelName,
    status: 'PENDING',
    metadata,
    createdAt: new Date()
  });
  return id;
}

async function completeAIRequest({ requestId, status = 'COMPLETED', metadata = null }) {
  if (!requestId) return;

  if (isPostgresConnected()) {
    try {
      await prisma.aIRequest.update({
        where: { id: requestId },
        data: {
          status,
          completedAt: new Date(),
          metadata: metadata ? metadata : undefined
        }
      });
      return;
    } catch (e) {
      // Ignore
    }
  }

  if (isMongoConnected()) {
    try {
      await AIRequestModel.findByIdAndUpdate(requestId, {
        status,
        completedAt: new Date(),
        ...(metadata ? { metadata } : {})
      });
      return;
    } catch (err) {
      // Ignore
    }
  }

  if (inMemoryStore.requests.has(requestId)) {
    const rec = inMemoryStore.requests.get(requestId);
    rec.status = status;
    rec.completedAt = new Date();
    if (metadata) rec.metadata = metadata;
  }
}

async function recordGeneratedContent({
  requestId,
  contentType = 'quiz_questions',
  generatedContent,
  validationStatus = 'VALID',
  approvedById = null,
  approvedAt = null
}) {
  if (isPostgresConnected()) {
    try {
      const record = await prisma.aIGeneratedContent.create({
        data: {
          requestId,
          contentType,
          generatedContent,
          validationStatus,
          approvedById,
          approvedAt
        }
      });
      return record.id;
    } catch (pgErr) {
      console.warn('[AI Storage] PostgreSQL create content failed:', pgErr.message);
    }
  }

  if (isMongoConnected()) {
    try {
      const record = await AIGeneratedContentModel.create({
        requestId,
        contentType,
        generatedContent,
        validationStatus,
        approvedBy: approvedById,
        approvedAt
      });
      return record._id.toString();
    } catch (err) {
      console.warn('[AI Storage] Content recording failed:', err.message);
    }
  }

  // Fast in-memory fallback
  const id = `content_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  inMemoryStore.contents.set(id, {
    id,
    requestId,
    contentType,
    generatedContent,
    validationStatus,
    approvedBy: approvedById,
    approvedAt,
    publishedToBank: false,
    createdAt: new Date()
  });
  return id;
}

async function recordAIUsage({
  userId = null,
  requestId = null,
  modelName,
  inputTokens = 0,
  outputTokens = 0,
  estimatedCost = 0.0
}) {
  const usageEntry = {
    userId,
    requestId,
    modelName,
    inputTokens,
    outputTokens,
    estimatedCost,
    createdAt: new Date()
  };

  if (isPostgresConnected()) {
    try {
      await prisma.aIUsage.create({ data: usageEntry });
      return;
    } catch (pgErr) {
      console.warn('[AI Storage] PostgreSQL usage log failed:', pgErr.message);
    }
  }

  if (isMongoConnected()) {
    try {
      await AIUsageModel.create(usageEntry);
      return;
    } catch (err) {
      // Fallback
    }
  }

  inMemoryStore.usages.push(usageEntry);
}

async function recordAIInteraction({ userId = null, featureType, requestReference = null, metadata = null }) {
  const interactionEntry = {
    userId,
    featureType,
    requestReference,
    metadata,
    createdAt: new Date()
  };

  if (isPostgresConnected()) {
    try {
      await prisma.aIInteraction.create({
        data: {
          userId,
          featureType,
          requestReference,
          metadata: metadata || undefined
        }
      });
      return;
    } catch (e) {
      // Ignore
    }
  }

  if (isMongoConnected()) {
    try {
      await AIInteractionModel.create(interactionEntry);
      return;
    } catch (err) {
      // Ignore
    }
  }

  inMemoryStore.interactions.push(interactionEntry);
}

/**
 * Teacher Approval Workflow: Approves generated questions and publishes them to the authoritative question bank
 */
async function approveContent({ contentId, teacherId, questionsToPublish = null }) {
  const now = new Date();
  let contentRecord = inMemoryStore.contents.get(contentId) || null;

  if (isPostgresConnected()) {
    try {
      const pgContent = await prisma.aIGeneratedContent.findUnique({
        where: { id: contentId }
      });
      if (pgContent) {
        contentRecord = pgContent;
        await prisma.aIGeneratedContent.update({
          where: { id: contentId },
          data: {
            approvedById: teacherId,
            approvedAt: now,
            publishedToBank: true
          }
        });
      }
    } catch (e) {
      // Ignore
    }
  }

  if (!contentRecord && isMongoConnected()) {
    try {
      if (mongoose.Types.ObjectId.isValid(contentId)) {
        contentRecord = await AIGeneratedContentModel.findById(contentId);
      } else {
        contentRecord = await AIGeneratedContentModel.findOne({
          $or: [{ requestId: contentId }]
        });
      }
      if (contentRecord) {
        contentRecord.approvedBy = teacherId;
        contentRecord.approvedAt = now;
        contentRecord.publishedToBank = true;
        await contentRecord.save();
      }
    } catch (e) {
      // Ignore
    }
  }

  if (contentRecord && inMemoryStore.contents.has(contentId)) {
    const mem = inMemoryStore.contents.get(contentId);
    mem.approvedBy = teacherId;
    mem.approvedAt = now;
    mem.publishedToBank = true;
  }

  // Publish questions to authoritative bank
  const items = questionsToPublish || (contentRecord ? contentRecord.generatedContent : []);
  const publishedQuestions = [];

  if (Array.isArray(items) && items.length > 0) {
    for (const q of items) {
      if (isPostgresConnected()) {
        try {
          const pgQ = await prisma.question.create({
            data: {
              subject: q.subject || 'Math',
              topic: q.topic || 'General',
              difficulty: (q.difficulty || 'MEDIUM').toUpperCase(),
              questionText: q.questionText || q.question,
              options: q.options,
              correctAnswerIndex: Number(q.correctAnswerIndex) || 0,
              explanation: q.explanation || 'Teacher-approved question.',
              steps: q.steps || null,
              conceptSummary: q.conceptSummary || null,
              misconception: q.misconception || null,
              source: 'ai_generated',
              status: 'APPROVED',
              createdById: teacherId,
              isActive: true
            }
          });

          await prisma.questionVersion.create({
            data: {
              questionId: pgQ.id,
              version: 1,
              questionText: pgQ.questionText,
              options: pgQ.options,
              correctAnswerIndex: pgQ.correctAnswerIndex,
              explanation: pgQ.explanation,
              steps: pgQ.steps,
              conceptSummary: pgQ.conceptSummary,
              misconception: pgQ.misconception,
              changedById: teacherId
            }
          });

          publishedQuestions.push(pgQ);
          continue;
        } catch (pgInsertErr) {
          // Fallback
        }
      }

      if (isMongoConnected()) {
        try {
          const validTeacherObjectId = mongoose.Types.ObjectId.isValid(teacherId)
            ? teacherId
            : new mongoose.Types.ObjectId();

          const mongoQ = await QuestionModel.create({
            subject: q.subject || 'Math',
            topic: q.topic || 'General',
            difficulty: (q.difficulty || 'medium').toLowerCase(),
            questionText: q.questionText || q.question,
            options: q.options,
            correctAnswerIndex: Number(q.correctAnswerIndex) || 0,
            explanation: q.explanation || 'Teacher-approved question.',
            steps: q.steps || [],
            conceptSummary: q.conceptSummary,
            misconception: q.misconception,
            source: 'ai_generated',
            status: 'approved',
            createdBy: validTeacherObjectId,
            isActive: true
          });
          publishedQuestions.push(mongoQ);
          continue;
        } catch (mongoErr) {
          // Fallback
        }
      }

      // Memory fallback for published question
      const memQ = {
        id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        subject: q.subject || 'Math',
        topic: q.topic || 'General',
        difficulty: (q.difficulty || 'MEDIUM').toUpperCase(),
        questionText: q.questionText || q.question,
        options: q.options,
        correctAnswerIndex: Number(q.correctAnswerIndex) || 0,
        explanation: q.explanation || 'Teacher-approved question.',
        status: 'APPROVED',
        createdById: teacherId,
        source: 'ai_generated',
        isActive: true,
        createdAt: now
      };
      inMemoryStore.questions.push(memQ);
      publishedQuestions.push(memQ);
    }
  }

  return {
    success: true,
    contentId,
    approvedBy: teacherId,
    publishedCount: publishedQuestions.length,
    publishedQuestions
  };
}

/**
 * Returns aggregated usage statistics and cost estimations
 */
async function getUsageStats({ userId = null, role = 'student' }) {
  if (isPostgresConnected()) {
    try {
      const where = (role === 'admin' || !userId) ? {} : { userId };
      const records = await prisma.aIUsage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100
      });

      const totalInput = records.reduce((sum, r) => sum + (r.inputTokens || 0), 0);
      const totalOutput = records.reduce((sum, r) => sum + (r.outputTokens || 0), 0);
      const totalCost = records.reduce((sum, r) => sum + (r.estimatedCost || 0.0), 0);

      return {
        totalRequests: records.length,
        totalInputTokens: totalInput,
        totalOutputTokens: totalOutput,
        totalTokens: totalInput + totalOutput,
        estimatedCostUSD: Math.round(totalCost * 10000) / 10000,
        recentUsage: records.slice(0, 20)
      };
    } catch (e) {
      // Ignore
    }
  }

  if (isMongoConnected()) {
    try {
      const query = (role === 'admin' || !userId) ? {} : { userId };
      const records = await AIUsageModel.find(query)
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      const totalInput = records.reduce((sum, r) => sum + (r.inputTokens || 0), 0);
      const totalOutput = records.reduce((sum, r) => sum + (r.outputTokens || 0), 0);
      const totalCost = records.reduce((sum, r) => sum + (r.estimatedCost || 0.0), 0);

      return {
        totalRequests: records.length,
        totalInputTokens: totalInput,
        totalOutputTokens: totalOutput,
        totalTokens: totalInput + totalOutput,
        estimatedCostUSD: Math.round(totalCost * 10000) / 10000,
        recentUsage: records.slice(0, 20)
      };
    } catch (err) {
      // Fallback
    }
  }

  // Memory fallback query
  const records = inMemoryStore.usages.filter(u => role === 'admin' || !userId || u.userId === userId);
  const totalInput = records.reduce((sum, r) => sum + (r.inputTokens || 0), 0);
  const totalOutput = records.reduce((sum, r) => sum + (r.outputTokens || 0), 0);
  const totalCost = records.reduce((sum, r) => sum + (r.estimatedCost || 0.0), 0);

  return {
    totalRequests: records.length,
    totalInputTokens: totalInput,
    totalOutputTokens: totalOutput,
    totalTokens: totalInput + totalOutput,
    estimatedCostUSD: Math.round(totalCost * 10000) / 10000,
    recentUsage: records.slice(0, 20)
  };
}

module.exports = {
  recordAIRequest,
  completeAIRequest,
  recordGeneratedContent,
  recordAIUsage,
  recordAIInteraction,
  approveContent,
  getUsageStats,
  inMemoryStore
};
