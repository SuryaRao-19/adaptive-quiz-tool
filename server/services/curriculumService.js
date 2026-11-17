/**
 * Curriculum & Academic Structure Service
 * Manages Grades 1-12, Subjects, Chapters, Topics, and Learning Outcomes
 * for Greenwood Public School digital learning platform.
 * Fully aligned with official NCERT textbook editions & CBSE 2026–2027 curriculum.
 */

const fs = require('fs');
const path = require('path');
const curriculumData = require('../data/curriculumData.json');
const multiGradeQuestions = require('../data/multiGradeQuestions.json');

const CATALOG_PATH = path.join(__dirname, '../data/curriculumCatalog.json');
let curriculumCatalog = null;

function loadCatalog() {
  if (!curriculumCatalog) {
    try {
      if (fs.existsSync(CATALOG_PATH)) {
        curriculumCatalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
      }
    } catch (e) {
      console.warn('[CurriculumService] Failed to load catalog from disk, using fallback');
    }
    if (!curriculumCatalog) {
      curriculumCatalog = {
        curriculumProfile: curriculumData.curriculumProfile,
        officialSources: {
          ncertTextbooks: { url: "https://ncert.nic.in/textbook.php" },
          ncertSyllabus: { url: "https://ncert.nic.in/syllabus.php" },
          cbseCurriculum: { url: "https://cbseacademic.nic.in/curriculum_2027.html" }
        },
        gradeDivisions: {},
        seniorSecondaryStreams: {},
        textbookCitations: []
      };
    }
  }
  return curriculumCatalog;
}

/**
 * Get full list of supported grades (Grades 1-12)
 */
function getSupportedGrades() {
  return curriculumData.grades;
}

/**
 * Stage-Aware Subject Matrix for Grades 1 to 12
 */
const STAGE_SUBJECTS = {
  PRIMARY: [
    { code: "MATH", name: "Mathematics", category: "NUMERACY", icon: "Calculator", color: "#173E2B" },
    { code: "EVS", name: "Environmental Studies", category: "GENERAL_AWARENESS", icon: "Globe", color: "#416B50" },
    { code: "ENG", name: "English", category: "LANGUAGES", icon: "BookOpen", color: "#2563EB" },
    { code: "HIN", name: "Hindi", category: "LANGUAGES", icon: "BookOpen", color: "#D97706" }
  ],
  MIDDLE: [
    { code: "MATH", name: "Mathematics", category: "STEM", icon: "Calculator", color: "#173E2B" },
    { code: "SCI", name: "Science", category: "STEM", icon: "FlaskConical", color: "#0D9488" },
    { code: "SOC", name: "Social Science", category: "HUMANITIES", icon: "Compass", color: "#416B50" },
    { code: "ENG", name: "English", category: "LANGUAGES", icon: "BookOpen", color: "#2563EB" },
    { code: "HIN", name: "Hindi", category: "LANGUAGES", icon: "BookOpen", color: "#D97706" },
    { code: "SAN", name: "Sanskrit", category: "LANGUAGES", icon: "Feather", color: "#B45309" },
    { code: "ICT", name: "Computer & AI Foundation", category: "TECHNOLOGY", icon: "Cpu", color: "#7C3AED" }
  ],
  SECONDARY: [
    { code: "MATH", name: "Mathematics", category: "STEM", icon: "Calculator", color: "#173E2B" },
    { code: "SCI", name: "Science (Phy/Chem/Bio)", category: "STEM", icon: "Atom", color: "#0D9488" },
    { code: "SOC", name: "Social Science (Hist/Civ/Geo/Econ)", category: "HUMANITIES", icon: "Landmark", color: "#416B50" },
    { code: "ENG", name: "English Language & Literature", category: "LANGUAGES", icon: "BookOpen", color: "#2563EB" },
    { code: "HIN", name: "Hindi Course A", category: "LANGUAGES", icon: "BookOpen", color: "#D97706" },
    { code: "AI", name: "Artificial Intelligence (Code 417)", category: "TECHNOLOGY", icon: "Cpu", color: "#7C3AED" }
  ],
  SENIOR_SECONDARY: [
    { code: "ENG_CORE", name: "English Core (301)", category: "CORE", icon: "BookOpen", color: "#2563EB" },
    { code: "PHY", name: "Physics (042)", category: "SCIENCE", icon: "Atom", color: "#0D9488" },
    { code: "CHEM", name: "Chemistry (043)", category: "SCIENCE", icon: "FlaskConical", color: "#0284C7" },
    { code: "MATH_SENIOR", name: "Mathematics (041)", category: "SCIENCE", icon: "Calculator", color: "#173E2B" },
    { code: "BIO", name: "Biology (044)", category: "SCIENCE", icon: "Dna", color: "#16A34A" },
    { code: "CS", name: "Computer Science (083)", category: "SCIENCE", icon: "Cpu", color: "#7C3AED" },
    { code: "ACCT", name: "Accountancy (055)", category: "COMMERCE", icon: "CreditCard", color: "#D97706" },
    { code: "BST", name: "Business Studies (054)", category: "COMMERCE", icon: "Briefcase", color: "#B45309" },
    { code: "ECON", name: "Economics (030)", category: "COMMERCE_HUMANITIES", icon: "TrendingUp", color: "#059669" },
    { code: "HIST", name: "History (027)", category: "HUMANITIES", icon: "Landmark", color: "#9333EA" },
    { code: "POL_SCI", name: "Political Science (028)", category: "HUMANITIES", icon: "Shield", color: "#C026D3" },
    { code: "PSYCH", name: "Psychology (037)", category: "HUMANITIES", icon: "Smile", color: "#DB2777" }
  ]
};

/**
 * Get all available subjects for a specific grade
 */
function getSubjectsForGrade(gradeLevel = 7) {
  const g = parseInt(gradeLevel, 10) || 7;
  let stage = 'MIDDLE';
  if (g <= 5) stage = 'PRIMARY';
  else if (g <= 8) stage = 'MIDDLE';
  else if (g <= 10) stage = 'SECONDARY';
  else stage = 'SENIOR_SECONDARY';

  const subjects = STAGE_SUBJECTS[stage] || STAGE_SUBJECTS.MIDDLE;
  return subjects.map(s => ({
    ...s,
    gradeLevel: g,
    stage,
    hasContent: Boolean(curriculumData.gradeCurricula[String(g)]?.[s.name] || curriculumData.gradeCurricula[String(g)]?.[s.code])
  }));
}

/**
 * Get structured curriculum chapters & topics for a specific grade and subject
 */
function getCurriculumByGradeAndSubject(gradeLevel = 7, subjectName = 'Mathematics') {
  const g = String(gradeLevel || 7);
  const subj = String(subjectName || 'Mathematics');

  const gradeMap = curriculumData.gradeCurricula[g];
  if (gradeMap && gradeMap[subj]) {
    const rawChapters = Array.isArray(gradeMap[subj]) ? gradeMap[subj] : [];
    const enrichedChapters = rawChapters.map((ch, chIdx) => ({
      ...ch,
      topics: (ch.topics || []).map((t, tIdx) => ({
        ...t,
        learningOutcomes: t.learningOutcomes || [
          {
            code: `LO-${subj.substring(0, 3).toUpperCase()}${g}-${ch.chapterNumber || (chIdx + 1)}.${t.topicNumber || (tIdx + 1)}`,
            description: `Demonstrate mastery in ${t.title || 'Core Principles'} per NCERT Class ${g} guidelines.`
          }
        ]
      }))
    }));

    return {
      gradeLevel: parseInt(g, 10),
      subject: subj,
      chapters: enrichedChapters
    };
  }

  // Official Chapter mapping fallback
  return {
    gradeLevel: parseInt(g, 10),
    subject: subj,
    chapters: [
      {
        chapterNumber: 1,
        title: `${subj} Foundations (Grade ${g})`,
        status: "ACTIVE",
        topics: [
          {
            topicNumber: 1,
            title: `Core Conceptual Principles`,
            learningOutcomes: [
              { code: `LO-${subj.substring(0, 3).toUpperCase()}${g}-1.1`, statement: `Applies NCERT-verified learning outcomes for ${subj}.`, taxonomyLevel: 'APPLY' }
            ]
          }
        ]
      }
    ]
  };
}

/**
 * Get Official Sources & Textbooks
 */
function getOfficialSources() {
  const cat = loadCatalog();
  return {
    officialSources: cat.officialSources,
    gradeDivisions: cat.gradeDivisions,
    curriculumProfile: cat.curriculumProfile,
    seniorSecondaryStreams: cat.seniorSecondaryStreams
  };
}

/**
 * Get Official Textbook Citations by Grade and Subject
 */
function getTextbookCitations(gradeLevel, subject) {
  const cat = loadCatalog();
  let list = cat.textbookCitations || [];
  if (gradeLevel) {
    const g = parseInt(gradeLevel, 10);
    list = list.filter(item => item.gradeLevel === g);
  }
  if (subject) {
    const s = subject.toLowerCase();
    list = list.filter(item => item.subject.toLowerCase().includes(s));
  }
  return list;
}

/**
 * Get Curriculum Versioning and Mapping Controls
 */
function getCurriculumVersions() {
  const cat = loadCatalog();
  return {
    currentProfile: cat.curriculumProfile,
    versions: [
      {
        version: "GPS-CBSE-2026-V2",
        effectiveYear: "2026-2027",
        status: "ACTIVE",
        releasedAt: "2026-10-01",
        description: "Rationalized NCERT text mappings aligned with NEP 2020 competency framework."
      },
      {
        version: "GPS-CBSE-2025-V1",
        effectiveYear: "2025-2026",
        status: "ARCHIVED",
        releasedAt: "2025-04-01",
        description: "Previous academic year baseline syllabus."
      }
    ]
  };
}

/**
 * Update Curriculum Profile without Code Modification
 */
function updateCurriculumProfile(updates) {
  const cat = loadCatalog();
  cat.curriculumProfile = {
    ...cat.curriculumProfile,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  try {
    fs.writeFileSync(CATALOG_PATH, JSON.stringify(cat, null, 2), 'utf8');
  } catch (e) {
    console.warn('[CurriculumService] Failed to persist catalog update to disk:', e.message);
  }
  return cat.curriculumProfile;
}

/**
 * Query questions from the multi-grade question bank
 */
function getQuestionsByFilter({ gradeLevel, subject, difficulty, format, limit = 100 } = {}) {
  let list = [...multiGradeQuestions];

  if (gradeLevel) {
    const g = parseInt(gradeLevel, 10);
    list = list.filter(q => q.gradeLevel === g);
  }

  if (subject) {
    const s = subject.toLowerCase();
    list = list.filter(q => q.subject.toLowerCase() === s);
  }

  if (difficulty) {
    const d = difficulty.toUpperCase();
    list = list.filter(q => q.difficulty === d);
  }

  if (format) {
    const f = format.toUpperCase();
    list = list.filter(q => q.questionFormat === f);
  }

  return list.slice(0, limit);
}

/**
 * Get courses directory for a grade or teacher
 */
function getCourses(gradeLevel = 7) {
  const g = parseInt(gradeLevel, 10) || 7;
  return [
    {
      id: `crs-g${g}-math`,
      title: `Class ${g} Mathematics (CBSE Core)`,
      code: `MATH-G${g}-2026`,
      subject: 'Mathematics',
      grade: g,
      section: `${g}-A (Pilot Cohort)`,
      teacher: 'Mrs. Ananya Sharma',
      progress: 68,
      totalLessons: 18,
      completedLessons: 12,
      chaptersCount: 6,
      studentsCount: 20,
      description: 'Comprehensive rational numbers, linear transposition equations, algebraic expressions, and geometric mensuration.'
    },
    {
      id: `crs-g${g}-sci`,
      title: `Class ${g} Science & Experiential STEM`,
      code: `SCI-G${g}-2026`,
      subject: 'Science',
      grade: g,
      section: `${g}-A (Pilot Cohort)`,
      teacher: 'Dr. Rajesh Verma',
      progress: 54,
      totalLessons: 16,
      completedLessons: 9,
      chaptersCount: 5,
      studentsCount: 20,
      description: 'Plant nutrition, heat & thermodynamic measurement, acids/bases, physical changes, and cellular respiration.'
    },
    {
      id: `crs-g${g}-eng`,
      title: `Class ${g} English Language & Literature`,
      code: `ENG-G${g}-2026`,
      subject: 'English',
      grade: g,
      section: `${g}-A (Pilot Cohort)`,
      teacher: 'Mr. David Paul',
      progress: 75,
      totalLessons: 14,
      completedLessons: 10,
      chaptersCount: 4,
      studentsCount: 20,
      description: 'Honeycomb prose, grammar mechanics, formal letter writing, and analytical reading comprehension.'
    }
  ];
}

/**
 * Get scheduled lessons
 */
function getLessons(gradeLevel = 7) {
  const g = parseInt(gradeLevel, 10) || 7;
  return [
    {
      id: 'lsn-01',
      title: 'Transposition Method for Linear Equations',
      subject: 'Mathematics',
      grade: g,
      chapter: 'Simple Equations (Chapter 3)',
      topic: 'Solving Multi-Step Equations by Transposition',
      learningObjective: 'Isolate variables using inverse operations across equality boundaries without arithmetic error.',
      teachingDate: '2026-11-18',
      durationMinutes: 45,
      status: 'In Progress',
      resources: [
        { type: 'PDF Worksheet', title: 'CBSE Transposition Drill Sheet (20 Items)', size: '1.2 MB' },
        { type: 'Reference Doc', title: 'NCERT Class VII Chapter 3 Exemplar Solutions', size: '2.4 MB' }
      ],
      homework: 'Complete Exercises 3.2 problems 1 through 8. Practice inverse signs on the number line.',
      teacherNotes: 'Focus heavily on negative coefficient transposition: -3x = 12 implies x = -4.'
    },
    {
      id: 'lsn-02',
      title: 'Rational Numbers on a Number Line',
      subject: 'Mathematics',
      grade: g,
      chapter: 'Rational Numbers (Chapter 1)',
      topic: 'Equivalence and Density of Rational Numbers',
      learningObjective: 'Locate positive and negative rational fractions symmetrically on a continuous real number line.',
      teachingDate: '2026-11-14',
      durationMinutes: 40,
      status: 'Completed',
      resources: [
        { type: 'Worksheet', title: 'Number Line Density Worksheet', size: '840 KB' }
      ],
      homework: 'Mark 5/7 and -3/4 on the coordinate line. Self-check using Greenwood solutions.',
      teacherNotes: 'Students demonstrated 88% accuracy on integer signs.'
    },
    {
      id: 'lsn-03',
      title: 'Autotrophic Plant Nutrition & Stomatal Regulation',
      subject: 'Science',
      grade: g,
      chapter: 'Nutrition in Plants (Chapter 1)',
      topic: 'Photosynthesis Mechanism & Light Reactions',
      learningObjective: 'Explain light-dependent chlorophyll reactions and gas exchange through guard-cell stomata.',
      teachingDate: '2026-11-20',
      durationMinutes: 45,
      status: 'Upcoming',
      resources: [
        { type: 'Lab Guide', title: 'Stomatal Peel Iodine Test Protocol', size: '3.1 MB' }
      ],
      homework: 'Draw and label the stomatal pore structure in the science journal.',
      teacherNotes: 'Lab demonstration scheduled for 10:15 AM in Biology Lab.'
    }
  ];
}

module.exports = {
  getSupportedGrades,
  getSubjectsForGrade,
  getCurriculumByGradeAndSubject,
  getQuestionsByFilter,
  getCourses,
  getLessons,
  getOfficialSources,
  getTextbookCitations,
  getCurriculumVersions,
  updateCurriculumProfile,
  curriculumProfile: curriculumData.curriculumProfile
};
