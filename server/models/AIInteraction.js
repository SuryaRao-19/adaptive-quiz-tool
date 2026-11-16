const mongoose = require('mongoose');

const AIInteractionSchema = new mongoose.Schema({
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
  requestReference: {
    type: String,
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

AIInteractionSchema.index({ userId: 1, featureType: 1, createdAt: -1 });

module.exports = mongoose.model('AIInteraction', AIInteractionSchema);
