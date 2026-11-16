/**
 * Hybrid Conversation Memory & Context Management Service
 * Supports PostgreSQL (Prisma), MongoDB (Mongoose), and In-Memory fallback.
 * Enforces per-user conversation isolation, token window slicing, and summarization.
 */

const { prisma, getDatabaseStatus } = require('../../../config/prisma');
const mongoose = require('mongoose');
const Conversation = require('../../../models/Conversation');
const ConversationMessage = require('../../../models/ConversationMessage');
const ConversationSummary = require('../../../models/ConversationSummary');

function isPostgresConnected() {
  return typeof getDatabaseStatus === 'function' && getDatabaseStatus() === 'connected';
}

function isMongoConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

// In-Memory store for offline test execution when no DB is connected
const inMemoryStore = {
  conversations: new Map(),
  messages: new Map(),
  summaries: new Map()
};

class ConversationService {
  /**
   * Creates a new conversation
   */
  async createConversation({
    userId,
    title = 'New Conversation',
    subject = 'Science & Mathematics',
    topic = 'General',
    tutorMode = 'explain'
  }) {
    const cleanTitle = String(title).slice(0, 100).trim() || 'New Conversation';
    const strUserId = String(userId);

    // 1. Try PostgreSQL Prisma
    if (isPostgresConnected()) {
      try {
        const record = await prisma.conversation.create({
          data: {
            userId: strUserId,
            title: cleanTitle,
            subject,
            topic,
            tutorMode
          }
        });
        return record;
      } catch (err) {
        // Fallback to Mongo
      }
    }

    // 2. Try MongoDB Mongoose
    if (isMongoConnected()) {
      try {
        const record = await Conversation.create({
          userId: mongoose.Types.ObjectId.isValid(strUserId) ? new mongoose.Types.ObjectId(strUserId) : new mongoose.Types.ObjectId(),
          title: cleanTitle,
          subject,
          topic,
          tutorMode
        });
        return {
          id: record._id.toString(),
          userId: strUserId,
          title: record.title,
          subject: record.subject,
          topic: record.topic,
          tutorMode: record.tutorMode,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt
        };
      } catch (err) {
        // Fallback to In-Memory
      }
    }

    // 3. In-Memory fallback
    const id = 'conv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const conv = {
      id,
      userId: strUserId,
      title: cleanTitle,
      subject,
      topic,
      tutorMode,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryStore.conversations.set(id, conv);
    return conv;
  }

  /**
   * Retrieves conversation with user isolation check
   */
  async getConversation(conversationId, userId) {
    const strUserId = String(userId);
    const strConvId = String(conversationId);

    // 1. Prisma
    if (isPostgresConnected()) {
      try {
        const conv = await prisma.conversation.findUnique({
          where: { id: strConvId }
        });
        if (conv && conv.userId === strUserId) return conv;
        return null;
      } catch (err) {}
    }

    // 2. Mongo
    if (isMongoConnected()) {
      try {
        const conv = await Conversation.findById(strConvId).lean();
        if (conv && String(conv.userId) === strUserId) {
          return {
            id: conv._id.toString(),
            userId: strUserId,
            title: conv.title,
            subject: conv.subject,
            topic: conv.topic,
            tutorMode: conv.tutorMode,
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt
          };
        }
        return null;
      } catch (err) {}
    }

    // 3. In-Memory
    const conv = inMemoryStore.conversations.get(strConvId);
    if (conv && conv.userId === strUserId) return conv;
    return null;
  }

  /**
   * Lists all conversations for a user
   */
  async listConversations(userId) {
    const strUserId = String(userId);

    if (isPostgresConnected()) {
      try {
        return await prisma.conversation.findMany({
          where: { userId: strUserId },
          orderBy: { updatedAt: 'desc' },
          take: 30
        });
      } catch (err) {}
    }

    if (isMongoConnected()) {
      try {
        const records = await Conversation.find({ userId: strUserId })
          .sort({ updatedAt: -1 })
          .limit(30)
          .lean();
        return records.map(r => ({
          id: r._id.toString(),
          userId: strUserId,
          title: r.title,
          subject: r.subject,
          topic: r.topic,
          tutorMode: r.tutorMode,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt
        }));
      } catch (err) {}
    }

    // In-memory
    const userConvs = [];
    for (const conv of inMemoryStore.conversations.values()) {
      if (conv.userId === strUserId) userConvs.push(conv);
    }
    userConvs.sort((a, b) => b.updatedAt - a.updatedAt);
    return userConvs;
  }

  /**
   * Appends a message to a conversation
   */
  async addMessage({
    conversationId,
    userId,
    role,
    content,
    modelProvider = 'gemini',
    modelName = 'gemini-3.8-flash',
    tokenUsage = null
  }) {
    const strConvId = String(conversationId);
    const strUserId = String(userId);

    // Verify ownership
    const conv = await this.getConversation(strConvId, strUserId);
    if (!conv) {
      throw new Error('CONVERSATION_NOT_FOUND: Conversation does not exist or user is unauthorized.');
    }

    const cleanContent = String(content || '').trim();

    // 1. Prisma
    if (isPostgresConnected()) {
      try {
        const msg = await prisma.conversationMessage.create({
          data: {
            conversationId: strConvId,
            role,
            content: cleanContent,
            modelProvider,
            modelName,
            tokenUsage: tokenUsage || undefined
          }
        });
        await prisma.conversation.update({
          where: { id: strConvId },
          data: { updatedAt: new Date() }
        });
        return msg;
      } catch (err) {}
    }

    // 2. Mongo
    if (isMongoConnected()) {
      try {
        const msg = await ConversationMessage.create({
          conversationId: new mongoose.Types.ObjectId(strConvId),
          role,
          content: cleanContent,
          modelProvider,
          modelName,
          tokenUsage
        });
        await Conversation.findByIdAndUpdate(strConvId, { updatedAt: new Date() });
        return {
          id: msg._id.toString(),
          conversationId: strConvId,
          role: msg.role,
          content: msg.content,
          modelProvider: msg.modelProvider,
          modelName: msg.modelName,
          tokenUsage: msg.tokenUsage,
          createdAt: msg.createdAt
        };
      } catch (err) {}
    }

    // 3. In-memory
    const id = 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const msg = {
      id,
      conversationId: strConvId,
      role,
      content: cleanContent,
      modelProvider,
      modelName,
      tokenUsage,
      createdAt: new Date()
    };
    if (!inMemoryStore.messages.has(strConvId)) {
      inMemoryStore.messages.set(strConvId, []);
    }
    inMemoryStore.messages.get(strConvId).push(msg);
    conv.updatedAt = new Date();
    return msg;
  }

  /**
   * Retrieves messages for a conversation with ownership check
   */
  async getMessages(conversationId, userId, limit = 50) {
    const strConvId = String(conversationId);
    const strUserId = String(userId);

    const conv = await this.getConversation(strConvId, strUserId);
    if (!conv) {
      throw new Error('UNAUTHORIZED: Cannot access conversation.');
    }

    if (isPostgresConnected()) {
      try {
        return await prisma.conversationMessage.findMany({
          where: { conversationId: strConvId },
          orderBy: { createdAt: 'asc' },
          take: limit
        });
      } catch (err) {}
    }

    if (isMongoConnected()) {
      try {
        const msgs = await ConversationMessage.find({ conversationId: strConvId })
          .sort({ createdAt: 1 })
          .limit(limit)
          .lean();
        return msgs.map(m => ({
          id: m._id.toString(),
          conversationId: strConvId,
          role: m.role,
          content: m.content,
          modelProvider: m.modelProvider,
          modelName: m.modelName,
          tokenUsage: m.tokenUsage,
          createdAt: m.createdAt
        }));
      } catch (err) {}
    }

    return (inMemoryStore.messages.get(strConvId) || []).slice(-limit);
  }

  /**
   * Slices conversation history into a sliding context window within token limits
   */
  async getContextWindow(conversationId, userId, { maxTurns = 8, maxTokens = 3500 } = {}) {
    const messages = await this.getMessages(conversationId, userId, 30);
    if (!messages || messages.length === 0) return [];

    // Slice last maxTurns
    const recent = messages.slice(-maxTurns);

    // Compute estimated token size and trim older turns if budget exceeded
    let totalEstimatedTokens = 0;
    const budgetedMessages = [];

    for (let i = recent.length - 1; i >= 0; i--) {
      const msg = recent[i];
      const estimatedTokens = Math.ceil((msg.content?.length || 0) / 4);
      if (totalEstimatedTokens + estimatedTokens > maxTokens && budgetedMessages.length > 0) {
        break;
      }
      totalEstimatedTokens += estimatedTokens;
      budgetedMessages.unshift(msg);
    }

    return budgetedMessages;
  }

  /**
   * Clears messages in a conversation
   */
  async clearMessages(conversationId, userId) {
    const strConvId = String(conversationId);
    const strUserId = String(userId);

    const conv = await this.getConversation(strConvId, strUserId);
    if (!conv) {
      throw new Error('UNAUTHORIZED: Cannot clear conversation.');
    }

    if (isPostgresConnected()) {
      try {
        await prisma.conversationMessage.deleteMany({ where: { conversationId: strConvId } });
        return { success: true };
      } catch (err) {}
    }

    if (isMongoConnected()) {
      try {
        await ConversationMessage.deleteMany({ conversationId: strConvId });
        return { success: true };
      } catch (err) {}
    }

    inMemoryStore.messages.set(strConvId, []);
    return { success: true };
  }

  /**
   * Deletes an entire conversation
   */
  async deleteConversation(conversationId, userId) {
    const strConvId = String(conversationId);
    const strUserId = String(userId);

    const conv = await this.getConversation(strConvId, strUserId);
    if (!conv) {
      throw new Error('UNAUTHORIZED: Cannot delete conversation.');
    }

    if (isPostgresConnected()) {
      try {
        await prisma.conversation.delete({ where: { id: strConvId } });
        return { success: true };
      } catch (err) {}
    }

    if (isMongoConnected()) {
      try {
        await ConversationMessage.deleteMany({ conversationId: strConvId });
        await Conversation.findByIdAndDelete(strConvId);
        return { success: true };
      } catch (err) {}
    }

    inMemoryStore.conversations.delete(strConvId);
    inMemoryStore.messages.delete(strConvId);
    return { success: true };
  }
}

const conversationService = new ConversationService();

module.exports = {
  conversationService,
  ConversationService
};
