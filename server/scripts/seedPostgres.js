const bcrypt = require('bcryptjs');
const { prisma, verifyDatabaseConnection } = require('../config/prisma');
const mathQuestions = require('./seedData/mathQuestions.json');
const scienceQuestions = require('./seedData/scienceQuestions.json');

async function seedPostgres() {
  console.log('========================================================');
  console.log('🌱 AdaptIQ PostgreSQL / Prisma Fictional Data Seed');
  console.log('========================================================');

  const connection = await verifyDatabaseConnection();
  if (!connection.ok) {
    console.error(`[Seed Error] Cannot connect to PostgreSQL: ${connection.error}`);
    console.error(`Please ensure PostgreSQL is running (e.g. via 'docker compose up -d') and DATABASE_URL is correct.`);
    process.exit(1);
  }

  try {
    console.log('[Seed] Connected to PostgreSQL. Checking existing data...');

    // 1. Seed Demo Teacher
    let teacher = await prisma.user.findUnique({
      where: { email: 'teacher@school.edu' }
    });

    if (!teacher) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('teacher123', salt);
      teacher = await prisma.user.create({
        data: {
          name: 'Sarah Jenkins',
          email: 'teacher@school.edu',
          passwordHash,
          role: 'TEACHER',
          avatar: 'avatar-4',
          themePreference: 'teacher-navy',
          gradeLevel: 7
        }
      });
      console.log(`[Seed] Created demo teacher: teacher@school.edu (pwd: teacher123)`);
    } else {
      console.log(`[Seed] Demo teacher already exists. Skipping.`);
    }

    // 2. Seed Demo Students
    const studentData = [
      {
        name: 'Alex Rivera',
        email: 'student@school.edu',
        rollNumber: 'STU-001',
        pin: '1234',
        grade: 7,
        avatar: 'avatar-1'
      },
      {
        name: 'Maya Patel',
        email: 'maya.patel@school.edu',
        rollNumber: 'STU-002',
        pin: '5678',
        grade: 7,
        avatar: 'avatar-2'
      },
      {
        name: 'Liam Chen',
        email: 'liam.chen@school.edu',
        rollNumber: 'STU-003',
        pin: '9012',
        grade: 7,
        avatar: 'avatar-3'
      }
    ];

    const seededStudents = [];

    for (const s of studentData) {
      let user = await prisma.user.findUnique({
        where: { email: s.email }
      });

      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(s.pin, salt);
        user = await prisma.user.create({
          data: {
            name: s.name,
            email: s.email,
            passwordHash,
            role: 'STUDENT',
            avatar: s.avatar,
            themePreference: 'student-indigo',
            gradeLevel: s.grade
          }
        });
      }

      let student = await prisma.student.findUnique({
        where: { rollNumber: s.rollNumber }
      });

      if (!student) {
        student = await prisma.student.create({
          data: {
            userId: user.id,
            rollNumber: s.rollNumber,
            grade: s.grade
          }
        });

        // Seed credential with bcrypt slow hash
        const pinHash = await bcrypt.hash(s.pin, 10);
        await prisma.studentCredential.create({
          data: {
            studentId: student.id,
            pinHash,
            failedAttempts: 0,
            status: 'ACTIVE'
          }
        });

        console.log(`[Seed] Created student ${s.name} (${s.rollNumber}) with PIN ${s.pin}`);
      }
      seededStudents.push(student);
    }

    // 3. Seed Demo Classroom
    let classroom = await prisma.classroom.findUnique({
      where: { joinCode: 'MATH7B' }
    });

    if (!classroom && teacher) {
      classroom = await prisma.classroom.create({
        data: {
          name: 'Grade 7-B Mathematics',
          subject: 'Math',
          gradeLevel: 7,
          joinCode: 'MATH7B',
          teacherId: teacher.id
        }
      });
      console.log(`[Seed] Created classroom: Grade 7-B Mathematics (Join Code: MATH7B)`);

      // Enroll students
      for (const st of seededStudents) {
        await prisma.enrollment.create({
          data: {
            classroomId: classroom.id,
            studentId: st.id,
            status: 'ACTIVE'
          }
        });
      }
      console.log(`[Seed] Enrolled ${seededStudents.length} students into MATH7B.`);
    }

    // 4. Seed Questions with Version 1
    const totalExistingQuestions = await prisma.question.count();
    if (totalExistingQuestions === 0) {
      console.log('[Seed] Seeding curriculum questions from JSON datasets...');
      const allRawQuestions = [...mathQuestions, ...scienceQuestions];
      let insertedCount = 0;

      for (const q of allRawQuestions) {
        const rawDiff = (q.difficulty || 'medium').toUpperCase();
        const difficulty = ['EASY', 'MEDIUM', 'HARD', 'VERY_HARD'].includes(rawDiff)
          ? rawDiff
          : 'MEDIUM';

        const createdQ = await prisma.question.create({
          data: {
            subject: q.subject || 'Math',
            topic: (q.topic || 'General').trim(),
            difficulty,
            questionText: q.questionText.trim(),
            options: q.options,
            correctAnswerIndex: Number(q.correctAnswerIndex) || 0,
            explanation: (q.explanation || 'Step-by-step solution.').trim(),
            steps: q.steps || [],
            conceptSummary: (q.conceptSummary || '').trim(),
            misconception: (q.misconception || '').trim(),
            source: q.source || 'seed',
            status: 'APPROVED',
            isActive: true,
            createdById: teacher ? teacher.id : null
          }
        });

        // Create immutable Version 1
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
            misconception: createdQ.misconception,
            changedById: teacher ? teacher.id : null
          }
        });

        // Initialize empty statistics baseline
        await prisma.questionStatistic.create({
          data: {
            questionId: createdQ.id,
            questionVersion: 1,
            totalResponses: 0,
            correctResponses: 0,
            pValue: null,
            raschLogitDifficulty: null,
            anomalyStatus: 'insufficient_data',
            sampleSizeStatus: 'insufficient'
          }
        });

        insertedCount++;
      }
      console.log(`[Seed] Successfully inserted ${insertedCount} questions with immutable version 1 and statistics records.`);
    } else {
      console.log(`[Seed] Database already contains ${totalExistingQuestions} questions. Skipping question seed.`);
    }

    // 5. Seed Assessment
    if (classroom && teacher) {
      let diagnostic = await prisma.assessment.findFirst({
        where: { classroomId: classroom.id, assessmentType: 'PRE_TEST' }
      });

      if (!diagnostic) {
        diagnostic = await prisma.assessment.create({
          data: {
            title: 'Grade 7 Math Diagnostic Assessment',
            subject: 'Math',
            topic: 'Foundational Diagnostic',
            assessmentType: 'PRE_TEST',
            durationMinutes: 20,
            maxScore: 100,
            passingScore: 60,
            classroomId: classroom.id,
            createdById: teacher.id,
            status: 'PUBLISHED',
            scoringRules: {
              penaltyForGuessing: false,
              adaptiveDifficultyBranching: true
            }
          }
        });

        // Attach sample math questions to assessment
        const sampleQs = await prisma.question.findMany({
          where: { subject: 'Math', status: 'APPROVED' },
          take: 10
        });

        for (let i = 0; i < sampleQs.length; i++) {
          await prisma.assessmentItem.create({
            data: {
              assessmentId: diagnostic.id,
              questionId: sampleQs[i].id,
              itemOrder: i + 1,
              points: 10.0
            }
          });
        }
        console.log(`[Seed] Created diagnostic assessment with ${sampleQs.length} items.`);
      }
    }

    // 6. Record Audit Log Entry
    await prisma.auditLog.create({
      data: {
        actorId: teacher ? teacher.id : null,
        action: 'SYSTEM_SEED',
        entityType: 'DATABASE',
        entityId: 'adaptiq_db',
        details: {
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development'
        }
      }
    });

    console.log('========================================================');
    console.log('✅ PostgreSQL / Prisma seeding completed successfully!');
    console.log('========================================================');
  } catch (error) {
    console.error('[Seed Exception]:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedPostgres();
}

module.exports = seedPostgres;
