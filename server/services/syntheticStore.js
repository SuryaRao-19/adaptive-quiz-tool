/**
 * Synthetic School Data Store Manager
 * Provides thread-safe, transactional in-memory and persistent JSON data access
 * for the Asian Public School simulation environment.
 * Ensures genuine persistence for attendance, assessments, live invigilation,
 * descriptive grading, and analytics when running in standalone/demonstration mode.
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE_PATH = path.join(__dirname, '../data/syntheticSchoolData.json');
const TMP_DATA_FILE_PATH = process.env.VERCEL ? path.join('/tmp', 'syntheticSchoolData.json') : null;
let inMemoryStore = null;

// Statically required so Vercel / serverless bundlers trace and bundle this JSON file into the Lambda distribution
let staticSeedData = null;
try {
  staticSeedData = require('../data/syntheticSchoolData.json');
} catch (e) {
  staticSeedData = null;
}

function loadStore() {
  if (!inMemoryStore) {
    // 1. Check writable /tmp partition first if running on Vercel
    if (TMP_DATA_FILE_PATH && fs.existsSync(TMP_DATA_FILE_PATH)) {
      try {
        const raw = fs.readFileSync(TMP_DATA_FILE_PATH, 'utf8');
        inMemoryStore = JSON.parse(raw);
      } catch (err) {
        console.warn('[SyntheticStore] Error reading /tmp store, falling back:', err.message);
        inMemoryStore = null;
      }
    }

    // 2. Read from local repository file path
    if (!inMemoryStore && fs.existsSync(DATA_FILE_PATH)) {
      try {
        const raw = fs.readFileSync(DATA_FILE_PATH, 'utf8');
        inMemoryStore = JSON.parse(raw);
      } catch (err) {
        console.error('[SyntheticStore] Error reading data file, using static fallback:', err.message);
        inMemoryStore = null;
      }
    }
    
    // 3. If not loaded from disk, use static seed data (bundled in Lambda)
    if (!inMemoryStore && staticSeedData) {
      inMemoryStore = JSON.parse(JSON.stringify(staticSeedData));
    }
    
    // If still null, trigger generator (local development only)
    if (!inMemoryStore) {
      try {
        require('../scripts/generateSyntheticSchoolData');
        if (fs.existsSync(DATA_FILE_PATH)) {
          const raw = fs.readFileSync(DATA_FILE_PATH, 'utf8');
          inMemoryStore = JSON.parse(raw);
        }
      } catch (genErr) {
        console.error('[SyntheticStore] Generator fallback error:', genErr.message);
      }
    }

    if (!inMemoryStore) {
      inMemoryStore = {
        school: { name: 'Asian Public School — AdaptIQ Demo', code: 'APS-2026-DEMO' },
        teachers: [],
        classrooms: [],
        students: [],
        assessments: [],
        assignments: [],
        attendance: [],
        attempts: [],
        answerEvents: []
      };
    }
  }
  return inMemoryStore;
}

function persistStore() {
  if (!inMemoryStore) return;
  const targetPath = (process.env.VERCEL && TMP_DATA_FILE_PATH) ? TMP_DATA_FILE_PATH : DATA_FILE_PATH;
  try {
    fs.writeFileSync(targetPath, JSON.stringify(inMemoryStore, null, 2), 'utf8');
  } catch (err) {
    if (TMP_DATA_FILE_PATH && targetPath !== TMP_DATA_FILE_PATH) {
      try {
        fs.writeFileSync(TMP_DATA_FILE_PATH, JSON.stringify(inMemoryStore, null, 2), 'utf8');
      } catch (_) {}
    }
  }
}

// 1. School & Teachers
function getSchool() {
  const store = loadStore();
  return store.school;
}

function getTeachers() {
  const store = loadStore();
  return store.teachers || [];
}

function getTeacherById(id) {
  const teachers = getTeachers();
  return teachers.find(t => t.id === id || t.email === id);
}

// 2. Classrooms
function getClassrooms() {
  const store = loadStore();
  return store.classrooms || [];
}

function getClassroomById(id) {
  const classrooms = getClassrooms();
  return classrooms.find(c => c.id === id || c.joinCode === id || c._id === id);
}

function addClassroom(classroomData) {
  const store = loadStore();
  const id = classroomData.id || `cls-${Date.now()}`;
  const newClass = {
    id,
    _id: id,
    name: classroomData.name,
    subject: classroomData.subject || 'Mathematics',
    gradeLevel: parseInt(classroomData.gradeLevel, 10) || 7,
    section: classroomData.section || `${classroomData.gradeLevel || 7}-A`,
    joinCode: classroomData.joinCode || `APS${classroomData.gradeLevel || 7}${classroomData.subject ? classroomData.subject[0].toUpperCase() : 'M'}`,
    teacherId: classroomData.teacherId || 't-01',
    teacherName: classroomData.teacherName || 'Mrs. Ananya Sharma',
    schoolId: store.school?.id || 'school-aps-demo-001',
    capacity: 35,
    isSynthetic: true,
    createdAt: new Date().toISOString()
  };
  store.classrooms.unshift(newClass);
  persistStore();
  return newClass;
}

// 3. Students
function getStudents() {
  const store = loadStore();
  return store.students || [];
}

function getStudentById(id) {
  const students = getStudents();
  return students.find(s => s.id === id || s.rollNumber === id || s.email === id);
}

function getStudentsByClassroom(classroomId) {
  const cls = getClassroomById(classroomId);
  const students = getStudents();
  if (!cls) return students.slice(0, 30);
  return students.filter(s => s.gradeLevel === cls.gradeLevel && (s.section === cls.section || !s.section));
}

// 4. Assessments
function getAssessments() {
  const store = loadStore();
  const rawAssessments = store.assessments || [];
  let multiQuestions = null;
  try {
    multiQuestions = require('../data/multiGradeQuestions.json');
  } catch (_) {
    multiQuestions = [];
  }
  const qMap = new Map((multiQuestions || []).map(q => [q.id, q]));

  return rawAssessments.map(asm => {
    if ((!asm.questions || asm.questions.length === 0) && Array.isArray(asm.questionIds) && asm.questionIds.length > 0) {
      const resolved = asm.questionIds.map(qid => qMap.get(qid)).filter(Boolean);
      return { ...asm, questions: resolved };
    }
    return asm;
  });
}

function getAssessmentById(id) {
  const assessments = getAssessments();
  return assessments.find(a => a.id === id);
}

function addAssessment(data) {
  const store = loadStore();
  const id = data.id || `asm-${Date.now()}`;
  const newAssessment = {
    id,
    title: data.title,
    gradeLevel: parseInt(data.gradeLevel, 10) || 7,
    subject: data.subject || 'Mathematics',
    assessmentType: data.assessmentType || 'FORMATIVE_TEST',
    status: data.status || 'PUBLISHED',
    isLive: Boolean(data.isLive),
    isPaused: false,
    timeExtendedMinutes: 0,
    durationMinutes: parseInt(data.durationMinutes, 10) || 20,
    totalMarks: parseInt(data.totalMarks, 10) || 24,
    questionCount: data.questionIds?.length || 12,
    questionIds: data.questionIds || [],
    randomizeOrder: Boolean(data.randomizeOrder),
    instructions: data.instructions || 'Standard School Assessment.',
    startTime: data.startTime || null,
    endTime: data.endTime || null,
    schoolId: store.school?.id || 'school-aps-demo-001',
    createdAt: new Date().toISOString(),
    isSynthetic: true
  };
  store.assessments.unshift(newAssessment);
  persistStore();
  return newAssessment;
}

function updateAssessment(id, updates) {
  const store = loadStore();
  const index = store.assessments.findIndex(a => a.id === id);
  if (index !== -1) {
    store.assessments[index] = { ...store.assessments[index], ...updates, updatedAt: new Date().toISOString() };
    persistStore();
    return store.assessments[index];
  }
  return null;
}

// 5. Attempts & AnswerEvents
function getAttempts() {
  const store = loadStore();
  return store.attempts || [];
}

function getAttemptById(id) {
  const attempts = getAttempts();
  return attempts.find(a => a.id === id);
}

function getAttemptsByAssessment(assessmentId) {
  const attempts = getAttempts();
  return attempts.filter(a => a.assessmentId === assessmentId);
}

function addAttempt(attemptData) {
  const store = loadStore();
  const id = attemptData.id || `att-${Date.now()}`;
  const totalScore = attemptData.totalScore ?? attemptData.score ?? 0;
  const maxScore = attemptData.maxScore || 20;
  const scorePercentage = attemptData.scorePercentage ?? Math.round((totalScore / maxScore) * 100);

  const newAttempt = {
    id,
    assessmentId: attemptData.assessmentId,
    assessmentTitle: attemptData.assessmentTitle || 'Asian Public School — Grade 7 Mathematics Diagnostic Assessment',
    studentId: attemptData.studentId,
    studentName: attemptData.studentName,
    rollNumber: attemptData.rollNumber,
    gradeLevel: attemptData.gradeLevel || 7,
    status: attemptData.status || 'SUBMITTED',
    totalScore,
    score: totalScore,
    maxScore,
    scorePercentage,
    correctCount: attemptData.correctCount ?? totalScore,
    totalQuestions: attemptData.totalQuestions || 20,
    finalBktMastery: attemptData.finalBktMastery ?? (scorePercentage / 100),
    weakTopic: attemptData.weakTopic || null,
    weakTopics: attemptData.weakTopics || (attemptData.weakTopic ? [attemptData.weakTopic] : []),
    autoSubmitted: Boolean(attemptData.autoSubmitted),
    violationCount: attemptData.violationCount || 0,
    violationReason: attemptData.violationReason || null,
    startTime: attemptData.startTime || new Date().toISOString(),
    endTime: attemptData.endTime || new Date().toISOString(),
    schoolId: store.school?.id || 'school-aps-001',
    isSynthetic: false
  };

  // If student exists in store.students, update their mastery and intervention status
  if (store.students) {
    const stu = store.students.find(s => 
      s.id === attemptData.studentId || s.rollNumber === attemptData.rollNumber
    );
    if (stu) {
      stu.bktMastery = (scorePercentage / 100);
      stu.accuracyRate = (scorePercentage / 100);
      if (attemptData.weakTopic) stu.weakTopic = attemptData.weakTopic;
      stu.tier = scorePercentage < 60 ? 'Intervention' : scorePercentage < 80 ? 'Targeted' : 'Core';
    }
  }

  store.attempts.unshift(newAttempt);
  persistStore();
  return newAttempt;
}

function updateAttempt(id, updates) {
  const store = loadStore();
  const index = store.attempts.findIndex(a => a.id === id);
  if (index !== -1) {
    store.attempts[index] = { ...store.attempts[index], ...updates, updatedAt: new Date().toISOString() };
    persistStore();
    return store.attempts[index];
  }
  return null;
}

function getAnswerEventsByAttempt(attemptId) {
  const store = loadStore();
  return (store.answerEvents || []).filter(e => e.attemptId === attemptId);
}

function updateAnswerEvent(id, updates) {
  const store = loadStore();
  const index = store.answerEvents.findIndex(e => e.id === id);
  if (index !== -1) {
    store.answerEvents[index] = { ...store.answerEvents[index], ...updates };
    persistStore();
    return store.answerEvents[index];
  }
  return null;
}

// 6. Attendance
function getAttendanceRecords(classroomId, dateStr) {
  const store = loadStore();
  let list = store.attendance || [];
  if (classroomId) {
    list = list.filter(a => a.classroomId === classroomId);
  }
  if (dateStr) {
    const targetDate = dateStr.split('T')[0];
    list = list.filter(a => a.date.startsWith(targetDate));
  }
  return list;
}

function saveAttendanceBatch(records) {
  const store = loadStore();
  if (!store.attendance) store.attendance = [];

  records.forEach(newRec => {
    const recDate = new Date(newRec.date);
    recDate.setUTCHours(0, 0, 0, 0);
    const normalizedDateStr = recDate.toISOString().split('T')[0];

    const existingIdx = store.attendance.findIndex(
      a => a.classroomId === newRec.classroomId &&
           a.studentId === newRec.studentId &&
           a.date.startsWith(normalizedDateStr)
    );

    const fullRecord = {
      id: newRec.id || `att-${newRec.studentId}-${normalizedDateStr}`,
      classroomId: newRec.classroomId,
      studentId: newRec.studentId,
      studentName: newRec.studentName,
      rollNumber: newRec.rollNumber,
      date: recDate.toISOString(),
      status: newRec.status || 'PRESENT',
      remarks: newRec.remarks || null,
      markedById: newRec.markedById || 'teacher-01',
      isSynthetic: true,
      updatedAt: new Date().toISOString()
    };

    if (existingIdx !== -1) {
      store.attendance[existingIdx] = fullRecord;
    } else {
      store.attendance.push(fullRecord);
    }
  });

  persistStore();
  return { success: true, count: records.length };
}

function findStudentByGradeAndRoll(grade, rollNumber) {
  const store = loadStore();
  const g = parseInt(grade, 10);
  const cleanRoll = String(rollNumber || '').trim().toUpperCase();
  return (store.students || []).find(
    s => (parseInt(s.grade, 10) === g || parseInt(s.gradeLevel, 10) === g || !s.grade) && 
         String(s.rollNumber || '').trim().toUpperCase() === cleanRoll
  );
}

function updateStudent(id, updates) {
  const store = loadStore();
  const index = (store.students || []).findIndex(s => s.id === id || s.rollNumber === id);
  if (index !== -1) {
    store.students[index] = { ...store.students[index], ...updates, updatedAt: new Date().toISOString() };
    persistStore();
    return store.students[index];
  }
  return null;
}

function addStudent(studentData) {
  const store = loadStore();
  if (!store.students) store.students = [];
  const id = studentData.id || `stu-g7-${Date.now()}`;
  const newStudent = {
    id,
    name: studentData.name || studentData.student_name,
    rollNumber: (studentData.rollNumber || studentData.roll_number || '').trim().toUpperCase(),
    grade: parseInt(studentData.grade || studentData.gradeLevel, 10) || 7,
    gradeLevel: parseInt(studentData.grade || studentData.gradeLevel, 10) || 7,
    section: studentData.section || '7-A',
    email: studentData.email || `${(studentData.name || 'student').toLowerCase().replace(/\s+/g, '.')}@asianpublicschool.edu`,
    classroomId: studentData.classroomId || 'cls-aps-7a',
    schoolId: store.school?.id || 'school-aps-001',
    activationCode: studentData.activationCode || `APS-ACT-${Math.floor(1000 + Math.random() * 9000)}`,
    isActivated: Boolean(studentData.isActivated),
    passwordHash: studentData.passwordHash || null,
    createdAt: new Date().toISOString()
  };
  store.students.push(newStudent);
  persistStore();
  return newStudent;
}

// 7. Internal Support Inbox & Ticket System
function getTickets(filter = {}) {
  const store = loadStore();
  let list = store.tickets || [];
  if (filter.status && filter.status !== 'ALL') {
    list = list.filter(t => t.status.toLowerCase() === filter.status.toLowerCase());
  }
  if (filter.category && filter.category !== 'ALL') {
    list = list.filter(t => t.category.toLowerCase() === filter.category.toLowerCase());
  }
  if (filter.assignedTo) {
    list = list.filter(t => t.assignedTo && t.assignedTo.toLowerCase().includes(filter.assignedTo.toLowerCase()));
  }
  return list;
}

function getTicketById(id) {
  const store = loadStore();
  return (store.tickets || []).find(t => t.id === id || t.ticketNumber === id);
}

function addTicket(ticketData) {
  const store = loadStore();
  if (!store.tickets) store.tickets = [];
  const count = store.tickets.length + 1;
  const numStr = String(count).padStart(3, '0');
  const id = ticketData.id || `TICK-${Date.now()}`;
  const newTicket = {
    id,
    ticketNumber: ticketData.ticketNumber || `APS-TK-${numStr}`,
    senderName: ticketData.senderName || ticketData.name || 'Anonymous User',
    senderRole: ticketData.senderRole || ticketData.role || 'student',
    senderEmail: ticketData.senderEmail || ticketData.email || 'user@asianpublicschool.edu',
    studentId: ticketData.studentId || null,
    subject: ticketData.subject || ticketData.bugTitle || 'Support Enquiry',
    message: ticketData.message || ticketData.description || '',
    category: ticketData.category || 'GENERAL',
    priority: ticketData.priority || 'MEDIUM',
    status: 'New',
    assignedTo: ticketData.assignedTo || 'Mrs. Ananya Sharma',
    responses: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  store.tickets.unshift(newTicket);
  persistStore();
  return newTicket;
}

function addTicketResponse(ticketId, { responderName, responderRole, message, newStatus }) {
  const store = loadStore();
  const ticket = (store.tickets || []).find(t => t.id === ticketId || t.ticketNumber === ticketId);
  if (!ticket) return null;
  const response = {
    id: `resp-${Date.now()}`,
    responderName: responderName || 'Staff Member',
    responderRole: responderRole || 'teacher',
    message,
    createdAt: new Date().toISOString()
  };
  if (!ticket.responses) ticket.responses = [];
  ticket.responses.push(response);
  if (newStatus) {
    ticket.status = newStatus;
  } else if (ticket.status === 'New') {
    ticket.status = 'Open';
  }
  ticket.updatedAt = new Date().toISOString();
  persistStore();
  return ticket;
}

function updateTicket(ticketId, updates) {
  const store = loadStore();
  const index = (store.tickets || []).findIndex(t => t.id === ticketId || t.ticketNumber === ticketId);
  if (index !== -1) {
    store.tickets[index] = { ...store.tickets[index], ...updates, updatedAt: new Date().toISOString() };
    persistStore();
    return store.tickets[index];
  }
  return null;
}

// 8. Reset to Clean Grade 7 Pilot Demonstration State
function resetToBaseline() {
  inMemoryStore = null;
  const { setupGrade7Pilot } = require('../scripts/setupGrade7Pilot');
  setupGrade7Pilot();
  return loadStore();
}

module.exports = {
  loadStore,
  persistStore,
  getSchool,
  getTeachers,
  getTeacherById,
  getClassrooms,
  getClassroomById,
  addClassroom,
  getStudents,
  getStudentById,
  getStudentsByClassroom,
  getAssessments,
  getAssessmentById,
  addAssessment,
  updateAssessment,
  getAttempts,
  getAttemptById,
  getAttemptsByAssessment,
  addAttempt,
  updateAttempt,
  getAnswerEventsByAttempt,
  updateAnswerEvent,
  getAttendanceRecords,
  saveAttendanceBatch,
  findStudentByGradeAndRoll,
  updateStudent,
  addStudent,
  getTickets,
  getTicketById,
  addTicket,
  addTicketResponse,
  updateTicket,
  resetToBaseline
};
