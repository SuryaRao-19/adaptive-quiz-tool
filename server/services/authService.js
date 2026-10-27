const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_school_jwt_key_change_in_production_987654321';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function generateAuthToken(user, studentId = null) {
  return jwt.sign(
    {
      id: user.id,
      studentId: studentId || user.studentProfile?.id || null,
      role: user.role.toLowerCase(),
      name: user.name,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Classroom-scoped Student PIN verification.
 * 4-digit PIN is a low-entropy credential:
 * - Scoped within classroom joinCode or student rollNumber
 * - Lockout after 5 consecutive failed attempts for 15 minutes
 * - Progressive failure counter
 * - Slow bcrypt verification
 */
async function authenticateStudentPin({ rollNumber, pin, joinCode }) {
  if (!rollNumber || !pin) {
    throw new Error('Roll Number and 4-digit PIN are required.');
  }

  const cleanRoll = String(rollNumber).trim().toUpperCase();
  const cleanPin = String(pin).trim();

  if (!/^\d{4}$/.test(cleanPin)) {
    throw new Error('Student PIN must be exactly 4 digits.');
  }

  // 1. Find Student by Roll Number
  const student = await prisma.student.findUnique({
    where: { rollNumber: cleanRoll },
    include: {
      user: true,
      credentials: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        take: 1
      },
      enrollments: {
        where: { status: 'ACTIVE' },
        include: { classroom: true }
      }
    }
  });

  if (!student || !student.user) {
    throw new Error('Invalid credentials. Student not found with this roll number.');
  }

  // 2. Classroom-scoped check if joinCode provided
  if (joinCode) {
    const cleanCode = String(joinCode).trim().toUpperCase();
    const isEnrolledInClass = student.enrollments.some(
      e => e.classroom.joinCode.toUpperCase() === cleanCode
    );
    if (!isEnrolledInClass) {
      throw new Error(`Student ${cleanRoll} is not enrolled in class ${cleanCode}.`);
    }
  }

  const activeCred = student.credentials[0];
  if (!activeCred) {
    throw new Error('No active credential found for this student. Please contact your teacher.');
  }

  // 3. Lockout enforcement
  const now = new Date();
  if (activeCred.lockedUntil && activeCred.lockedUntil > now) {
    const waitMinutes = Math.ceil((activeCred.lockedUntil.getTime() - now.getTime()) / (60 * 1000));
    throw new Error(`Account locked due to too many failed attempts. Try again in ${waitMinutes} minutes.`);
  }

  // 4. Verify PIN with bcrypt slow hash
  const isMatch = await bcrypt.compare(cleanPin, activeCred.pinHash);

  if (!isMatch) {
    const newFailed = activeCred.failedAttempts + 1;
    let lockTime = null;

    if (newFailed >= 5) {
      // Lock for 15 minutes after 5 consecutive failures
      lockTime = new Date(Date.now() + 15 * 60 * 1000);
    }

    await prisma.studentCredential.update({
      where: { id: activeCred.id },
      data: {
        failedAttempts: newFailed,
        lockedUntil: lockTime
      }
    });

    const attemptsRemaining = Math.max(0, 5 - newFailed);
    if (newFailed >= 5) {
      throw new Error('Too many failed PIN attempts. Account locked for 15 minutes.');
    } else {
      throw new Error(`Incorrect PIN. ${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining before temporary lockout.`);
    }
  }

  // 5. Successful match: reset lockout and failed attempts
  await prisma.studentCredential.update({
    where: { id: activeCred.id },
    data: {
      failedAttempts: 0,
      lockedUntil: null
    }
  });

  const token = generateAuthToken(student.user, student.id);

  return {
    success: true,
    token,
    user: {
      id: student.user.id,
      studentId: student.id,
      name: student.user.name,
      email: student.user.email,
      role: 'student',
      rollNumber: student.rollNumber,
      gradeLevel: student.grade,
      avatar: student.user.avatar,
      themePreference: student.user.themePreference,
      enrolledClasses: student.enrollments.map(e => e.classroom.joinCode)
    }
  };
}

/**
 * Standard username/email and password login (for teachers, admins, and students)
 */
async function authenticateUser({ identifier, password }) {
  if (!identifier || !password) {
    throw new Error('Email/username and password/PIN are required.');
  }

  const cleanId = String(identifier).trim().toLowerCase();

  // Find user by email or rollNumber
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: cleanId },
        { email: cleanId.toUpperCase() },
        { studentProfile: { rollNumber: cleanId.toUpperCase() } }
      ]
    },
    include: { studentProfile: true }
  });

  if (!user || !user.passwordHash) {
    throw new Error('Invalid credentials. Please verify your email and password.');
  }

  const isMatch = await bcrypt.compare(String(password), user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid credentials. Please verify your email and password.');
  }

  const token = generateAuthToken(user, user.studentProfile?.id);

  return {
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase(),
      avatar: user.avatar,
      themePreference: user.themePreference,
      gradeLevel: user.gradeLevel,
      studentId: user.studentProfile?.id || null
    }
  };
}

module.exports = {
  generateAuthToken,
  authenticateStudentPin,
  authenticateUser
};
