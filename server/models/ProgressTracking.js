const mongoose = require('mongoose');

const ProgressTrackingSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subject: {
    type: String,
    required: true,
    enum: ['Math', 'Science']
  },
  topic: {
    type: String,
    required: true
  },
  questionsAttempted: { type: Number, default: 0 },
  questionsCorrect: { type: Number, default: 0 },
  masteryPercentage: { type: Number, default: 0 },
  bktMastery: { 
    type: Number, 
    default: 0.20,
    min: 0,
    max: 1
  },
  consecutiveCorrect: { type: Number, default: 0 },
  consecutiveIncorrect: { type: Number, default: 0 },
  leitnerBox: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  nextReviewDue: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastConfidence: {
    type: String,
    enum: ['guessing', 'somewhat_sure', 'very_sure', 'unspecified'],
    default: 'unspecified'
  },
  misconceptionCount: {
    type: Number,
    default: 0
  },
  currentLevel: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'very_hard'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['needs_focus', 'in_progress', 'mastered'],
    default: 'in_progress'
  },
  lastPracticed: { type: Date, default: Date.now }
}, { timestamps: true });

ProgressTrackingSchema.index({ studentId: 1, subject: 1, topic: 1 }, { unique: true });

module.exports = mongoose.model('ProgressTracking', ProgressTrackingSchema);
