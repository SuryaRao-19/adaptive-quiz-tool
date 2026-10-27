const mongoose = require('mongoose');

const AnswerRecordSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  selectedOptionIndex: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true }
}, { _id: false });

const QuizAttemptSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  quizType: {
    type: String,
    required: true,
    enum: ['pre_test', 'practice', 'post_test'],
    index: true
  },
  subject: {
    type: String,
    required: true,
    enum: ['Math', 'Science']
  },
  topic: {
    type: String,
    default: 'Diagnostic'
  },
  answers: [AnswerRecordSchema],
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  scorePercentage: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);
