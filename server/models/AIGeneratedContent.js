const mongoose = require('mongoose');

const AIGeneratedContentSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    index: true
  },
  contentType: {
    type: String,
    required: true,
    default: 'quiz_questions'
  },
  generatedContent: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  validationStatus: {
    type: String,
    enum: ['VALID', 'INVALID', 'PENDING', 'PARTIAL'],
    default: 'VALID',
    index: true
  },
  approvedBy: {
    type: String
  },
  approvedAt: {
    type: Date
  },
  publishedToBank: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

AIGeneratedContentSchema.index({ validationStatus: 1, approvedBy: 1 });

module.exports = mongoose.model('AIGeneratedContent', AIGeneratedContentSchema);
