/**
 * Assignment Management Service
 * Supports multi-grade homework, formative assessments, and scheduled task management.
 */

let demoAssignments = [
  {
    id: 'asg-01',
    schoolId: 'school-aps-001',
    classroomId: 'class-math-7a',
    gradeLevel: 7,
    section: '7-A',
    subject: 'Mathematics',
    title: 'Solving Linear Equations by Transposition (10 Problems)',
    instructions: 'Complete the adaptive practice set. Pay attention to sign changes across the equals sign.',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    assignedBy: 'Mrs. Ananya Sharma',
    totalStudents: 34,
    submittedCount: 28,
    status: 'ACTIVE'
  },
  {
    id: 'asg-02',
    schoolId: 'school-aps-001',
    classroomId: 'class-sci-7a',
    gradeLevel: 7,
    section: '7-A',
    subject: 'Science',
    title: 'Photosynthesis vs Respiration Concept Check',
    instructions: 'Answer all multiple-select and diagram analysis questions before Friday.',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    assignedBy: 'Ms. Sunita Rao',
    totalStudents: 34,
    submittedCount: 19,
    status: 'ACTIVE'
  },
  {
    id: 'asg-03',
    schoolId: 'school-aps-001',
    classroomId: 'class-eng-7a',
    gradeLevel: 7,
    section: '7-A',
    subject: 'English',
    title: 'Passive Voice Sentence Conversion Practice',
    instructions: 'Convert the 5 active sentences and write a short analytical paragraph.',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    assignedBy: 'Mr. David Paul',
    totalStudents: 34,
    submittedCount: 31,
    status: 'ACTIVE'
  },
  {
    id: 'asg-04',
    schoolId: 'school-aps-001',
    classroomId: 'class-math-10a',
    gradeLevel: 10,
    section: '10-A',
    subject: 'Mathematics',
    title: 'Quadratic Formula & Nature of Discriminant Drills',
    instructions: 'Solve the 8 numerical problems. Show step-by-step discriminant calculations.',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    assignedBy: 'Dr. Preeti Nair',
    totalStudents: 16,
    submittedCount: 14,
    status: 'ACTIVE'
  }
];

function getAssignmentsForStudent(studentGrade = 7, section = '7-A') {
  const g = parseInt(studentGrade, 10) || 7;
  return demoAssignments.filter(a => a.gradeLevel === g);
}

function getAssignmentsForTeacher(teacherName = '') {
  return demoAssignments;
}

function createAssignment(data) {
  const newAssignment = {
    id: `asg-${Date.now()}`,
    schoolId: data.schoolId || 'school-aps-001',
    classroomId: data.classroomId || 'class-custom',
    gradeLevel: parseInt(data.gradeLevel, 10) || 7,
    section: data.section || 'All',
    subject: data.subject || 'Mathematics',
    title: data.title || 'Untitled Practice Assignment',
    instructions: data.instructions || '',
    dueDate: data.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    assignedBy: data.assignedBy || 'Faculty Member',
    totalStudents: 30,
    submittedCount: 0,
    status: 'ACTIVE'
  };

  demoAssignments.unshift(newAssignment);
  return newAssignment;
}

let submissionsStore = [
  {
    id: 'sub-01',
    assignmentId: 'asg-01',
    studentId: 'student_demo_01',
    studentName: 'Aarav Patel',
    rollNumber: 'GPS-07-001',
    status: 'Submitted',
    submittedAt: '2026-11-17T14:30:00.000Z',
    textAnswer: 'Attached PDF contains solved questions 1 to 10 with verified checks for each root.',
    marksAwarded: 24,
    maxMarks: 25,
    feedback: 'Outstanding step-by-step transposition Aarav! Excellent precision on handling negative coefficients.',
    graded: true,
    gradedBy: 'Mrs. Ananya Sharma'
  }
];

function submitAssignment(assignmentId, studentData = {}, submissionPayload = {}) {
  const asg = demoAssignments.find(a => a.id === assignmentId);
  if (!asg) throw new Error('Assignment not found');
  
  const studentId = studentData.id || studentData.studentId || 'student_demo_01';
  const existingIndex = submissionsStore.findIndex(s => s.assignmentId === assignmentId && s.studentId === studentId);
  
  const submission = {
    id: existingIndex >= 0 ? submissionsStore[existingIndex].id : `sub-${Date.now()}`,
    assignmentId,
    studentId,
    studentName: studentData.name || 'Aarav Patel',
    rollNumber: studentData.rollNumber || 'GPS-07-001',
    status: 'Submitted',
    submittedAt: new Date().toISOString(),
    textAnswer: submissionPayload.textAnswer || '',
    attachmentUrl: submissionPayload.attachmentUrl || null,
    marksAwarded: null,
    maxMarks: asg.maxMarks || 25,
    feedback: 'Awaiting teacher evaluation.',
    graded: false
  };

  if (existingIndex >= 0) {
    submissionsStore[existingIndex] = submission;
  } else {
    submissionsStore.push(submission);
    asg.submittedCount = (asg.submittedCount || 0) + 1;
  }

  return submission;
}

function gradeAssignment(assignmentId, submissionId, { marksAwarded, feedback, gradedBy } = {}) {
  const sub = submissionsStore.find(s => s.id === submissionId || (s.assignmentId === assignmentId && s.id === submissionId));
  if (!sub) throw new Error('Submission not found');
  sub.marksAwarded = Number(marksAwarded);
  sub.feedback = feedback || 'Graded.';
  sub.graded = true;
  sub.gradedBy = gradedBy || 'Teacher';
  sub.status = 'Graded';
  return sub;
}

function getSubmissions(assignmentId) {
  return submissionsStore.filter(s => s.assignmentId === assignmentId);
}

module.exports = {
  getAssignmentsForStudent,
  getAssignmentsForTeacher,
  createAssignment,
  submitAssignment,
  gradeAssignment,
  getSubmissions,
  demoAssignments,
  submissionsStore
};

