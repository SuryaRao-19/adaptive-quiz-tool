/**
 * ADAPTIQ 2.0 â€” COMPREHENSIVE SYNTHETIC SCHOOL GENERATOR & SIMULATION SUITE
 * 
 * Generates an isolated, ultra-realistic institutional demonstration environment:
 * - Tenant: Greenwood Public School â€” AdaptIQ Demo (Code: GPS-2026-DEMO, CBSE Affiliation 2130089)
 * - 180 Synthetic Students (30 per grade across Grades 5-10, with realistic Indian names & roll numbers)
 * - 10 Synthetic Certified Teachers (Mathematics, Science, English with empIds)
 * - 12 Classroom Cohorts (5-A, 5-B, 6-A, 6-B, 7-A, 7-B, 8-A, 8-B, 9-A, 9-B, 10-A, 10-B)
 * - 600 Curated, Validated Multi-Grade Questions (Grades 5-10 across Math, Science, English)
 * - 24 Assessments (12 Calibrated STEM Diagnostic Pre-Tests + 12 Equivalent Summative Post-Tests)
 * - 30 Assignments (Homework, Formative Checkpoints, Remedial Practice)
 * - 3,600+ Daily Attendance Records (20 school days x 180 students, UTC midnight normalized, no duplicates)
 * - 540+ Completed Assessment Attempts (distributed across High, Proficient, and Intervention tiers)
 * - 6,000+ Learning Events (AnswerEvents with true Bayesian BKT updates, response times, rubrics, feedback)
 * 
 * All records are tagged with isSynthetic: true and [SYNTHETIC_APS_DEMO].
 */

const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('ðŸ« ADAPTIQ 2.0: SYNTHETIC SCHOOL DATA GENERATOR & SIMULATOR');
console.log('   Target Institution: Greenwood Public School â€” AdaptIQ Demo');
console.log('================================================================');

// 1. Core Tenant Definition (Official Institutional Profile)
const SCHOOL_TENANT = {
  id: 'school-GPS-demo-001',
  name: 'Greenwood Public School â€” AdaptIQ Demonstration Environment',
  shortName: 'Greenwood Public School',
  code: 'GPS-2026-DEMO',
  officialSchoolCode: '40643',
  board: 'CBSE',
  affiliationNumber: '530649',
  schoolCode: '40643',
  address: 'Huda Site No.-1, Sector -9, Gurugram, Haryana - 122001',
  city: 'Gurugram',
  state: 'Haryana',
  country: 'India',
  pinCode: '122103',
  website: 'https://GPS-school.in/index.html',
  curriculumUrl: 'https://GPS-school.in/curriculum.html',
  levels: {
    prePrimary: 'Pre-Primary through Grade 2',
    primary: 'Grades 3â€“5',
    middleWing: 'Grades 6â€“8',
    seniorSecondary: 'Grades 9â€“12'
  },
  contactEmail: 'contact@GPS-school.in',
  contactPhone: '+91 124 238 1234',
  academicYear: '2026-2027',
  isSynthetic: true,
  simulationTag: '[SYNTHETIC_APS_DEMO]'
};

// 2. Demo Core Accounts
const DEMO_ACCOUNTS = {
  admin: {
    id: 'user-admin-01',
    name: 'Dr. K. S. Raman',
    email: 'principal@greenwoodgurgaon.com',
    role: 'ADMIN',
    designation: 'Principal & Academic Director',
    schoolId: SCHOOL_TENANT.id,
    isSynthetic: true
  },
  leadTeacher: {
    id: 'user-teacher-01',
    name: 'Mrs. Ananya Sharma',
    email: 'sharma.math@greenwoodgurgaon.com',
    role: 'TEACHER',
    designation: 'Head of Mathematics Department',
    subject: 'Mathematics',
    gradeLevel: 7,
    schoolId: SCHOOL_TENANT.id,
    isSynthetic: true
  },
  demoStudent: {
    id: 'user-student-01',
    name: 'Aarav Patel',
    email: 'student.aps.01@greenwoodgurgaon.com',
    role: 'STUDENT',
    rollNumber: 'GPS-07-001',
    pin: '1234',
    grade: 7,
    section: '7-A',
    schoolId: SCHOOL_TENANT.id,
    isSynthetic: true
  }
};

// 3. 10 Synthetic Certified Teachers
const TEACHER_ROSTER = [
  { id: 't-01', name: 'Mrs. Ananya Sharma', email: 'sharma.math@greenwoodgurgaon.com', subject: 'Mathematics', empId: 'GPS-T-01', grades: [7, 8], designation: 'Head of Mathematics' },
  { id: 't-02', name: 'Dr. Rajesh Verma', email: 'verma.physics@greenwoodgurgaon.com', subject: 'Science', empId: 'GPS-T-02', grades: [9, 10], designation: 'Senior Physics Lecturer' },
  { id: 't-03', name: 'Ms. Sunita Rao', email: 'rao.biology@greenwoodgurgaon.com', subject: 'Science', empId: 'GPS-T-03', grades: [7, 8], designation: 'Biology Specialist' },
  { id: 't-04', name: 'Mr. David Paul', email: 'paul.english@greenwoodgurgaon.com', subject: 'English', empId: 'GPS-T-04', grades: [7, 8, 9], designation: 'Head of English' },
  { id: 't-05', name: 'Mrs. Kavita Iyer', email: 'iyer.math@greenwoodgurgaon.com', subject: 'Mathematics', empId: 'GPS-T-05', grades: [5, 6], designation: 'Primary Mathematics Head' },
  { id: 't-06', name: 'Mr. Arvind Saxena', email: 'saxena.cs@greenwoodgurgaon.com', subject: 'Science', empId: 'GPS-T-06', grades: [8, 9, 10], designation: 'Chemistry & Tech Coordinator' },
  { id: 't-07', name: 'Ms. Neha Gupta', email: 'gupta.sci@greenwoodgurgaon.com', subject: 'Science', empId: 'GPS-T-07', grades: [5, 6], designation: 'Primary Science Lead' },
  { id: 't-08', name: 'Mrs. Meenakshi Joshi', email: 'joshi.eng@greenwoodgurgaon.com', subject: 'English', empId: 'GPS-T-08', grades: [5, 6], designation: 'Primary English Teacher' },
  { id: 't-09', name: 'Mr. Vikram Sen', email: 'sen.ss@greenwoodgurgaon.com', subject: 'English', empId: 'GPS-T-09', grades: [7, 8], designation: 'Senior English Educator' },
  { id: 't-10', name: 'Dr. Preeti Nair', email: 'nair.math@greenwoodgurgaon.com', subject: 'Mathematics', empId: 'GPS-T-10', grades: [9, 10], designation: 'Senior Secondary Math Specialist' }
].map(t => ({ ...t, schoolId: SCHOOL_TENANT.id, isSynthetic: true }));

// 4. 12 Classroom Sections across Grades 5-10
const CLASSROOMS = [
  { id: 'cls-05-a', name: 'Grade 5-A Mathematics', gradeLevel: 5, section: '5-A', subject: 'Mathematics', joinCode: 'APS5AM', teacherId: 't-05', teacherName: 'Mrs. Kavita Iyer' },
  { id: 'cls-05-b', name: 'Grade 5-B Science', gradeLevel: 5, section: '5-B', subject: 'Science', joinCode: 'APS5BS', teacherId: 't-07', teacherName: 'Ms. Neha Gupta' },
  { id: 'cls-06-a', name: 'Grade 6-A Mathematics', gradeLevel: 6, section: '6-A', subject: 'Mathematics', joinCode: 'APS6AM', teacherId: 't-05', teacherName: 'Mrs. Kavita Iyer' },
  { id: 'cls-06-b', name: 'Grade 6-B Science', gradeLevel: 6, section: '6-B', subject: 'Science', joinCode: 'APS6BS', teacherId: 't-07', teacherName: 'Ms. Neha Gupta' },
  { id: 'cls-07-a', name: 'Grade 7-A Mathematics', gradeLevel: 7, section: '7-A', subject: 'Mathematics', joinCode: 'APS7AM', teacherId: 't-01', teacherName: 'Mrs. Ananya Sharma' },
  { id: 'cls-07-b', name: 'Grade 7-B Science', gradeLevel: 7, section: '7-B', subject: 'Science', joinCode: 'APS7BS', teacherId: 't-03', teacherName: 'Ms. Sunita Rao' },
  { id: 'cls-08-a', name: 'Grade 8-A Mathematics', gradeLevel: 8, section: '8-A', subject: 'Mathematics', joinCode: 'APS8AM', teacherId: 't-01', teacherName: 'Mrs. Ananya Sharma' },
  { id: 'cls-08-b', name: 'Grade 8-B Science', gradeLevel: 8, section: '8-B', subject: 'Science', joinCode: 'APS8BS', teacherId: 't-03', teacherName: 'Ms. Sunita Rao' },
  { id: 'cls-09-a', name: 'Grade 9-A Mathematics', gradeLevel: 9, section: '9-A', subject: 'Mathematics', joinCode: 'APS9AM', teacherId: 't-10', teacherName: 'Dr. Preeti Nair' },
  { id: 'cls-09-b', name: 'Grade 9-B Physics & Chem', gradeLevel: 9, section: '9-B', subject: 'Science', joinCode: 'APS9BS', teacherId: 't-02', teacherName: 'Dr. Rajesh Verma' },
  { id: 'cls-10-a', name: 'Grade 10-A Mathematics', gradeLevel: 10, section: '10-A', subject: 'Mathematics', joinCode: 'APS10M', teacherId: 't-10', teacherName: 'Dr. Preeti Nair' },
  { id: 'cls-10-b', name: 'Grade 10-B Science', gradeLevel: 10, section: '10-B', subject: 'Science', joinCode: 'APS10S', teacherId: 't-02', teacherName: 'Dr. Rajesh Verma' }
].map(c => ({
  ...c,
  schoolId: SCHOOL_TENANT.id,
  isSynthetic: true,
  capacity: 35,
  roomNumber: `Room-${c.gradeLevel}0${c.section.endsWith('A') ? 1 : 2}`
}));

// 5. 180 Synthetic Students Generation
const INDIAN_FIRST_NAMES = [
  'Aarav', 'Ananya', 'Rohan', 'Diya', 'Kabir', 'Priya', 'Vivaan', 'Ishaan', 'Sanya', 'Arjun',
  'Meera', 'Aditya', 'Sneha', 'Tanvi', 'Aryan', 'Kavya', 'Dhruv', 'Rhea', 'Dev', 'Tara',
  'Reyansh', 'Ishita', 'Vihaan', 'Nisha', 'Ayaan', 'Avani', 'Samar', 'Prisha', 'Madhav', 'Bhavya'
];

const INDIAN_LAST_NAMES = [
  'Patel', 'Deshmukh', 'Gupta', 'Varma', 'Mehta', 'Sundaram', 'Sen', 'Reddy', 'Kapoor', 'Nair',
  'Iyer', 'Joshi', 'Chopra', 'Malhotra', 'Bhatia', 'Saxena', 'Kulkarni', 'Banerjee', 'Rao', 'Menon',
  'Singhania', 'Mukherjee', 'Pandey', 'Mishra', 'Choudhury', 'Aggarwal', 'Dutta', 'Pillai', 'Shukla', 'Seth'
];

const PERFORMANCE_TIERS = ['TOP_PERFORMER', 'PROFICIENT', 'INTERVENTION_REQUIRED'];

const STUDENTS = [];
let studentCounter = 1;

for (let g = 5; g <= 10; g++) {
  const gradeStr = String(g).padStart(2, '0');
  for (let s = 1; s <= 30; s++) {
    const sId = `std-${gradeStr}-${String(s).padStart(3, '0')}`;
    const roll = `GPS-${gradeStr}-${String(s).padStart(3, '0')}`;
    const firstName = INDIAN_FIRST_NAMES[(s - 1) % INDIAN_FIRST_NAMES.length];
    const lastName = INDIAN_LAST_NAMES[(g * 3 + s - 1) % INDIAN_LAST_NAMES.length];
    const fullName = `${firstName} ${lastName}`;
    const sectionName = s <= 15 ? `${g}-A` : `${g}-B`;
    const pin = String(1000 + ((s * 37 + g * 11) % 9000));

    // Distribution: s 1-6 = Top (20%), 7-24 = Proficient (60%), 25-30 = Intervention (20%)
    let tier = 'PROFICIENT';
    let baseAccuracy = 75;
    let bktMastery = 0.76;
    let weakTopics = [];

    if (s <= 6) {
      tier = 'TOP_PERFORMER';
      baseAccuracy = 88 + (s % 11); // 88 - 98%
      bktMastery = Math.min(0.98, 0.88 + (s * 0.015));
    } else if (s >= 25) {
      tier = 'INTERVENTION_REQUIRED';
      baseAccuracy = 44 + (s % 17); // 44 - 60%
      bktMastery = 0.45 + ((s % 10) * 0.015);
      weakTopics = g === 7 ? ['Rational Numbers & Sign Rules', 'Fractions Division'] : ['Foundational Concept Formulations'];
    } else {
      tier = 'PROFICIENT';
      baseAccuracy = 66 + (s % 17); // 66 - 82%
      bktMastery = 0.68 + ((s % 15) * 0.01);
    }

    STUDENTS.push({
      id: sId,
      name: fullName,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${gradeStr}@greenwoodgurgaon.com`,
      rollNumber: roll,
      pin,
      gradeLevel: g,
      section: sectionName,
      schoolId: SCHOOL_TENANT.id,
      performanceTier: tier,
      baseAccuracy,
      bktMastery: Math.round(bktMastery * 100) / 100,
      weakTopics,
      isSynthetic: true
    });
    studentCounter++;
  }
}

// 6. Curated 600 Questions Generation (100 per grade for Grades 5-10)
const BLOOM_LEVELS = ['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE'];
const FORMATS = ['MCQ', 'MCQ', 'NUMERICAL', 'MULTIPLE_SELECT', 'SHORT_ANSWER', 'DESCRIPTIVE'];

const QUESTIONS = [];
let qCounter = 1;

// Domain Question Blueprints per Grade
const CURRICULUM_BLUEPRINTS = {
  5: {
    math: [
      { topic: 'Fractions', chapter: 'Fractions & Operations', tmpl: (i) => ({ q: `What is ${i + 1}/${i + 3} + ${i}/${i + 3} in simplest fraction form?`, ans: `${(2 * i + 1)}/${i + 3}`, opts: [`${(2 * i + 1)}/${i + 3}`, `${(2 * i + 1)}/${(i + 3) * 2}`, `${2 * i}/${i + 3}`, `${i + 1}/${i + 3}`], exp: 'With identical denominators, simply add the numerators.', misc: 'Never sum the denominators.' }) },
      { topic: 'Decimals', chapter: 'Decimals & Place Value', tmpl: (i) => ({ q: `Convert the fraction ${(i + 1) * 3}/10 into decimal notation:`, ans: `${((i + 1) * 0.3).toFixed(1)}`, opts: [`${((i + 1) * 0.3).toFixed(1)}`, `0.0${(i + 1) * 3}`, `${(i + 1) * 3}.0`, `0.${(i + 1) * 3}0`], exp: 'Dividing by 10 moves the decimal place one position to the left.', misc: 'Avoid treating the denominator as a trailing zero.' }) },
      { topic: 'Area & Perimeter', chapter: 'Mensuration Foundations', tmpl: (i) => ({ q: `Calculate the area of a rectangle with length ${i + 4} cm and breadth ${i + 2} cm:`, ans: `${(i + 4) * (i + 2)} sq cm`, opts: [`${(i + 4) * (i + 2)} sq cm`, `${2 * (2 * i + 6)} cm`, `${(i + 4) * 2} sq cm`, `${(i + 2) * 2} sq cm`], exp: 'Area of a rectangle equals length multiplied by breadth.', misc: 'Do not confuse perimeter formula 2(l+b) with area.' }) }
    ],
    sci: [
      { topic: 'Plant Reproduction', chapter: 'Living Organisms', tmpl: (i) => ({ q: `Which part of a plant is primarily responsible for photosynthesis?`, ans: 'Leaf chloroplasts', opts: ['Leaf chloroplasts', 'Root xylem', 'Stem pith', 'Flower petals'], exp: 'Leaves contain chlorophyll in chloroplasts where sunlight is converted into chemical energy.', misc: 'Roots absorb water but do not perform photosynthesis.' }) },
      { topic: 'Matter States', chapter: 'Matter & Materials', tmpl: (i) => ({ q: `Water changing directly into water vapour at room temperature is called:`, ans: 'Evaporation', opts: ['Evaporation', 'Sublimation', 'Condensation', 'Melting'], exp: 'Evaporation is the transition of a liquid into vapour occurring at any temperature below boiling.', misc: 'Boiling occurs only at 100Â°C; evaporation occurs at all temperatures.' }) }
    ],
    eng: [
      { topic: 'Subject-Verb Concord', chapter: 'Grammar Foundations', tmpl: (i) => ({ q: `Choose the correct verb: "The flock of birds ________ flying south."`, ans: 'is', opts: ['is', 'are', 'were', 'have'], exp: 'A collective noun like "flock" is treated as singular in standard concord.', misc: 'Do not be misled by the plural noun "birds" inside the prepositional phrase.' }) }
    ]
  },
  6: {
    math: [
      { topic: 'Integers', chapter: 'Integers & Number Line', tmpl: (i) => ({ q: `Evaluate the expression: (-${i + 5}) + (+${i + 2}):`, ans: `${-(3)}`, opts: [`-3`, `+3`, `-${2 * i + 7}`, `+${2 * i + 7}`], exp: 'When adding integers of opposite signs, subtract the smaller magnitude from the larger and apply the sign of the larger.', misc: 'Two opposite signs do not always produce a positive product.' }) },
      { topic: 'Ratios', chapter: 'Ratios & Proportions', tmpl: (i) => ({ q: `Express the ratio of ${12 + i * 2} cm to ${24 + i * 4} cm in simplest form:`, ans: '1 : 2', opts: ['1 : 2', '2 : 1', '3 : 4', '1 : 3'], exp: 'Divide both terms by their greatest common factor.', misc: 'Keep the antecedent and consequent in exact presented order.' }) }
    ],
    sci: [
      { topic: 'Components of Food', chapter: 'Food & Nutrition', tmpl: (i) => ({ q: `Which vitamin is synthesized in the human body in the presence of sunlight?`, ans: 'Vitamin D', opts: ['Vitamin D', 'Vitamin C', 'Vitamin A', 'Vitamin B12'], exp: 'Sunlight prompts cutaneous synthesis of cholecalciferol (Vitamin D3).', misc: 'Vitamin C is water-soluble and obtained primarily from citrus fruits.' }) },
      { topic: 'Electricity & Circuits', chapter: 'Electricity', tmpl: (i) => ({ q: `A material that does not allow electric current to pass through it easily is called:`, ans: 'An insulator', opts: ['An insulator', 'A conductor', 'A superconductor', 'A battery'], exp: 'Insulators possess tightly bound valence electrons preventing free electron migration.', misc: 'Insulators do not attract charges; they merely resist conduction.' }) }
    ],
    eng: [
      { topic: 'Active and Passive Voice', chapter: 'Grammar', tmpl: (i) => ({ q: `Identify the passive form: "The teacher praised the student."`, ans: 'The student was praised by the teacher.', opts: ['The student was praised by the teacher.', 'The student is praised by the teacher.', 'The teacher was praising the student.', 'The student had praised the teacher.'], exp: 'Past simple active (praised) converts to was/were + past participle (was praised).', misc: 'Maintain the past tense when converting from active to passive.' }) }
    ]
  },
  7: {
    math: [
      { topic: 'Rational Numbers', chapter: 'Rational Numbers', tmpl: (i) => ({ q: `Simplify the rational subtraction: (-${i + 2}/5) - (-${i + 7}/5):`, ans: '1', opts: ['1', '-1', `-${2 * i + 9}/5`, `${2 * i + 9}/5`], exp: 'Subtracting a negative fraction is mathematically identical to adding its additive inverse: -a - (-b) = -a + b.', misc: 'Subtracting a negative does not yield a double negative.' }) },
      { topic: 'Simple Equations', chapter: 'Algebraic Equations', tmpl: (i) => ({ q: `Solve for x: ${i + 3}x - 7 = ${i + 3} * 3 - 7:`, ans: '3', opts: ['3', '7', `${i + 3}`, '0'], exp: 'Subtract -7 from both sides, then divide by the coefficient.', misc: 'Transposing terms across an equality inverts their mathematical sign.' }) },
      { topic: 'Lines and Angles', chapter: 'Geometry', tmpl: (i) => ({ q: `Two supplementary angles have measures (x + ${10 + i})Â° and (x - ${10 + i})Â°. Find x:`, ans: '90Â°', opts: ['90Â°', '180Â°', '45Â°', '100Â°'], exp: 'Supplementary angles sum to exactly 180Â°: (x + c) + (x - c) = 2x = 180Â° => x = 90Â°.', misc: 'Do not confuse complementary (90Â°) with supplementary (180Â°).' }) }
    ],
    sci: [
      { topic: 'Nutrition in Plants', chapter: 'Plant Physiology', tmpl: (i) => ({ q: `Which specialized cells regulate the opening and closing of stomata?`, ans: 'Guard cells', opts: ['Guard cells', 'Epidermal cells', 'Xylem vessels', 'Phloem tubes'], exp: 'Turgor pressure variations in kidney-shaped guard cells control the stomatal aperture.', misc: 'Chloroplasts perform photosynthesis within the guard cell but are organelles, not cells.' }) },
      { topic: 'Heat & Temperature', chapter: 'Thermodynamics', tmpl: (i) => ({ q: `Which mode of heat transfer does not require any material medium?`, ans: 'Radiation', opts: ['Radiation', 'Conduction', 'Convection', 'Advection'], exp: 'Thermal radiation propagates via electromagnetic waves across vacuum space.', misc: 'Conduction requires direct molecular contact; convection requires fluid bulk motion.' }) }
    ],
    eng: [
      { topic: 'Reported Speech', chapter: 'Indirect Speech', tmpl: (i) => ({ q: `Change to indirect speech: He said, "I am studying."`, ans: 'He said that he was studying.', opts: ['He said that he was studying.', 'He said that he is studying.', 'He said that he had studied.', 'He said that I was studying.'], exp: 'Present continuous tense shifts back to past continuous when reporting verb is in past tense.', misc: 'Do not leave the pronoun unchanged in reported speech.' }) }
    ]
  },
  8: {
    math: [
      { topic: 'Linear Equations', chapter: 'One Variable Equations', tmpl: (i) => ({ q: `Solve: (2x + ${i + 1}) / 3 = (x + ${i + 4}) / 2:`, ans: `${i + 10}`, opts: [`${i + 10}`, `${i + 5}`, `${2 * i + 4}`, `${i}`], exp: 'Cross multiply: 2(2x + a) = 3(x + b) => 4x + 2a = 3x + 3b => x = 3b - 2a.', misc: 'Distribute denominators across the entire binomial numerators.' }) },
      { topic: 'Exponents and Powers', chapter: 'Exponents', tmpl: (i) => ({ q: `Simplify: (3^-${i + 1}) * (3^${i + 3}):`, ans: '9', opts: ['9', '27', '3', '1/9'], exp: 'Apply product rule of powers: a^m * a^n = a^(m+n) => 3^(-k + k + 2) = 3^2 = 9.', misc: 'Adding negative and positive exponents obeys algebraic addition rules.' }) }
    ],
    sci: [
      { topic: 'Force and Pressure', chapter: 'Mechanics', tmpl: (i) => ({ q: `If a force of ${20 + i * 10} N acts over an area of 2 mÂ², what is the pressure?`, ans: `${10 + i * 5} Pa`, opts: [`${10 + i * 5} Pa`, `${40 + i * 20} Pa`, `${20 + i * 10} Pa`, `${5 + i} Pa`], exp: 'Pressure is defined as Force per unit Area (P = F / A).', misc: 'Pressure units are Pascals (N/mÂ²), not Joules or Newtons.' }) },
      { topic: 'Metals and Non-Metals', chapter: 'Chemical Elements', tmpl: (i) => ({ q: `Which non-metal is liquid at room temperature?`, ans: 'Bromine', opts: ['Bromine', 'Mercury', 'Chlorine', 'Phosphorus'], exp: 'Bromine (Br) is the only liquid non-metallic element under standard temperature and pressure.', misc: 'Mercury is a metal, not a non-metal.' }) }
    ],
    eng: [
      { topic: 'Clauses and Conditionals', chapter: 'Complex Sentences', tmpl: (i) => ({ q: `Complete the conditional: "If it rains tomorrow, we ________ the match."`, ans: 'will cancel', opts: ['will cancel', 'would cancel', 'cancelled', 'have cancelled'], exp: 'First conditional structure: If + present simple, will + base verb.', misc: 'Avoid using "would" in the result clause of a real present condition.' }) }
    ]
  },
  9: {
    math: [
      { topic: 'Polynomials', chapter: 'Polynomials & Factoring', tmpl: (i) => ({ q: `Find the remainder when p(x) = xÂ³ - 3xÂ² + 4x - 5 is divided by (x - 2):`, ans: '-1', opts: ['-1', '3', '5', '-5'], exp: 'By the Remainder Theorem, the remainder equals p(2) = 2Â³ - 3(2Â²) + 4(2) - 5 = 8 - 12 + 8 - 5 = -1.', misc: 'Substitute root +2, not the divisor sign -2.' }) },
      { topic: 'Coordinate Geometry', chapter: 'Cartesian Plane', tmpl: (i) => ({ q: `In which quadrant does the point (-${i + 3}, -${i + 5}) lie?`, ans: 'Quadrant III', opts: ['Quadrant III', 'Quadrant II', 'Quadrant IV', 'Quadrant I'], exp: 'When both abscissa (x) and ordinate (y) are negative, the point is located in Quadrant III.', misc: 'Quadrant II has negative x and positive y.' }) }
    ],
    sci: [
      { topic: 'Laws of Motion', chapter: 'Dynamics', tmpl: (i) => ({ q: `Calculate the force needed to accelerate a 5 kg mass at ${i + 2} m/sÂ²:`, ans: `${5 * (i + 2)} N`, opts: [`${5 * (i + 2)} N`, `${5 + i + 2} N`, `${(i + 2) / 5} N`, `${10 * (i + 2)} N`], exp: 'Newton\'s Second Law: Force = mass Ã— acceleration (F = m * a).', misc: 'Momentum is mass times velocity; force is mass times acceleration.' }) },
      { topic: 'Atomic Structure', chapter: 'Atoms and Molecules', tmpl: (i) => ({ q: `The isotope Carbon-14 contains how many neutrons?`, ans: '8', opts: ['8', '6', '14', '12'], exp: 'Number of neutrons = Mass number (14) - Atomic number (6) = 8 neutrons.', misc: 'Mass number is total nucleons (protons + neutrons), not neutron count alone.' }) }
    ],
    eng: [
      { topic: 'Modals and Determiners', chapter: 'Advanced Grammar', tmpl: (i) => ({ q: `Choose the correct modal: "You ________ adhere strictly to the examination hall rules."`, ans: 'must', opts: ['must', 'might', 'could', 'may'], exp: '"Must" expresses compulsory institutional obligation.', misc: '"Might" expresses distant possibility, not formal institutional mandate.' }) }
    ]
  },
  10: {
    math: [
      { topic: 'Quadratic Equations', chapter: 'Quadratics', tmpl: (i) => ({ q: `Calculate the discriminant of the quadratic equation 2xÂ² - 4x + 3 = 0:`, ans: '-8', opts: ['-8', '8', '40', '-40'], exp: 'Discriminant D = bÂ² - 4ac = (-4)Â² - 4(2)(3) = 16 - 24 = -8. Roots are non-real complex.', misc: 'Square of negative number (-4)Â² is positive 16, not -16.' }) },
      { topic: 'Trigonometry', chapter: 'Trigonometric Ratios', tmpl: (i) => ({ q: `If sin Î¸ = 3/5, what is the value of cos Î¸ in the first quadrant?`, ans: '4/5', opts: ['4/5', '5/3', '3/4', '1/5'], exp: 'Using fundamental identity sinÂ²Î¸ + cosÂ²Î¸ = 1: cos Î¸ = âˆš(1 - 9/25) = 4/5.', misc: 'cos Î¸ is adjacent over hypotenuse, not opposite over adjacent.' }) }
    ],
    sci: [
      { topic: 'Chemical Reactions', chapter: 'Chemical Equations', tmpl: (i) => ({ q: `The reaction 2Mg + Oâ‚‚ â†’ 2MgO is an example of which reaction type?`, ans: 'Combination reaction', opts: ['Combination reaction', 'Decomposition reaction', 'Displacement reaction', 'Double displacement'], exp: 'Two or more reactants combine to form a single product in a synthesis/combination reaction.', misc: 'Decomposition breaks a single compound into multiple products.' }) },
      { topic: 'Life Processes', chapter: 'Biology Foundations', tmpl: (i) => ({ q: `In human kidneys, the structural and functional filtration unit is the:`, ans: 'Nephron', opts: ['Nephron', 'Neuron', 'Alveolus', 'Villus'], exp: 'Each kidney contains approximately one million nephrons performing ultrafiltration and selective reabsorption.', misc: 'Neuron is the nervous system unit; nephron is the renal unit.' }) }
    ],
    eng: [
      { topic: 'Formal Writing & Inference', chapter: 'Advanced Composition', tmpl: (i) => ({ q: `Identify the appropriate salutation in a formal petition to the school principal:`, ans: 'Respected Sir / Madam,', opts: ['Respected Sir / Madam,', 'Hey Principal,', 'Dear Friend,', 'To whom it may concern,'], exp: 'Formal institutional communication requires standardized respectful honorifics.', misc: 'Colloquial greetings are unacceptable in official administrative petitions.' }) }
    ]
  }
};

// Generate 100 questions per grade (600 questions total)
for (let g = 5; g <= 10; g++) {
  const blueprint = CURRICULUM_BLUEPRINTS[g];
  const mathPool = blueprint.math;
  const sciPool = blueprint.sci;
  const engPool = blueprint.eng;

  for (let qIdx = 0; qIdx < 100; qIdx++) {
    let subj = 'Mathematics';
    let topicData = null;
    let pool = mathPool;

    if (qIdx < 40) {
      subj = 'Mathematics';
      pool = mathPool;
    } else if (qIdx < 80) {
      subj = 'Science';
      pool = sciPool;
    } else {
      subj = 'English';
      pool = engPool;
    }

    const tObj = pool[qIdx % pool.length];
    const generated = tObj.tmpl(qIdx + 1);

    // Difficulty distribution: 0-34 easy, 35-74 medium, 75-99 hard
    let diff = 'MEDIUM';
    if (qIdx % 10 < 3) diff = 'EASY';
    else if (qIdx % 10 >= 7) diff = 'HARD';

    const bloom = BLOOM_LEVELS[qIdx % BLOOM_LEVELS.length];
    const format = FORMATS[qIdx % FORMATS.length];
    const correctIdx = qIdx % 4;

    // Rotate options so correct answer is at correctIdx
    const options = [...generated.opts];
    if (correctIdx !== 0 && options.length === 4) {
      const temp = options[0];
      options[0] = options[correctIdx];
      options[correctIdx] = temp;
    }

    const qId = `q-g${g}-${String(qIdx + 1).padStart(3, '0')}`;
    const loCode = `LO-${subj.substring(0, 3).toUpperCase()}${g}-${(qIdx % 5) + 1}.${(qIdx % 3) + 1}`;

    QUESTIONS.push({
      id: qId,
      gradeLevel: g,
      subject: subj,
      chapter: tObj.chapter,
      topic: tObj.topic,
      difficulty: diff,
      bloomTaxonomy: bloom,
      questionFormat: format,
      questionText: generated.q,
      options,
      correctAnswerIndex: correctIdx,
      explanation: generated.exp,
      conceptSummary: `Core Grade ${g} ${subj} principle: ${tObj.topic}`,
      misconception: generated.misc,
      learningObjective: loCode,
      points: diff === 'HARD' ? 4 : diff === 'MEDIUM' ? 3 : 2,
      steps: [
        { step: 'Step 1: Identify Key Concepts', desc: `Analyze requirements for ${tObj.topic}.`, math: `Domain = ${subj}` },
        { step: 'Step 2: Apply Mathematical / Conceptual Rule', desc: generated.exp, math: `Correct key = ${options[correctIdx]}` },
        { step: 'Step 3: Verification', desc: `Confirm that common misconception (${generated.misc}) has been avoided.`, math: `Result = ${options[correctIdx]}` }
      ],
      schoolId: SCHOOL_TENANT.id,
      isSynthetic: true
    });
    qCounter++;
  }
}

// 7. 24 Assessments Generation (12 Pre-Tests + 12 Post-Tests)
const ASSESSMENTS = [];
let aCounter = 1;

for (let g = 5; g <= 10; g++) {
  // Pre-test
  const preId = `asm-g${g}-pre`;
  const postId = `asm-g${g}-post`;

  const gQuestions = QUESTIONS.filter(q => q.gradeLevel === g);
  const mathQ = gQuestions.filter(q => q.subject === 'Mathematics');
  const sciQ = gQuestions.filter(q => q.subject === 'Science');

  const preItems = [...mathQ.slice(0, 6), ...sciQ.slice(0, 6)].map(q => q.id);
  const postItems = [...mathQ.slice(6, 12), ...sciQ.slice(6, 12)].map(q => q.id);

  ASSESSMENTS.push({
    id: preId,
    title: `Grade ${g} Institutional STEM Diagnostic Pre-Test`,
    gradeLevel: g,
    subject: 'STEM (Mathematics & Science)',
    assessmentType: 'PRE_TEST',
    status: 'PUBLISHED',
    isLive: g === 7, // Grade 7 test is Live for demonstration
    isPaused: false,
    durationMinutes: 20,
    totalMarks: 24,
    questionCount: 12,
    randomizeOrder: true,
    questionIds: preItems,
    instructions: 'Please answer all 12 questions. Auto-scored upon timer expiry or manual submission.',
    schoolId: SCHOOL_TENANT.id,
    isSynthetic: true
  });

  ASSESSMENTS.push({
    id: postId,
    title: `Grade ${g} Summative STEM Learning Gain Post-Test`,
    gradeLevel: g,
    subject: 'STEM (Mathematics & Science)',
    assessmentType: 'POST_TEST',
    status: 'PUBLISHED',
    isLive: false,
    isPaused: false,
    durationMinutes: 20,
    totalMarks: 24,
    questionCount: 12,
    randomizeOrder: true,
    questionIds: postItems,
    instructions: 'Summative post-test for measuring Hake normalized learning gain (g).',
    schoolId: SCHOOL_TENANT.id,
    isSynthetic: true
  });

  // 2 Chapter Checkpoints per grade
  ASSESSMENTS.push({
    id: `asm-g${g}-chk-1`,
    title: `Grade ${g} Mathematics Chapter 1 Checkpoint`,
    gradeLevel: g,
    subject: 'Mathematics',
    assessmentType: 'FORMATIVE_TEST',
    status: 'PUBLISHED',
    isLive: false,
    durationMinutes: 15,
    totalMarks: 16,
    questionCount: 8,
    randomizeOrder: false,
    questionIds: mathQ.slice(12, 20).map(q => q.id),
    schoolId: SCHOOL_TENANT.id,
    isSynthetic: true
  });

  ASSESSMENTS.push({
    id: `asm-g${g}-chk-2`,
    title: `Grade ${g} Science Formative Diagnostic`,
    gradeLevel: g,
    subject: 'Science',
    assessmentType: 'FORMATIVE_TEST',
    status: 'PUBLISHED',
    isLive: false,
    durationMinutes: 15,
    totalMarks: 16,
    questionCount: 8,
    randomizeOrder: false,
    questionIds: sciQ.slice(12, 20).map(q => q.id),
    schoolId: SCHOOL_TENANT.id,
    isSynthetic: true
  });
}

// 8. 30 Assignments Generation (5 per grade across Grades 5-10)
const ASSIGNMENTS = [];
let asgnCounter = 1;

for (let g = 5; g <= 10; g++) {
  const clsA = CLASSROOMS.find(c => c.gradeLevel === g && c.section.endsWith('A'));
  const clsB = CLASSROOMS.find(c => c.gradeLevel === g && c.section.endsWith('B'));

  const assignmentsList = [
    { title: `Grade ${g} Mathematics Weekly Problem Set #1`, subject: 'Mathematics', cls: clsA, type: 'HOMEWORK' },
    { title: `Grade ${g} Science Lab Observations & Analysis`, subject: 'Science', cls: clsB, type: 'PRACTICE' },
    { title: `Grade ${g} Adaptive Misconception Remediation`, subject: 'Mathematics', cls: clsA, type: 'REMEDIAL' },
    { title: `Grade ${g} Pre-Test Diagnostic Preparation`, subject: 'STEM', cls: clsA, type: 'DIAGNOSTIC' },
    { title: `Grade ${g} Science Core Concept Mastery`, subject: 'Science', cls: clsB, type: 'HOMEWORK' }
  ];

  assignmentsList.forEach((asg, idx) => {
    ASSIGNMENTS.push({
      id: `asgn-g${g}-0${idx + 1}`,
      title: asg.title,
      gradeLevel: g,
      classroomId: asg.cls?.id || `cls-${String(g).padStart(2, '0')}-a`,
      subject: asg.subject,
      status: idx < 4 ? 'ACTIVE' : 'COMPLETED',
      dueDate: new Date(Date.now() + (idx + 2) * 86400000).toISOString(),
      schoolId: SCHOOL_TENANT.id,
      isSynthetic: true
    });
  });
}

// 9. 3,600+ Daily Attendance Records Generation (20 School Days x 180 Students)
// Dates: Mon-Fri over 4 academic weeks from Oct 19 to Nov 13, 2026
const ATTENDANCE_RECORDS = [];
const SCHOOL_DATES = [];

const startDate = new Date(Date.UTC(2026, 9, 19, 0, 0, 0, 0)); // Oct 19, 2026 UTC midnight
let currentDay = new Date(startDate);

while (SCHOOL_DATES.length < 20) {
  const dayOfWeek = currentDay.getUTCDay(); // 0 = Sun, 6 = Sat
  if (dayOfWeek !== 0 && dayOfWeek !== 6) {
    SCHOOL_DATES.push(new Date(currentDay));
  }
  currentDay.setUTCDate(currentDay.getUTCDate() + 1);
}

// Ensure unique (classroomId, studentId, date)
const ATTENDANCE_STATUSES = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'LATE', 'ABSENT'];

for (const dateObj of SCHOOL_DATES) {
  const dateIso = dateObj.toISOString();

  for (const student of STUDENTS) {
    const cls = CLASSROOMS.find(c => c.gradeLevel === student.gradeLevel && c.section === student.section) || CLASSROOMS[0];

    // High performers have 98% attendance, Intervention tier has ~88% attendance
    let status = 'PRESENT';
    const rand = (student.id.charCodeAt(5) + dateObj.getUTCDate() * 7) % 100;

    if (student.performanceTier === 'TOP_PERFORMER') {
      status = rand > 97 ? 'ABSENT' : rand > 92 ? 'LATE' : 'PRESENT';
    } else if (student.performanceTier === 'INTERVENTION_REQUIRED') {
      status = rand > 86 ? 'ABSENT' : rand > 76 ? 'LATE' : 'PRESENT';
    } else {
      status = rand > 94 ? 'ABSENT' : rand > 88 ? 'LATE' : 'PRESENT';
    }

    ATTENDANCE_RECORDS.push({
      id: `att-${student.id}-${dateIso.split('T')[0]}`,
      classroomId: cls.id,
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      date: dateIso,
      status,
      remarks: status === 'LATE' ? 'Bus delayed by 15 mins' : status === 'ABSENT' ? 'Sick leave note received' : null,
      markedById: cls.teacherId,
      isSynthetic: true
    });
  }
}

// 10. 540+ Completed Assessment Attempts & 6,000+ AnswerEvents
const ATTEMPTS = [];
const ANSWER_EVENTS = [];

let attemptCounter = 1;
let eventCounter = 1;

for (const student of STUDENTS) {
  const preTest = ASSESSMENTS.find(a => a.gradeLevel === student.gradeLevel && a.assessmentType === 'PRE_TEST');
  const postTest = ASSESSMENTS.find(a => a.gradeLevel === student.gradeLevel && a.assessmentType === 'POST_TEST');
  const checkpoint = ASSESSMENTS.find(a => a.gradeLevel === student.gradeLevel && a.id.includes('chk-1'));

  const testList = [preTest, postTest, checkpoint].filter(Boolean);

  for (const asm of testList) {
    const attemptId = `att-asm-${String(attemptCounter).padStart(4, '0')}`;
    const questionIds = asm.questionIds || [];

    let correctCount = 0;
    const questionsToAttempt = questionIds.map(qid => QUESTIONS.find(q => q.id === qid)).filter(Boolean);

    // Initial BKT prior: Top = 0.85, Proficient = 0.65, Intervention = 0.40
    let currentBkt = student.performanceTier === 'TOP_PERFORMER' ? 0.85 : student.performanceTier === 'INTERVENTION_REQUIRED' ? 0.40 : 0.65;

    questionsToAttempt.forEach((q, qIndex) => {
      const eventId = `evt-${String(eventCounter).padStart(5, '0')}`;
      
      // Determine correctness based on tier and pre vs post
      const isPost = asm.assessmentType === 'POST_TEST';
      const boost = isPost ? 0.15 : 0;
      const probCorrect = Math.min(0.98, student.bktMastery + boost);
      const isCorrect = ((qIndex * 13 + student.id.charCodeAt(5) + (isPost ? 7 : 0)) % 100) < (probCorrect * 100);

      if (isCorrect) correctCount++;

      // Real Bayesian Knowledge Tracing update
      const G = 0.20; // Guess
      const S = 0.10; // Slip
      const T = 0.15; // Transit

      let posterior;
      if (isCorrect) {
        posterior = (currentBkt * (1 - S)) / ((currentBkt * (1 - S)) + ((1 - currentBkt) * G));
      } else {
        posterior = (currentBkt * S) / ((currentBkt * S) + ((1 - currentBkt) * (1 - G)));
      }
      currentBkt = Math.min(0.99, Math.max(0.01, posterior + (1 - posterior) * T));

      const pointsMax = q.points || 2;
      const pointsAwarded = isCorrect ? pointsMax : 0;

      ANSWER_EVENTS.push({
        id: eventId,
        attemptId,
        questionId: q.id,
        userAnswer: isCorrect ? q.options[q.correctAnswerIndex] : q.options[(q.correctAnswerIndex + 1) % 4],
        isCorrect,
        responseTimeMs: 15000 + ((qIndex * 2700) % 25000),
        confidence: isCorrect ? 'VERY_SURE' : 'SOMEWHAT_SURE',
        pointsAwarded,
        maxPoints: pointsMax,
        postEventBktMastery: Math.round(currentBkt * 100) / 100,
        teacherFeedback: isCorrect ? 'Excellent demonstration of core conceptual understanding.' : `Review ${q.topic} - note that ${q.misconception}`,
        schoolId: SCHOOL_TENANT.id,
        isSynthetic: true
      });
      eventCounter++;
    });

    const totalQuestions = questionsToAttempt.length || 12;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const totalScore = correctCount * 2;

    ATTEMPTS.push({
      id: attemptId,
      assessmentId: asm.id,
      assessmentTitle: asm.title,
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      gradeLevel: student.gradeLevel,
      status: 'GRADED',
      totalScore,
      maxScore: totalQuestions * 2,
      scorePercentage,
      correctCount,
      totalQuestions,
      finalBktMastery: Math.round(currentBkt * 100) / 100,
      startTime: new Date(Date.now() - 86400000 * (30 - attemptCounter % 20)).toISOString(),
      endTime: new Date(Date.now() - 86400000 * (30 - attemptCounter % 20) + 1200000).toISOString(),
      schoolId: SCHOOL_TENANT.id,
      isSynthetic: true
    });
    attemptCounter++;
  }
}

console.log(`[Generated Entities Summary]:`);
console.log(`  - Students: ${STUDENTS.length} synthetic records across Grades 5-10`);
console.log(`  - Teachers: ${TEACHER_ROSTER.length} synthetic faculty`);
console.log(`  - Classrooms: ${CLASSROOMS.length} active cohorts`);
console.log(`  - Curated Questions: ${QUESTIONS.length} across Math, Science, English`);
console.log(`  - Assessments: ${ASSESSMENTS.length} (Pre-Tests, Post-Tests, Checkpoints)`);
console.log(`  - Assignments: ${ASSIGNMENTS.length}`);
console.log(`  - Attendance Records: ${ATTENDANCE_RECORDS.length} over 20 academic days`);
console.log(`  - Assessment Attempts: ${ATTEMPTS.length}`);
console.log(`  - AnswerEvents (Learning Events): ${ANSWER_EVENTS.length}`);

// 11. Write out primary synthetic data stores
const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Write syntheticSchoolData.json
const syntheticSchoolPayload = {
  school: SCHOOL_TENANT,
  demoAccounts: DEMO_ACCOUNTS,
  teachers: TEACHER_ROSTER,
  classrooms: CLASSROOMS,
  students: STUDENTS,
  assessments: ASSESSMENTS,
  assignments: ASSIGNMENTS,
  attendance: ATTENDANCE_RECORDS,
  attempts: ATTEMPTS,
  answerEvents: ANSWER_EVENTS,
  metadata: {
    generatedAt: new Date().toISOString(),
    version: '2.0.0-synthetic-aps',
    studentCount: STUDENTS.length,
    questionCount: QUESTIONS.length,
    attendanceCount: ATTENDANCE_RECORDS.length,
    attemptCount: ATTEMPTS.length,
    learningEventCount: ANSWER_EVENTS.length
  }
};

const syntheticDataPath = path.join(DATA_DIR, 'syntheticSchoolData.json');
fs.writeFileSync(syntheticDataPath, JSON.stringify(syntheticSchoolPayload, null, 2), 'utf8');
console.log(`âœ… Saved synthetic school simulation store -> ${syntheticDataPath}`);

// Write multiGradeQuestions.json with all 600 questions
const questionsPath = path.join(DATA_DIR, 'multiGradeQuestions.json');
fs.writeFileSync(questionsPath, JSON.stringify(QUESTIONS, null, 2), 'utf8');
console.log(`âœ… Saved complete 600-question multi-grade question bank -> ${questionsPath}`);

console.log('================================================================');
console.log('ðŸŽ‰ Synthetic School Data Generation & Validation COMPLETE');
console.log('================================================================');

