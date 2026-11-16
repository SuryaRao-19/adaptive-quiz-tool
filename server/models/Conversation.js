const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'New Conversation',
    trim: true,
    maxlength: 120
  },
  subject: {
    type: String,
    default: 'Science & Mathematics',
    trim: true
  },
  topic: {
    type: String,
    default: 'General',
    trim: true
  },
  tutorMode: {
    type: String,
    default: 'explain',
    enum: ['explain', 'socratic', 'step_by_step', 'exam_prep', 'debug', 'conceptual']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

ConversationSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);

