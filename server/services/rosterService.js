const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const xlsx = require('xlsx');
const { prisma } = require('../config/prisma');

/**
 * Generates an unpredictable, cryptographically random 4-digit PIN preserving leading zeros.
 * @returns {string} 4-digit PIN between "0000" and "9999"
 */
function generateSecure4DigitPin() {
  return crypto.randomInt(0, 10000).toString().padStart(4, '0');
}

/**
 * Parses raw CSV or XLSX file buffer into normalized row objects.
 * @param {Buffer} fileBuffer 
 * @param {string} originalName 
 * @returns {Array<{ student_name: string, roll_number: string }>}
 */
function parseRosterBuffer(fileBuffer, originalName = '') {
  const workbook = xlsx.read(fileBuffer, { type: 'buffer', raw: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  
  const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: false, defval: '' });
  
  return rawRows.map(row => {
    // Normalization of common column names
    const rawName = row['Student Name'] || row['student_name'] || row['Name'] || row['name'] || row['Student'] || '';
    const rawRoll = row['Roll Number'] || row['roll_number'] || row['Roll No'] || row['rollNo'] || row['ID'] || row['Roll'] || '';
    return {
      student_name: String(rawName).trim(),
      roll_number: String(rawRoll).trim().toUpperCase()
    };
  });
}

/**
 * Previews and validates a roster without committing changes to the database.
 * @param {Array<{ student_name: string, roll_number: string }>} rows 
 * @param {string} classroomId 
 * @returns {Promise<object>} preview result with valid, duplicate, and invalid rows
 */
async function previewRoster(rows, classroomId) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      valid: false,
      message: 'Roster must contain at least one row.',
      summary: { total: 0, validCount: 0, duplicateCount: 0, invalidCount: 0 },
      rows: []
    };
  }

  const seenRollNumbersInBatch = new Set();
  const previewRows = [];
  let validCount = 0;
  let duplicateCount = 0;
  let invalidCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rawName = row.student_name || row.name || '';
    const rawRoll = row.roll_number || row.rollNo || '';

    const cleanName = String(rawName).trim();
    const cleanRoll = String(rawRoll).trim().toUpperCase();

    // 1. Validation check
    if (!cleanName || !cleanRoll || cleanRoll.length < 2) {
      invalidCount++;
      previewRows.push({
        rowNumber: i + 1,
        studentName: cleanName,
        rollNumber: cleanRoll,
        status: 'invalid',
        error: 'Missing or invalid student name or roll number (minimum 2 characters).'
      });
      continue;
    }

    // 2. Intra-batch duplicate check
    if (seenRollNumbersInBatch.has(cleanRoll)) {
      duplicateCount++;
      previewRows.push({
        rowNumber: i + 1,
        studentName: cleanName,
        rollNumber: cleanRoll,
        status: 'duplicate_in_file',
        error: `Duplicate roll number '${cleanRoll}' in uploaded file.`
      });
      continue;
    }
    seenRollNumbersInBatch.add(cleanRoll);

    // 3. Database existence check
    let existingStudent = null;
    try {
      existingStudent = await prisma.student.findUnique({
        where: { rollNumber: cleanRoll },
        include: { user: true }
      });
    } catch (e) {}

    let enrollmentStatus = 'new_student';
    if (existingStudent) {
      if (classroomId) {
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            classroomId_studentId: {
              classroomId,
              studentId: existingStudent.id
            }
          }
        });
        enrollmentStatus = enrollment ? 'already_enrolled' : 'existing_student_will_enroll';
      } else {
        enrollmentStatus = 'existing_student';
      }
    }

    validCount++;
    previewRows.push({
      rowNumber: i + 1,
      studentName: cleanName,
      rollNumber: cleanRoll,
      status: 'valid',
      action: enrollmentStatus,
      existingStudentId: existingStudent?.id || null
    });
  }

  return {
    valid: invalidCount === 0 && duplicateCount === 0,
    summary: {
      total: rows.length,
      validCount,
      duplicateCount,
      invalidCount
    },
    rows: previewRows
  };
}

/**
 * Commits roster import transactionally: provisions users, students, credentials, and enrollments.
 * Returns printable student desk cards with credentials.
 */
async function commitRosterImport({ classroomId, roster, teacherId }) {
  const classroom = await prisma.classroom.findUnique({
    where: { id: classroomId }
  });

  if (!classroom) {
    throw new Error('Classroom not found.');
  }

  const seenRollNumbersInBatch = new Set();
  const deskCards = [];
  const errors = [];
  let createdCount = 0;
  let enrolledExistingCount = 0;

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < roster.length; i++) {
      const row = roster[i];
      const cleanName = String(row.student_name || row.name || '').trim();
      const cleanRoll = String(row.roll_number || row.rollNo || '').trim().toUpperCase();

      if (!cleanName || !cleanRoll || cleanRoll.length < 2) {
        errors.push({ row: i + 1, error: 'Invalid name or roll number.' });
        continue;
      }

      if (seenRollNumbersInBatch.has(cleanRoll)) {
        errors.push({ row: i + 1, rollNumber: cleanRoll, error: 'Duplicate roll number in file.' });
        continue;
      }
      seenRollNumbersInBatch.add(cleanRoll);

      const studentEmail = `${cleanRoll.toLowerCase()}@student.adaptiq.internal`;

      // Check if student exists
      let student = await tx.student.findUnique({
        where: { rollNumber: cleanRoll },
        include: { user: true }
      });

      if (student) {
        // Enroll in class if not enrolled
        await tx.enrollment.upsert({
          where: {
            classroomId_studentId: {
              classroomId: classroom.id,
              studentId: student.id
            }
          },
          update: { status: 'ACTIVE' },
          create: {
            classroomId: classroom.id,
            studentId: student.id,
            status: 'ACTIVE'
          }
        });

        enrolledExistingCount++;
        deskCards.push({
          studentId: student.id,
          name: student.user.name,
          rollNumber: cleanRoll,
          classroomName: classroom.name,
          joinCode: classroom.joinCode,
          pin: '**** (Pre-existing account - unchanged)',
          status: 'already_registered'
        });
      } else {
        // Create user, student, and secure PIN
        const plainPin = generateSecure4DigitPin();
        const pinHash = await bcrypt.hash(plainPin, 10);

        const newUser = await tx.user.create({
          data: {
            name: cleanName,
            email: studentEmail,
            passwordHash: pinHash,
            role: 'STUDENT',
            gradeLevel: classroom.gradeLevel || 7,
            avatar: `avatar-${(createdCount % 8) + 1}`,
            themePreference: 'student-indigo'
          }
        });

        const newStudent = await tx.student.create({
          data: {
            userId: newUser.id,
            rollNumber: cleanRoll,
            grade: classroom.gradeLevel || 7
          }
        });

        await tx.studentCredential.create({
          data: {
            studentId: newStudent.id,
            pinHash,
            status: 'ACTIVE'
          }
        });

        await tx.enrollment.create({
          data: {
            classroomId: classroom.id,
            studentId: newStudent.id,
            status: 'ACTIVE'
          }
        });

        createdCount++;
        // Plaintext PIN returned ONLY in this authorized response for desk card printing
        deskCards.push({
          studentId: newStudent.id,
          name: cleanName,
          rollNumber: cleanRoll,
          classroomName: classroom.name,
          joinCode: classroom.joinCode,
          pin: plainPin,
          status: 'newly_created'
        });
      }
    }

    // Record audit log entry
    await tx.auditLog.create({
      data: {
        actorId: teacherId,
        action: 'ROSTER_IMPORT_COMMITTED',
        entityType: 'CLASSROOM',
        entityId: classroom.id,
        details: {
          classroomId: classroom.id,
          createdCount,
          enrolledExistingCount,
          totalProcessed: roster.length
        }
      }
    });
  });

  return {
    success: true,
    summary: {
      totalRows: roster.length,
      createdCount,
      enrolledExistingCount,
      errors
    },
    deskCards
  };
}

/**
 * Securely resets a student's PIN credential.
 * Generates an unpredictable 4-digit PIN, resets failed attempt counters,
 * and returns the one-time credential for desk card reissue.
 */
async function resetStudentPin({ classroomId, studentId, teacherId }) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { user: true }
  });

  if (!student) {
    throw new Error('Student not found.');
  }

  const newPin = generateSecure4DigitPin();
  const pinHash = await bcrypt.hash(newPin, 10);

  await prisma.$transaction(async (tx) => {
    // Revoke old credentials
    await tx.studentCredential.updateMany({
      where: { studentId: student.id },
      data: { status: 'REVOKED' }
    });

    // Create fresh active credential
    await tx.studentCredential.create({
      data: {
        studentId: student.id,
        pinHash,
        failedAttempts: 0,
        lockedUntil: null,
        resetRequired: false,
        status: 'ACTIVE'
      }
    });

    // Also update User passwordHash so both auth methods reflect the new PIN
    await tx.user.update({
      where: { id: student.userId },
      data: { passwordHash: pinHash }
    });

    // Audit log
    await tx.auditLog.create({
      data: {
        actorId: teacherId,
        action: 'STUDENT_PIN_RESET',
        entityType: 'STUDENT',
        entityId: student.id,
        details: {
          rollNumber: student.rollNumber,
          resetByTeacherId: teacherId
        }
      }
    });
  });

  return {
    success: true,
    studentId: student.id,
    name: student.user.name,
    rollNumber: student.rollNumber,
    newPin,
    message: 'PIN successfully reset. Desk card credential generated.'
  };
}

module.exports = {
  generateSecure4DigitPin,
  parseRosterBuffer,
  previewRoster,
  commitRosterImport,
  resetStudentPin
};
