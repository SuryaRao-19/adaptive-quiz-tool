const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const User = require('../models/User');
const { prisma } = require('../config/prisma');
const { authenticateStudentPin, authenticateUser, generateAuthToken } = require('../services/authService');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    keys.JWT_SECRET,
    { expiresIn: keys.JWT_EXPIRES_IN }
  );
};

// @desc Register a new user (Student, Teacher, Parent, Admin)
// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const rawName = req.body.name || req.body.fullName;
    const rawEmail = req.body.email || req.body.username || req.body.rollNumber;
    const { password, role, gradeLevel, grade, avatar, themePreference } = req.body;

    if (!rawName || !rawEmail || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and password are required.' 
      });
    }

    const cleanEmail = rawEmail.toString().trim().toLowerCase();

    // 1. Try Prisma first
    try {
      const existingPgUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (existingPgUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email/username already exists. Please log in.'
        });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password.toString(), salt);
      const validRoles = ['student', 'teacher', 'parent', 'admin'];
      const chosenRole = role && validRoles.includes(role.toLowerCase()) ? role.toLowerCase() : 'student';

      const pgUser = await prisma.user.create({
        data: {
          name: rawName.trim(),
          email: cleanEmail,
          passwordHash,
          role: chosenRole.toUpperCase(),
          avatar: avatar || 'avatar-1',
          themePreference: themePreference || (chosenRole === 'teacher' ? 'teacher-navy' : 'student-indigo'),
          gradeLevel: Number(gradeLevel || grade) || 7
        }
      });

      // If student, create student profile
      if (chosenRole === 'student') {
        const rollNumber = req.body.rollNumber || (cleanEmail.includes('@') ? cleanEmail.split('@')[0].toUpperCase() : `STU-${pgUser.id.substring(0, 4)}`);
        const studentRecord = await prisma.student.create({
          data: {
            userId: pgUser.id,
            rollNumber,
            grade: Number(gradeLevel || grade) || 7
          }
        });

        await prisma.studentCredential.create({
          data: {
            studentId: studentRecord.id,
            pinHash: passwordHash,
            status: 'ACTIVE'
          }
        });
      }

      const token = generateAuthToken(pgUser);
      return res.status(201).json({
        success: true,
        token,
        user: {
          id: pgUser.id,
          name: pgUser.name,
          email: pgUser.email,
          role: pgUser.role.toLowerCase(),
          avatar: pgUser.avatar,
          themePreference: pgUser.themePreference,
          notificationsEnabled: pgUser.notificationsEnabled,
          gradeLevel: pgUser.gradeLevel
        }
      });
    } catch (prismaErr) {
      // Fallback to Mongoose
    }

    // 2. Fallback to Mongoose
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'An account with this email/username already exists. Please log in.' 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password.toString(), salt);

    const validRoles = ['student', 'teacher', 'parent', 'admin'];
    const chosenRole = role && validRoles.includes(role.toLowerCase()) ? role.toLowerCase() : 'student';

    const user = await User.create({
      name: rawName.trim(),
      email: cleanEmail,
      passwordHash,
      role: chosenRole,
      avatar: avatar || 'avatar-1',
      themePreference: themePreference || (chosenRole === 'teacher' ? 'teacher-navy' : 'student-indigo'),
      gradeLevel: gradeLevel || grade || 7
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        themePreference: user.themePreference,
        notificationsEnabled: user.notificationsEnabled,
        gradeLevel: user.gradeLevel
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Login user (Standard email/username and password)
// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const rawId = req.body.email || req.body.username || req.body.rollNumber || req.body.identifier;
    const rawPass = req.body.password || req.body.pinCode;

    if (!rawId || !rawPass) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email/username and password/PIN are required.' 
      });
    }

    // Try Prisma first
    try {
      const result = await authenticateUser({ identifier: rawId, password: rawPass });
      return res.status(200).json(result);
    } catch (prismaErr) {
      // If error is about invalid credentials, fall through to Mongoose check before rejecting
    }

    const cleanId = rawId.toString().trim().toLowerCase();
    const user = await User.findOne({ 
      $or: [
        { email: cleanId },
        { email: cleanId.toUpperCase() }
      ]
    });

    if (!user) {
      // Standalone SyntheticStore Fallback
      try {
        const syntheticStore = require('../services/syntheticStore');
        const teachers = syntheticStore.getTeachers();
        const staff = teachers.find(t => t.email.toLowerCase() === cleanId || t.email.toUpperCase() === cleanId.toUpperCase());
        if (staff && staff.passwordHash) {
          const isMatch = await bcrypt.compare(rawPass.toString(), staff.passwordHash);
          if (isMatch) {
            const token = generateToken(staff.id, staff.role.toLowerCase());
            return res.status(200).json({
              success: true,
              token,
              user: {
                id: staff.id,
                name: staff.name,
                email: staff.email,
                role: staff.role.toLowerCase(),
                schoolId: staff.schoolId
              }
            });
          }
        }

        const students = syntheticStore.getStudents();
        const student = students.find(s => 
          (s.rollNumber && s.rollNumber.toUpperCase() === cleanId.toUpperCase()) ||
          (s.email && s.email.toLowerCase() === cleanId)
        );
        if (student && student.passwordHash) {
          const isMatch = await bcrypt.compare(rawPass.toString(), student.passwordHash);
          if (isMatch) {
            const token = generateToken(student.id, 'student');
            return res.status(200).json({
              success: true,
              token,
              user: {
                id: student.id,
                name: student.name,
                email: student.email,
                rollNumber: student.rollNumber,
                grade: student.gradeLevel || 7,
                gradeLevel: student.gradeLevel || 7,
                role: 'student',
                classroomId: student.classroomId
              }
            });
          }
        }
      } catch (synthErr) {
        // Fall through to 401
      }

      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials. Please verify your email and password.' 
      });
    }

    const isMatch = await bcrypt.compare(rawPass.toString(), user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials. Please verify your email and password.' 
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        themePreference: user.themePreference,
        notificationsEnabled: user.notificationsEnabled,
        gradeLevel: user.gradeLevel
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Student PIN verification (Classroom-scoped, throttled with lockout protection)
// @route POST /api/auth/pin-login
const pinLogin = async (req, res, next) => {
  try {
    const { rollNumber, pin, joinCode } = req.body;

    if (!rollNumber || !pin) {
      return res.status(400).json({
        success: false,
        message: 'Roll Number and 4-digit PIN are required.'
      });
    }

    const result = await authenticateStudentPin({ rollNumber, pin, joinCode });
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

// @desc Get current authenticated user profile
// @route GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update user profile & settings
// @route PATCH /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, themePreference, notificationsEnabled } = req.body;
    const userId = req.user.id || req.user._id?.toString();

    // Try Prisma
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          name: name ? name.trim() : undefined,
          avatar: avatar || undefined,
          themePreference: themePreference || undefined,
          notificationsEnabled: notificationsEnabled !== undefined ? Boolean(notificationsEnabled) : undefined
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        user: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          role: updated.role.toLowerCase(),
          avatar: updated.avatar,
          themePreference: updated.themePreference,
          notificationsEnabled: updated.notificationsEnabled,
          gradeLevel: updated.gradeLevel
        }
      });
    } catch (e) {}

    // Fallback to Mongoose
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name !== undefined) user.name = name.trim();
    if (avatar !== undefined) user.avatar = avatar;
    if (themePreference !== undefined) user.themePreference = themePreference;
    if (notificationsEnabled !== undefined) user.notificationsEnabled = Boolean(notificationsEnabled);

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        themePreference: user.themePreference,
        notificationsEnabled: user.notificationsEnabled,
        gradeLevel: user.gradeLevel
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Change user password
// @route POST /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({ success: false, message: 'New password must be at least 4 characters long.' });
    }

    const userId = req.user.id || req.user._id?.toString();

    // Try Prisma
    try {
      const pgUser = await prisma.user.findUnique({ where: { id: userId } });
      if (pgUser) {
        const isMatch = await bcrypt.compare(currentPassword.toString(), pgUser.passwordHash);
        if (!isMatch) {
          return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
        }
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(newPassword.toString(), salt);
        await prisma.user.update({
          where: { id: userId },
          data: { passwordHash: newHash }
        });
        return res.status(200).json({ success: true, message: 'Password changed successfully.' });
      }
    } catch (e) {}

    // Fallback to Mongoose
    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword.toString(), user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword.toString(), salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc Student Login using Grade + Roll Number + Password
// @route POST /api/auth/student-login
const studentLogin = async (req, res, next) => {
  try {
    const { grade, rollNumber, password } = req.body;
    const { authenticateStudentGradeRoll } = require('../services/authService');
    const result = await authenticateStudentGradeRoll({ grade, rollNumber, password });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(401).json({
      success: false,
      requireActivation: Boolean(error.requireActivation),
      message: error.message
    });
  }
};

// @desc Student First-Time Account Activation
// @route POST /api/auth/student-activate
const studentActivate = async (req, res, next) => {
  try {
    const { grade, rollNumber, activationCode, newPassword } = req.body;
    const { activateStudentAccount } = require('../services/authService');
    const result = await activateStudentAccount({ grade, rollNumber, activationCode, newPassword });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc Staff Login for Teachers and Principals
// @route POST /api/auth/staff-login
const staffLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { authenticateStaff } = require('../services/authService');
    const result = await authenticateStaff({ email, password });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

// @desc Logout user
// @route POST /api/auth/logout
const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

module.exports = {
  register,
  login,
  pinLogin,
  studentLogin,
  studentActivate,
  staffLogin,
  logout,
  getMe,
  updateProfile,
  changePassword
};
