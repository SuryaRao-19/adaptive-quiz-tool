const jwt = require('jsonwebtoken');
const { prisma } = require('../config/prisma');
const User = require('../models/User');
const Class = require('../models/Class');
const syntheticStore = require('../services/syntheticStore');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. Token missing.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'super_secret_school_jwt_key_change_in_production_987654321'
    );

    let user = null;

    // 1. Try Prisma lookup first if UUID
    if (decoded.id && typeof decoded.id === 'string' && decoded.id.length >= 32) {
      try {
        const pgUser = await prisma.user.findUnique({
          where: { id: decoded.id },
          include: { studentProfile: true }
        });
        if (pgUser) {
          user = {
            _id: pgUser.id,
            id: pgUser.id,
            name: pgUser.name,
            email: pgUser.email,
            role: pgUser.role.toLowerCase(),
            avatar: pgUser.avatar,
            themePreference: pgUser.themePreference,
            gradeLevel: pgUser.gradeLevel,
            studentProfile: pgUser.studentProfile
          };
        }
      } catch (e) {
        // Fallback to Mongoose
      }
    }

    // 2. Fallback to Mongoose if not found in Prisma
    if (!user && decoded.id) {
      try {
        const mongooseUser = await User.findById(decoded.id).select('-passwordHash');
        if (mongooseUser) {
          user = mongooseUser;
        }
      } catch (_) {}
    }

    // 3. Fallback to SyntheticStore or decoded JWT claims for Institutional Pilots
    if (!user && decoded.id) {
      const synStudent = syntheticStore.getStudents().find(s => 
        s.id === decoded.id || s.rollNumber === decoded.rollNumber || s.email === decoded.email
      );
      if (synStudent) {
        user = {
          _id: synStudent.id,
          id: synStudent.id,
          name: synStudent.name,
          email: synStudent.email,
          role: 'student',
          gradeLevel: synStudent.gradeLevel || 7,
          rollNumber: synStudent.rollNumber,
          section: synStudent.section || '7-A',
          studentProfile: { id: synStudent.id, grade: synStudent.gradeLevel || 7, rollNumber: synStudent.rollNumber }
        };
      } else {
        const synTeacher = syntheticStore.getTeachers().find(t => 
          t.id === decoded.id || t.email === decoded.email
        );
        if (synTeacher) {
          user = {
            _id: synTeacher.id,
            id: synTeacher.id,
            name: synTeacher.name,
            email: synTeacher.email,
            role: synTeacher.role || 'teacher'
          };
        } else if (decoded.role && (decoded.name || decoded.email)) {
          user = {
            _id: decoded.id,
            id: decoded.id,
            name: decoded.name || 'User',
            email: decoded.email,
            role: decoded.role,
            gradeLevel: decoded.gradeLevel || decoded.grade || 7,
            rollNumber: decoded.rollNumber,
            studentProfile: decoded.role === 'student' ? { id: decoded.id, rollNumber: decoded.rollNumber } : undefined
          };
        }
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid authentication token. User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid token. Please log in again.' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role.toLowerCase())) {
      return res.status(403).json({ success: false, message: 'Access denied: Unauthorized privilege level.' });
    }
    next();
  };
};

/**
 * Enforces that the current authenticated user owns the target classroom, or is an admin.
 */
const requireClassroomOwner = async (req, res, next) => {
  try {
    const classId = req.params.id || req.params.classId || req.body.classroomId;
    if (!classId) {
      return res.status(400).json({ success: false, message: 'Classroom ID parameter is required.' });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    // Check Prisma
    try {
      const pgClass = await prisma.classroom.findUnique({ where: { id: classId } });
      if (pgClass) {
        if (pgClass.teacherId !== req.user.id && pgClass.teacherId !== req.user._id?.toString()) {
          return res.status(403).json({ success: false, message: 'Forbidden: You do not own this classroom.' });
        }
        req.classroom = pgClass;
        return next();
      }
    } catch (e) {}

    // Check Mongoose fallback
    try {
      const mongoClass = await Class.findById(classId);
      if (mongoClass) {
        if (mongoClass.teacherId.toString() !== req.user._id.toString()) {
          return res.status(403).json({ success: false, message: 'Forbidden: You do not own this classroom.' });
        }
        req.classroom = mongoClass;
        return next();
      }
    } catch (e) {}

    return res.status(404).json({ success: false, message: 'Classroom not found.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { verifyToken, requireRole, requireClassroomOwner };
