const mongoose = require('mongoose');

const ConversationMessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  modelProvider: {
    type: String,
    default: 'gemini'
  },
  modelName: {
    type: String,
    default: 'gemini-3.8-flash'
  },
  tokenUsage: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

ConversationMessageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.models.ConversationMessage || mongoose.model('ConversationMessage', ConversationMessageSchema);

