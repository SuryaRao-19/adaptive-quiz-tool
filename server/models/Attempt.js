const mongoose = require('mongoose');

const AttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  eventId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  questionId: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'Question',
    required: false,
    index: true
  },
  questionVersion: {
    type: Number,
    default: 1
  },
  mode: {
    type: String,
    enum: ['practice', 'test', 'diagnostic'],
    default: 'practice'
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0
  },
  difficultyAtTime: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'very_hard'],
    default: 'medium'
  },
  subject: {
    type: String,
    enum: ['Math', 'Science'],
    default: 'Math',
    index: true
  },
  topic: {
    type: String,
    index: true
  },
  selectedAnswerIndex: {
    type: Number
  },
  confidence: {
    type: String,
    enum: ['guessing', 'somewhat_sure', 'very_sure', 'unspecified'],
    default: 'unspecified'
  },
  source: {
    type: String,
    enum: ['online', 'offline_sync'],
    default: 'online'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Attempt', AttemptSchema);
