const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required']
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'parent', 'admin'],
    default: 'student',
    index: true
  },
  avatar: {
    type: String,
    default: 'avatar-1'
  },
  themePreference: {
    type: String,
    default: 'student-indigo'
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  gradeLevel: {
    type: Number,
    default: 7
  }
}, { timestamps: true });

// Compatibility getter so legacy code accessing .fullName or .rollNumber works transparently
UserSchema.virtual('fullName').get(function() {
  return this.name;
});

UserSchema.virtual('rollNumber').get(function() {
  return this.email.split('@')[0].toUpperCase();
});

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', UserSchema);
