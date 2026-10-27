// Rich Mock Data Store for Live Pitch, Investor Showcases & Full SaaS Flow

export const MOCK_STUDENT = {
  id: "student_demo_01",
  fullName: "Rahul Sharma",
  rollNumber: "G7-B-24",
  grade: 7,
  school: "Kendriya Vidyalaya No. 1",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  role: "student",
  joinedClasses: ["MATH-7B", "SCI-7A"]
};

export const MOCK_TEACHER = {
  id: "teacher_demo_01",
  fullName: "Mrs. Anita Rao",
  role: "teacher",
  designation: "Lead STEM Educator (Grade 7)",
  school: "District Model Secondary School",
  createdClasses: ["MATH-7B", "SCI-7A", "ALG-8C"]
};

export const MOCK_CLASSES = [
  {
    id: "MATH-7B",
    name: "Class 7-B Mathematics",
    subject: "Math",
    grade: 7,
    joinCode: "MATH-7B",
    teacherName: "Mrs. Anita Rao",
    studentCount: 28,
    activeAssignments: 2,
    avgMastery: 67,
    weakTopics: ["Fractions", "Ratios"]
  },
  {
    id: "SCI-7A",
    name: "Class 7-A General Science",
    subject: "Science",
    grade: 7,
    joinCode: "SCI-7A",
    teacherName: "Mrs. Anita Rao",
    studentCount: 30,
    activeAssignments: 1,
    avgMastery: 72,
    weakTopics: ["Photosynthesis", "Acids & Bases"]
  },
  {
    id: "ALG-8C",
    name: "Class 8-C Advanced Algebra",
    subject: "Math",
    grade: 8,
    joinCode: "ALG-8C",
    teacherName: "Mrs. Anita Rao",
    studentCount: 25,
    activeAssignments: 3,
    avgMastery: 81,
    weakTopics: ["Quadratic Equations"]
  }
];

export const MOCK_TOPICS_MATH = [
  { topic: "Fractions", attempted: 34, correct: 17, mastery: 50, status: "needs_focus", level: "easy", initialScore: 40, postScore: 82 },
  { topic: "Decimals", attempted: 28, correct: 18, mastery: 64, status: "in_progress", level: "medium", initialScore: 55, postScore: 78 },
  { topic: "Algebra Basics", attempted: 45, correct: 39, mastery: 87, status: "mastered", level: "hard", initialScore: 60, postScore: 90 },
  { topic: "Ratios & Proportions", attempted: 20, correct: 11, mastery: 55, status: "needs_focus", level: "easy", initialScore: 45, postScore: 75 },
  { topic: "Geometry & Angles", attempted: 24, correct: 20, mastery: 83, status: "mastered", level: "hard", initialScore: 65, postScore: 88 }
];

export const MOCK_TOPICS_SCIENCE = [
  { topic: "Photosynthesis", attempted: 30, correct: 15, mastery: 50, status: "needs_focus", level: "easy", initialScore: 42, postScore: 80 },
  { topic: "Forces & Motion", attempted: 26, correct: 21, mastery: 81, status: "mastered", level: "hard", initialScore: 58, postScore: 85 },
  { topic: "Cell Structure", attempted: 35, correct: 23, mastery: 66, status: "in_progress", level: "medium", initialScore: 50, postScore: 76 },
  { topic: "States of Matter", attempted: 20, correct: 17, mastery: 85, status: "mastered", level: "hard", initialScore: 62, postScore: 90 },
  { topic: "Acids, Bases & Salts", attempted: 18, correct: 9, mastery: 50, status: "needs_focus", level: "easy", initialScore: 38, postScore: 74 }
];

export const MOCK_SCORE_TREND = [
  { week: "Week 1", score: 48, questions: 15 },
  { week: "Week 2", score: 56, questions: 38 },
  { week: "Week 3", score: 64, questions: 62 },
  { week: "Week 4", score: 71, questions: 95 },
  { week: "Week 5", score: 79, questions: 124 },
  { week: "Week 6", score: 84, questions: 156 }
];

export const MOCK_STUDENT_WEEKLY_HOURS = [
  { day: "Mon", hours: 0.8 },
  { day: "Tue", hours: 1.2 },
  { day: "Wed", hours: 0.5 },
  { day: "Thu", hours: 1.5 },
  { day: "Fri", hours: 1.1 },
  { day: "Sat", hours: 2.0 },
  { day: "Sun", hours: 1.4 }
];

export const MOCK_PRE_VS_POST_MATH = [
  { topic: "Fractions", preTest: 40, postTest: 82, gain: 42 },
  { topic: "Decimals", preTest: 55, postTest: 78, gain: 23 },
  { topic: "Algebra Basics", preTest: 60, postTest: 90, gain: 30 },
  { topic: "Ratios", preTest: 45, postTest: 75, gain: 30 },
  { topic: "Geometry", preTest: 65, postTest: 88, gain: 23 }
];

export const MOCK_RECENT_ACTIVITY = [
  { id: 1, type: "practice", topic: "Fractions", subject: "Math", score: "8/10", time: "2 hours ago", status: "improved" },
  { id: 2, type: "practice", topic: "Decimals", subject: "Math", score: "7/10", time: "Yesterday", status: "steady" },
  { id: 3, type: "test", topic: "Timed Unit Quiz", subject: "Math", score: "80%", time: "3 days ago", status: "completed" },
  { id: 4, type: "mastery", topic: "Algebra Basics", subject: "Math", score: "Mastered 🔥", time: "4 days ago", status: "mastered" },
  { id: 5, type: "pre_test", topic: "Diagnostic Baseline", subject: "Math", score: "48%", time: "3 weeks ago", status: "baseline" }
];

export const MOCK_TESTS = [
  {
    id: "test-01",
    title: "Unit 2: Fractions & Ratios Timed Assessment",
    subject: "Math",
    assignedBy: "Mrs. Anita Rao",
    classId: "MATH-7B",
    questionCount: 10,
    durationMinutes: 15,
    dueDate: "Tomorrow at 5:00 PM",
    status: "active",
    description: "Evaluates procedural fluency in adding unlike fractions, cross-multiplication, and proportional reasoning.",
    questions: [
      {
        id: "t_1",
        difficulty: "easy",
        levelName: "Level 1: Foundational",
        questionText: "Simplify the fraction 15/45 to its lowest terms.",
        options: ["1/3", "3/9", "5/15", "1/4"],
        correctIndex: 0,
        topic: "Fractions",
        explanation: "Divide both 15 and 45 by their greatest common divisor 15: (15 ÷ 15) / (45 ÷ 15) = 1/3.",
        steps: [
          { step: "Step 1: Identify Greatest Common Divisor (GCD)", desc: "Find factors of 15 (1, 3, 5, 15) and 45 (1, 3, 5, 9, 15, 45). The highest common factor is 15." },
          { step: "Step 2: Divide Numerator & Denominator", desc: "15 ÷ 15 = 1 (Numerator), 45 ÷ 15 = 3 (Denominator)." },
          { step: "Step 3: Resulting Irreducible Fraction", desc: "The simplest irreducible form is 1/3." }
        ],
        conceptSummary: "Simplifying a fraction means dividing both top and bottom by their Greatest Common Factor (GCF) without altering the proportional value.",
        keyTakeaway: "Always check if the smaller number divides evenly into the larger number first!"
      },
      {
        id: "t_2",
        difficulty: "medium",
        levelName: "Level 2: Procedural",
        questionText: "Calculate: 3/5 + 1/10 and express as a fraction in simplest form.",
        options: ["4/15", "7/10", "4/10", "3/10"],
        correctIndex: 1,
        topic: "Fractions",
        explanation: "Convert 3/5 to the common denominator 10: 3/5 × 2/2 = 6/10. Then add: 6/10 + 1/10 = 7/10.",
        steps: [
          { step: "Step 1: Find Least Common Denominator (LCD)", desc: "Multiples of 5: 5, 10, 15... Multiples of 10: 10, 20... LCD is 10." },
          { step: "Step 2: Create Equivalent Fractions", desc: "Multiply 3/5 by (2/2) to obtain 6/10." },
          { step: "Step 3: Direct Numerator Addition", desc: "Add numerators: 6 + 1 = 7. Denominator remains 10: 7/10." }
        ],
        conceptSummary: "You cannot add numerators directly when denominators differ because the piece sizes are unequal. Converting to an LCD standardizes the unit size.",
        keyTakeaway: "Match denominators first, then combine numerators."
      },
      {
        id: "t_3",
        difficulty: "hard",
        levelName: "Level 3: Multi-Step",
        questionText: "Evaluate: (3/4) ÷ (1/2) and convert to mixed number.",
        options: ["3/8", "1 1/2 (3/2)", "6/4", "1/4"],
        correctIndex: 1,
        topic: "Fractions",
        explanation: "Dividing by a fraction is multiplying by its reciprocal: (3/4) × (2/1) = 6/4 = 3/2 = 1 1/2.",
        steps: [
          { step: "Step 1: Invert the Divisor (Find Reciprocal)", desc: "Flip 1/2 upside down to become 2/1." },
          { step: "Step 2: Multiply Numerators and Denominators", desc: "(3 × 2) / (4 × 1) = 6/4." },
          { step: "Step 3: Simplify and Convert to Mixed Number", desc: "Divide by 2: 3/2 = 1 whole and 1/2 leftover (1 1/2)." }
        ],
        conceptSummary: "Dividing by a fraction answers: 'How many halves fit into three-quarters?' Since one half (2/4) fits in 3/4 with 1/4 remaining, the answer is 1.5.",
        keyTakeaway: "Keep, Change, Flip: Keep 1st, Change to Multiply, Flip 2nd."
      },
      {
        id: "t_4",
        difficulty: "very_hard",
        levelName: "Level 4: Conceptual Mastery",
        questionText: "A water tank is 2/3 full. After 15 liters are drained, it remains 1/2 full. What is the total capacity of the tank?",
        options: ["60 Liters", "90 Liters", "75 Liters", "45 Liters"],
        correctIndex: 1,
        topic: "Algebraic Fractions",
        explanation: "Difference: (2/3) - (1/2) = (4/6) - (3/6) = 1/6 of tank. If 1/6 = 15 L, Total capacity = 15 × 6 = 90 Liters.",
        steps: [
          { step: "Step 1: Set Up Algebraic Equation", desc: "Let Total Capacity = C. Drained portion = (2/3)C - (1/2)C = 15 L." },
          { step: "Step 2: Subtract Fractions with LCD 6", desc: "(4/6)C - (3/6)C = (1/6)C = 15 L." },
          { step: "Step 3: Solve for C", desc: "Multiply both sides by 6: C = 15 × 6 = 90 Liters." }
        ],
        conceptSummary: "Rate and word problems require translating verbal ratios into fractional parts of an unknown whole variable.",
        keyTakeaway: "Find the fractional delta first, then scale by the denominator."
      }
    ]
  },
  {
    id: "test-02",
    title: "Diagnostic Baseline Assessment (Science)",
    subject: "Science",
    assignedBy: "School Curriculum Board",
    classId: "SCI-7A",
    questionCount: 15,
    durationMinutes: 20,
    dueDate: "Completed",
    status: "completed",
    score: 52,
    description: "Evaluates foundational understanding of Photosynthesis, Cell Structures, and Newton's Laws."
  },
  {
    id: "test-03",
    title: "Mid-Term Summative Growth Exam (Math)",
    subject: "Math",
    assignedBy: "Mrs. Anita Rao",
    classId: "MATH-7B",
    questionCount: 15,
    durationMinutes: 25,
    dueDate: "In 5 days",
    status: "upcoming",
    description: "Standardized parallel post-test measuring individual growth delta against the diagnostic baseline."
  }
];

export const MOCK_QUESTIONS_POOL = {
  Fractions: [
    {
      id: "f_1",
      topic: "Fractions",
      difficulty: "easy",
      questionText: "What is 1/4 + 2/4?",
      options: ["3/8", "3/4", "2/8", "1/2"],
      correctIndex: 1,
      explanation: "Since denominators are identical (4), add the numerators directly: 1 + 2 = 3. Thus, 1/4 + 2/4 = 3/4."
    },
    {
      id: "f_2",
      topic: "Fractions",
      difficulty: "easy",
      questionText: "Which of the following is equivalent to 1/2?",
      options: ["2/5", "3/6", "4/7", "5/9"],
      correctIndex: 1,
      explanation: "Dividing both numerator and denominator of 3/6 by 3 yields 1/2."
    },
    {
      id: "f_3",
      topic: "Fractions",
      difficulty: "medium",
      questionText: "Calculate: 1/3 + 1/6",
      options: ["2/9", "1/2", "2/6", "3/6"],
      correctIndex: 1,
      explanation: "Convert 1/3 to the common denominator 6: 1/3 = 2/6. Then 2/6 + 1/6 = 3/6, which reduces to 1/2."
    },
    {
      id: "f_4",
      topic: "Fractions",
      difficulty: "medium",
      questionText: "Multiply: 3/4 × 2/3",
      options: ["5/7", "6/12", "1/2", "9/8"],
      correctIndex: 2,
      explanation: "Multiply numerators (3 × 2 = 6) and denominators (4 × 3 = 12). 6/12 reduces directly to 1/2."
    },
    {
      id: "f_5",
      topic: "Fractions",
      difficulty: "hard",
      questionText: "Evaluate: (2/3) ÷ (4/9)",
      options: ["8/27", "3/2 (1.5)", "6/12", "2/3"],
      correctIndex: 1,
      explanation: "Dividing fractions is multiplying by the reciprocal: 2/3 × 9/4 = 18/12 = 3/2 (or 1 1/2)."
    },
    {
      id: "f_6",
      topic: "Fractions",
      difficulty: "hard",
      questionText: "A recipe needs 3/4 cup of sugar. If you make 2 1/2 times the recipe, how much sugar is needed?",
      options: ["1 7/8 cups", "2 1/4 cups", "1 3/8 cups", "3 cups"],
      correctIndex: 0,
      explanation: "Convert 2 1/2 to 5/2. Multiply 3/4 × 5/2 = 15/8 = 1 7/8 cups."
    },
    {
      id: "f_7",
      topic: "Fractions",
      difficulty: "very_hard",
      questionText: "Pipe A fills a tank in 3 hours, while Pipe B fills it in 6 hours. If both pipes run together, what fraction of the tank is filled per hour, and how long does it take?",
      options: ["1/2 per hour, 2 hours total", "1/9 per hour, 9 hours total", "3/8 per hour, 2.5 hours total", "1/4 per hour, 4 hours total"],
      correctIndex: 0,
      explanation: "Rate of A = 1/3 tank/hr. Rate of B = 1/6 tank/hr. Combined rate = 1/3 + 1/6 = 2/6 + 1/6 = 3/6 = 1/2 tank/hr. Total time = 1 ÷ (1/2) = 2 hours."
    }
  ],
  Photosynthesis: [
    {
      id: "p_1",
      topic: "Photosynthesis",
      difficulty: "easy",
      questionText: "Which gas is absorbed by plant leaves during photosynthesis?",
      options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
      correctIndex: 1,
      explanation: "Plants absorb atmospheric Carbon Dioxide (CO2) through microscopic leaf pores called stomata."
    },
    {
      id: "p_2",
      topic: "Photosynthesis",
      difficulty: "easy",
      questionText: "What green pigment inside plant cells captures solar energy?",
      options: ["Hemoglobin", "Chlorophyll", "Carotene", "Melanin"],
      correctIndex: 1,
      explanation: "Chlorophyll is the light-absorbing pigment located in the thylakoid membranes of chloroplasts."
    },
    {
      id: "p_3",
      topic: "Photosynthesis",
      difficulty: "medium",
      questionText: "What are the primary chemical products of oxygenic photosynthesis?",
      options: ["Water and CO2", "Glucose and Oxygen", "Nitrogen and Starch", "CO2 and Cellulose"],
      correctIndex: 1,
      explanation: "The overall formula: 6CO2 + 6H2O + Sunlight -> C6H12O6 (Glucose) + 6O2 (Oxygen)."
    },
    {
      id: "p_4",
      topic: "Photosynthesis",
      difficulty: "hard",
      questionText: "Where in the chloroplast do the light-independent (Calvin) reactions occur?",
      options: ["Mitochondria", "Chloroplast Stroma", "Thylakoid Lumen", "Outer Membrane"],
      correctIndex: 1,
      explanation: "The light reactions happen in thylakoids, whereas the Calvin Cycle takes place in the fluid stroma."
    },
    {
      id: "p_5",
      topic: "Photosynthesis",
      difficulty: "very_hard",
      questionText: "Why do C4 and CAM plants fix carbon into 4-carbon oxaloacetate prior to the Calvin Cycle?",
      options: ["To prevent photorespiration in hot/arid conditions", "To bypass ATP consumption completely", "To generate glucose directly in roots", "To synthesize chlorophyll faster"],
      correctIndex: 0,
      explanation: "C4 and CAM adaptations minimize photorespiration catalyzed by RuBisCO under high temperatures by concentrating CO2 around RuBisCO."
    }
  ],
  "Algebra Basics": [
    {
      id: "a_1",
      topic: "Algebra Basics",
      difficulty: "easy",
      questionText: "Solve for x: x + 9 = 21",
      options: ["11", "12", "13", "30"],
      correctIndex: 1,
      explanation: "Subtract 9 from both sides: x = 21 - 9 = 12."
    },
    {
      id: "a_2",
      topic: "Algebra Basics",
      difficulty: "medium",
      questionText: "Solve for y: 4y - 7 = 17",
      options: ["5", "6", "7", "8"],
      correctIndex: 1,
      explanation: "Add 7: 4y = 24. Divide by 4: y = 24 ÷ 4 = 6."
    },
    {
      id: "a_3",
      topic: "Algebra Basics",
      difficulty: "hard",
      questionText: "Solve for x: 3(2x - 1) = 4x + 9",
      options: ["3", "4", "6", "8"],
      correctIndex: 2,
      explanation: "Distribute 3: 6x - 3 = 4x + 9. 2x = 12 => x = 6."
    },
    {
      id: "a_4",
      topic: "Algebra Basics",
      difficulty: "very_hard",
      questionText: "A mother is 4 times as old as her daughter. In 16 years, she will be twice as old as her daughter. How old is the daughter now?",
      options: ["6 years", "8 years", "10 years", "12 years"],
      correctIndex: 1,
      explanation: "4d + 16 = 2(d + 16) => 4d + 16 = 2d + 32 => 2d = 16 => d = 8."
    }
  ],
  "Forces & Motion": [
    {
      id: "fm_1",
      topic: "Forces & Motion",
      difficulty: "easy",
      questionText: "According to Newton's First Law, an object at rest will remain at rest unless acted upon by:",
      options: ["Balanced forces", "An unbalanced net force", "Gravity alone", "Frictional velocity"],
      correctIndex: 1,
      explanation: "Inertia keeps velocity constant unless an external unbalanced force acts on it."
    },
    {
      id: "fm_2",
      topic: "Forces & Motion",
      difficulty: "medium",
      questionText: "A cart with mass m = 15 kg accelerates at a = 3 m/s². What net force was applied?",
      options: ["5 N", "18 N", "45 N", "135 N"],
      correctIndex: 2,
      explanation: "F = m · a = 15 kg × 3 m/s² = 45 N."
    },
    {
      id: "fm_3",
      topic: "Forces & Motion",
      difficulty: "hard",
      questionText: "When a swimmer pushes water backward with their hands, they propel forward. Which physical law explains this?",
      options: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Law of Gravitation"],
      correctIndex: 2,
      explanation: "Newton's Third Law: for every action force, there is an equal and opposite reaction force."
    },
    {
      id: "fm_4",
      topic: "Forces & Motion",
      difficulty: "very_hard",
      questionText: "A 1000 kg car traveling at 20 m/s brakes to a stop in 4 seconds. What was the average braking force?",
      options: ["2000 N", "5000 N", "8000 N", "10000 N"],
      correctIndex: 1,
      explanation: "a = 20 / 4 = 5 m/s². F = 1000 × 5 = 5000 N."
    }
  ],
  "Cell Structure": [
    {
      id: "c_1",
      topic: "Cell Structure",
      difficulty: "easy",
      questionText: "Which organelle is known as the 'powerhouse of the cell' for producing ATP?",
      options: ["Ribosome", "Mitochondrion", "Endoplasmic Reticulum", "Lysosome"],
      correctIndex: 1,
      explanation: "Mitochondria produce cellular ATP through aerobic cellular respiration."
    },
    {
      id: "c_2",
      topic: "Cell Structure",
      difficulty: "medium",
      questionText: "Which structure is present in plant cells but absent in animal cells?",
      options: ["Cell membrane", "Cell wall", "Mitochondria", "Nucleus"],
      correctIndex: 1,
      explanation: "Plant cells possess a rigid outer cellulose cell wall."
    },
    {
      id: "c_3",
      topic: "Cell Structure",
      difficulty: "hard",
      questionText: "What mechanism allows water to diffuse across a semi-permeable membrane down its water potential?",
      options: ["Active Transport", "Osmosis", "Endocytosis", "Phagocytosis"],
      correctIndex: 1,
      explanation: "Osmosis is the passive diffusion of water through a selectively permeable membrane."
    },
    {
      id: "c_4",
      topic: "Cell Structure",
      difficulty: "very_hard",
      questionText: "What happens to a red blood cell placed into pure distilled water?",
      options: ["It shrivels", "It swells and bursts (lysis)", "It stays unchanged", "It creates a cell wall"],
      correctIndex: 1,
      explanation: "Lacking a rigid cell wall, the animal cell takes in water by osmosis and lyses (bursts)."
    }
  ]
};

export const MOCK_LIBRARY_RESOURCES = [
  {
    id: "res-01",
    title: "Visual Guide to Adding Fractions with Unlike Denominators",
    subject: "Math",
    topic: "Fractions",
    difficulty: "Foundational",
    type: "Article",
    readTime: "6 min read",
    thumbnail: "📐",
    summary: "Understand why we need common denominators using pizza slice visual models and step-by-step LCM finding.",
    body: `
# Adding Fractions with Different Denominators

When adding fractions like **1/3** and **1/6**, why can't we simply add 1+1 and 3+6?

Imagine cutting one cake into 3 large pieces and another cake into 6 small pieces. One large piece is not equal to one small piece! To add them fairly, we must cut both cakes into pieces of the exact same size.

### Step 1: Find the Least Common Denominator (LCD)
List the multiples of each denominator:
* Multiples of 3: 3, **6**, 9, 12...
* Multiples of 6: **6**, 12, 18...

The smallest shared multiple is **6**.

### Step 2: Convert to Equivalent Fractions
Multiply the numerator and denominator of 1/3 by 2:
$$1/3 \\times (2/2) = 2/6$$

### Step 3: Add the Numerators
Now that piece sizes match:
$$2/6 + 1/6 = 3/6$$

### Step 4: Simplify to Lowest Terms
Divide top and bottom by 3:
$$3/6 = 1/2$$
    `
  },
  {
    id: "res-02",
    title: "Why Dividing by a Fraction Means Multiplying by the Reciprocal",
    subject: "Math",
    topic: "Fractions",
    difficulty: "Intermediate",
    type: "Step-by-Step Guide",
    readTime: "4 min read",
    thumbnail: "📖",
    summary: "An intuitive explanation of reciprocal division: How many 1/4 pound burgers can you make from 3 pounds of beef?",
    body: "Step-by-Step Guide: Demystifying reciprocal division with visual grouping models and worked examples."
  },
  {
    id: "res-03",
    title: "Algebraic Equations Cheat Sheet & Balance Rules",
    subject: "Math",
    topic: "Algebra Basics",
    difficulty: "Intermediate",
    type: "Formula Sheet",
    readTime: "Quick Reference",
    thumbnail: "📋",
    summary: "The essential balance scale rules: Whatever you do to one side of the equal sign, you must do to the other.",
    formulas: [
      { name: "Addition Inverse", rule: "x - a = b => x = b + a", tip: "Add 'a' to both sides" },
      { name: "Multiplication Inverse", rule: "a · x = b => x = b / a", tip: "Divide both sides by 'a'" },
      { name: "Distributive Law", rule: "a(b + c) = ab + ac", tip: "Multiply 'a' across every term inside" },
      { name: "Two-Step Linear", rule: "ax + b = c => ax = c - b => x = (c - b) / a", tip: "Isolate variable term first" }
    ]
  },
  {
    id: "res-04",
    title: "Light Reactions vs. Calvin Cycle: The Photosynthesis Engine",
    subject: "Science",
    topic: "Photosynthesis",
    difficulty: "Intermediate",
    type: "Article",
    readTime: "7 min read",
    thumbnail: "🌱",
    summary: "Explore how chlorophyll captures photons to split water, generate ATP, and fuel glucose synthesis in the stroma.",
    body: `
# The Two Stages of Photosynthesis

Photosynthesis is nature's solar power factory. It occurs in two distinct but interdependent stages inside plant chloroplasts:

### 1. The Light-Dependent Reactions (Thylakoids)
* **Input:** Sunlight + Water ($H_2O$)
* **Mechanism:** Chlorophyll molecules absorb light energy, splitting water molecules into protons and releasing Oxygen ($O_2$) into the air.
* **Output:** Chemical battery energy stored in ATP and NADPH.

### 2. The Light-Independent Reactions / Calvin Cycle (Stroma)
* **Input:** Carbon Dioxide ($CO_2$) from atmospheric air + ATP/NADPH energy.
* **Mechanism:** Enzymes fix inorganic carbon into high-energy bonds in the fluid chloroplast stroma.
* **Output:** Glucose ($C_6H_{12}O_6$), the primary fuel for plant growth.
    `
  },
  {
    id: "res-05",
    title: "Newton's Laws of Motion: Everyday Physics Walkthrough",
    subject: "Science",
    topic: "Forces & Motion",
    difficulty: "Foundational",
    type: "Step-by-Step Guide",
    readTime: "5 min read",
    thumbnail: "🚀",
    summary: "From seatbelts to rocket propulsion: Visual breakdown of Inertia, F=ma, and Action-Reaction.",
    body: "Step-by-Step Guide: In-depth physics explanations demonstrating Newton's three laws through everyday experiments."
  },
  {
    id: "res-06",
    title: "Essential Physics Formulas & Metric Units Sheet",
    subject: "Science",
    topic: "Forces & Motion",
    difficulty: "Foundational",
    type: "Formula Sheet",
    readTime: "Quick Reference",
    thumbnail: "⚡",
    summary: "Quick reference card for Speed, Velocity, Acceleration, Force, and Standard SI units.",
    formulas: [
      { name: "Speed / Velocity", rule: "v = d / t", tip: "Distance (m) divided by time (s)" },
      { name: "Newton's Second Law", rule: "F = m · a", tip: "Force (Newtons) = mass (kg) × acceleration (m/s²)" },
      { name: "Work Done", rule: "W = F · d", tip: "Work (Joules) = Force (N) × displacement (m)" },
      { name: "Weight vs Mass", rule: "W = m · g", tip: "Weight is gravity force; on Earth g ≈ 9.8 m/s²" }
    ]
  }
];

export const MOCK_SOLUTIONS = [
  {
    id: "sol-01",
    title: "Dividing Fractions: (2/3) ÷ (4/9)",
    subject: "Math",
    topic: "Fractions",
    difficulty: "hard",
    problemText: "Evaluate: (2/3) ÷ (4/9) and express your answer in simplest form.",
    steps: [
      {
        stepNumber: 1,
        title: "Recognize Fraction Division as Reciprocal Multiplication",
        explanation: "Dividing by a fraction is mathematically identical to multiplying by its reciprocal (flipping the second fraction upside down).",
        math: "(2/3) ÷ (4/9)  -->  (2/3) × (9/4)"
      },
      {
        stepNumber: 2,
        title: "Multiply the Numerators and Denominators",
        explanation: "Multiply top numbers together and bottom numbers together:",
        math: "(2 × 9) / (3 × 4) = 18 / 12"
      },
      {
        stepNumber: 3,
        title: "Simplify to Lowest Terms",
        explanation: "Find the greatest common factor between 18 and 12, which is 6. Divide both by 6:",
        math: "18 ÷ 6 = 3   and   12 ÷ 6 = 2   =>   3/2 (or 1 1/2)"
      }
    ],
    relatedTopic: "Fractions"
  },
  {
    id: "sol-02",
    title: "Solving Two-Step Linear Equations: 3(2x - 1) = 4x + 9",
    subject: "Math",
    topic: "Algebra Basics",
    difficulty: "hard",
    problemText: "Solve for x in the equation: 3(2x - 1) = 4x + 9",
    steps: [
      {
        stepNumber: 1,
        title: "Distribute the 3 Across the Parentheses",
        explanation: "Multiply 3 by 2x, and 3 by -1:",
        math: "6x - 3 = 4x + 9"
      },
      {
        stepNumber: 2,
        title: "Move All Variable Terms to One Side",
        explanation: "Subtract 4x from both sides of the equation:",
        math: "6x - 4x - 3 = 9   =>   2x - 3 = 9"
      },
      {
        stepNumber: 3,
        title: "Isolate the Variable Term",
        explanation: "Add 3 to both sides to eliminate the -3:",
        math: "2x = 9 + 3   =>   2x = 12"
      },
      {
        stepNumber: 4,
        title: "Solve for x",
        explanation: "Divide both sides by 2:",
        math: "x = 12 / 2 = 6"
      }
    ],
    relatedTopic: "Algebra Basics"
  },
  {
    id: "sol-03",
    title: "Net Force Calculation: Mass and Acceleration",
    subject: "Science",
    topic: "Forces & Motion",
    difficulty: "hard",
    problemText: "A 5 kg mass accelerates at 4 m/s². What net force was applied?",
    steps: [
      {
        stepNumber: 1,
        title: "Identify Known Values",
        explanation: "Mass m = 5 kg; Acceleration a = 4 m/s².",
        math: "m = 5 kg,  a = 4 m/s²"
      },
      {
        stepNumber: 2,
        title: "Apply Newton's Second Law Formula",
        explanation: "Use F = m × a:",
        math: "F = 5 kg × 4 m/s² = 20 N (Newtons)"
      }
    ],
    relatedTopic: "Forces & Motion"
  }
];

export const MOCK_CLASS_ROSTER = [
  { id: "s1", name: "Rahul Sharma", roll: "G7-01", grade: 7, preScore: 48, postScore: 82, practiced: 156, status: "on_track", weakCount: 1, weakTopics: ["Decimals"], joinDate: "Aug 12, 2026", lastActive: "10 mins ago" },
  { id: "s2", name: "Priya Patel", roll: "G7-02", grade: 7, preScore: 36, postScore: 74, practiced: 142, status: "on_track", weakCount: 1, weakTopics: ["Fractions"], joinDate: "Aug 14, 2026", lastActive: "2 hours ago" },
  { id: "s3", name: "Aarav Kumar", roll: "G7-03", grade: 7, preScore: 42, postScore: 50, practiced: 24, status: "needs_attention", weakCount: 3, weakTopics: ["Algebra", "Ratios", "Fractions"], joinDate: "Aug 15, 2026", lastActive: "3 days ago" },
  { id: "s4", name: "Ananya Singh", roll: "G7-04", grade: 7, preScore: 68, postScore: 92, practiced: 180, status: "on_track", weakCount: 0, weakTopics: [], joinDate: "Aug 10, 2026", lastActive: "Yesterday" },
  { id: "s5", name: "Vikram Das", roll: "G7-05", grade: 7, preScore: 30, postScore: 44, practiced: 32, status: "at_risk", weakCount: 4, weakTopics: ["Decimals", "Geometry", "Fractions", "Ratios"], joinDate: "Aug 18, 2026", lastActive: "5 days ago" },
  { id: "s6", name: "Meera Nair", roll: "G7-06", grade: 7, preScore: 55, postScore: 86, practiced: 135, status: "on_track", weakCount: 1, weakTopics: ["Geometry"], joinDate: "Aug 12, 2026", lastActive: "1 day ago" }
];

export const MOCK_HISTOGRAM_DISTRIBUTION = [
  { range: "0 - 40%", count: 2, label: "Foundational Gap", color: "#F43F5E" },
  { range: "41 - 60%", count: 6, label: "Needs Practice", color: "#F59E0B" },
  { range: "61 - 80%", count: 12, label: "Proficient", color: "#6366F1" },
  { range: "81 - 100%", count: 8, label: "Mastered", color: "#10B981" }
];

export const MOCK_CLASS_HEATMAP = [
  { topic: "Fractions", avgAccuracy: 52, status: "needs_focus", strugglingCount: 14 },
  { topic: "Decimals", avgAccuracy: 64, status: "in_progress", strugglingCount: 9 },
  { topic: "Algebra Basics", avgAccuracy: 78, status: "in_progress", strugglingCount: 5 },
  { topic: "Ratios & Proportions", avgAccuracy: 58, status: "needs_focus", strugglingCount: 12 },
  { topic: "Geometry & Angles", avgAccuracy: 84, status: "mastered", strugglingCount: 2 }
];

export const MOCK_CHAT_HISTORY = [
  {
    id: "m_1",
    sender: "ai",
    text: "Hello Rahul! I'm your AdaptIQ AI Tutor. I see you're working on Fractions and Decimals today. What question or concept would you like to break down together?",
    timestamp: "10:30 AM"
  }
];
