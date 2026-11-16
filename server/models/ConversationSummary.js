const mongoose = require('mongoose');

const ConversationSummarySchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    unique: true,
    index: true
  },
  summary: {
    type: String,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.ConversationSummary || mongoose.model('ConversationSummary', ConversationSummarySchema);

