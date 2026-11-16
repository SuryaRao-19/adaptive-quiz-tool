const mongoose = require('mongoose');

const AIRequestSchema = new mongoose.Schema({
  userId: {
    type: String,
    index: true
  },
  featureType: {
    type: String,
    enum: [
      'QUIZ_GENERATOR',
      'ANSWER_EXPLANATION',
      'STUDY_PLAN',
      'PRACTICE_TEST',
      'TEACHER_ASSISTANT',
      'PERFORMANCE_INSIGHTS'
    ],
    required: true,
    index: true
  },
  modelName: {
    type: String,
    required: true,
    default: 'gemini-2.5-flash'
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REJECTED'],
    default: 'PENDING',
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  completedAt: {
    type: Date
  }
}, { timestamps: true });

AIRequestSchema.index({ userId: 1, featureType: 1, createdAt: -1 });

module.exports = mongoose.model('AIRequest', AIRequestSchema);
