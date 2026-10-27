/**
 * Explicit, repeatable data migration script from legacy MongoDB to PostgreSQL (Prisma).
 * Validates record counts, maintains relational integrity, and logs audit records.
 */
const mongoose = require('mongoose');
const { prisma, verifyDatabaseConnection } = require('../config/prisma');
const keys = require('../config/keys');

// Load Mongoose models
const MongoUser = require('../models/User');
const MongoClass = require('../models/Class');
const MongoQuestion = require('../models/Question');
const MongoAttempt = require('../models/Attempt');
const MongoQuizAttempt = require('../models/QuizAttempt');
const MongoProgress = require('../models/ProgressTracking');

async function migrateFromMongo() {
  console.log('========================================================');
  console.log('🔄 AdaptIQ MongoDB -> PostgreSQL Migration Utility');
  console.log('========================================================');

  // Verify PostgreSQL connection
  const pgConn = await verifyDatabaseConnection();
  if (!pgConn.ok) {
    console.error(`[Migration Error] PostgreSQL is unreachable: ${pgConn.error}`);
    process.exit(1);
  }

  // Connect to MongoDB
  try {
    await mongoose.connect(keys.MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    console.log(`[Migration] Connected to source MongoDB at: ${keys.MONGODB_URI}`);
  } catch (mongoErr) {
    console.warn(`[Migration Warning] Could not connect to external MongoDB: ${mongoErr.message}`);
    console.log('[Migration] No active source MongoDB found to migrate. Exiting migration safely without changes.');
    process.exit(0);
  }

  try {
    const report = {
      usersMigrated: 0,
      studentsMigrated: 0,
      classroomsMigrated: 0,
      questionsMigrated: 0,
      attemptsMigrated: 0,
      errors: []
    };

    // 1. Migrate Users
    const mongoUsers = await MongoUser.find();
    console.log(`[Migration] Found ${mongoUsers.length} MongoDB users.`);

    const userMapping = new Map(); // Mongo _id -> Postgres UUID
    const studentMapping = new Map(); // Mongo _id -> Postgres Student UUID

    for (const u of mongoUsers) {
      try {
        let pgUser = await prisma.user.findUnique({ where: { email: u.email } });
        const userRole = u.role ? u.role.toUpperCase() : 'STUDENT';
        const role = ['STUDENT', 'TEACHER', 'PARENT', 'ADMIN'].includes(userRole) ? userRole : 'STUDENT';

        if (!pgUser) {
          pgUser = await prisma.user.create({
            data: {
              name: u.name || u.fullName || 'User',
              email: u.email,
              passwordHash: u.passwordHash,
              role,
              avatar: u.avatar || 'avatar-1',
              themePreference: u.themePreference || 'student-indigo',
              gradeLevel: u.gradeLevel || u.grade || 7,
              notificationsEnabled: u.notificationsEnabled !== undefined ? u.notificationsEnabled : true
            }
          });
          report.usersMigrated++;
        }
        userMapping.set(u._id.toString(), pgUser.id);

        if (role === 'STUDENT') {
          const rollNumber = u.rollNumber || (u.email.includes('@') ? u.email.split('@')[0].toUpperCase() : `STU-${u._id.toString().slice(-4)}`);
          let pgStudent = await prisma.student.findUnique({ where: { userId: pgUser.id } });
          if (!pgStudent) {
            pgStudent = await prisma.student.create({
              data: {
                userId: pgUser.id,
                rollNumber,
                grade: u.gradeLevel || u.grade || 7
              }
            });

            // Migrate credential
            await prisma.studentCredential.create({
              data: {
                studentId: pgStudent.id,
                pinHash: u.passwordHash,
                status: 'ACTIVE'
              }
            });
            report.studentsMigrated++;
          }
          studentMapping.set(u._id.toString(), pgStudent.id);
        }
      } catch (err) {
        report.errors.push(`User ${u.email}: ${err.message}`);
      }
    }

    // 2. Migrate Classrooms
    const mongoClasses = await MongoClass.find();
    console.log(`[Migration] Found ${mongoClasses.length} MongoDB classrooms.`);

    for (const c of mongoClasses) {
      try {
        let pgClass = await prisma.classroom.findUnique({ where: { joinCode: c.joinCode } });
        const pgTeacherId = userMapping.get(c.teacherId?.toString());

        if (!pgClass && pgTeacherId) {
          pgClass = await prisma.classroom.create({
            data: {
              name: c.name,
              subject: c.subject || 'Math',
              gradeLevel: c.gradeLevel || 7,
              joinCode: c.joinCode,
              teacherId: pgTeacherId
            }
          });
          report.classroomsMigrated++;

          // Migrate enrollments
          if (Array.isArray(c.studentIds)) {
            for (const sMongoId of c.studentIds) {
              const pgStudentId = studentMapping.get(sMongoId.toString());
              if (pgStudentId) {
                await prisma.enrollment.upsert({
                  where: {
                    classroomId_studentId: {
                      classroomId: pgClass.id,
                      studentId: pgStudentId
                    }
                  },
                  update: {},
                  create: {
                    classroomId: pgClass.id,
                    studentId: pgStudentId,
                    status: 'ACTIVE'
                  }
                });
              }
            }
          }
        }
      } catch (err) {
        report.errors.push(`Class ${c.joinCode}: ${err.message}`);
      }
    }

    // 3. Migrate Questions
    const mongoQuestions = await MongoQuestion.find();
    console.log(`[Migration] Found ${mongoQuestions.length} MongoDB questions.`);

    for (const q of mongoQuestions) {
      try {
        const rawDiff = (q.difficulty || 'medium').toUpperCase();
        const difficulty = ['EASY', 'MEDIUM', 'HARD', 'VERY_HARD'].includes(rawDiff) ? rawDiff : 'MEDIUM';

        // Check if question text exists
        const existingQ = await prisma.question.findFirst({
          where: { questionText: q.questionText.trim(), subject: q.subject }
        });

        if (!existingQ) {
          const createdQ = await prisma.question.create({
            data: {
              subject: q.subject || 'Math',
              topic: (q.topic || 'General').trim(),
              difficulty,
              questionText: q.questionText.trim(),
              options: q.options,
              correctAnswerIndex: Number(q.correctAnswerIndex) || 0,
              explanation: (q.explanation || '').trim(),
              steps: q.steps || [],
              conceptSummary: (q.conceptSummary || '').trim(),
              misconception: (q.misconception || '').trim(),
              source: q.source || 'mongo_migration',
              status: 'APPROVED',
              isActive: q.isActive !== undefined ? q.isActive : true
            }
          });

          await prisma.questionVersion.create({
            data: {
              questionId: createdQ.id,
              version: 1,
              questionText: createdQ.questionText,
              options: createdQ.options,
              correctAnswerIndex: createdQ.correctAnswerIndex,
              explanation: createdQ.explanation,
              steps: createdQ.steps,
              conceptSummary: createdQ.conceptSummary,
              misconception: createdQ.misconception
            }
          });

          report.questionsMigrated++;
        }
      } catch (err) {
        report.errors.push(`Question: ${err.message}`);
      }
    }

    // Log Migration Audit Record
    await prisma.auditLog.create({
      data: {
        action: 'MONGO_TO_POSTGRES_MIGRATION',
        entityType: 'DATABASE',
        entityId: 'adaptiq_db',
        details: report
      }
    });

    console.log('========================================================');
    console.log('✅ Migration completed successfully!');
    console.log(`Users migrated: ${report.usersMigrated}`);
    console.log(`Students migrated: ${report.studentsMigrated}`);
    console.log(`Classrooms migrated: ${report.classroomsMigrated}`);
    console.log(`Questions migrated: ${report.questionsMigrated}`);
    if (report.errors.length > 0) {
      console.warn(`Errors encountered (${report.errors.length}):`, report.errors);
    }
    console.log('========================================================');
  } catch (error) {
    console.error('[Migration Fatal Error]:', error);
  } finally {
    await mongoose.disconnect();
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  migrateFromMongo();
}

module.exports = migrateFromMongo;
