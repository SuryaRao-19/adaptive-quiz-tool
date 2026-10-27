/**
 * PostgreSQL Database Restore Utility
 * Restores relational records from a verified snapshot file with integrity checks.
 */
const fs = require('fs');
const path = require('path');
const { prisma, verifyDatabaseConnection } = require('../config/prisma');

async function restoreDb(filePath) {
  console.log('========================================================');
  console.log('📥 AdaptIQ PostgreSQL Database Restore Utility');
  console.log('========================================================');

  const connection = await verifyDatabaseConnection();
  if (!connection.ok) {
    console.error(`[Restore Error] Database is unreachable: ${connection.error}`);
    process.exit(1);
  }

  const targetFile = filePath || process.argv[2];
  if (!targetFile) {
    console.error('[Restore Error] Please supply a path to the backup JSON file.');
    console.error('Usage: node scripts/restoreDb.js backups/backup_adaptiq_<timestamp>.json');
    process.exit(1);
  }

  const resolvedPath = path.isAbsolute(targetFile) ? targetFile : path.join(__dirname, '..', targetFile);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`[Restore Error] File does not exist at: ${resolvedPath}`);
    process.exit(1);
  }

  try {
    const rawContent = fs.readFileSync(resolvedPath, 'utf-8');
    const snapshot = JSON.parse(rawContent);

    if (!snapshot.data || !snapshot.counts) {
      throw new Error('Invalid snapshot structure: missing data or counts property.');
    }

    console.log(`[Restore] Restoring from snapshot timestamp: ${snapshot.meta?.timestamp || 'unknown'}`);
    console.log('Snapshot target counts:', snapshot.counts);

    // Restore sequentially respecting foreign key constraints
    const {
      users = [],
      classrooms = [],
      students = [],
      enrollments = [],
      credentials = [],
      questions = [],
      questionVersions = [],
      assessments = [],
      assessmentItems = [],
      attempts = [],
      answerEvents = [],
      gradebookEntries = [],
      questionStatistics = []
    } = snapshot.data;

    await prisma.$transaction(async (tx) => {
      // 1. Users
      for (const u of users) {
        await tx.user.upsert({
          where: { id: u.id },
          update: u,
          create: u
        });
      }

      // 2. Classrooms
      for (const c of classrooms) {
        await tx.classroom.upsert({
          where: { id: c.id },
          update: c,
          create: c
        });
      }

      // 3. Students
      for (const s of students) {
        await tx.student.upsert({
          where: { id: s.id },
          update: s,
          create: s
        });
      }

      // 4. Enrollments
      for (const e of enrollments) {
        await tx.enrollment.upsert({
          where: { id: e.id },
          update: e,
          create: e
        });
      }

      // 5. Credentials
      for (const cr of credentials) {
        await tx.studentCredential.upsert({
          where: { id: cr.id },
          update: cr,
          create: cr
        });
      }

      // 6. Questions
      for (const q of questions) {
        await tx.question.upsert({
          where: { id: q.id },
          update: q,
          create: q
        });
      }

      // 7. QuestionVersions
      for (const qv of questionVersions) {
        await tx.questionVersion.upsert({
          where: { id: qv.id },
          update: qv,
          create: qv
        });
      }

      // 8. Assessments
      for (const a of assessments) {
        await tx.assessment.upsert({
          where: { id: a.id },
          update: a,
          create: a
        });
      }

      // 9. AssessmentItems
      for (const ai of assessmentItems) {
        await tx.assessmentItem.upsert({
          where: { id: ai.id },
          update: ai,
          create: ai
        });
      }

      // 10. Attempts
      for (const att of attempts) {
        await tx.attempt.upsert({
          where: { id: att.id },
          update: att,
          create: att
        });
      }

      // 11. AnswerEvents
      for (const ae of answerEvents) {
        await tx.answerEvent.upsert({
          where: { id: ae.id },
          update: ae,
          create: ae
        });
      }

      // 12. GradebookEntries
      for (const g of gradebookEntries) {
        await tx.gradebookEntry.upsert({
          where: { id: g.id },
          update: g,
          create: g
        });
      }

      // 13. QuestionStatistics
      for (const qs of questionStatistics) {
        await tx.questionStatistic.upsert({
          where: { id: qs.id },
          update: qs,
          create: qs
        });
      }

      // Audit Log
      await tx.auditLog.create({
        data: {
          action: 'DATABASE_RESTORE_COMPLETED',
          entityType: 'DATABASE',
          entityId: 'adaptiq_db',
          details: {
            sourceFile: resolvedPath,
            snapshotTimestamp: snapshot.meta?.timestamp
          }
        }
      });
    });

    console.log('========================================================');
    console.log('✅ PostgreSQL database restore completed successfully!');
    console.log('========================================================');
  } catch (error) {
    console.error('[Restore Fatal Error]:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  restoreDb();
}

module.exports = restoreDb;
