const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Class = require('../models/Class');
const User = require('../models/User');
const { prisma } = require('../config/prisma');
const rosterService = require('../services/rosterService');

const generateJoinCode = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars: e.g. "A4F89D"
};

// @desc Create a new class (Teacher only)
// @route POST /api/classes
const createClass = async (req, res, next) => {
  try {
    const { name, subject, gradeLevel } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Class name is required.' });
    }

    let joinCode = generateJoinCode();

    // Check Prisma first
    try {
      let existingPrisma = await prisma.classroom.findUnique({ where: { joinCode } });
      while (existingPrisma) {
        joinCode = generateJoinCode();
        existingPrisma = await prisma.classroom.findUnique({ where: { joinCode } });
      }

      const teacherId = req.user.id || req.user._id?.toString();
      const newClassPrisma = await prisma.classroom.create({
        data: {
          name: name.trim(),
          subject: subject || 'Math',
          gradeLevel: Number(gradeLevel) || 7,
          joinCode,
          teacherId
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Class created successfully.',
        class: newClassPrisma
      });
    } catch (prismaErr) {
      // Fallback to Mongoose
    }

    let existing = await Class.findOne({ joinCode });
    while (existing) {
      joinCode = generateJoinCode();
      existing = await Class.findOne({ joinCode });
    }

    const newClass = await Class.create({
      name: name.trim(),
      subject: subject || 'Math',
      gradeLevel: Number(gradeLevel) || 7,
      joinCode,
      teacherId: req.user._id,
      studentIds: []
    });

    res.status(201).json({
      success: true,
      message: 'Class created successfully.',
      class: newClass
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get classes for currently logged-in user
// @route GET /api/classes
const getMyClasses = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id?.toString();

    // Try Prisma first
    try {
      if (req.user.role === 'teacher' || req.user.role === 'admin') {
        const classes = await prisma.classroom.findMany({
          where: { teacherId: userId, deletedAt: null },
          include: {
            enrollments: {
              where: { status: 'ACTIVE' },
              include: {
                student: {
                  include: { user: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        if (classes.length > 0) {
          const formatted = classes.map(c => ({
            _id: c.id,
            id: c.id,
            name: c.name,
            subject: c.subject,
            gradeLevel: c.gradeLevel,
            joinCode: c.joinCode,
            studentIds: c.enrollments.map(e => ({
              _id: e.student.id,
              name: e.student.user.name,
              email: e.student.user.email,
              rollNumber: e.student.rollNumber,
              gradeLevel: e.student.grade
            }))
          }));

          return res.status(200).json({
            success: true,
            count: formatted.length,
            classes: formatted
          });
        }
      }
    } catch (e) {}

    // Fallback to Mongoose
    let classes = [];
    if (req.user.role === 'teacher' || req.user.role === 'admin') {
      classes = await Class.find({ teacherId: req.user._id })
        .populate('studentIds', 'name email avatar gradeLevel createdAt')
        .sort({ createdAt: -1 });
    } else {
      classes = await Class.find({ studentIds: req.user._id })
        .populate('teacherId', 'name email avatar')
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: classes.length,
      classes
    });
  } catch (error) {
    next(error);
  }
};

// @desc Join a class with a 6-character code (Student)
// @route POST /api/classes/join
const joinClass = async (req, res, next) => {
  try {
    const { joinCode } = req.body;

    if (!joinCode) {
      return res.status(400).json({ success: false, message: 'Join code is required.' });
    }

    const cleanCode = joinCode.toString().trim().toUpperCase();

    // Try Prisma
    try {
      const targetClass = await prisma.classroom.findUnique({
        where: { joinCode: cleanCode }
      });

      if (targetClass && req.user.studentProfile?.id) {
        const studentId = req.user.studentProfile.id;
        const existingEnrollment = await prisma.enrollment.findUnique({
          where: {
            classroomId_studentId: {
              classroomId: targetClass.id,
              studentId
            }
          }
        });

        if (existingEnrollment && existingEnrollment.status === 'ACTIVE') {
          return res.status(400).json({ success: false, message: 'You are already enrolled in this class.' });
        }

        await prisma.enrollment.upsert({
          where: {
            classroomId_studentId: {
              classroomId: targetClass.id,
              studentId
            }
          },
          update: { status: 'ACTIVE' },
          create: {
            classroomId: targetClass.id,
            studentId,
            status: 'ACTIVE'
          }
        });

        return res.status(200).json({
          success: true,
          message: `Enrolled successfully into ${targetClass.name}!`,
          class: targetClass
        });
      }
    } catch (e) {}

    // Fallback to Mongoose
    const targetClass = await Class.findOne({ joinCode: cleanCode });
    if (!targetClass) {
      return res.status(404).json({ success: false, message: 'Invalid class code. No matching class found.' });
    }

    const alreadyEnrolled = targetClass.studentIds.some(
      id => id.toString() === req.user._id.toString()
    );

    if (alreadyEnrolled) {
      return res.status(400).json({ 
        success: false, 
        message: 'You are already enrolled in this class.' 
      });
    }

    targetClass.studentIds.push(req.user._id);
    await targetClass.save();

    res.status(200).json({
      success: true,
      message: `Enrolled successfully into ${targetClass.name}!`,
      class: targetClass
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single class details and roster
// @route GET /api/classes/:id
const getClassById = async (req, res, next) => {
  try {
    const classId = req.params.id;

    // Try Prisma
    try {
      const classItem = await prisma.classroom.findUnique({
        where: { id: classId },
        include: {
          teacher: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          enrollments: {
            where: { status: 'ACTIVE' },
            include: {
              student: {
                include: {
                  user: {
                    select: { id: true, name: true, email: true, avatar: true, gradeLevel: true }
                  }
                }
              }
            }
          }
        }
      });

      if (classItem) {
        return res.status(200).json({
          success: true,
          class: {
            _id: classItem.id,
            id: classItem.id,
            name: classItem.name,
            subject: classItem.subject,
            gradeLevel: classItem.gradeLevel,
            joinCode: classItem.joinCode,
            teacherId: classItem.teacher,
            studentIds: classItem.enrollments.map(e => ({
              _id: e.student.id,
              id: e.student.id,
              name: e.student.user.name,
              email: e.student.user.email,
              rollNumber: e.student.rollNumber,
              gradeLevel: e.student.grade
            }))
          }
        });
      }
    } catch (e) {}

    // Fallback to Mongoose
    const classItem = await Class.findById(classId)
      .populate('teacherId', 'name email avatar')
      .populate('studentIds', 'name email avatar gradeLevel createdAt');

    if (!classItem) {
      return res.status(404).json({ success: false, message: 'Class not found.' });
    }

    res.status(200).json({
      success: true,
      class: classItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete class (Teacher only)
// @route DELETE /api/classes/:id
const deleteClass = async (req, res, next) => {
  try {
    const classId = req.params.id;

    // Try Prisma
    try {
      const pgClass = await prisma.classroom.findUnique({ where: { id: classId } });
      if (pgClass) {
        if (pgClass.teacherId !== (req.user.id || req.user._id?.toString()) && req.user.role !== 'admin') {
          return res.status(403).json({ success: false, message: 'Unauthorized to delete this class.' });
        }
        await prisma.classroom.update({
          where: { id: classId },
          data: { deletedAt: new Date() }
        });
        return res.status(200).json({ success: true, message: 'Class deleted successfully.' });
      }
    } catch (e) {}

    // Fallback to Mongoose
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return res.status(404).json({ success: false, message: 'Class not found.' });
    }

    if (classItem.teacherId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this class.' });
    }

    await Class.findByIdAndDelete(classId);

    res.status(200).json({
      success: true,
      message: 'Class deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Helper for cryptographically secure 4-digit PIN generation
const generateSecure4DigitPin = rosterService.generateSecure4DigitPin;

// @desc Preview and validate roster before commit (Teacher only)
// @route POST /api/classes/:id/import-roster/preview
const previewRoster = async (req, res, next) => {
  try {
    const { roster } = req.body;
    if (!Array.isArray(roster) || roster.length === 0) {
      return res.status(400).json({ success: false, message: 'Roster must be a non-empty array of students.' });
    }

    const preview = await rosterService.previewRoster(roster, req.params.id);
    res.status(200).json({
      success: true,
      ...preview
    });
  } catch (error) {
    next(error);
  }
};

// @desc Bulk import classroom roster and generate one-time desk cards (Teacher only)
// @route POST /api/classes/:id/import-roster
const importRoster = async (req, res, next) => {
  try {
    const classId = req.params.id;
    const { roster } = req.body;

    if (!Array.isArray(roster) || roster.length === 0) {
      return res.status(400).json({ success: false, message: 'Roster must be a non-empty array of students.' });
    }

    if (roster.length > 200) {
      return res.status(400).json({ success: false, message: 'Roster exceeds maximum batch size of 200 students per import.' });
    }

    // Try Prisma implementation
    try {
      const pgClass = await prisma.classroom.findUnique({ where: { id: classId } });
      if (pgClass) {
        if (pgClass.teacherId !== (req.user.id || req.user._id?.toString()) && req.user.role !== 'admin') {
          return res.status(403).json({ success: false, message: 'Unauthorized to import students into this class.' });
        }

        const importResult = await rosterService.commitRosterImport({
          classroomId: pgClass.id,
          roster,
          teacherId: req.user.id || req.user._id?.toString()
        });

        return res.status(200).json({
          success: true,
          message: `Roster import complete: ${importResult.summary.createdCount} new students provisioned, ${importResult.summary.enrolledExistingCount} existing students enrolled.`,
          summary: importResult.summary,
          deskCards: importResult.deskCards
        });
      }
    } catch (e) {}

    // Fallback to Mongoose implementation
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return res.status(404).json({ success: false, message: 'Class not found.' });
    }

    if (classItem.teacherId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to import students into this class.' });
    }

    const seenRollNumbersInBatch = new Set();
    const createdDeskCards = [];
    let createdCount = 0;
    let existingCount = 0;
    let invalidCount = 0;
    const errors = [];

    for (let i = 0; i < roster.length; i++) {
      const row = roster[i];
      const rawName = row.student_name || row.name || row.studentName || '';
      const rawRoll = row.roll_number || row.rollNumber || row.rollNo || '';

      const cleanName = typeof rawName === 'string' ? rawName.trim() : '';
      const cleanRoll = typeof rawRoll === 'string' || typeof rawRoll === 'number' 
        ? String(rawRoll).trim().toUpperCase() 
        : '';

      if (!cleanName || !cleanRoll || cleanRoll.length < 2) {
        invalidCount++;
        errors.push({ row: i + 1, message: 'Missing or invalid student name or roll number (minimum 2 characters).' });
        continue;
      }

      if (seenRollNumbersInBatch.has(cleanRoll)) {
        invalidCount++;
        errors.push({ row: i + 1, rollNumber: cleanRoll, message: `Duplicate roll number ${cleanRoll} within uploaded file.` });
        continue;
      }
      seenRollNumbersInBatch.add(cleanRoll);

      const studentEmail = `${cleanRoll}@student.adaptiq.internal`.toLowerCase();
      let studentUser = await User.findOne({ email: studentEmail });

      if (studentUser) {
        const isEnrolled = classItem.studentIds.some(
          id => id.toString() === studentUser._id.toString()
        );
        if (!isEnrolled) {
          classItem.studentIds.push(studentUser._id);
        }
        existingCount++;
        createdDeskCards.push({
          name: studentUser.name,
          rollNumber: cleanRoll,
          pin: '**** (Pre-existing account - unchanged)',
          status: 'already_registered'
        });
      } else {
        const plainPin = generateSecure4DigitPin();
        const passwordHash = await bcrypt.hash(plainPin, 10);

        studentUser = await User.create({
          name: cleanName,
          email: studentEmail,
          passwordHash,
          role: 'student',
          gradeLevel: classItem.gradeLevel || 7,
          avatar: `avatar-${(createdCount % 8) + 1}`,
          themePreference: 'student-indigo'
        });

        classItem.studentIds.push(studentUser._id);
        createdCount++;

        createdDeskCards.push({
          name: cleanName,
          rollNumber: cleanRoll,
          pin: plainPin,
          status: 'newly_created'
        });
      }
    }

    await classItem.save();

    res.status(200).json({
      success: true,
      message: `Roster import complete: ${createdCount} new students provisioned, ${existingCount} existing students enrolled, ${invalidCount} skipped.`,
      summary: {
        totalRows: roster.length,
        createdCount,
        existingCount,
        invalidCount,
        errors
      },
      deskCards: createdDeskCards
    });
  } catch (error) {
    next(error);
  }
};

// @desc Reset a student's PIN (Teacher only)
// @route POST /api/classes/:id/students/:studentId/reset-pin
const resetStudentPin = async (req, res, next) => {
  try {
    const { id: classroomId, studentId } = req.params;
    const teacherId = req.user.id || req.user._id?.toString();

    const result = await rosterService.resetStudentPin({
      classroomId,
      studentId,
      teacherId
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// @desc Remove student from class
// @route DELETE /api/classes/:id/students/:studentId
const removeStudent = async (req, res, next) => {
  try {
    const { id: classroomId, studentId } = req.params;

    // Try Prisma
    try {
      await prisma.enrollment.update({
        where: {
          classroomId_studentId: {
            classroomId,
            studentId
          }
        },
        data: {
          status: 'INACTIVE',
          deletedAt: new Date()
        }
      });
      return res.status(200).json({ success: true, message: 'Student removed from classroom.' });
    } catch (e) {}

    // Fallback to Mongoose
    const classItem = await Class.findById(classroomId);
    if (!classItem) return res.status(404).json({ success: false, message: 'Class not found.' });
    classItem.studentIds = classItem.studentIds.filter(id => id.toString() !== studentId);
    await classItem.save();

    res.status(200).json({ success: true, message: 'Student removed from classroom.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createClass,
  getMyClasses,
  joinClass,
  getClassById,
  deleteClass,
  previewRoster,
  importRoster,
  resetStudentPin,
  removeStudent
};
