const bcrypt = require('bcryptjs');
const Question = require('../models/Question');
const User = require('../models/User');
const mathQuestions = require('./seedData/mathQuestions.json');
const scienceQuestions = require('./seedData/scienceQuestions.json');

const seedData = async () => {
  try {
    const qCount = await Question.countDocuments();
    if (qCount < 150) {
      const allQuestions = [...mathQuestions, ...scienceQuestions];
      for (const q of allQuestions) {
        await Question.updateOne(
          { subject: q.subject, topic: q.topic, questionText: q.questionText },
          { $set: { ...q, source: 'seed', status: 'approved', isActive: true } },
          { upsert: true }
        );
      }
      const newCount = await Question.countDocuments();
      console.log(`[Database Seeder] Loaded ${newCount} curriculum questions (all approved).`);
    } else {
      // Ensure all existing questions have status: 'approved'
      await Question.updateMany({ status: { $exists: false } }, { $set: { status: 'approved', source: 'seed' } });
    }

    const Class = require('../models/Class');

    // 1. Seed demo student (Roll Number: STUDENT01, PIN: 1234)
    let student01 = await User.findOne({ email: 'student01' });
    if (!student01) {
      const salt = await bcrypt.genSalt(10);
      const studentHash = await bcrypt.hash('1234', salt);
      student01 = await User.create({
        name: 'Rahul Sharma',
        email: 'student01',
        gradeLevel: 7,
        passwordHash: studentHash,
        role: 'student'
      });
      console.log(`[Database Seeder] Created demo student: Roll Number "STUDENT01", PIN: 1234`);
    }

    // 2. Seed demo student (student@school.edu, password: student123)
    let studentEdu = await User.findOne({ email: 'student@school.edu' });
    if (!studentEdu) {
      const salt = await bcrypt.genSalt(10);
      const studentHash2 = await bcrypt.hash('student123', salt);
      studentEdu = await User.create({
        name: 'Alex Rivera',
        email: 'student@school.edu',
        gradeLevel: 7,
        passwordHash: studentHash2,
        role: 'student',
        themePreference: 'student-indigo'
      });
      console.log(`[Database Seeder] Created demo student: student@school.edu, password: student123`);
    }

    // 3. Seed demo teacher (ID: TEACHER01, Password: admin123)
    let teacher01 = await User.findOne({ email: 'teacher01' });
    if (!teacher01) {
      const salt = await bcrypt.genSalt(10);
      const teacherHash = await bcrypt.hash('admin123', salt);
      teacher01 = await User.create({
        name: 'Mrs. Anita Rao',
        email: 'teacher01',
        passwordHash: teacherHash,
        role: 'teacher'
      });
      console.log(`[Database Seeder] Created demo teacher: ID "TEACHER01", Password: admin123`);
    }

    // 4. Seed demo teacher (teacher@school.edu, password: teacher123)
    let teacherEdu = await User.findOne({ email: 'teacher@school.edu' });
    if (!teacherEdu) {
      const salt = await bcrypt.genSalt(10);
      const teacherHash2 = await bcrypt.hash('teacher123', salt);
      teacherEdu = await User.create({
        name: 'Sarah Jenkins',
        email: 'teacher@school.edu',
        passwordHash: teacherHash2,
        role: 'teacher',
        themePreference: 'teacher-navy'
      });
      console.log(`[Database Seeder] Created demo teacher: teacher@school.edu, password: teacher123`);
    }

    // 5. Seed demo class
    let demoClass = await Class.findOne({ joinCode: 'MATH7B' });
    if (!demoClass && (teacher01 || teacherEdu) && (student01 || studentEdu)) {
      await Class.create({
        name: 'Grade 7-B Mathematics',
        subject: 'Math',
        gradeLevel: 7,
        joinCode: 'MATH7B',
        teacherId: (teacherEdu || teacher01)._id,
        studentIds: [student01 ? student01._id : studentEdu._id]
      });
      console.log(`[Database Seeder] Created demo class: Grade 7-B Mathematics (Join Code: MATH7B)`);
    }
  } catch (err) {
    console.error('[Database Seeder Error]:', err.message);
  }
};

module.exports = { seedData };
