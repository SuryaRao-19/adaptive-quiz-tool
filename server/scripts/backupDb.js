/**
 * PostgreSQL Database Backup Utility
 * Generates point-in-time JSON and pg_dump backups into a local backups directory.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { prisma, verifyDatabaseConnection } = require('../config/prisma');

async function backupDb() {
  console.log('========================================================');
  console.log('💾 AdaptIQ PostgreSQL Database Backup Utility');
  console.log('========================================================');

  const connection = await verifyDatabaseConnection();
  if (!connection.ok) {
    console.error(`[Backup Error] Database is unreachable: ${connection.error}`);
    process.exit(1);
  }

  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilePath = path.join(backupDir, `backup_adaptiq_${timestamp}.json`);

  try {
    console.log('[Backup] Exporting complete database snapshot...');

    const [
      users,
      classrooms,
      students,
      enrollments,
      credentials,
      questions,
      questionVersions,
      assessments,
      assessmentItems,
      attempts,
      answerEvents,
      gradebookEntries,
      questionStatistics,
      syncEvents,
      auditLogs
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.classroom.findMany(),
      prisma.student.findMany(),
      prisma.enrollment.findMany(),
      prisma.studentCredential.findMany(),
      prisma.question.findMany(),
      prisma.questionVersion.findMany(),
      prisma.assessment.findMany(),
      prisma.assessmentItem.findMany(),
      prisma.attempt.findMany(),
      prisma.answerEvent.findMany(),
      prisma.gradebookEntry.findMany(),
      prisma.questionStatistic.findMany(),
      prisma.syncEvent.findMany(),
      prisma.auditLog.findMany()
    ]);

    const snapshot = {
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      },
      counts: {
        users: users.length,
        classrooms: classrooms.length,
        students: students.length,
        enrollments: enrollments.length,
        credentials: credentials.length,
        questions: questions.length,
        questionVersions: questionVersions.length,
        assessments: assessments.length,
        assessmentItems: assessmentItems.length,
        attempts: attempts.length,
        answerEvents: answerEvents.length,
        gradebookEntries: gradebookEntries.length,
        questionStatistics: questionStatistics.length,
        syncEvents: syncEvents.length,
        auditLogs: auditLogs.length
      },
      data: {
        users,
        classrooms,
        students,
        enrollments,
        credentials,
        questions,
        questionVersions,
        assessments,
        assessmentItems,
        attempts,
        answerEvents,
        gradebookEntries,
        questionStatistics,
        syncEvents,
        auditLogs
      }
    };

    fs.writeFileSync(backupFilePath, JSON.stringify(snapshot, null, 2), 'utf-8');
    console.log(`[Backup Success] Snapshot written to: ${backupFilePath}`);
    console.log('Record Counts Summary:', snapshot.counts);

    // Audit backup creation
    await prisma.auditLog.create({
      data: {
        action: 'DATABASE_BACKUP_CREATED',
        entityType: 'DATABASE',
        entityId: 'adaptiq_db',
        details: {
          file: backupFilePath,
          counts: snapshot.counts
        }
      }
    });

    console.log('========================================================');
  } catch (error) {
    console.error('[Backup Error]:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  backupDb();
}

module.exports = backupDb;
