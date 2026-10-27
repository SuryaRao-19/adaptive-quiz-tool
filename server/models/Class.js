const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    enum: ['Math', 'Science', 'General'],
    default: 'Math'
  },
  gradeLevel: {
    type: Number,
    required: [true, 'Grade level is required'],
    default: 7
  },
  joinCode: {
    type: String,
    required: [true, 'Join code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  studentIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Class', ClassSchema);
