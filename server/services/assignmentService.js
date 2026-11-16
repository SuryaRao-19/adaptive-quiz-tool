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

module.exports = {
  getAssignmentsForStudent,
  getAssignmentsForTeacher,
  createAssignment,
  demoAssignments
};

