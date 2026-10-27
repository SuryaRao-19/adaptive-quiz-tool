const mongoose = require('mongoose');

const LibraryResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true
  },
  subject: {
    type: String,
    required: true,
    enum: ['Math', 'Science'],
    default: 'Math',
    index: true
  },
  topic: {
    type: String,
    required: true,
    index: true
  },
  difficulty: {
    type: String,
    enum: ['Foundational', 'Intermediate', 'Advanced'],
    default: 'Foundational'
  },
  type: {
    type: String,
    enum: ['Article', 'Step-by-Step Guide', 'Formula Sheet'],
    default: 'Article',
    index: true
  },
  readTime: {
    type: String,
    default: '5 min read'
  },
  summary: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('LibraryResource', LibraryResourceSchema);
