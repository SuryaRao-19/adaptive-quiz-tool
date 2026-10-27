const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const keys = require('../config/keys');
const User = require('../models/User');
const Question = require('../models/Question');
const Class = require('../models/Class');
const mathQuestions = require('./seedData/mathQuestions.json');
const scienceQuestions = require('./seedData/scienceQuestions.json');

const runManualSeed = async () => {
  console.log('========================================================');
  console.log('🌱 AdaptIQ Manual Seed Script (Optional Local Testing)');
  console.log('========================================================');

  try {
    await mongoose.connect(keys.MONGODB_URI);
    console.log(`[Seed] Connected to database: ${mongoose.connection.host}`);

    // 1. Seed curriculum questions if needed
    const existingQCount = await Question.countDocuments();
    if (existingQCount === 0) {
      const allQuestions = [...mathQuestions, ...scienceQuestions];
      await Question.insertMany(allQuestions);
      console.log(`[Seed] Inserted ${allQuestions.length} curriculum questions.`);
    } else {
      console.log(`[Seed] Question collection already has ${existingQCount} questions. Skipping question seed.`);
    }

    // 2. Seed realistic demo teacher
    let teacher = await User.findOne({ email: 'teacher@school.edu' });
    if (!teacher) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('teacher123', salt);
      teacher = await User.create({
        name: 'Sarah Jenkins',
        email: 'teacher@school.edu',
        passwordHash: hash,
        role: 'teacher',
        themePreference: 'teacher-navy'
      });
      console.log(`[Seed] Created demo teacher: teacher@school.edu (password: teacher123)`);
    }

    // 3. Seed realistic demo student
    let student = await User.findOne({ email: 'student@school.edu' });
    if (!student) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('student123', salt);
      student = await User.create({
        name: 'Alex Rivera',
        email: 'student@school.edu',
        passwordHash: hash,
        role: 'student',
        gradeLevel: 7,
        themePreference: 'student-indigo'
      });
      console.log(`[Seed] Created demo student: student@school.edu (password: student123)`);
    }

    // 4. Seed demo class
    let demoClass = await Class.findOne({ joinCode: 'MATH7B' });
    if (!demoClass && teacher && student) {
      demoClass = await Class.create({
        name: 'Grade 7-B Mathematics',
        subject: 'Math',
        gradeLevel: 7,
        joinCode: 'MATH7B',
        teacherId: teacher._id,
        studentIds: [student._id]
      });
      console.log(`[Seed] Created demo class: Grade 7-B Mathematics (Join Code: MATH7B)`);
    }

    console.log('========================================================');
    console.log('✅ Manual seeding complete!');
    console.log('========================================================');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err.message);
    process.exit(1);
  }
};

runManualSeed();
