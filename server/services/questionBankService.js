/**
 * Greenwood Public School — Centralized Question Bank Service
 * Supports 15 question formats, comprehensive pedagogical metadata,
 * strict validation engine, editorial approval workflow, and curriculum coverage tracking.
 */

const fs = require('fs');
const path = require('path');
const multiGradeQuestions = require('../data/multiGradeQuestions.json');

const QUESTION_BANK_FILE = path.join(__dirname, '../data/questionBankStore.json');
const TMP_QUESTION_BANK_FILE = process.env.VERCEL ? path.join('/tmp', 'questionBankStore.json') : null;

// 15 Supported Question Formats
const VALID_QUESTION_FORMATS = [
  'MCQ',
  'MULTIPLE_SELECT',
  'TRUE_FALSE',
  'FILL_BLANKS',
  'MATCH_FOLLOWING',
  'SHORT_ANSWER',
  'LONG_ANSWER',
  'NUMERICAL',
  'CASE_BASED',
  'COMPETENCY_BASED',
  'ASSERTION_REASON',
  'DIAGRAM_BASED',
  'PRACTICAL_APPLICATION',
  'READING_COMPREHENSION',
  'ORAL_ACTIVITY'
];

// 5 Standard Difficulty Tiers
const VALID_DIFFICULTIES = ['FOUNDATION', 'EASY', 'MODERATE', 'CHALLENGING', 'ADVANCED'];

// Editorial Lifecycle States
const VALID_EDITORIAL_STATUSES = ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'];

let questionStore = null;

function loadQuestionStore() {
  if (!questionStore) {
    if (TMP_QUESTION_BANK_FILE && fs.existsSync(TMP_QUESTION_BANK_FILE)) {
      try {
        questionStore = JSON.parse(fs.readFileSync(TMP_QUESTION_BANK_FILE, 'utf8'));
      } catch (e) {
        questionStore = null;
      }
    }

    if (!questionStore && fs.existsSync(QUESTION_BANK_FILE)) {
      try {
        questionStore = JSON.parse(fs.readFileSync(QUESTION_BANK_FILE, 'utf8'));
      } catch (e) {
        questionStore = null;
      }
    }

    if (!questionStore) {
      // Seed with initial multiGradeQuestions formatted to the full metadata schema
      questionStore = multiGradeQuestions.map((q, idx) => ({
        id: q.id || `gps-q-${String(idx + 1).padStart(5, '0')}`,
        gradeLevel: q.gradeLevel || 7,
        subject: q.subject || 'Mathematics',
        academicYear: '2026-2027',
        curriculumVersion: 'GPS-CBSE-2026-V2',
        chapter: q.chapter || 'Foundations',
        chapterNumber: q.chapterNumber || 1,
        topic: q.topic || 'General Topic',
        subtopic: q.subtopic || 'Core Concept',
        learningObjective: q.learningObjective || `LO-${(q.subject || 'MAT').substring(0, 3).toUpperCase()}${q.gradeLevel || 7}-1.1`,
        questionStatement: q.questionText || q.questionStatement || '',
        questionFormat: q.questionFormat || 'MCQ',
        options: q.options || [],
        correctAnswer: q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : (q.correctAnswer || 0),
        explanation: q.explanation || 'Pedagogical explanation aligned with NCERT standards.',
        workedSolution: q.steps || [
          { step: 'Step 1: Conceptual Identification', desc: 'Identify core principles and mathematical terms.' },
          { step: 'Step 2: Rule Application', desc: 'Compute verified result according to NCERT syllabus guidelines.' },
          { step: 'Step 3: Verification', desc: 'Check boundary conditions and eliminate common misconceptions.' }
        ],
        marks: q.points || 2,
        difficulty: (q.difficulty || 'MODERATE').toUpperCase(),
        estimatedResponseTime: q.estimatedResponseTime || 60,
        misconceptionTags: q.misconception ? [q.misconception] : [],
        sourceAttribution: {
          publisher: 'NCERT',
          edition: '2026-2027',
          verifiedBy: 'Greenwood Academic Council'
        },
        editorialVerificationStatus: 'PUBLISHED',
        publicationStatus: 'ACTIVE',
        createdAt: new Date().toISOString()
      }));

      // Enrich with sample original questions demonstrating all 15 formats
      enrichWithAll15Formats(questionStore);
      saveQuestionStore();
    }
  }
  return questionStore;
}

function saveQuestionStore() {
  if (!questionStore) return;
  const targetPath = TMP_QUESTION_BANK_FILE || QUESTION_BANK_FILE;
  try {
    fs.writeFileSync(targetPath, JSON.stringify(questionStore, null, 2), 'utf8');
  } catch (err) {
    console.warn('[QuestionBankService] Failed to persist question store:', err.message);
  }
}

function enrichWithAll15Formats(store) {
  const sampleItems = [
    {
      id: 'gps-q-fmt-001',
      gradeLevel: 7,
      subject: 'Mathematics',
      academicYear: '2026-2027',
      curriculumVersion: 'GPS-CBSE-2026-V2',
      chapter: 'Simple Equations',
      chapterNumber: 3,
      topic: 'Solving Equations by Transposition',
      subtopic: 'Linear Equations with Variable on One Side',
      learningObjective: 'LO-MAT7-3.1: Solve linear equations using transposition method across equality boundaries.',
      questionStatement: 'Solve for x: 3x - 7 = 14',
      questionFormat: 'MCQ',
      options: ['x = 7', 'x = 21', 'x = 3', 'x = 9'],
      correctAnswer: 0,
      explanation: 'Add 7 to both sides: 3x = 21. Divide by 3: x = 7.',
      workedSolution: [
        { step: 'Step 1', desc: 'Transpose -7 to RHS as +7: 3x = 14 + 7 = 21.' },
        { step: 'Step 2', desc: 'Divide both sides by coefficient 3: x = 21 / 3 = 7.' }
      ],
      marks: 2,
      difficulty: 'MODERATE',
      estimatedResponseTime: 45,
      misconceptionTags: ['Transposing sign without inverting (-7 to -7)'],
      sourceAttribution: { publisher: 'NCERT', edition: '2026-2027', bookTitle: 'Mathematics Class VII' },
      editorialVerificationStatus: 'PUBLISHED',
      publicationStatus: 'ACTIVE'
    },
    {
      id: 'gps-q-fmt-002',
      gradeLevel: 7,
      subject: 'Mathematics',
      academicYear: '2026-2027',
      curriculumVersion: 'GPS-CBSE-2026-V2',
      chapter: 'Integers',
      chapterNumber: 1,
      topic: 'Properties of Integers',
      subtopic: 'Distributive and Commutative Laws',
      learningObjective: 'LO-MAT7-1.1: Identify valid algebraic properties of integer operations.',
      questionStatement: 'Which of the following operations are commutative for integers? (Select all that apply)',
      questionFormat: 'MULTIPLE_SELECT',
      options: ['Addition (a + b = b + a)', 'Multiplication (a × b = b × a)', 'Subtraction (a - b = b - a)', 'Division (a ÷ b = b ÷ a)'],
      correctAnswer: [0, 1],
      explanation: 'Addition and multiplication are commutative for integers. Subtraction and division are not.',
      workedSolution: [
        { step: 'Step 1', desc: 'Verify addition: 3 + (-2) = 1, (-2) + 3 = 1 (Holds).' },
        { step: 'Step 2', desc: 'Verify multiplication: 3 × (-2) = -6, (-2) × 3 = -6 (Holds).' },
        { step: 'Step 3', desc: 'Counterexample for subtraction: 3 - 2 = 1, but 2 - 3 = -1 (Fails).' }
      ],
      marks: 3,
      difficulty: 'MODERATE',
      estimatedResponseTime: 60,
      misconceptionTags: ['Assuming subtraction is commutative'],
      sourceAttribution: { publisher: 'NCERT', edition: '2026-2027', bookTitle: 'Mathematics Class VII' },
      editorialVerificationStatus: 'PUBLISHED',
      publicationStatus: 'ACTIVE'
    },
    {
      id: 'gps-q-fmt-003',
      gradeLevel: 7,
      subject: 'Science',
      academicYear: '2026-2027',
      curriculumVersion: 'GPS-CBSE-2026-V2',
      chapter: 'Nutrition in Plants',
      chapterNumber: 1,
      topic: 'Autotrophic Nutrition',
      subtopic: 'Role of Chlorophyll',
      learningObjective: 'LO-SCI7-1.2: Differentiate autotrophic and heterotrophic modes of nutrition.',
      questionStatement: 'True or False: Cuscuta (Amarbel) is an autotrophic plant that synthesizes its own food using chlorophyll.',
      questionFormat: 'TRUE_FALSE',
      options: ['True', 'False'],
      correctAnswer: 1,
      explanation: 'False. Cuscuta is a parasitic heterotrophic plant lacking chlorophyll; it derives ready-made nutrients from its host.',
      workedSolution: [
        { step: 'Step 1', desc: 'Cuscuta does not contain chlorophyll and appears yellow.' },
        { step: 'Step 2', desc: 'It climbs onto host trees and absorbs nutrients via specialized haustorial roots.' }
      ],
      marks: 1,
      difficulty: 'EASY',
      estimatedResponseTime: 30,
      misconceptionTags: ['Assuming all green/yellow plants are autotrophs'],
      sourceAttribution: { publisher: 'NCERT', edition: '2026-2027', bookTitle: 'Science Class VII' },
      editorialVerificationStatus: 'PUBLISHED',
      publicationStatus: 'ACTIVE'
    },
    {
      id: 'gps-q-fmt-004',
      gradeLevel: 7,
      subject: 'Science',
      academicYear: '2026-2027',
      curriculumVersion: 'GPS-CBSE-2026-V2',
      chapter: 'Acids, Bases and Salts',
      chapterNumber: 4,
      topic: 'Indicators',
      subtopic: 'Litmus Paper Reaction',
      learningObjective: 'LO-SCI7-4.1: Identify acidic and basic solutions using natural indicators.',
      questionStatement: 'Fill in the blank: An acidic solution turns blue litmus paper ______.',
      questionFormat: 'FILL_BLANKS',
      options: ['red', 'blue', 'green', 'yellow'],
      correctAnswer: 'red',
      explanation: 'Acids turn blue litmus red. Bases turn red litmus blue.',
      workedSolution: [
        { step: 'Step 1', desc: 'Acids release hydrogen ions which cause blue litmus pigment to shift to red.' }
      ],
      marks: 1,
      difficulty: 'FOUNDATION',
      estimatedResponseTime: 20,
      misconceptionTags: ['Inverting litmus colors for acids and bases'],
      sourceAttribution: { publisher: 'NCERT', edition: '2026-2027', bookTitle: 'Science Class VII' },
      editorialVerificationStatus: 'PUBLISHED',
      publicationStatus: 'ACTIVE'
    },
    {
      id: 'gps-q-fmt-005',
      gradeLevel: 7,
      subject: 'Science',
      academicYear: '2026-2027',
      curriculumVersion: 'GPS-CBSE-2026-V2',
      chapter: 'Respiration in Organisms',
      chapterNumber: 6,
      topic: 'Breathing Organs',
      subtopic: 'Comparative Respiration',
      learningObjective: 'LO-SCI7-6.2: Match organisms to their specialized respiratory structures.',
      questionStatement: 'Match the organism in Column A with its respiratory organ in Column B:\n(1) Earthworm - (A) Gills\n(2) Fish - (B) Moist Skin\n(3) Human - (C) Tracheae\n(4) Cockroach - (D) Lungs',
      questionFormat: 'MATCH_FOLLOWING',
      options: ['1-B, 2-A, 3-D, 4-C', '1-A, 2-B, 3-C, 4-D', '1-B, 2-C, 3-D, 4-A', '1-C, 2-A, 3-B, 4-D'],
      correctAnswer: 0,
      explanation: 'Earthworms breathe through moist skin, fish through gills, humans through lungs, cockroaches via tracheal spiracles.',
      workedSolution: [
        { step: 'Step 1', desc: 'Earthworm: cutaneous respiration through moist cuticle (1-B).' },
        { step: 'Step 2', desc: 'Fish: aquatic gills with counter-current blood flow (2-A).' },
        { step: 'Step 3', desc: 'Human: pulmonary alveoli lungs (3-D).' },
        { step: 'Step 4', desc: 'Cockroach: spiracle-tracheal network (4-C).' }
      ],
      marks: 4,
      difficulty: 'MODERATE',
      estimatedResponseTime: 90,
      misconceptionTags: ['Assuming insects possess lungs'],
      sourceAttribution: { publisher: 'NCERT', edition: '2026-2027', bookTitle: 'Science Class VII' },
      editorialVerificationStatus: 'PUBLISHED',
      publicationStatus: 'ACTIVE'
    },
    {
      id: 'gps-q-fmt-006',
      gradeLevel: 7,
      subject: 'Mathematics',
      academicYear: '2026-2027',
      curriculumVersion: 'GPS-CBSE-2026-V2',
      chapter: 'Lines and Angles',
      chapterNumber: 5,
      topic: 'Supplementary and Complementary Angles',
      subtopic: 'Angle Calculations',
      learningObjective: 'LO-MAT7-5.1: Calculate supplementary and complementary angle measures.',
      questionStatement: 'State the measure of an angle that is equal to its supplement.',
      questionFormat: 'SHORT_ANSWER',
      options: ['90°', '45°', '180°', '60°'],
      correctAnswer: '90°',
      explanation: 'Supplementary angles sum to 180°. If x = 180° - x, then 2x = 180°, so x = 90°.',
      workedSolution: [
        { step: 'Step 1', desc: 'Let the angle be x. Its supplement is 180° - x.' },
        { step: 'Step 2', desc: 'x = 180° - x => 2x = 180° => x = 90°.' }
      ],
      marks: 2,
      difficulty: 'EASY',
      estimatedResponseTime: 40,
      misconceptionTags: ['Confusing supplementary (180°) with complementary (90°)'],
      sourceAttribution: { publisher: 'NCERT', edition: '2026-2027', bookTitle: 'Mathematics Class VII' },
      editorialVerificationStatus: 'PUBLISHED',
      publicationStatus: 'ACTIVE'
    },
    {
      id: 'gps-q-fmt-007',
      gradeLevel: 7,
      subject: 'Science',
      academicYear: '2026-2027',
      curriculumVersion: 'GPS-CBSE-2026-V2',
      chapter: 'Physical and Chemical Changes',
      chapterNumber: 5,
      topic: 'Rusting of Iron',
      subtopic: 'Prevention Mechanisms',
      learningObjective: 'LO-SCI7-5.3: Explain chemical transformations and industrial prevention methods.',
      questionStatement: 'Describe the chemical mechanism of rusting of iron. Detail the two necessary environmental conditions and explain why galvanisation prevents it.',
      questionFormat: 'LONG_ANSWER',
      options: [],
      correctAnswer: 'Rusting requires iron (Fe), oxygen (O2), and moisture (H2O). Galvanisation coats iron with sacrificial zinc (Zn) to prevent air/water contact.',
      explanation: 'Rusting formula: 4Fe + 3O2 + 2xH2O -> 2Fe2O3.xH2O (Hydrated iron oxide). Zinc oxidizes preferentially.',
      workedSolution: [
        { step: 'Condition 1', desc: 'Presence of atmospheric oxygen (O2).' },
        { step: 'Condition 2', desc: 'Presence of liquid water or moisture vapour (H2O).' },
        { step: 'Mechanism', desc: 'Zinc layer acts as physical barrier and sacrificial anode.' }
      ],
      marks: 5,
      difficulty: 'CHALLENGING',
      estimatedResponseTime: 180,
      misconceptionTags: ['Believing rusting occurs in dry air or boiled oxygen-free water'],
      sourceAttribution: { publisher: 'NCERT', edition: '2026-2027', bookTitle: 'Science Class VII' },
      editorialVerificationStatus: 'PUBLISHED',
      publicationStatus: 'ACTIVE'
    },
    {
      id: 'gps-q-fmt-008',
      gradeLevel: 7,
      subject: 'Mathematics',
      academicYear: '2026-2027',
      curriculumVersion: 'GPS-CBSE-2026-V2',
      chapter: 'Perimeter and Area',
      chapterNumber: 9,
      topic: 'Circles',
      subtopic: 'Circumference and Area Calculation',
      learningObjective: 'LO-MAT7-9.3: Compute circle circumference and enclosed area using pi = 22/7.',
      questionStatement: 'A circular garden has a radius of 14 meters. Calculate its perimeter (circumference) in meters (take π = 22/7):',
      questionFormat: 'NUMERICAL',
      options: ['88', '44', '616', '154'],
      correctAnswer: 88,
      explanation: 'Circumference = 2 × π × r = 2 × (22/7) × 14 = 2 × 22 × 2 = 88 m.',
      workedSolution: [
        { step: 'Step 1', desc: 'Formula C = 2 × π × r' },
        { step: 'Step 2', desc: 'Substitute values: 2 × (22/7) × 14' },
        { step: 'Step 3', desc: 'Simplify: 2 × 22 × 2 = 88 m.' }
      ],
      marks: 3,
      difficulty: 'MODERATE',
      estimatedResponseTime: 60,
      misconceptionTags: ['Using area formula πr² instead of circumference 2πr'],
      sourceAttribution: { publisher: 'NCERT', edition: '2026-2027', bookTitle: 'Mathematics Class VII' },
      editorialVerificationStatus: 'PUBLISHED',
      publicationStatus: 'ACTIVE'
    },
    {
      id: 'gps-q-fmt-009',
      gradeLevel: 7,
      subject: 'Mathematics',
      academicYear: '2026-2027',
      curriculumVersion: 'GPS-CBSE-2026-V2',
      chapter: 'Comparing Quantities',
      chapterNumber: 7,
      topic: 'Profit and Loss in Real Life',
      subtopic: 'Commercial Arithmetic',
      learningObjective: 'LO-MAT7-7.2: Apply percentage markup and discount calculations in real-world retail scenarios.',
      questionStatement: 'CASE STUDY: A school stationery bookstore in Sector-9 purchases 50 geometry boxes at Rs. 120 each. 10 boxes were sold at Rs. 150 each, and the remaining 40 boxes were sold at Rs. 140 each during the annual academic rush. Calculate the net percentage profit earned by the bookstore on the total consignment.',
      questionFormat: 'CASE_BASED',
      options: ['18.33%', '20.00%', '16.67%', '22.50%'],
      correctAnswer: 0,
      explanation: 'Total Cost Price = 50 × 120 = Rs. 6000. Total Selling Price = (10 × 150) + (40 × 140) = 1500 + 5600 = Rs. 7100. Net Profit = 7100 - 6000 = Rs. 1100. Profit % = (1100 / 6000) × 100 = 18.33%.',
      workedSolution: [
        { step: 'Step 1: Total Cost', desc: '50 × Rs. 120 = Rs. 6,000.' },
        { step: 'Step 2: Total Revenue', desc: 'Rs. 1,500 + Rs. 5,600 = Rs. 7,100.' },
        { step: 'Step 3: Profit Calculation', desc: 'Profit = Rs. 1,100. Profit % = (1100 / 6000) × 100 = 18.33%.' }
      ],
      marks: 4,
      difficulty: 'CHALLENGING',
      estimatedResponseTime: 120,
      misconceptionTags: ['Dividing profit by Selling Price instead of Cost Price'],
      sourceAttribution: { publisher: 'NCERT', edition: '2026-2027', bookTitle: 'Mathematics Class VII' },
      editorialVerificationStatus: 'PUBLISHED',
      publicationStatus: 'ACTIVE'
    },
    {
      id: 'gps-q-fmt-010',
      gradeLevel: 7,
      subject: 'Science',
      academicYear: '2026-2027',
      curriculumVersion: 'GPS-CBSE-2026-V2',
      chapter: 'Heat and Temperature',
      chapterNumber: 3,
      topic: 'Conduction, Convection and Radiation',
      subtopic: 'Thermodynamics & Heat Transfer',
      learningObjective: 'LO-SCI7-3.4: Evaluate thermal transfer mechanisms and solve real-world architectural insulation challenges.',
      questionStatement: 'COMPETENCY ITEM: In Haryana summer conditions, traditional houses in rural Gurugram were constructed with thick mud walls and thatched roofs, whereas modern concrete apartments quickly overheat. Which thermal transfer property explains why mud houses stay significantly cooler during daytime peak solar radiation?',
      questionFormat: 'COMPETENCY_BASED',
      options: [
        'Mud has low thermal conductivity and traps insulating air pockets, delaying heat transfer by conduction into the interior.',
        'Mud accelerates heat radiation directly into the soil.',
        'Concrete conducts heat much slower than mud.',
        'Thatched roofs reflect 100% of cosmic ultraviolet radiation.'
      ],
      correctAnswer: 0,
      explanation: 'Mud and thatch have very low thermal conductivity (k-value) and high thermal inertia, effectively resisting solar conduction.',
      workedSolution: [
        { step: 'Step 1', desc: 'Identify conduction mechanism in solid porous materials.' },
        { step: 'Step 2', desc: 'Air trapped inside mud matrix acts as a high-resistance thermal insulator.' }
      ],
      marks: 3,
      difficulty: 'CHALLENGING',
      estimatedResponseTime: 90,
      misconceptionTags: ['Confusing high thermal conductivity with insulation'],
      sourceAttribution: { publisher: 'NCERT', edition: '2026-2027', bookTitle: 'Science Class VII' },
      editorialVerificationStatus: 'PUBLISHED',
      publicationStatus: 'ACTIVE'
    },
    {
      id: 'gps-q-fmt-011',
      gradeLevel: 7,
      subject: 'Science',
      academicYear: '2026-2027',
      curriculumVersion: 'GPS-CBSE-2026-V2',
      chapter: 'Nutrition in Animals',
      chapterNumber: 2,
      topic: 'Human Digestion',
      subtopic: 'Stomach Acid and Mucosa',
      learningObjective: 'LO-SCI7-2.3: Explain the physiological role of gastric secretions.',
      questionStatement: 'ASSERTION (A): The inner lining of the stomach produces hydrochloric acid (HCl) to destroy incoming ingested bacteria.\nREASON (R): The stomach inner lining produces mucus to protect its own cellular tissue from being eroded by the strong hydrochloric acid.\nSelect the correct evaluation:',
      questionFormat: 'ASSERTION_REASON',
      options: [
        'Both (A) and (R) are true and (R) is the correct explanation of (A).',
        'Both (A) and (R) are true, but (R) is NOT the correct explanation of (A).',
        '(A) is true, but (R) is false.',
        '(A) is false, but (R) is true.'
      ],
      correctAnswer: 1,
      explanation: 'Both statements are scientifically correct. However, mucus protection (R) explains how the stomach survives, not why HCl kills bacteria (A).',
      workedSolution: [
        { step: 'Evaluate A', desc: 'HCl kills microorganisms and lowers pH to ~1.5-2.0 for pepsin activation (True).' },
        { step: 'Evaluate R', desc: 'Goblet cells secrete gastric mucus protecting mucosal epithelial cells (True).' },
        { step: 'Linkage', desc: 'R is a complementary protective adaptation, not the causal reason for A.' }
      ],
      marks: 3,
      difficulty: 'ADVANCED',
      estimatedResponseTime: 75,
      misconceptionTags: ['Assuming correlated biological facts automatically form a causal explanation'],
      sourceAttribution: { publisher: 'NCERT', edition: '2026-2027', bookTitle: 'Science Class VII' },
      editorialVerificationStatus: 'PUBLISHED',
      publicationStatus: 'ACTIVE'
    },
    {
      id: 'gps-q-fmt-012',
      gradeLevel: 7,
      subject: 'Science',
      academicYear: '2026-2027',
      curriculumVersion: 'GPS-CBSE-2026-V2',
      chapter: 'Motion and Time',
      chapterNumber: 9,
      topic: 'Distance-Time Graphs',
      subtopic: 'Uniform vs Non-Uniform Motion',
      learningObjective: 'LO-SCI7-9.4: Interpret physical kinematics from Cartesian distance-time coordinates.',
      questionStatement: 'DIAGRAM ASSESSMENT: Refer to the distance-time plot where the X-axis represents Time (seconds) and the Y-axis represents Distance (meters). The resulting plot is a perfectly horizontal line parallel to the Time axis at Y = 25m. What does this graph indicate regarding the vehicle\'s velocity?',
      questionFormat: 'DIAGRAM_BASED',
      options: [
        'The vehicle is completely stationary (velocity = 0 m/s).',
        'The vehicle is moving at a uniform speed of 25 m/s.',
        'The vehicle is undergoing constant positive acceleration.',
        'The vehicle is moving in reverse toward the origin.'
      ],
      correctAnswer: 0,
      explanation: 'When distance does not change over elapsed time, slope (d/t) is 0, indicating zero speed (stationary object).',
      workedSolution: [
        { step: 'Step 1', desc: 'Velocity on a distance-time graph equals the slope (gradient) delta-y / delta-x.' },
        { step: 'Step 2', desc: 'For horizontal line, delta-y = 0. Slope = 0 / delta-x = 0 m/s.' }
      ],
      marks: 2,
      difficulty: 'MODERATE',
      estimatedResponseTime: 45,
      misconceptionTags: ['Confusing distance-time horizontal line with velocity-time uniform speed'],
      sourceAttribution: { publisher: 'NCERT', edition: '2026-2027', bookTitle: 'Science Class VII' },
      editorialVerificationStatus: 'PUBLISHED',
      publicationStatus: 'ACTIVE'
    },
    {
      id: 'gps-q-fmt-013',
      gradeLevel: 7,
      subject: 'Science',
      academicYear: '2026-2027',
      curriculumVersion: 'GPS-CBSE-2026-V2',
      chapter: 'Electric Current and its Effects',
      chapterNumber: 10,
      topic: 'Magnetic Effect of Electric Current',
      subtopic: 'Electromagnets & Relays',
      learningObjective: 'LO-SCI7-10.2: Construct and troubleshoot an operational electromagnet.',
      questionStatement: 'PRACTICAL LAB APPLICATION: A student winds insulated copper wire around an iron nail and connects it to a 9V battery cell. When brought near steel paper clips, only 2 clips are attracted. Name TWO verifiable experimental adjustments the student can implement in the laboratory to increase the magnetic strength of this electromagnet.',
      questionFormat: 'PRACTICAL_APPLICATION',
      options: [
        'Increase the number of coil turns around the nail and increase the electrical current/voltage.',
        'Use plastic instead of iron core and decrease turns.',
        'Submerge the coil in cold water and remove the core.',
        'Reverse the polarity and heat the iron nail.'
      ],
      correctAnswer: 0,
      explanation: 'Electromagnetic field strength B is directly proportional to number of turns N and current I: B ∝ N × I.',
      workedSolution: [
        { step: 'Method 1', desc: 'Increase number of solenoid turns (N) around the ferromagnetic core.' },
        { step: 'Method 2', desc: 'Increase DC current (I) supplied by adding battery cells in series.' }
      ],
      marks: 3,
      difficulty: 'MODERATE',
      estimatedResponseTime: 60,
      misconceptionTags: ['Believing wire thickness alone increases magnetic flux density'],
      sourceAttribution: { publisher: 'NCERT', edition: '2026-2027', bookTitle: 'Science Class VII' },
      editorialVerificationStatus: 'PUBLISHED',
      publicationStatus: 'ACTIVE'
    },
    {
      id: 'gps-q-fmt-014',
      gradeLevel: 7,
      subject: 'English',
      academicYear: '2026-2027',
      curriculumVersion: 'GPS-CBSE-2026-V2',
      chapter: 'Honeycomb Prose',
      chapterNumber: 1,
      topic: 'Three Questions by Leo Tolstoy',
      subtopic: 'Analytical Reading & Theme',
      learningObjective: 'LO-ENG7-1.1: Deduce moral philosophy and contextual character motivation from classical narrative prose.',
      questionStatement: 'READING COMPREHENSION PASSAGE:\n"The King turned round and saw a bearded man come running out of the wood. The man held his hands pressed against his stomach, and blood was flowing from under them. When he reached the King, he fainted and fell to the ground. The King and the hermit unfastened the man\'s clothing and found a large wound in his stomach. The King washed and covered it with his handkerchief..."\n\nQuestion: According to the moral resolution of Tolstoy\'s narrative, what was the hermit\'s final answer regarding the single most important time, the most important person, and the most important business in life?',
      questionFormat: 'READING_COMPREHENSION',
      options: [
        'The most important time is NOW; the most important person is the one you are with; the most important business is to do that person good.',
        'The most important time is tomorrow; the most important person is the king; the most important business is state diplomacy.',
        'The most important time is the past; the most important person is the hermit; the most important business is meditation.',
        'The most important time is when you are alone; the most important person is oneself; the most important business is self-defense.'
      ],
      correctAnswer: 0,
      explanation: 'The moral conclusion of the tale states that the present moment (NOW) is the only time we have power, the person at hand is crucial, and doing good is man\'s primary purpose.',
      workedSolution: [
        { step: 'Textual Evidence', desc: 'The hermit delivers this exact philosophical summation to the King on the following morning.' }
      ],
      marks: 4,
      difficulty: 'MODERATE',
      estimatedResponseTime: 100,
      misconceptionTags: ['Selecting utilitarian political outcomes over moral philosophy'],
      sourceAttribution: { publisher: 'NCERT', edition: '2026-2027', bookTitle: 'Honeycomb Class VII' },
      editorialVerificationStatus: 'PUBLISHED',
      publicationStatus: 'ACTIVE'
    },
    {
      id: 'gps-q-fmt-015',
      gradeLevel: 7,
      subject: 'Science',
      academicYear: '2026-2027',
      curriculumVersion: 'GPS-CBSE-2026-V2',
      chapter: 'Forests: Our Lifeline',
      chapterNumber: 12,
      topic: 'Ecological Canopy and Decomposers',
      subtopic: 'Field Inquiry and Community Viva',
      learningObjective: 'LO-SCI7-12.1: Orally present and explain humus formation and forest canopy stratification.',
      questionStatement: 'ORAL & ACTIVITY VIVA PROMPT: In a guided school botanical garden walk, you observe dark, spongy soil beneath a rotting fallen log. Present an oral explanation of how decomposers (fungi and bacteria) recycle carbon and nutrients back to the root rhizosphere, and identify why forests are termed "green lungs".',
      questionFormat: 'ORAL_ACTIVITY',
      options: [],
      correctAnswer: 'Decomposers break down dead biomass into dark nutrient-rich humus. Forests are green lungs because trees release O2 via photosynthesis and absorb CO2.',
      explanation: 'Rubric criteria: (1) Mention of decomposer organisms (microorganisms/fungi), (2) Humus concept, (3) Gas exchange balance (CO2 absorption, O2 generation).',
      workedSolution: [
        { step: 'Viva Point 1', desc: 'Identify decomposers converting dead tissues into humus.' },
        { step: 'Viva Point 2', desc: 'Correlate photosynthesis with planetary respiratory balance.' }
      ],
      marks: 5,
      difficulty: 'MODERATE',
      estimatedResponseTime: 120,
      misconceptionTags: ['Confusing decomposers with scavengers or parasitic plants'],
      sourceAttribution: { publisher: 'NCERT', edition: '2026-2027', bookTitle: 'Science Class VII' },
      editorialVerificationStatus: 'PUBLISHED',
      publicationStatus: 'ACTIVE'
    }
  ];

  sampleItems.forEach(item => {
    const exists = store.some(q => q.id === item.id);
    if (!exists) {
      store.push(item);
    }
  });
}

/**
 * Validate a question against official editorial criteria
 */
function validateQuestion(q) {
  const errors = [];

  if (!q.questionStatement || typeof q.questionStatement !== 'string' || q.questionStatement.trim().length < 5) {
    errors.push('Question statement must be at least 5 characters long.');
  }

  if (!q.gradeLevel || q.gradeLevel < 1 || q.gradeLevel > 12) {
    errors.push('Grade level must be an integer between 1 and 12.');
  }

  if (!q.subject || typeof q.subject !== 'string' || q.subject.trim().length < 2) {
    errors.push('Valid subject is required.');
  }

  if (!q.questionFormat || !VALID_QUESTION_FORMATS.includes(q.questionFormat.toUpperCase())) {
    errors.push(`Question format must be one of: ${VALID_QUESTION_FORMATS.join(', ')}`);
  }

  if (['MCQ', 'MULTIPLE_SELECT', 'MATCH_FOLLOWING'].includes(q.questionFormat)) {
    if (!Array.isArray(q.options) || q.options.length < 2) {
      errors.push(`${q.questionFormat} questions must have at least 2 options.`);
    }
  }

  if (q.correctAnswer === undefined || q.correctAnswer === null || q.correctAnswer === '') {
    errors.push('Correct answer is required.');
  }

  if (!q.explanation || typeof q.explanation !== 'string' || q.explanation.trim().length < 10) {
    errors.push('Explanation must provide a meaningful pedagogical explanation (at least 10 characters).');
  }

  if (q.difficulty && !VALID_DIFFICULTIES.includes(q.difficulty.toUpperCase())) {
    errors.push(`Difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`);
  }

  if (!q.learningObjective || typeof q.learningObjective !== 'string') {
    errors.push('Curriculum-aligned Learning Objective is required.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Create a new question with validation
 */
function createQuestion(questionData, author = 'Teacher') {
  const store = loadQuestionStore();
  const validation = validateQuestion(questionData);

  if (!validation.isValid) {
    const err = new Error(`Validation failed: ${validation.errors.join(' ')}`);
    err.status = 400;
    err.details = validation.errors;
    throw err;
  }

  const id = questionData.id || `gps-q-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const newQuestion = {
    ...questionData,
    id,
    difficulty: (questionData.difficulty || 'MODERATE').toUpperCase(),
    questionFormat: (questionData.questionFormat || 'MCQ').toUpperCase(),
    editorialVerificationStatus: questionData.editorialVerificationStatus || 'PENDING_REVIEW',
    publicationStatus: questionData.publicationStatus || 'ACTIVE',
    author,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.unshift(newQuestion);
  saveQuestionStore();
  return newQuestion;
}

/**
 * Search and filter questions
 */
function searchQuestions({
  grade,
  subject,
  chapter,
  difficulty,
  format,
  status,
  keyword,
  excludeIds,
  shuffle = true,
  limit = 50,
  offset = 0
} = {}) {
  const store = loadQuestionStore();
  let list = [...store];

  // Exclude previously answered or exposed questions to prevent repetition
  if (excludeIds) {
    const excludeSet = new Set((Array.isArray(excludeIds) ? excludeIds : String(excludeIds).split(',')).map(s => String(s).trim()));
    list = list.filter(q => !excludeSet.has(String(q.id || q._id)));
  }

  if (grade) {
    const g = parseInt(grade, 10);
    list = list.filter(q => q.gradeLevel === g);
  }

  if (subject) {
    const s = subject.toLowerCase();
    list = list.filter(q => q.subject.toLowerCase().includes(s));
  }

  if (chapter) {
    const c = chapter.toLowerCase();
    list = list.filter(q => (q.chapter || '').toLowerCase().includes(c));
  }

  if (difficulty) {
    const d = difficulty.toUpperCase();
    list = list.filter(q => q.difficulty === d);
  }

  if (format) {
    const f = format.toUpperCase();
    list = list.filter(q => q.questionFormat === f);
  }

  if (status) {
    const st = status.toUpperCase();
    list = list.filter(q => q.editorialVerificationStatus === st);
  }

  if (keyword) {
    const kw = keyword.toLowerCase();
    list = list.filter(q =>
      (q.questionStatement || '').toLowerCase().includes(kw) ||
      (q.chapter || '').toLowerCase().includes(kw) ||
      (q.topic || '').toLowerCase().includes(kw) ||
      (q.learningObjective || '').toLowerCase().includes(kw)
    );
  }

  // Deduplicate by ID and question text
  const seenIds = new Set();
  const seenTexts = new Set();
  list = list.filter(q => {
    const id = String(q.id || q._id || '');
    const txt = (q.questionStatement || q.questionText || '').toLowerCase().trim();
    if (id && seenIds.has(id)) return false;
    if (txt && seenTexts.has(txt)) return false;
    if (id) seenIds.add(id);
    if (txt) seenTexts.add(txt);
    return true;
  });

  if (shuffle) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
  }

  const total = list.length;
  const paginated = list.slice(offset, offset + limit);

  return {
    total,
    offset,
    limit,
    questions: paginated
  };
}

/**
 * Editorial Review Action (Approve, Reject, Publish, Archive)
 */
function reviewQuestion(id, { reviewerId, status, remarks }) {
  const store = loadQuestionStore();
  const q = store.find(item => item.id === id);
  if (!q) {
    const err = new Error(`Question with id ${id} not found.`);
    err.status = 404;
    throw err;
  }

  if (!VALID_EDITORIAL_STATUSES.includes(status.toUpperCase())) {
    const err = new Error(`Invalid status. Must be one of: ${VALID_EDITORIAL_STATUSES.join(', ')}`);
    err.status = 400;
    throw err;
  }

  q.editorialVerificationStatus = status.toUpperCase();
  q.reviewedBy = reviewerId || 'Greenwood Editorial Board';
  q.reviewedAt = new Date().toISOString();
  if (remarks) q.reviewRemarks = remarks;
  q.updatedAt = new Date().toISOString();

  saveQuestionStore();
  return q;
}

/**
 * Get Question Bank Coverage & Progress Report across Grades 1-12
 */
function getCoverageReport() {
  const store = loadQuestionStore();
  const report = {
    totalQuestions: store.length,
    byGrade: {},
    byFormat: {},
    byStatus: {},
    byDifficulty: {},
    verifiedPercentage: 0
  };

  for (let g = 1; g <= 12; g++) {
    report.byGrade[g] = { total: 0, published: 0, pendingReview: 0, subjects: {} };
  }

  VALID_QUESTION_FORMATS.forEach(f => { report.byFormat[f] = 0; });
  VALID_EDITORIAL_STATUSES.forEach(s => { report.byStatus[s] = 0; });
  VALID_DIFFICULTIES.forEach(d => { report.byDifficulty[d] = 0; });

  let verifiedCount = 0;

  store.forEach(q => {
    const g = q.gradeLevel;
    if (report.byGrade[g]) {
      report.byGrade[g].total++;
      if (q.editorialVerificationStatus === 'PUBLISHED' || q.editorialVerificationStatus === 'APPROVED') {
        report.byGrade[g].published++;
      } else if (q.editorialVerificationStatus === 'PENDING_REVIEW') {
        report.byGrade[g].pendingReview++;
      }
      const subj = q.subject || 'General';
      report.byGrade[g].subjects[subj] = (report.byGrade[g].subjects[subj] || 0) + 1;
    }

    if (report.byFormat[q.questionFormat] !== undefined) {
      report.byFormat[q.questionFormat]++;
    }

    if (report.byStatus[q.editorialVerificationStatus] !== undefined) {
      report.byStatus[q.editorialVerificationStatus]++;
    }

    if (report.byDifficulty[q.difficulty] !== undefined) {
      report.byDifficulty[q.difficulty]++;
    }

    if (q.editorialVerificationStatus === 'PUBLISHED' || q.editorialVerificationStatus === 'APPROVED') {
      verifiedCount++;
    }
  });

  report.verifiedPercentage = store.length > 0 ? Math.round((verifiedCount / store.length) * 100) : 0;
  return report;
}

/**
 * Validated Batch Import (JSON or CSV)
 */
function importQuestions(items, author = 'Curriculum Coordinator') {
  if (!Array.isArray(items)) {
    throw new Error('Import data must be an array of question records.');
  }

  const results = {
    importedCount: 0,
    failedCount: 0,
    errors: [],
    importedItems: []
  };

  items.forEach((item, idx) => {
    const validation = validateQuestion(item);
    if (!validation.isValid) {
      results.failedCount++;
      results.errors.push({ line: idx + 1, errors: validation.errors });
    } else {
      try {
        const created = createQuestion(item, author);
        results.importedCount++;
        results.importedItems.push(created);
      } catch (err) {
        results.failedCount++;
        results.errors.push({ line: idx + 1, errors: [err.message] });
      }
    }
  });

  return results;
}

module.exports = {
  VALID_QUESTION_FORMATS,
  VALID_DIFFICULTIES,
  VALID_EDITORIAL_STATUSES,
  validateQuestion,
  createQuestion,
  searchQuestions,
  reviewQuestion,
  getCoverageReport,
  importQuestions
};
