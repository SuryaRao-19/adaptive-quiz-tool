/**
 * School Management & Multi-Tenant Service
 * Provides institutional administration, grade-wise metrics, teacher allocation,
 * and multi-grade school intelligence for Greenwood Public School.
 */

const { prisma, getDatabaseStatus } = require('../config/prisma');
const curriculumData = require('../data/curriculumData.json');

const GREENWOOD_PUBLIC_SCHOOL_DEFAULT = {
  id: 'school-gps-001',
  name: 'Greenwood Public School',
  tenantName: 'Greenwood Public School — AdaptIQ Demonstration Environment',
  code: 'GPS-2026',
  officialSchoolCode: '40643',
  board: 'CBSE',
  affiliationNumber: '530649',
  schoolCode: '40643',
  address: 'Huda Site No.-1, Sector -9, Gurugram, Haryana - 122001',
  city: 'Gurugram',
  state: 'Haryana',
  country: 'India',
  pinCode: '122001',
  website: 'https://www.greenwoodgurgaon.com',
  curriculumUrl: 'https://www.greenwoodgurgaon.com',
  established: 2002,
  aboutUs: 'Greenwood Public School, founded in 2002, is a premium school which is affiliated with the Central Board of Secondary Education (CBSE), has an educational strategy that is dynamic in approach and in conformity with the evolving demands of society.',
  openingHours: 'Mon - Sat : 07:30 A.M - 03:00 P.M, Sun : Closed',
  levels: {
    prePrimary: 'Pre-Nursery, Nursery, LKG, UKG',
    primary: 'Grades 1–5',
    middleWing: 'Grades 6–8',
    secondary: 'Grades 9–10',
    seniorSecondary: 'Grades 11–12'
  },
  streams: {
    science: ['Physics', 'Chemistry', 'Mathematics (PCM)', 'Biology (PCB)', 'Computer Science'],
    commerce: ['Accountancy', 'Business Studies', 'Economics', 'Applied Mathematics'],
    humanities: ['History', 'Political Science', 'Psychology', 'Sociology', 'English Core']
  },
  competitiveExamPrep: ['JEE Main / Advanced', 'NEET-UG', 'CUET', 'NDA', 'CLAT'],
  schedule: {
    summer: 'Monday–Saturday, 7:30 AM – 3:00 PM',
    winter: 'Monday–Saturday, 7:30 AM – 3:00 PM'
  },
  houseSystem: [
    { name: 'Tagore House', color: '#dc2626', motto: 'Knowledge is Freedom' },
    { name: 'Gandhi House', color: '#16a34a', motto: 'Truth and Non-Violence' },
    { name: 'Nehru House', color: '#2563eb', motto: 'Forward with Vision' },
    { name: 'Subhash House', color: '#d97706', motto: 'Courage and Dedication' }
  ],
  coCurricular: ['Robotics & STEM Lab', 'Vocal & Instrumental Music', 'Classical Dance', 'Debate & Model UN', 'Visual Arts & Pottery'],
  sports: ['Cricket', 'Football', 'Basketball', 'Badminton', 'Table Tennis', 'Athletics & Track', 'Taekwondo'],
  contactEmail: 'info@greenwoodgurgaon.com',
  contactPhone: '0124 - 4200807 / 808',
  contactMobile: '+91-9354482819 / 9990395520',
  academicYear: '2026-2027',
  isCurrentYear: true
};

const ASIAN_PUBLIC_SCHOOL_DEFAULT = GREENWOOD_PUBLIC_SCHOOL_DEFAULT;

/**
 * Fetch or initialize the Greenwood Public School institutional profile
 */
async function getSchoolProfile(schoolCode = 'GPS-2026') {
  if (getDatabaseStatus() === 'connected') {
    try {
      const codeToSearch = (schoolCode === 'APS-2026') ? 'GPS-2026' : schoolCode;
      const school = await prisma.school.findFirst({
        where: { OR: [{ code: codeToSearch }, { code: schoolCode }] },
        include: {
          academicYears: { where: { isCurrent: true } },
          grades: { orderBy: { level: 'asc' } }
        }
      });
      if (school) return school;
    } catch (err) {
      console.warn('[SchoolService] PostgreSQL query error, using fallback:', err.message);
    }
  }

  // Demonstration Fallback Object
  return {
    ...GREENWOOD_PUBLIC_SCHOOL_DEFAULT,
    grades: curriculumData.grades,
    curriculumProfile: curriculumData.curriculumProfile,
    totalEnrolledStudents: 150,
    totalActiveTeachers: 10,
    totalClassrooms: 10,
    overallAverageMastery: 74.8
  };
}

/**
 * Fetch comprehensive institutional dashboard metrics for School Administrators / Principals
 */
async function getSchoolAdminMetrics(schoolCode = 'APS-2026') {
  const profile = await getSchoolProfile(schoolCode);

  // Realistic synthesized distribution across Grades 1-12 with deep focus on Grades 5, 7, 8, 9, 10
  const gradeDistribution = [
    { grade: 'Grade 5', level: 5, students: 28, sections: ['5-A', '5-B'], avgMastery: 78.4, attendance: 95.2 },
    { grade: 'Grade 6', level: 6, students: 22, sections: ['6-A'], avgMastery: 72.1, attendance: 93.8 },
    { grade: 'Grade 7', level: 7, students: 34, sections: ['7-A', '7-B'], avgMastery: 76.5, attendance: 94.6 },
    { grade: 'Grade 8', level: 8, students: 26, sections: ['8-A'], avgMastery: 71.8, attendance: 92.4 },
    { grade: 'Grade 9', level: 9, students: 24, sections: ['9-A', '9-B'], avgMastery: 73.2, attendance: 94.1 },
    { grade: 'Grade 10', level: 10, students: 16, sections: ['10-A'], avgMastery: 77.9, attendance: 96.0 }
  ];

  const totalStudents = gradeDistribution.reduce((acc, g) => acc + g.students, 0);

  const subjectPerformance = [
    { subject: 'Mathematics', averageMastery: 74.2, passRate: 88.5, assessmentsTaken: 412, learningGapsCount: 8 },
    { subject: 'Science', averageMastery: 77.8, passRate: 91.2, assessmentsTaken: 386, learningGapsCount: 5 },
    { subject: 'English', averageMastery: 81.4, passRate: 94.0, assessmentsTaken: 290, learningGapsCount: 3 }
  ];

  const teachers = [
    { id: 't-1', name: 'Mrs. Ananya Sharma', subject: 'Mathematics', grades: 'Grade 7, 8', classes: 3, students: 60, status: 'Active' },
    { id: 't-2', name: 'Dr. Rajesh Verma', subject: 'Science (Physics/Chem)', grades: 'Grade 9, 10', classes: 2, students: 40, status: 'Active' },
    { id: 't-3', name: 'Ms. Sunita Rao', subject: 'Science (Biology)', grades: 'Grade 7, 8', classes: 2, students: 50, status: 'Active' },
    { id: 't-4', name: 'Mr. David Paul', subject: 'English Language', grades: 'Grade 7, 8, 9', classes: 3, students: 75, status: 'Active' },
    { id: 't-5', name: 'Mrs. Kavita Iyer', subject: 'Mathematics', grades: 'Grade 5, 6', classes: 2, students: 50, status: 'Active' },
    { id: 't-6', name: 'Mr. Arvind Saxena', subject: 'Computer Science & AI', grades: 'Grade 8, 9, 10', classes: 3, students: 66, status: 'Active' },
    { id: 't-7', name: 'Ms. Neha Gupta', subject: 'Science', grades: 'Grade 5, 6', classes: 2, students: 50, status: 'Active' },
    { id: 't-8', name: 'Mrs. Meenakshi Joshi', subject: 'English', grades: 'Grade 5, 6', classes: 2, students: 50, status: 'Active' },
    { id: 't-9', name: 'Mr. Vikram Sen', subject: 'Social Sciences', grades: 'Grade 7, 8', classes: 2, students: 50, status: 'Active' },
    { id: 't-10', name: 'Dr. Preeti Nair', subject: 'Mathematics (Senior)', grades: 'Grade 9, 10', classes: 2, students: 40, status: 'Active' }
  ];

  const learningGaps = [
    {
      topic: 'Solving Linear Equations by Transposition',
      grade: 'Grade 7',
      subject: 'Mathematics',
      affectedStudents: 14,
      avgMastery: 46.2,
      severity: 'HIGH',
      recommendedAction: 'Assign Targeted Remedial Practice with progressive transposition scaffolding.'
    },
    {
      topic: 'Balancing Redox Chemical Equations',
      grade: 'Grade 10',
      subject: 'Science',
      affectedStudents: 8,
      avgMastery: 52.0,
      severity: 'MEDIUM',
      recommendedAction: 'Trigger step-by-step oxidation state simulation.'
    },
    {
      topic: 'Laws of Negative Exponents (a^-n = 1/a^n)',
      grade: 'Grade 8',
      subject: 'Mathematics',
      affectedStudents: 11,
      avgMastery: 49.5,
      severity: 'HIGH',
      recommendedAction: 'Schedule Leitner Box 1 flashcard drill on inverse powers.'
    },
    {
      topic: 'Kinematic Formulas with Uniform Acceleration',
      grade: 'Grade 9',
      subject: 'Science',
      affectedStudents: 9,
      avgMastery: 54.1,
      severity: 'MEDIUM',
      recommendedAction: 'Provide graphical displacement-time interactive diagrams.'
    }
  ];

  const prePostGains = [
    { cohort: 'Grade 7 Mathematics (Algebra Module)', preScore: 48.5, postScore: 82.0, hakeGain: 0.65, gainCategory: 'Medium Gain' },
    { cohort: 'Grade 7 Science (Photosynthesis & Digestion)', preScore: 52.0, postScore: 88.5, hakeGain: 0.76, gainCategory: 'High Gain' },
    { cohort: 'Grade 8 Mathematics (Exponents & Factorization)', preScore: 42.0, postScore: 79.0, hakeGain: 0.64, gainCategory: 'Medium Gain' },
    { cohort: 'Grade 9 Science (Motion & Force Equations)', preScore: 45.0, postScore: 84.0, hakeGain: 0.71, gainCategory: 'High Gain' },
    { cohort: 'Grade 10 Mathematics (Quadratic Formula & Trig)', preScore: 55.0, postScore: 89.0, hakeGain: 0.75, gainCategory: 'High Gain' }
  ];

  return {
    school: profile,
    kpis: {
      totalStudents,
      totalTeachers: teachers.length,
      activeClassrooms: 10,
      overallSchoolMastery: 75.8,
      averageHakeGain: 0.702,
      assessmentsCompletedTotal: 1088,
      activeAssignments: 14
    },
    gradeDistribution,
    subjectPerformance,
    teachers,
    learningGaps,
    prePostGains
  };
}

module.exports = {
  getSchoolProfile,
  getSchoolAdminMetrics,
  GREENWOOD_PUBLIC_SCHOOL_DEFAULT,
  ASIAN_PUBLIC_SCHOOL_DEFAULT
};

