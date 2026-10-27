const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    enum: ['Math', 'Science'],
    index: true
  },
  topic: {
    type: String,
    required: true,
    index: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard', 'very_hard'],
    index: true
  },
  levelName: {
    type: String,
    default: function() {
      switch(this.difficulty) {
        case 'easy': return 'Level 1: Foundational';
        case 'medium': return 'Level 2: Procedural';
        case 'hard': return 'Level 3: Multi-Step';
        case 'very_hard': return 'Level 4: Conceptual Mastery';
        default: return 'Standard Practice';
      }
    }
  },
  questionText: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: [val => val.length === 4, 'Must provide exactly 4 options']
  },
  correctAnswerIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  explanation: {
    type: String,
    required: true
  },
  steps: [
    {
      step: { type: String },
      desc: { type: String },
      math: { type: String }
    }
  ],
  conceptSummary: {
    type: String
  },
  misconception: {
    type: String
  },
  videoUrl: {
    type: String
  },
  source: {
    type: String,
    enum: ['seed', 'ai_generated', 'manual'],
    default: 'seed',
    index: true
  },
  status: {
    type: String,
    enum: ['approved', 'pending_review', 'rejected'],
    default: 'approved',
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

QuestionSchema.virtual('text').get(function() {
  return this.questionText;
});

QuestionSchema.virtual('correctAnswer').get(function() {
  return this.correctAnswerIndex;
});

QuestionSchema.virtual('solutionSteps').get(function() {
  return this.steps;
});

QuestionSchema.set('toJSON', { virtuals: true });
QuestionSchema.set('toObject', { virtuals: true });

QuestionSchema.index({ subject: 1, topic: 1, difficulty: 1, isActive: 1 });

module.exports = mongoose.model('Question', QuestionSchema);
