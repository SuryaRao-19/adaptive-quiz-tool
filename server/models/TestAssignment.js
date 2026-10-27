const mongoose = require('mongoose');

const TestAssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
    index: true
  },
  subject: {
    type: String,
    enum: ['Math', 'Science'],
    default: 'Math'
  },
  questionIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  dueDate: {
    type: Date
  },
  timeLimitMinutes: {
    type: Number,
    default: 15
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('TestAssignment', TestAssignmentSchema);
