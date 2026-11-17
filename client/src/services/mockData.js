// Rich Mock Data Store for Greenwood Public School Demonstration Edition

export const MOCK_ADMIN = {
  id: "admin_demo_01",
  fullName: "Dr. K. S. Raman",
  email: "principal@greenwoodgurgaon.com",
  role: "admin",
  designation: "Principal & Academic Director",
  school: "Greenwood Public School (CBSE)",
  avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  board: "CBSE"
};

export const MOCK_STUDENT_G3 = {
  id: "student_g3_01",
  fullName: "Alex Rivera",
  rollNumber: "GPS-03-042",
  grade: 3,
  gradeLevel: 3,
  section: "3-A",
  school: "Greenwood Public School",
  educationalStage: "Primary",
  subjects: ["Mathematics", "English", "EVS"],
  email: "alex.rivera.03@greenwoodgurgaon.com",
  avatarUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
  role: "student",
  joinedClasses: ["GPS3AM", "GPS3AE", "GPS3AV"],
  bktMastery: 82.0,
  streakDays: 4,
  overdueReviews: 1
};

export const MOCK_STUDENT_G7 = {
  id: "student_g7_01",
  fullName: "Aarav Patel",
  rollNumber: "GPS-07-001",
  grade: 7,
  gradeLevel: 7,
  section: "7-A",
  school: "Greenwood Public School",
  educationalStage: "Middle",
  subjects: ["Mathematics", "Science", "English"],
  email: "aarav.patel.07@greenwoodgurgaon.com",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  role: "student",
  joinedClasses: ["GPS7AM", "GPS7AS", "GPS7BE"],
  bktMastery: 76.5,
  streakDays: 6,
  overdueReviews: 2
};

export const MOCK_STUDENT_G10 = {
  id: "student_g10_01",
  fullName: "Diya Sharma",
  rollNumber: "GPS-10-015",
  grade: 10,
  gradeLevel: 10,
  section: "10-A",
  school: "Greenwood Public School",
  educationalStage: "Secondary",
  subjects: ["Mathematics", "Science", "English"],
  email: "diya.sharma.10@greenwoodgurgaon.com",
  avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  role: "student",
  joinedClasses: ["GPS10M", "GPS10S", "GPS10E"],
  bktMastery: 85.4,
  streakDays: 9,
  overdueReviews: 0
};

export const DEMO_STUDENTS = {
  g3: MOCK_STUDENT_G3,
  g7: MOCK_STUDENT_G7,
  g10: MOCK_STUDENT_G10
};

export const MOCK_STUDENT = MOCK_STUDENT_G7;

export const MOCK_TEACHER = {
  id: "teacher_demo_01",
  fullName: "Mrs. Ananya Sharma",
  email: "sharma.math@greenwoodgurgaon.com",
  role: "teacher",
  designation: "Head of Mathematics Department",
  school: "Greenwood Public School (CBSE)",
  createdClasses: ["GPS7AM", "GPS8AM", "GPS9AM"],
  avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
};

export const MOCK_PARENT = {
  id: "parent_demo_01",
  fullName: "Mr. Vikram Patel",
  email: "vikram.patel@greenwoodgurgaon.com",
  role: "parent",
  designation: "Verified Parent / Guardian",
  school: "Greenwood Public School (CBSE)",
  phone: "+91 98110 54321",
  linkedChildren: [
    {
      studentId: "student_demo_01",
      fullName: "Aarav Patel",
      rollNumber: "GPS-07-001",
      grade: 7,
      section: "7-A",
      attendanceRate: 96,
      overallMastery: 88,
      recentScore: "88% (STEM Pre-Test)",
      streakDays: 6,
      teacherRemarks: "Aarav demonstrates strong analytical aptitude in Mathematics and Science. Shows high consistency in daily practice sessions.",
      teacherName: "Mrs. Ananya Sharma",
      subjectBreakdowns: [
        { subject: "Mathematics", score: 92, status: "Advanced Mastery" },
        { subject: "Science", score: 86, status: "Proficient" },
        { subject: "English", score: 84, status: "Proficient" }
      ],
      upcomingAssessments: [
        { title: "Class VII STEM Diagnostic Post-Test", date: "2026-11-28", type: "Summative" },
        { title: "Chapter 3 Linear Equations Quiz", date: "2026-12-05", type: "Formative" }
      ]
    }
  ],
  avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
};

export const MOCK_CLASSES = [
  {
    id: "cls-aps-7a",
    name: "Grade 7-A Mathematics (Pilot)",
    subject: "Mathematics",
    grade: 7,
    section: "7-A",
    joinCode: "GPS7M",
    teacherName: "Mrs. Ananya Sharma",
    studentCount: 20,
    activeAssignments: 2,
    avgMastery: 82,
    weakTopics: ["Linear Equations", "Rational Numbers"]
  }
];

export const MOCK_STUDENTS_ROSTER = [
  { id: "s-1", rollNumber: "GPS-07-001", name: "Aarav Patel", pin: "1234", grade: 7, section: "7-A", mastery: 84, status: "Active" },
  { id: "s-2", rollNumber: "GPS-07-002", name: "Priya Sharma", pin: "4321", grade: 7, section: "7-A", mastery: 91, status: "Active" },
  { id: "s-3", rollNumber: "GPS-07-003", name: "Rohan Gupta", pin: "5678", grade: 7, section: "7-A", mastery: 72, status: "Active" },
  { id: "s-4", rollNumber: "GPS-07-004", name: "Ananya Verma", pin: "8765", grade: 7, section: "7-A", mastery: 85, status: "Active" },
  { id: "s-5", rollNumber: "GPS-07-005", name: "Kabir Mehta", pin: "9012", grade: 7, section: "7-A", mastery: 70, status: "Active" },
  { id: "s-6", rollNumber: "GPS-07-006", name: "Sanya Reddy", pin: "2109", grade: 7, section: "7-A", mastery: 88, status: "Active" },
  { id: "s-7", rollNumber: "GPS-07-007", name: "Devansh Singh", pin: "3456", grade: 7, section: "7-A", mastery: 82, status: "Active" },
  { id: "s-8", rollNumber: "GPS-07-008", name: "Ishita Joshi", pin: "6543", grade: 7, section: "7-A", mastery: 76, status: "Active" },
  { id: "s-9", rollNumber: "GPS-07-009", name: "Vivaan Kapoor", pin: "7890", grade: 7, section: "7-A", mastery: 89, status: "Active" },
  { id: "s-10", rollNumber: "GPS-07-010", name: "Diya Mukherjee", pin: "0987", grade: 7, section: "7-A", mastery: 92, status: "Active" },
  { id: "s-11", rollNumber: "GPS-07-011", name: "Arjun Nair", pin: "1122", grade: 7, section: "7-A", mastery: 79, status: "Active" },
  { id: "s-12", rollNumber: "GPS-07-012", name: "Meera Iyer", pin: "2233", grade: 7, section: "7-A", mastery: 86, status: "Active" },
  { id: "s-13", rollNumber: "GPS-07-013", name: "Siddharth Rao", pin: "3344", grade: 7, section: "7-A", mastery: 80, status: "Active" },
  { id: "s-14", rollNumber: "GPS-07-014", name: "Tanvi Bhatia", pin: "4455", grade: 7, section: "7-A", mastery: 94, status: "Active" },
  { id: "s-15", rollNumber: "GPS-07-015", name: "Aditya Sen", pin: "5566", grade: 7, section: "7-A", mastery: 74, status: "Active" },
  { id: "s-16", rollNumber: "GPS-07-016", name: "Riya Chawla", pin: "6677", grade: 7, section: "7-A", mastery: 87, status: "Active" },
  { id: "s-17", rollNumber: "GPS-07-017", name: "Varun Kulkarni", pin: "7788", grade: 7, section: "7-A", mastery: 81, status: "Active" },
  { id: "s-18", rollNumber: "GPS-07-018", name: "Sneha Pillai", pin: "8899", grade: 7, section: "7-A", mastery: 90, status: "Active" },
  { id: "s-19", rollNumber: "GPS-07-019", name: "Pranav Mishra", pin: "9900", grade: 7, section: "7-A", mastery: 78, status: "Active" },
  { id: "s-20", rollNumber: "GPS-07-020", name: "Kavya Saxena", pin: "1010", grade: 7, section: "7-A", mastery: 85, status: "Active" }
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
  "id": "aps-g7-math-diag-2026",
  "title": "Greenwood Public School — Grade 7 Mathematics Diagnostic Assessment",
  "type": "Diagnostic",
  "category": "Diagnostic Assessments",
  "gradeLevel": 7,
  "subject": "Mathematics",
  "assignedBy": "Mrs. Ananya Sharma • Mathematics Department",
  "classId": "cls-aps-7a",
  "questionCount": 20,
  "durationMinutes": 20,
  "dueDate": "Mandatory Diagnostic Pilot",
  "status": "active",
  "isFeatured": true,
  "description": "Official institutional diagnostic assessment measuring foundational readiness across 7 CBSE Mathematics topics (Integers, Fractions & Decimals, Rational Numbers, Simple Equations, Algebraic Expressions, Geometry & Mensuration, Ratio & Proportion).",
  "questions": [
    {
      "id": "aps-g7-m-int-01",
      "subject": "Mathematics",
      "topic": "Integers",
      "difficulty": "easy",
      "levelName": "Level 1: Foundational",
      "questionText": "Calculate the exact value of: (-15) + (-28) - (-43)",
      "options": [
        "0",
        "-86",
        "-30",
        "56"
      ],
      "correctIndex": 0,
      "explanation": "Subtracting a negative number is equivalent to adding: (-15) + (-28) + 43 = -43 + 43 = 0.",
      "steps": [
        {
          "step": "Step 1: Simplify double signs",
          "desc": "-(-43) becomes +43. Expression is (-15) + (-28) + 43",
          "math": "(-15) + (-28) + 43"
        },
        {
          "step": "Step 2: Add negative terms",
          "desc": "(-15) + (-28) = -43",
          "math": "-43 + 43"
        },
        {
          "step": "Step 3: Combine with positive term",
          "desc": "-43 + 43 = 0",
          "math": "0"
        }
      ],
      "conceptSummary": "Two negatives make a positive: -(-a) = +a. Combine same-sign integers first.",
      "misconception": "Sign reversal error with subtraction of negative integers."
    },
    {
      "id": "aps-g7-m-int-02",
      "subject": "Mathematics",
      "topic": "Integers",
      "difficulty": "medium",
      "levelName": "Level 2: Intermediate",
      "questionText": "Evaluate: (-20) × (-5) ÷ (-4)",
      "options": [
        "-25",
        "25",
        "-100",
        "50"
      ],
      "correctIndex": 0,
      "explanation": "(-20) × (-5) = +100. Then +100 ÷ (-4) = -25. Positive divided by negative is negative.",
      "steps": [
        {
          "step": "Step 1: Multiply first two factors",
          "desc": "(-20) × (-5) = +100",
          "math": "100 ÷ (-4)"
        },
        {
          "step": "Step 2: Divide by -4",
          "desc": "100 / (-4) = -25",
          "math": "-25"
        }
      ],
      "conceptSummary": "Negative × Negative = Positive; Positive ÷ Negative = Negative.",
      "misconception": "Sign propagation error across chained multiplication and division."
    },
    {
      "id": "aps-g7-m-int-03",
      "subject": "Mathematics",
      "topic": "Integers",
      "difficulty": "hard",
      "levelName": "Level 3: Advanced",
      "questionText": "At 6:00 AM, the temperature in Manali was -4°C. By noon, it rose by 9°C, and by midnight, it dropped by 11°C. What was the temperature at midnight?",
      "options": [
        "-6°C",
        "2°C",
        "-2°C",
        "-16°C"
      ],
      "correctIndex": 0,
      "explanation": "Initial = -4°C. Noon = -4 + 9 = +5°C. Midnight = 5 - 11 = -6°C.",
      "steps": [
        {
          "step": "Step 1: Calculate noon temperature",
          "desc": "-4°C + 9°C = +5°C",
          "math": "+5°C"
        },
        {
          "step": "Step 2: Calculate midnight temperature",
          "desc": "5°C - 11°C = -6°C",
          "math": "-6°C"
        }
      ],
      "conceptSummary": "Rises correspond to positive additions; drops correspond to subtractions.",
      "misconception": "Directional integer confusion in real-world temperature deltas."
    },
    {
      "id": "aps-g7-m-frac-01",
      "subject": "Mathematics",
      "topic": "Fractions and Decimals",
      "difficulty": "easy",
      "levelName": "Level 1: Foundational",
      "questionText": "Evaluate: (2/5) × (15/16) and express in simplest form.",
      "options": [
        "3/8",
        "6/16",
        "30/80",
        "1/4"
      ],
      "correctIndex": 0,
      "explanation": "Cross-cancel common factors: 2 and 16 divide by 2 (1/8); 15 and 5 divide by 5 (3/1). Multiply: (1 × 3)/(1 × 8) = 3/8.",
      "steps": [
        {
          "step": "Step 1: Simplify across diagonals",
          "desc": "2/16 = 1/8 and 15/5 = 3/1",
          "math": "(1/1) × (3/8)"
        },
        {
          "step": "Step 2: Multiply simplified numerators and denominators",
          "desc": "1 × 3 = 3; 1 × 8 = 8",
          "math": "3/8"
        }
      ],
      "conceptSummary": "Divide numerator and denominator by greatest common divisor before multiplying.",
      "misconception": "Omitting irreducible form reduction."
    },
    {
      "id": "aps-g7-m-frac-02",
      "subject": "Mathematics",
      "topic": "Fractions and Decimals",
      "difficulty": "medium",
      "levelName": "Level 2: Intermediate",
      "questionText": "Evaluate: (7/12) ÷ (14/9)",
      "options": [
        "3/8",
        "8/3",
        "49/54",
        "2/3"
      ],
      "correctIndex": 0,
      "explanation": "Dividing by a fraction is multiplying by its reciprocal: (7/12) × (9/14) = (7/14) × (9/12) = (1/2) × (3/4) = 3/8.",
      "steps": [
        {
          "step": "Step 1: Take reciprocal of divisor",
          "desc": "Reciprocal of 14/9 is 9/14",
          "math": "(7/12) × (9/14)"
        },
        {
          "step": "Step 2: Cross cancel 7 with 14 and 9 with 12",
          "desc": "7/14 = 1/2; 9/12 = 3/4",
          "math": "(1 × 3) / (4 × 2) = 3/8"
        }
      ],
      "conceptSummary": "a/b ÷ c/d = a/b × d/c.",
      "misconception": "Inverting dividend instead of divisor during fraction division."
    },
    {
      "id": "aps-g7-m-frac-03",
      "subject": "Mathematics",
      "topic": "Fractions and Decimals",
      "difficulty": "medium",
      "levelName": "Level 2: Intermediate",
      "questionText": "What is 2.4 × 0.35?",
      "options": [
        "0.84",
        "8.4",
        "0.084",
        "0.74"
      ],
      "correctIndex": 0,
      "explanation": "24 × 35 = 840. Total decimal places = 1 + 2 = 3 decimal places. 0.840 = 0.84.",
      "steps": [
        {
          "step": "Step 1: Multiply whole numbers",
          "desc": "24 × 35 = 840",
          "math": "840"
        },
        {
          "step": "Step 2: Position decimal point",
          "desc": "1 place in 2.4 + 2 places in 0.35 = 3 places",
          "math": "0.840 = 0.84"
        }
      ],
      "conceptSummary": "Multiply ignoring decimals, then count total digits to right of decimals in both factors.",
      "misconception": "Decimal placement summation error in multiplication."
    },
    {
      "id": "aps-g7-m-frac-04",
      "subject": "Mathematics",
      "topic": "Fractions and Decimals",
      "difficulty": "hard",
      "levelName": "Level 3: Advanced",
      "questionText": "A car covers a distance of 89.1 km in 2.2 hours. What is the average distance covered by it in 1 hour?",
      "options": [
        "40.5 km",
        "40.05 km",
        "44.55 km",
        "39.5 km"
      ],
      "correctIndex": 0,
      "explanation": "Distance in 1 hour = 89.1 ÷ 2.2 = 891 ÷ 22 = 40.5 km.",
      "steps": [
        {
          "step": "Step 1: Set up division",
          "desc": "89.1 / 2.2 = 891 / 22",
          "math": "891 / 22"
        },
        {
          "step": "Step 2: Carry out division",
          "desc": "891 / 22 = 40 with remainder 11. 11/22 = 0.5. Total = 40.5",
          "math": "40.5"
        }
      ],
      "conceptSummary": "Speed = Distance / Time. Multiply numerator and denominator by 10 to clear decimals.",
      "misconception": "Division of decimals by decimals decimal-shift error."
    },
    {
      "id": "aps-g7-m-rat-01",
      "subject": "Mathematics",
      "topic": "Rational Numbers",
      "difficulty": "easy",
      "levelName": "Level 1: Foundational",
      "questionText": "Write the rational number (-24)/36 in standard irreducible form.",
      "options": [
        "-2/3",
        "2/3",
        "-4/6",
        "-12/18"
      ],
      "correctIndex": 0,
      "explanation": "Divide both numerator and denominator by their HCF (12): (-24 ÷ 12) / (36 ÷ 12) = -2/3.",
      "steps": [
        {
          "step": "Step 1: Find HCF of 24 and 36",
          "desc": "HCF(24, 36) = 12",
          "math": "12"
        },
        {
          "step": "Step 2: Divide numerator and denominator by 12",
          "desc": "-24/12 = -2; 36/12 = 3",
          "math": "-2/3"
        }
      ],
      "conceptSummary": "A rational number is in standard form when HCF(|p|, |q|) = 1 and denominator is positive.",
      "misconception": "Incomplete reduction to lowest terms."
    },
    {
      "id": "aps-g7-m-rat-02",
      "subject": "Mathematics",
      "topic": "Rational Numbers",
      "difficulty": "medium",
      "levelName": "Level 2: Intermediate",
      "questionText": "Evaluate: (-3/5) + (7/10)",
      "options": [
        "1/10",
        "-1/10",
        "4/15",
        "10/10"
      ],
      "correctIndex": 0,
      "explanation": "LCM of 5 and 10 is 10. (-3/5) = (-6/10). (-6/10) + (7/10) = (-6 + 7)/10 = 1/10.",
      "steps": [
        {
          "step": "Step 1: Find LCM(5, 10)",
          "desc": "LCM is 10",
          "math": "10"
        },
        {
          "step": "Step 2: Convert to like rational numbers",
          "desc": "(-3 × 2)/(5 × 2) = -6/10",
          "math": "-6/10 + 7/10"
        },
        {
          "step": "Step 3: Add numerators",
          "desc": "-6 + 7 = +1",
          "math": "1/10"
        }
      ],
      "conceptSummary": "Equalize denominators using LCM of denominators.",
      "misconception": "Adding denominators instead of finding LCM."
    },
    {
      "id": "aps-g7-m-rat-03",
      "subject": "Mathematics",
      "topic": "Rational Numbers",
      "difficulty": "hard",
      "levelName": "Level 3: Advanced",
      "questionText": "What number should be added to -5/8 so as to get 5/9?",
      "options": [
        "85/72",
        "5/72",
        "-85/72",
        "10/17"
      ],
      "correctIndex": 0,
      "explanation": "Let number be x. -5/8 + x = 5/9 => x = 5/9 - (-5/8) = 5/9 + 5/8 = (40 + 45)/72 = 85/72.",
      "steps": [
        {
          "step": "Step 1: Form equation",
          "desc": "x = 5/9 - (-5/8) = 5/9 + 5/8",
          "math": "5/9 + 5/8"
        },
        {
          "step": "Step 2: Find LCM(9, 8)",
          "desc": "LCM is 72",
          "math": "72"
        },
        {
          "step": "Step 3: Combine fractions",
          "desc": "(5 × 8 + 5 × 9) / 72 = (40 + 45) / 72 = 85/72",
          "math": "85/72"
        }
      ],
      "conceptSummary": "Transpose -5/8 to right hand side as +5/8.",
      "misconception": "Transposition sign change failure."
    },
    {
      "id": "aps-g7-m-eq-01",
      "subject": "Mathematics",
      "topic": "Simple Linear Equations",
      "difficulty": "easy",
      "levelName": "Level 1: Foundational",
      "questionText": "Solve for x: 3x - 7 = 14",
      "options": [
        "7",
        "21",
        "5",
        "6"
      ],
      "correctIndex": 0,
      "explanation": "Add 7 to both sides: 3x = 14 + 7 = 21. Divide by 3: x = 21 / 3 = 7.",
      "steps": [
        {
          "step": "Step 1: Add 7 to both sides",
          "desc": "3x = 14 + 7 = 21",
          "math": "3x = 21"
        },
        {
          "step": "Step 2: Divide both sides by 3",
          "desc": "x = 21 / 3 = 7",
          "math": "x = 7"
        }
      ],
      "conceptSummary": "Isolate variable term using addition, then divide by coefficient.",
      "misconception": "Inverse operation confusion during transposition."
    },
    {
      "id": "aps-g7-m-eq-02",
      "subject": "Mathematics",
      "topic": "Simple Linear Equations",
      "difficulty": "medium",
      "levelName": "Level 2: Intermediate",
      "questionText": "Solve for m: 4(m + 3) = 28",
      "options": [
        "4",
        "7",
        "10",
        "1"
      ],
      "correctIndex": 0,
      "explanation": "Divide both sides by 4: m + 3 = 7. Subtract 3 from both sides: m = 7 - 3 = 4.",
      "steps": [
        {
          "step": "Step 1: Divide by 4",
          "desc": "m + 3 = 28 / 4 = 7",
          "math": "m + 3 = 7"
        },
        {
          "step": "Step 2: Subtract 3",
          "desc": "m = 7 - 3 = 4",
          "math": "m = 4"
        }
      ],
      "conceptSummary": "Divide through by factor or expand bracket first.",
      "misconception": "Failure to distribute multiplier across all terms inside parentheses."
    },
    {
      "id": "aps-g7-m-eq-03",
      "subject": "Mathematics",
      "topic": "Simple Linear Equations",
      "difficulty": "hard",
      "levelName": "Level 3: Advanced",
      "questionText": "The perimeter of a rectangle is 48 cm. Its length is 4 cm more than its breadth. What is the breadth of the rectangle?",
      "options": [
        "10 cm",
        "14 cm",
        "12 cm",
        "8 cm"
      ],
      "correctIndex": 0,
      "explanation": "Let breadth = b. Length = b + 4. Perimeter = 2(l + b) = 2(b + 4 + b) = 2(2b + 4) = 4b + 8. 4b + 8 = 48 => 4b = 40 => b = 10 cm.",
      "steps": [
        {
          "step": "Step 1: Write equation",
          "desc": "2(b + b + 4) = 48",
          "math": "2(2b + 4) = 48"
        },
        {
          "step": "Step 2: Divide by 2",
          "desc": "2b + 4 = 24",
          "math": "2b = 20"
        },
        {
          "step": "Step 3: Solve for b",
          "desc": "b = 20 / 2 = 10 cm",
          "math": "b = 10 cm"
        }
      ],
      "conceptSummary": "Perimeter of rectangle = 2(length + breadth).",
      "misconception": "Omitting perimeter factor of 2 in algebraic representation."
    },
    {
      "id": "aps-g7-m-alg-01",
      "subject": "Mathematics",
      "topic": "Algebraic Expressions",
      "difficulty": "easy",
      "levelName": "Level 1: Foundational",
      "questionText": "Simplify the algebraic expression by combining like terms: 7x - 4y + 2x + 9y",
      "options": [
        "9x + 5y",
        "9x - 5y",
        "5x + 5y",
        "14xy"
      ],
      "correctIndex": 0,
      "explanation": "Group like terms: (7x + 2x) + (-4y + 9y) = 9x + 5y.",
      "steps": [
        {
          "step": "Step 1: Group x terms",
          "desc": "7x + 2x = 9x",
          "math": "9x"
        },
        {
          "step": "Step 2: Group y terms",
          "desc": "-4y + 9y = +5y",
          "math": "+5y"
        },
        {
          "step": "Step 3: Combine",
          "desc": "9x + 5y",
          "math": "9x + 5y"
        }
      ],
      "conceptSummary": "Like terms having identical variable factors can be added or subtracted.",
      "misconception": "Conflating addition of terms with multiplication of variables."
    },
    {
      "id": "aps-g7-m-alg-02",
      "subject": "Mathematics",
      "topic": "Algebraic Expressions",
      "difficulty": "medium",
      "levelName": "Level 2: Intermediate",
      "questionText": "If a = 2 and b = -3, find the numerical value of: 3a² - 2ab + b²",
      "options": [
        "33",
        "15",
        "21",
        "27"
      ],
      "correctIndex": 0,
      "explanation": "3(2)² - 2(2)(-3) + (-3)² = 3(4) - (-12) + 9 = 12 + 12 + 9 = 33.",
      "steps": [
        {
          "step": "Step 1: Substitute a=2 and b=-3",
          "desc": "3(2)² - 2(2)(-3) + (-3)²",
          "math": "3(4) - 2(-6) + 9"
        },
        {
          "step": "Step 2: Evaluate products",
          "desc": "12 - (-12) + 9 = 12 + 12 + 9",
          "math": "24 + 9"
        },
        {
          "step": "Step 3: Sum",
          "desc": "24 + 9 = 33",
          "math": "33"
        }
      ],
      "conceptSummary": "Substitute values with brackets to preserve signs when squaring negatives.",
      "misconception": "Squaring negative numbers without brackets yielding negative results."
    },
    {
      "id": "aps-g7-m-alg-03",
      "subject": "Mathematics",
      "topic": "Algebraic Expressions",
      "difficulty": "medium",
      "levelName": "Level 2: Intermediate",
      "questionText": "Subtract (3a - 4b + 5c) from (7a + 2b - 3c)",
      "options": [
        "4a + 6b - 8c",
        "4a - 2b + 2c",
        "10a - 2b - 8c",
        "4a + 6b + 2c"
      ],
      "correctIndex": 0,
      "explanation": "(7a + 2b - 3c) - (3a - 4b + 5c) = 7a - 3a + 2b - (-4b) - 3c - 5c = 4a + 6b - 8c.",
      "steps": [
        {
          "step": "Step 1: Set up subtraction with brackets",
          "desc": "(7a + 2b - 3c) - (3a - 4b + 5c)",
          "math": "7a + 2b - 3c - 3a + 4b - 5c"
        },
        {
          "step": "Step 2: Group like terms",
          "desc": "(7a - 3a) + (2b + 4b) + (-3c - 5c)",
          "math": "4a + 6b - 8c"
        }
      ],
      "conceptSummary": "Subtracting requires changing the sign of every term in the subtrahend.",
      "misconception": "Incomplete sign distribution during polynomial subtraction."
    },
    {
      "id": "aps-g7-m-geo-01",
      "subject": "Mathematics",
      "topic": "Geometry and Basic Mensuration",
      "difficulty": "easy",
      "levelName": "Level 1: Foundational",
      "questionText": "Two supplementary angles are in the ratio 4:5. What is the measure of the smaller angle?",
      "options": [
        "80°",
        "100°",
        "40°",
        "90°"
      ],
      "correctIndex": 0,
      "explanation": "Supplementary angles sum to 180°. Let angles be 4x and 5x. 4x + 5x = 9x = 180° => x = 20°. Smaller angle = 4(20°) = 80°.",
      "steps": [
        {
          "step": "Step 1: Sum ratio parts",
          "desc": "4x + 5x = 9x = 180°",
          "math": "9x = 180°"
        },
        {
          "step": "Step 2: Find unit value x",
          "desc": "x = 180° / 9 = 20°",
          "math": "x = 20°"
        },
        {
          "step": "Step 3: Multiply smaller ratio part",
          "desc": "4 × 20° = 80°",
          "math": "80°"
        }
      ],
      "conceptSummary": "Supplementary angles sum to 180°.",
      "misconception": "Conflating complementary (90°) and supplementary (180°) angles."
    },
    {
      "id": "aps-g7-m-geo-02",
      "subject": "Mathematics",
      "topic": "Geometry and Basic Mensuration",
      "difficulty": "hard",
      "levelName": "Level 3: Advanced",
      "questionText": "A circular copper wire of radius r = 14 cm is cut and rebent into the exact shape of a square. Find the length of each side of the square. (Take π = 22/7)",
      "options": [
        "22 cm",
        "44 cm",
        "88 cm",
        "11 cm"
      ],
      "correctIndex": 0,
      "explanation": "Perimeter of square = Circumference of circle. Circumference = 2πr = 2 × (22/7) × 14 = 88 cm. Side of square = 88 / 4 = 22 cm.",
      "steps": [
        {
          "step": "Step 1: Compute circumference of circle",
          "desc": "C = 2 × (22/7) × 14 = 2 × 22 × 2 = 88 cm",
          "math": "88 cm"
        },
        {
          "step": "Step 2: Equate to perimeter of square",
          "desc": "4 × side = 88 cm",
          "math": "4s = 88"
        },
        {
          "step": "Step 3: Solve for side",
          "desc": "side = 88 / 4 = 22 cm",
          "math": "22 cm"
        }
      ],
      "conceptSummary": "Rebending wire preserves boundary length (perimeter = circumference).",
      "misconception": "Conflating boundary length conservation with area conservation."
    },
    {
      "id": "aps-g7-m-ratprop-01",
      "subject": "Mathematics",
      "topic": "Ratio and Proportion",
      "difficulty": "medium",
      "levelName": "Level 2: Intermediate",
      "questionText": "If A : B = 3 : 4 and B : C = 8 : 9, what is the ratio of A : C in simplest irreducible form?",
      "options": [
        "2 : 3",
        "3 : 4",
        "24 : 36",
        "1 : 2"
      ],
      "correctIndex": 0,
      "explanation": "A/C = (A/B) × (B/C) = (3/4) × (8/9) = (3 × 8) / (4 × 9) = 24/36 = 2/3 (or 2:3).",
      "steps": [
        {
          "step": "Step 1: Multiply fraction representations",
          "desc": "(3/4) × (8/9)",
          "math": "(3 × 8)/(4 × 9) = 24/36"
        },
        {
          "step": "Step 2: Reduce by dividing by 12",
          "desc": "24/12 = 2; 36/12 = 3",
          "math": "2/3"
        }
      ],
      "conceptSummary": "Multiply ratios: (A/B) × (B/C) = A/C.",
      "misconception": "Additive error in ratio compounding."
    },
    {
      "id": "aps-g7-m-ratprop-02",
      "subject": "Mathematics",
      "topic": "Ratio and Proportion",
      "difficulty": "medium",
      "levelName": "Level 2: Intermediate",
      "questionText": "The price of an NCERT Mathematics textbook was increased from ₹400 to ₹460. What is the percentage increase in price?",
      "options": [
        "15%",
        "12%",
        "13.04%",
        "18%"
      ],
      "correctIndex": 0,
      "explanation": "Increase = 460 - 400 = ₹60. Percentage increase = (Increase / Original Price) × 100% = (60 / 400) × 100% = 15%.",
      "steps": [
        {
          "step": "Step 1: Find absolute increase",
          "desc": "460 - 400 = ₹60",
          "math": "₹60"
        },
        {
          "step": "Step 2: Calculate percentage over initial price",
          "desc": "(60 / 400) × 100 = 60 / 4 = 15%",
          "math": "15%"
        }
      ],
      "conceptSummary": "Percentage increase = (Absolute Increase / Base Original Price) × 100.",
      "misconception": "Using final value instead of initial base value in denominator of percentage change."
    }
  ]
},
  {
    id: "aps-g7-diagnostic-pre",
    title: "Greenwood Public School — Grade 7 STEM Diagnostic Pre-Test",
    type: "Diagnostic",
    category: "Diagnostic Assessments",
    gradeLevel: 7,
    subject: "STEM (Math & Science)",
    assignedBy: "Academic Directorate, Greenwood Public School",
    classId: "APS-7A",
    questionCount: 12,
    durationMinutes: 25,
    dueDate: "Mandatory Baseline",
    status: "active",
    isFeatured: true,
    description: "Official institutional diagnostic baseline measuring foundational readiness across 6 Mathematics competencies and 6 Science competencies for Class VII (CBSE 2026–2027).",
    questions: [
      {
        id: "diag_m1",
        subject: "Math",
        topic: "Integers",
        difficulty: "easy",
        levelName: "Level 1: Foundational",
        questionText: "Calculate the value of: (-15) + (-28) - (-43)",
        options: ["0", "-86", "-30", "56"],
        correctIndex: 0,
        explanation: "Subtracting a negative number is equivalent to adding: (-15) + (-28) + 43 = -43 + 43 = 0.",
        conceptSummary: "Minus a negative equals plus; combine same-sign integers first."
      },
      {
        id: "diag_m2",
        subject: "Math",
        topic: "Fractions & Decimals",
        difficulty: "easy",
        levelName: "Level 1: Foundational",
        questionText: "Evaluate: (2/5) × (15/16) and express in simplest form.",
        options: ["3/8", "6/16", "30/80", "1/4"],
        correctIndex: 0,
        explanation: "Cross-cancel common factors: 2 and 16 divide by 2 (1/8); 15 and 5 divide by 5 (3/1). Multiply: (1 × 3) / (1 × 8) = 3/8.",
        conceptSummary: "Cross-cancel common divisors before multiplying to maintain reduced form."
      },
      {
        id: "diag_m3",
        subject: "Math",
        topic: "Lines & Angles",
        difficulty: "medium",
        levelName: "Level 2: Procedural",
        questionText: "Two supplementary angles are in the ratio 4:5. Find the measure of the smaller angle.",
        options: ["80°", "100°", "40°", "90°"],
        correctIndex: 0,
        explanation: "Supplementary angles sum to 180°. Let angles be 4x and 5x. 4x + 5x = 9x = 180° => x = 20°. Smaller angle = 4(20°) = 80°.",
        conceptSummary: "Supplementary angles sum to 180°; complementary angles sum to 90°."
      },
      {
        id: "diag_m4",
        subject: "Math",
        topic: "Algebraic Expressions",
        difficulty: "medium",
        levelName: "Level 2: Procedural",
        questionText: "Simplify the algebraic expression: 5x - [3x - (2x - 4)]",
        options: ["4x - 4", "4x + 4", "6x - 4", "x + 4"],
        correctIndex: 0,
        explanation: "Clear inner parentheses: 3x - 2x + 4 = x + 4. Next: 5x - (x + 4) = 5x - x - 4 = 4x - 4.",
        conceptSummary: "Distribute negative signs across every term when removing brackets."
      },
      {
        id: "diag_m5",
        subject: "Math",
        topic: "Ratio & Proportion",
        difficulty: "hard",
        levelName: "Level 3: Multi-Step",
        questionText: "If A:B = 3:4 and B:C = 8:9, what is the ratio of A:C in simplest irreducible form?",
        options: ["2:3", "3:4", "24:36", "1:2"],
        correctIndex: 0,
        explanation: "Multiply ratios: (A/B) × (B/C) = A/C = (3/4) × (8/9) = (3 × 8) / (4 × 9) = 24/36 = 2/3 (or 2:3).",
        conceptSummary: "Chain ratios by compounding their fractional fractions."
      },
      {
        id: "diag_m6",
        subject: "Math",
        topic: "Perimeter & Area",
        difficulty: "hard",
        levelName: "Level 4: Conceptual",
        questionText: "A circular wire of radius r = 14 cm is bent into the shape of a square. Find the length of each side of the square. (Use π = 22/7)",
        options: ["22 cm", "44 cm", "88 cm", "11 cm"],
        correctIndex: 0,
        explanation: "Circumference of circle = Perimeter of square. C = 2πr = 2 × (22/7) × 14 = 88 cm. Side of square = 88 / 4 = 22 cm.",
        conceptSummary: "Bending preserves boundary perimeter/circumference, not internal area."
      },
      {
        id: "diag_s1",
        subject: "Science",
        topic: "Nutrition in Plants",
        difficulty: "easy",
        levelName: "Level 1: Foundational",
        questionText: "Which microscopic pores on plant leaf surfaces regulate gas exchange during photosynthesis and transpiration?",
        options: ["Stomata", "Chloroplasts", "Xylem vessels", "Guard nuclei"],
        correctIndex: 0,
        explanation: "Stomata are specialized microscopic pores flanked by guard cells that open and close to facilitate CO2 and O2 exchange.",
        conceptSummary: "Stomata control transpirational pull and photosynthesis gas intake."
      },
      {
        id: "diag_s2",
        subject: "Science",
        topic: "Heat & Temperature",
        difficulty: "easy",
        levelName: "Level 1: Foundational",
        questionText: "In which mode of heat transfer can thermal energy travel across a complete vacuum without requiring any physical medium?",
        options: ["Radiation", "Conduction", "Convection", "Advection"],
        correctIndex: 0,
        explanation: "Radiation transfers heat via electromagnetic infrared waves and does not require particles or a material medium.",
        conceptSummary: "Radiation traverses vacuum (e.g. solar warmth reaching Earth)."
      },
      {
        id: "diag_s3",
        subject: "Science",
        topic: "Acids, Bases & Salts",
        difficulty: "medium",
        levelName: "Level 2: Procedural",
        questionText: "What color does blue litmus paper turn when dipped into a test tube of dilute Hydrochloric Acid (HCl)?",
        options: ["Red", "Blue", "Green", "Colorless"],
        correctIndex: 0,
        explanation: "Acids turn moist blue litmus paper red. Bases turn red litmus paper blue.",
        conceptSummary: "Litmus indicator mnemonic: Acid turns Blue to Red (ABR)."
      },
      {
        id: "diag_s4",
        subject: "Science",
        topic: "Motion & Time",
        difficulty: "medium",
        levelName: "Level 2: Procedural",
        questionText: "A Haryana Roadways bus travels 180 km in 3 hours. Express its average speed in standard SI units (m/s).",
        options: ["16.67 m/s", "60 m/s", "25 m/s", "12.5 m/s"],
        correctIndex: 0,
        explanation: "Speed = 180 km / 3 h = 60 km/h. Convert to m/s: 60 × (5/18) = 300/18 ≈ 16.67 m/s.",
        conceptSummary: "Multiply km/h by 5/18 to convert directly to meters per second (m/s)."
      },
      {
        id: "diag_s5",
        subject: "Science",
        topic: "Electric Current & Effects",
        difficulty: "hard",
        levelName: "Level 3: Multi-Step",
        questionText: "Which physical property of an electrical safety fuse wire protects household circuits from accidental short-circuits and electrical fires?",
        options: ["Low melting point and high resistance", "High melting point and zero resistance", "Superconductivity at room temperature", "High magnetic permeability"],
        correctIndex: 0,
        explanation: "A fuse wire has high electrical resistance and a low melting point so excessive current generates Joule heating (H = I²Rt) that melts the wire quickly.",
        conceptSummary: "Joule heating melts the safety fuse wire to break the circuit upon overcurrent."
      },
      {
        id: "diag_s6",
        subject: "Science",
        topic: "Light",
        difficulty: "hard",
        levelName: "Level 4: Conceptual",
        questionText: "An object is placed between the Pole (P) and Focus (F) of a concave spherical mirror. What are the characteristics of the image formed?",
        options: ["Virtual, erect, and magnified behind the mirror", "Real, inverted, and magnified in front of the mirror", "Real, inverted, and diminished at Focus", "Virtual, inverted, and same size"],
        correctIndex: 0,
        explanation: "When an object lies between P and F of a concave mirror, reflected rays diverge and appear to meet behind the mirror, creating a virtual, erect, and enlarged image.",
        conceptSummary: "Concave mirrors act as dental/shaving magnifying mirrors only within focal distance."
      }
    ]
  },
  {
    id: "aps-g7-growth-post",
    title: "Greenwood Public School — Grade 7 STEM Summative Growth Post-Test",
    type: "Diagnostic",
    category: "Diagnostic Assessments",
    gradeLevel: 7,
    subject: "STEM (Math & Science)",
    assignedBy: "Academic Directorate, Greenwood Public School",
    classId: "APS-7A",
    questionCount: 12,
    durationMinutes: 25,
    dueDate: "Post-Intervention Review",
    status: "upcoming",
    isFeatured: true,
    description: "Standardized parallel post-test measuring individual normalized Hake learning gain against diagnostic baseline.",
    questions: [
      {
        id: "post_m1",
        subject: "Math",
        topic: "Integers",
        difficulty: "easy",
        levelName: "Level 1: Foundational",
        questionText: "Evaluate: (-20) × (-5) ÷ (-4)",
        options: ["-25", "25", "-100", "50"],
        correctIndex: 0,
        explanation: "(-20) × (-5) = +100. Then +100 ÷ (-4) = -25.",
        conceptSummary: "Product of two negatives is positive; positive divided by negative is negative."
      },
      {
        id: "post_m2",
        subject: "Math",
        topic: "Fractions & Decimals",
        difficulty: "easy",
        levelName: "Level 1: Foundational",
        questionText: "Convert the fraction 7/8 into an exact terminating decimal.",
        options: ["0.875", "0.78", "0.85", "0.825"],
        correctIndex: 0,
        explanation: "7 ÷ 8 = 0.875.",
        conceptSummary: "Fractions with denominator powers of 2 always terminate."
      },
      {
        id: "post_m3",
        subject: "Math",
        topic: "Lines & Angles",
        difficulty: "medium",
        levelName: "Level 2: Procedural",
        questionText: "An angle is 24° more than its complement. Find the measure of the angle.",
        options: ["57°", "33°", "66°", "48°"],
        correctIndex: 0,
        explanation: "Let complement be x. Then angle = x + 24. x + (x + 24) = 90° => 2x = 66° => x = 33°. Angle = 33 + 24 = 57°.",
        conceptSummary: "Complementary angles sum to 90°."
      },
      {
        id: "post_m4",
        subject: "Math",
        topic: "Algebraic Expressions",
        difficulty: "medium",
        levelName: "Level 2: Procedural",
        questionText: "Subtract (3a - 4b + 5c) from (7a + 2b - 3c).",
        options: ["4a + 6b - 8c", "4a - 2b + 2c", "10a - 2b + 2c", "4a + 6b + 2c"],
        correctIndex: 0,
        explanation: "(7a + 2b - 3c) - (3a - 4b + 5c) = 7a - 3a + 2b - (-4b) - 3c - 5c = 4a + 6b - 8c.",
        conceptSummary: "Subtracting polynomial requires inverting every sign in the subtracted term."
      },
      {
        id: "post_m5",
        subject: "Math",
        topic: "Ratio & Proportion",
        difficulty: "hard",
        levelName: "Level 3: Multi-Step",
        questionText: "The price of a school bag is increased from ₹400 to ₹460. What is the percentage increase?",
        options: ["15%", "12%", "13.04%", "18%"],
        correctIndex: 0,
        explanation: "Increase = 460 - 400 = ₹60. Percentage = (60 / 400) × 100% = 15%.",
        conceptSummary: "Percentage increase is always relative to initial base value."
      },
      {
        id: "post_m6",
        subject: "Math",
        topic: "Perimeter & Area",
        difficulty: "hard",
        levelName: "Level 4: Conceptual",
        questionText: "The area of a rectangular classroom is 120 m² and its perimeter is 46 m. Find the length and breadth.",
        options: ["15 m and 8 m", "20 m and 6 m", "12 m and 10 m", "24 m and 5 m"],
        correctIndex: 0,
        explanation: "L × B = 120 and 2(L + B) = 46 => L + B = 23. Factors of 120 summing to 23 are 15 and 8. 15 × 8 = 120 and 15 + 8 = 23.",
        conceptSummary: "Quadratic factoring solves simultaneous perimeter and area conditions."
      },
      {
        id: "post_s1",
        subject: "Science",
        topic: "Nutrition in Plants",
        difficulty: "easy",
        levelName: "Level 1: Foundational",
        questionText: "Cuscuta (Amarbel) is an example of which nutritional type?",
        options: ["Parasite", "Autotroph", "Saprotroph", "Symbiont"],
        correctIndex: 0,
        explanation: "Cuscuta lacks chlorophyll and absorbs nutrients directly from host trees via haustoria, acting as a true parasite.",
        conceptSummary: "Parasites derive nutrition without benefiting host."
      },
      {
        id: "post_s2",
        subject: "Science",
        topic: "Heat & Temperature",
        difficulty: "easy",
        levelName: "Level 1: Foundational",
        questionText: "What is the normal human body temperature on the Celsius scale?",
        options: ["37°C", "98.6°C", "35°C", "42°C"],
        correctIndex: 0,
        explanation: "Normal physiological body temperature is 37°C (which corresponds to 98.6°F).",
        conceptSummary: "Clinical thermometers span 35°C to 42°C."
      },
      {
        id: "post_s3",
        subject: "Science",
        topic: "Acids, Bases & Salts",
        difficulty: "medium",
        levelName: "Level 2: Procedural",
        questionText: "What chemical substance is commonly applied to ant bites to neutralize methanoic (formic) acid?",
        options: ["Baking Soda (Sodium Hydrogen Carbonate)", "Vinegar (Acetic Acid)", "Lemon Juice", "Common Salt"],
        correctIndex: 0,
        explanation: "Ant bites inject methanoic acid. Mild moist base like baking soda or calamine lotion neutralizes the acid sting.",
        conceptSummary: "Neutralization: Acid + Base -> Salt + Water."
      },
      {
        id: "post_s4",
        subject: "Science",
        topic: "Motion & Time",
        difficulty: "medium",
        levelName: "Level 2: Procedural",
        questionText: "A simple pendulum takes 32 seconds to complete 20 full oscillations. What is its time period?",
        options: ["1.6 seconds", "0.625 seconds", "2.0 seconds", "1.2 seconds"],
        correctIndex: 0,
        explanation: "Time period T = Total time / Number of oscillations = 32 s / 20 = 1.6 s.",
        conceptSummary: "Time period is duration of one complete oscillation."
      },
      {
        id: "post_s5",
        subject: "Science",
        topic: "Electric Current & Effects",
        difficulty: "hard",
        levelName: "Level 3: Multi-Step",
        questionText: "When an electric current passes through a wire wrapped around an iron nail, what does the device act as?",
        options: ["An Electromagnet", "An Electric Generator", "A Thermal Insulator", "A Permanent Magnet"],
        correctIndex: 0,
        explanation: "The current generates a magnetic field around the coil, magnetizing the soft iron core to create a temporary electromagnet.",
        conceptSummary: "Electromagnets lose magnetism immediately when current turns off."
      },
      {
        id: "post_s6",
        subject: "Science",
        topic: "Light",
        difficulty: "hard",
        levelName: "Level 4: Conceptual",
        questionText: "White sunlight splitting into seven constituent rainbow colors through a glass prism is called:",
        options: ["Dispersion", "Total internal reflection", "Diffraction", "Polarization"],
        correctIndex: 0,
        explanation: "Dispersion is the splitting of composite white light into its spectrum (VIBGYOR) due to different refractive speeds in glass.",
        conceptSummary: "Red light bends least; violet light bends most."
      }
    ]
  },
  {
    id: "test-ch2-fractions",
    title: "Chapter Assessment: Fractions, Decimals & Rational Numbers",
    type: "Chapter",
    category: "Chapter Assessments",
    gradeLevel: 7,
    subject: "Math",
    assignedBy: "Mrs. Anita Rao",
    classId: "MATH-7B",
    questionCount: 4,
    durationMinutes: 15,
    dueDate: "Friday at 4:00 PM",
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
        explanation: "Divide both 15 and 45 by their greatest common divisor 15: (15 ÷ 15) / (45 ÷ 15) = 1/3."
      },
      {
        id: "t_2",
        difficulty: "medium",
        levelName: "Level 2: Procedural",
        questionText: "Calculate: 3/5 + 1/10 and express as a fraction in simplest form.",
        options: ["4/15", "7/10", "4/10", "3/10"],
        correctIndex: 1,
        topic: "Fractions",
        explanation: "Convert 3/5 to the common denominator 10: 3/5 × 2/2 = 6/10. Then add: 6/10 + 1/10 = 7/10."
      },
      {
        id: "t_3",
        difficulty: "hard",
        levelName: "Level 3: Multi-Step",
        questionText: "Evaluate: (3/4) ÷ (1/2) and convert to mixed number.",
        options: ["3/8", "1 1/2 (3/2)", "6/4", "1/4"],
        correctIndex: 1,
        topic: "Fractions",
        explanation: "Dividing by a fraction is multiplying by its reciprocal: (3/4) × (2/1) = 6/4 = 3/2 = 1 1/2."
      },
      {
        id: "t_4",
        difficulty: "very_hard",
        levelName: "Level 4: Conceptual Mastery",
        questionText: "A water tank is 2/3 full. After 15 liters are drained, it remains 1/2 full. What is the total capacity of the tank?",
        options: ["60 Liters", "90 Liters", "75 Liters", "45 Liters"],
        correctIndex: 1,
        topic: "Algebraic Fractions",
        explanation: "Difference: (2/3) - (1/2) = (4/6) - (3/6) = 1/6 of tank. If 1/6 = 15 L, Total capacity = 15 × 6 = 90 Liters."
      }
    ]
  },
  {
    id: "test-top-photosynthesis",
    title: "Topic Quiz: Photosynthesis & Plant Biochemistry",
    type: "Topic",
    category: "Topic Quizzes",
    gradeLevel: 7,
    subject: "Science",
    assignedBy: "Ms. Sunita Rao",
    classId: "SCI-7A",
    questionCount: 4,
    durationMinutes: 10,
    dueDate: "Tomorrow",
    status: "active",
    description: "Rapid formative quiz testing knowledge of chlorophyll function, light reactions, and carbon fixation.",
    questions: [
      {
        id: "t_p1",
        difficulty: "easy",
        questionText: "Which pigment inside plant cells absorbs solar photon energy?",
        options: ["Chlorophyll", "Hemoglobin", "Carotene", "Anthocyanin"],
        correctIndex: 0,
        topic: "Photosynthesis",
        explanation: "Chlorophyll in thylakoid membranes absorbs light wavelengths to drive photolysis."
      },
      {
        id: "t_p2",
        difficulty: "medium",
        questionText: "What are the chemical end-products of oxygenic photosynthesis?",
        options: ["Glucose and Oxygen", "Water and Nitrogen", "Carbon Dioxide and Glucose", "Hydrogen and Starch"],
        correctIndex: 0,
        topic: "Photosynthesis",
        explanation: "6CO2 + 6H2O + Sunlight -> C6H12O6 + 6O2."
      }
    ]
  },
  {
    id: "test-pa1-stem",
    title: "Periodic Assessment 1 (PA-1): Class 7 STEM Composite",
    type: "Periodic",
    category: "Periodic Assessments",
    gradeLevel: 7,
    subject: "STEM",
    assignedBy: "Curriculum Cell, Greenwood Public School",
    classId: "APS-7A",
    questionCount: 8,
    durationMinutes: 20,
    dueDate: "Next Week",
    status: "upcoming",
    description: "First official periodic cycle assessment mapping Quarter 1 learning milestones per CBSE blueprint."
  },
  {
    id: "test-half-yearly",
    title: "Half-Yearly Examination 2026: Mathematics (Class VII)",
    type: "Half-Yearly",
    category: "Half-Yearly Examinations",
    gradeLevel: 7,
    subject: "Math",
    assignedBy: "Academic Controller, Greenwood Public School",
    classId: "APS-7A",
    questionCount: 15,
    durationMinutes: 45,
    dueDate: "Term 1 Schedule",
    status: "upcoming",
    description: "Comprehensive mid-year summative examination covering Integers, Fractions, Decimals, Lines and Angles."
  },
  {
    id: "test-annual-2027",
    title: "Annual Term-End Examination 2027: Science & Math",
    type: "Annual",
    category: "Annual Examinations",
    gradeLevel: 7,
    subject: "STEM",
    assignedBy: "Academic Council, Greenwood Public School",
    classId: "APS-7A",
    questionCount: 20,
    durationMinutes: 60,
    dueDate: "March 2027",
    status: "upcoming",
    description: "End of year standardized evaluation synthesizing complete annual syllabi across all STEM domains."
  },
  {
    id: "test-adaptive-irt",
    title: "Dynamic IRT/BKT Calibrated Adaptive Evaluation",
    type: "Adaptive",
    category: "Adaptive Tests",
    gradeLevel: 7,
    subject: "Math",
    assignedBy: "AdaptIQ Adaptive Engine",
    classId: "APS-7A",
    questionCount: 10,
    durationMinutes: 20,
    dueDate: "Self-Paced",
    status: "active",
    description: "Real-time difficulty steering based on Rasch theta ability estimation and Bayesian Knowledge Tracing."
  },
  {
    id: "test-olympiad-prep",
    title: "National Science & Mathematics Olympiad (NSO/IMO) Prep",
    type: "Olympiad",
    category: "Olympiad / Competitive Prep",
    gradeLevel: 7,
    subject: "STEM",
    assignedBy: "Talent Development Cell",
    classId: "APS-7A",
    questionCount: 15,
    durationMinutes: 30,
    dueDate: "Open Challenge",
    status: "active",
    description: "High-order thinking skills (HOTS) and non-routine problem solving for national competitive benchmarks."
  },
  {
  "id": "aps-g3-diagnostic-pre",
  "title": "Greenwood Public School — Grade 3 Primary Wing Diagnostic Pre-Test",
  "type": "Diagnostic",
  "category": "Diagnostic Assessments",
  "gradeLevel": 3,
  "subject": "Primary (Math, English & EVS)",
  "assignedBy": "Primary Wing Directorate, Greenwood Public School",
  "classId": "APS-3A",
  "questionCount": 12,
  "durationMinutes": 20,
  "dueDate": "Mandatory Baseline",
  "status": "active",
  "isFeatured": true,
  "description": "Official institutional diagnostic baseline measuring foundational literacy, numeracy, and environmental awareness for Class III (CBSE 2026–2027).",
  "questions": [
    {
      "id": "q-g3-mat-001",
      "subject": "Mathematics",
      "topic": "3-Digit Numbers & Place Value",
      "difficulty": "easy",
      "levelName": "Level 1: Foundational",
      "questionText": "What is the place value of 2 in the number 225?",
      "options": [
        "200",
        "20",
        "2",
        "2000"
      ],
      "correctIndex": 0,
      "explanation": "In the number 225, the digit 2 is in the hundreds place, so its place value is 2 × 100 = 200.",
      "conceptSummary": "Place Value = Face Value × Position Value (Hundreds place = 100)",
      "steps": [
        "Identify the position of 2 in 225: it is in the hundreds column.",
        "Multiply face value by place value: 2 × 100 = 200."
      ]
    },
    {
      "id": "q-g3-mat-002",
      "subject": "Mathematics",
      "topic": "3-Digit Numbers & Place Value",
      "difficulty": "medium",
      "levelName": "Level 2: Procedural",
      "questionText": "Which of the following represents 351 in expanded form?",
      "options": [
        "300 + 50 + 1",
        "300 + 5 + 1",
        "30 + 50 + 1",
        "3 + 5 + 1"
      ],
      "correctIndex": 0,
      "explanation": "351 = 3 hundreds + 5 tens + 1 ones = 300 + 50 + 1.",
      "conceptSummary": "Expanded form expresses a number as the sum of each digit multiplied by its place value.",
      "steps": [
        "Break 351 into hundreds, tens, and ones.",
        "300 + 50 + 1."
      ]
    },
    {
      "id": "q-g3-mat-003",
      "subject": "Mathematics",
      "topic": "Number Sequences & Ordering",
      "difficulty": "easy",
      "levelName": "Level 1: Foundational",
      "questionText": "What is the successor (number immediately after) of 486?",
      "options": [
        "487",
        "485",
        "496",
        "488"
      ],
      "correctIndex": 0,
      "explanation": "The successor of any number is obtained by adding 1. 486 + 1 = 487.",
      "conceptSummary": "Successor = Given number + 1",
      "steps": [
        "Take 486 and add 1.",
        "486 + 1 = 487."
      ]
    },
    {
      "id": "q-g3-mat-004",
      "subject": "Mathematics",
      "topic": "3-Digit Numbers & Place Value",
      "difficulty": "easy",
      "levelName": "Level 1: Foundational",
      "questionText": "What is the place value of 5 in the number 522?",
      "options": [
        "500",
        "50",
        "5",
        "5000"
      ],
      "correctIndex": 0,
      "explanation": "In the number 522, the digit 5 is in the hundreds place, so its place value is 5 × 100 = 500.",
      "conceptSummary": "Place Value = Face Value × Position Value (Hundreds place = 100)",
      "steps": [
        "Identify the position of 5 in 522: it is in the hundreds column.",
        "Multiply face value by place value: 5 × 100 = 500."
      ]
    },
    {
      "id": "q-g3-mat-005",
      "subject": "Mathematics",
      "topic": "3-Digit Numbers & Place Value",
      "difficulty": "medium",
      "levelName": "Level 2: Procedural",
      "questionText": "Which of the following represents 657 in expanded form?",
      "options": [
        "600 + 50 + 7",
        "600 + 5 + 7",
        "60 + 50 + 7",
        "6 + 5 + 7"
      ],
      "correctIndex": 0,
      "explanation": "657 = 6 hundreds + 5 tens + 7 ones = 600 + 50 + 7.",
      "conceptSummary": "Expanded form expresses a number as the sum of each digit multiplied by its place value.",
      "steps": [
        "Break 657 into hundreds, tens, and ones.",
        "600 + 50 + 7."
      ]
    },
    {
      "id": "q-g3-mat-006",
      "subject": "Mathematics",
      "topic": "Number Sequences & Ordering",
      "difficulty": "easy",
      "levelName": "Level 1: Foundational",
      "questionText": "What is the successor (number immediately after) of 783?",
      "options": [
        "784",
        "782",
        "793",
        "785"
      ],
      "correctIndex": 0,
      "explanation": "The successor of any number is obtained by adding 1. 783 + 1 = 784.",
      "conceptSummary": "Successor = Given number + 1",
      "steps": [
        "Take 783 and add 1.",
        "783 + 1 = 784."
      ]
    },
    {
      "id": "q-g3-mat-007",
      "subject": "Mathematics",
      "topic": "3-Digit Numbers & Place Value",
      "difficulty": "easy",
      "levelName": "Level 1: Foundational",
      "questionText": "What is the place value of 8 in the number 828?",
      "options": [
        "800",
        "80",
        "8",
        "8000"
      ],
      "correctIndex": 0,
      "explanation": "In the number 828, the digit 8 is in the hundreds place, so its place value is 8 × 100 = 800.",
      "conceptSummary": "Place Value = Face Value × Position Value (Hundreds place = 100)",
      "steps": [
        "Identify the position of 8 in 828: it is in the hundreds column.",
        "Multiply face value by place value: 8 × 100 = 800."
      ]
    },
    {
      "id": "q-g3-mat-008",
      "subject": "Mathematics",
      "topic": "3-Digit Numbers & Place Value",
      "difficulty": "medium",
      "levelName": "Level 2: Procedural",
      "questionText": "Which of the following represents 954 in expanded form?",
      "options": [
        "900 + 50 + 4",
        "900 + 5 + 4",
        "90 + 50 + 4",
        "9 + 5 + 4"
      ],
      "correctIndex": 0,
      "explanation": "954 = 9 hundreds + 5 tens + 4 ones = 900 + 50 + 4.",
      "conceptSummary": "Expanded form expresses a number as the sum of each digit multiplied by its place value.",
      "steps": [
        "Break 954 into hundreds, tens, and ones.",
        "900 + 50 + 4."
      ]
    },
    {
      "id": "q-g3-mat-009",
      "subject": "Mathematics",
      "topic": "Number Sequences & Ordering",
      "difficulty": "easy",
      "levelName": "Level 1: Foundational",
      "questionText": "What is the successor (number immediately after) of 289?",
      "options": [
        "290",
        "288",
        "299",
        "291"
      ],
      "correctIndex": 0,
      "explanation": "The successor of any number is obtained by adding 1. 289 + 1 = 290.",
      "conceptSummary": "Successor = Given number + 1",
      "steps": [
        "Take 289 and add 1.",
        "289 + 1 = 290."
      ]
    },
    {
      "id": "q-g3-mat-010",
      "subject": "Mathematics",
      "topic": "3-Digit Numbers & Place Value",
      "difficulty": "easy",
      "levelName": "Level 1: Foundational",
      "questionText": "What is the place value of 3 in the number 325?",
      "options": [
        "300",
        "30",
        "3",
        "3000"
      ],
      "correctIndex": 0,
      "explanation": "In the number 325, the digit 3 is in the hundreds place, so its place value is 3 × 100 = 300.",
      "conceptSummary": "Place Value = Face Value × Position Value (Hundreds place = 100)",
      "steps": [
        "Identify the position of 3 in 325: it is in the hundreds column.",
        "Multiply face value by place value: 3 × 100 = 300."
      ]
    },
    {
      "id": "q-g3-mat-011",
      "subject": "Mathematics",
      "topic": "3-Digit Numbers & Place Value",
      "difficulty": "medium",
      "levelName": "Level 2: Procedural",
      "questionText": "Which of the following represents 451 in expanded form?",
      "options": [
        "400 + 50 + 1",
        "400 + 5 + 1",
        "40 + 50 + 1",
        "4 + 5 + 1"
      ],
      "correctIndex": 0,
      "explanation": "451 = 4 hundreds + 5 tens + 1 ones = 400 + 50 + 1.",
      "conceptSummary": "Expanded form expresses a number as the sum of each digit multiplied by its place value.",
      "steps": [
        "Break 451 into hundreds, tens, and ones.",
        "400 + 50 + 1."
      ]
    },
    {
      "id": "q-g3-mat-012",
      "subject": "Mathematics",
      "topic": "Number Sequences & Ordering",
      "difficulty": "easy",
      "levelName": "Level 1: Foundational",
      "questionText": "What is the successor (number immediately after) of 586?",
      "options": [
        "587",
        "585",
        "596",
        "588"
      ],
      "correctIndex": 0,
      "explanation": "The successor of any number is obtained by adding 1. 586 + 1 = 587.",
      "conceptSummary": "Successor = Given number + 1",
      "steps": [
        "Take 586 and add 1.",
        "586 + 1 = 587."
      ]
    }
  ]
},
  {
  "id": "aps-g10-diagnostic-pre",
  "title": "Greenwood Public School — Grade 10 Secondary STEM Pre-Board Diagnostic",
  "type": "Diagnostic",
  "category": "Diagnostic Assessments",
  "gradeLevel": 10,
  "subject": "STEM (Mathematics & Science)",
  "assignedBy": "Senior Secondary Directorate, Greenwood Public School",
  "classId": "APS-10A",
  "questionCount": 12,
  "durationMinutes": 30,
  "dueDate": "Pre-Board Calibration",
  "status": "active",
  "isFeatured": true,
  "description": "Standardized Class X CBSE diagnostic assessing competency in Real Numbers, Polynomials, Chemical Reactions, and Light (CBSE 2026–2027).",
  "questions": [
    {
      "id": "q-g10-001",
      "subject": "Mathematics",
      "topic": "Quadratic Equations",
      "difficulty": "easy",
      "levelName": "Level 1: Foundational",
      "questionText": "Calculate the discriminant of the quadratic equation 2x² - 4x + 3 = 0:",
      "options": [
        "-8",
        "8",
        "40",
        "-40"
      ],
      "correctIndex": 0,
      "explanation": "Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Roots are non-real complex.",
      "conceptSummary": "Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Roots are non-real complex.",
      "steps": [
        {
          "step": "Step 1: Identify Given",
          "desc": "Note down given quantities",
          "math": ""
        },
        {
          "step": "Step 2: Apply Concept",
          "desc": "Execute the core operation",
          "math": ""
        },
        {
          "step": "Step 3: Final Answer",
          "desc": "Result obtained",
          "math": ""
        }
      ]
    },
    {
      "id": "q-g10-002",
      "subject": "Mathematics",
      "topic": "Trigonometry",
      "difficulty": "easy",
      "levelName": "Level 1: Foundational",
      "questionText": "If sin θ = 3/5, what is the value of cos θ in the first quadrant?",
      "options": [
        "5/3",
        "4/5",
        "3/4",
        "1/5"
      ],
      "correctIndex": 1,
      "explanation": "Using fundamental identity sin²θ + cos²θ = 1: cos θ = √(1 - 9/25) = 4/5.",
      "conceptSummary": "Using fundamental identity sin²θ + cos²θ = 1: cos θ = √(1 - 9/25) = 4/5.",
      "steps": [
        {
          "step": "Step 1: Identify Given",
          "desc": "Note down given quantities",
          "math": ""
        },
        {
          "step": "Step 2: Apply Concept",
          "desc": "Execute the core operation",
          "math": ""
        },
        {
          "step": "Step 3: Final Answer",
          "desc": "Result obtained",
          "math": ""
        }
      ]
    },
    {
      "id": "q-g10-003",
      "subject": "Mathematics",
      "topic": "Quadratic Equations",
      "difficulty": "easy",
      "levelName": "Level 1: Foundational",
      "questionText": "Calculate the discriminant of the quadratic equation 2x² - 4x + 3 = 0:",
      "options": [
        "40",
        "8",
        "-8",
        "-40"
      ],
      "correctIndex": 2,
      "explanation": "Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Roots are non-real complex.",
      "conceptSummary": "Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Roots are non-real complex.",
      "steps": [
        {
          "step": "Step 1: Identify Given",
          "desc": "Note down given quantities",
          "math": ""
        },
        {
          "step": "Step 2: Apply Concept",
          "desc": "Execute the core operation",
          "math": ""
        },
        {
          "step": "Step 3: Final Answer",
          "desc": "Result obtained",
          "math": ""
        }
      ]
    },
    {
      "id": "q-g10-004",
      "subject": "Mathematics",
      "topic": "Trigonometry",
      "difficulty": "medium",
      "levelName": "Level 2: Procedural",
      "questionText": "If sin θ = 3/5, what is the value of cos θ in the first quadrant?",
      "options": [
        "1/5",
        "5/3",
        "3/4",
        "4/5"
      ],
      "correctIndex": 3,
      "explanation": "Using fundamental identity sin²θ + cos²θ = 1: cos θ = √(1 - 9/25) = 4/5.",
      "conceptSummary": "Using fundamental identity sin²θ + cos²θ = 1: cos θ = √(1 - 9/25) = 4/5.",
      "steps": [
        {
          "step": "Step 1: Identify Given",
          "desc": "Note down given quantities",
          "math": ""
        },
        {
          "step": "Step 2: Apply Concept",
          "desc": "Execute the core operation",
          "math": ""
        },
        {
          "step": "Step 3: Final Answer",
          "desc": "Result obtained",
          "math": ""
        }
      ]
    },
    {
      "id": "q-g10-005",
      "subject": "Mathematics",
      "topic": "Quadratic Equations",
      "difficulty": "medium",
      "levelName": "Level 2: Procedural",
      "questionText": "Calculate the discriminant of the quadratic equation 2x² - 4x + 3 = 0:",
      "options": [
        "-8",
        "8",
        "40",
        "-40"
      ],
      "correctIndex": 0,
      "explanation": "Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Roots are non-real complex.",
      "conceptSummary": "Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Roots are non-real complex.",
      "steps": [
        {
          "step": "Step 1: Identify Given",
          "desc": "Note down given quantities",
          "math": ""
        },
        {
          "step": "Step 2: Apply Concept",
          "desc": "Execute the core operation",
          "math": ""
        },
        {
          "step": "Step 3: Final Answer",
          "desc": "Result obtained",
          "math": ""
        }
      ]
    },
    {
      "id": "q-g10-006",
      "subject": "Mathematics",
      "topic": "Trigonometry",
      "difficulty": "medium",
      "levelName": "Level 2: Procedural",
      "questionText": "If sin θ = 3/5, what is the value of cos θ in the first quadrant?",
      "options": [
        "5/3",
        "4/5",
        "3/4",
        "1/5"
      ],
      "correctIndex": 1,
      "explanation": "Using fundamental identity sin²θ + cos²θ = 1: cos θ = √(1 - 9/25) = 4/5.",
      "conceptSummary": "Using fundamental identity sin²θ + cos²θ = 1: cos θ = √(1 - 9/25) = 4/5.",
      "steps": [
        {
          "step": "Step 1: Identify Given",
          "desc": "Note down given quantities",
          "math": ""
        },
        {
          "step": "Step 2: Apply Concept",
          "desc": "Execute the core operation",
          "math": ""
        },
        {
          "step": "Step 3: Final Answer",
          "desc": "Result obtained",
          "math": ""
        }
      ]
    },
    {
      "id": "q-g10-007",
      "subject": "Mathematics",
      "topic": "Quadratic Equations",
      "difficulty": "medium",
      "levelName": "Level 2: Procedural",
      "questionText": "Calculate the discriminant of the quadratic equation 2x² - 4x + 3 = 0:",
      "options": [
        "40",
        "8",
        "-8",
        "-40"
      ],
      "correctIndex": 2,
      "explanation": "Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Roots are non-real complex.",
      "conceptSummary": "Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Roots are non-real complex.",
      "steps": [
        {
          "step": "Step 1: Identify Given",
          "desc": "Note down given quantities",
          "math": ""
        },
        {
          "step": "Step 2: Apply Concept",
          "desc": "Execute the core operation",
          "math": ""
        },
        {
          "step": "Step 3: Final Answer",
          "desc": "Result obtained",
          "math": ""
        }
      ]
    },
    {
      "id": "q-g10-008",
      "subject": "Mathematics",
      "topic": "Trigonometry",
      "difficulty": "hard",
      "levelName": "Level 3: Multi-Step",
      "questionText": "If sin θ = 3/5, what is the value of cos θ in the first quadrant?",
      "options": [
        "1/5",
        "5/3",
        "3/4",
        "4/5"
      ],
      "correctIndex": 3,
      "explanation": "Using fundamental identity sin²θ + cos²θ = 1: cos θ = √(1 - 9/25) = 4/5.",
      "conceptSummary": "Using fundamental identity sin²θ + cos²θ = 1: cos θ = √(1 - 9/25) = 4/5.",
      "steps": [
        {
          "step": "Step 1: Identify Given",
          "desc": "Note down given quantities",
          "math": ""
        },
        {
          "step": "Step 2: Apply Concept",
          "desc": "Execute the core operation",
          "math": ""
        },
        {
          "step": "Step 3: Final Answer",
          "desc": "Result obtained",
          "math": ""
        }
      ]
    },
    {
      "id": "q-g10-009",
      "subject": "Mathematics",
      "topic": "Quadratic Equations",
      "difficulty": "hard",
      "levelName": "Level 3: Multi-Step",
      "questionText": "Calculate the discriminant of the quadratic equation 2x² - 4x + 3 = 0:",
      "options": [
        "-8",
        "8",
        "40",
        "-40"
      ],
      "correctIndex": 0,
      "explanation": "Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Roots are non-real complex.",
      "conceptSummary": "Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Roots are non-real complex.",
      "steps": [
        {
          "step": "Step 1: Identify Given",
          "desc": "Note down given quantities",
          "math": ""
        },
        {
          "step": "Step 2: Apply Concept",
          "desc": "Execute the core operation",
          "math": ""
        },
        {
          "step": "Step 3: Final Answer",
          "desc": "Result obtained",
          "math": ""
        }
      ]
    },
    {
      "id": "q-g10-010",
      "subject": "Mathematics",
      "topic": "Trigonometry",
      "difficulty": "hard",
      "levelName": "Level 3: Multi-Step",
      "questionText": "If sin θ = 3/5, what is the value of cos θ in the first quadrant?",
      "options": [
        "5/3",
        "4/5",
        "3/4",
        "1/5"
      ],
      "correctIndex": 1,
      "explanation": "Using fundamental identity sin²θ + cos²θ = 1: cos θ = √(1 - 9/25) = 4/5.",
      "conceptSummary": "Using fundamental identity sin²θ + cos²θ = 1: cos θ = √(1 - 9/25) = 4/5.",
      "steps": [
        {
          "step": "Step 1: Identify Given",
          "desc": "Note down given quantities",
          "math": ""
        },
        {
          "step": "Step 2: Apply Concept",
          "desc": "Execute the core operation",
          "math": ""
        },
        {
          "step": "Step 3: Final Answer",
          "desc": "Result obtained",
          "math": ""
        }
      ]
    },
    {
      "id": "q-g10-011",
      "subject": "Mathematics",
      "topic": "Quadratic Equations",
      "difficulty": "easy",
      "levelName": "Level 1: Foundational",
      "questionText": "Calculate the discriminant of the quadratic equation 2x² - 4x + 3 = 0:",
      "options": [
        "40",
        "8",
        "-8",
        "-40"
      ],
      "correctIndex": 2,
      "explanation": "Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Roots are non-real complex.",
      "conceptSummary": "Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Roots are non-real complex.",
      "steps": [
        {
          "step": "Step 1: Identify Given",
          "desc": "Note down given quantities",
          "math": ""
        },
        {
          "step": "Step 2: Apply Concept",
          "desc": "Execute the core operation",
          "math": ""
        },
        {
          "step": "Step 3: Final Answer",
          "desc": "Result obtained",
          "math": ""
        }
      ]
    },
    {
      "id": "q-g10-012",
      "subject": "Mathematics",
      "topic": "Trigonometry",
      "difficulty": "easy",
      "levelName": "Level 1: Foundational",
      "questionText": "If sin θ = 3/5, what is the value of cos θ in the first quadrant?",
      "options": [
        "1/5",
        "5/3",
        "3/4",
        "4/5"
      ],
      "correctIndex": 3,
      "explanation": "Using fundamental identity sin²θ + cos²θ = 1: cos θ = √(1 - 9/25) = 4/5.",
      "conceptSummary": "Using fundamental identity sin²θ + cos²θ = 1: cos θ = √(1 - 9/25) = 4/5.",
      "steps": [
        {
          "step": "Step 1: Identify Given",
          "desc": "Note down given quantities",
          "math": ""
        },
        {
          "step": "Step 2: Apply Concept",
          "desc": "Execute the core operation",
          "math": ""
        },
        {
          "step": "Step 3: Final Answer",
          "desc": "Result obtained",
          "math": ""
        }
      ]
    }
  ]
},
  {
    id: "test-cbse-preboard-10",
    questions: [
  {
    "id": "q-g10-001",
    "subject": "Mathematics",
    "topic": "Quadratic Equations",
    "difficulty": "easy",
    "levelName": "Level 1: Foundational",
    "questionText": "Calculate the discriminant of the quadratic equation 2x² - 4x + 3 = 0:",
    "options": [
      "-8",
      "8",
      "40",
      "-40"
    ],
    "correctIndex": 0,
    "explanation": "Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Roots are non-real complex.",
    "conceptSummary": "Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Roots are non-real complex.",
    "steps": [
      {
        "step": "Step 1: Identify Given",
        "desc": "Note down given quantities",
        "math": ""
      },
      {
        "step": "Step 2: Apply Concept",
        "desc": "Execute the core operation",
        "math": ""
      },
      {
        "step": "Step 3: Final Answer",
        "desc": "Result obtained",
        "math": ""
      }
    ]
  },
  {
    "id": "q-g10-002",
    "subject": "Mathematics",
    "topic": "Trigonometry",
    "difficulty": "easy",
    "levelName": "Level 1: Foundational",
    "questionText": "If sin θ = 3/5, what is the value of cos θ in the first quadrant?",
    "options": [
      "5/3",
      "4/5",
      "3/4",
      "1/5"
    ],
    "correctIndex": 1,
    "explanation": "Using fundamental identity sin²θ + cos²θ = 1: cos θ = √(1 - 9/25) = 4/5.",
    "conceptSummary": "Using fundamental identity sin²θ + cos²θ = 1: cos θ = √(1 - 9/25) = 4/5.",
    "steps": [
      {
        "step": "Step 1: Identify Given",
        "desc": "Note down given quantities",
        "math": ""
      },
      {
        "step": "Step 2: Apply Concept",
        "desc": "Execute the core operation",
        "math": ""
      },
      {
        "step": "Step 3: Final Answer",
        "desc": "Result obtained",
        "math": ""
      }
    ]
  },
  {
    "id": "q-g10-003",
    "subject": "Mathematics",
    "topic": "Quadratic Equations",
    "difficulty": "easy",
    "levelName": "Level 1: Foundational",
    "questionText": "Calculate the discriminant of the quadratic equation 2x² - 4x + 3 = 0:",
    "options": [
      "40",
      "8",
      "-8",
      "-40"
    ],
    "correctIndex": 2,
    "explanation": "Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Roots are non-real complex.",
    "conceptSummary": "Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Roots are non-real complex.",
    "steps": [
      {
        "step": "Step 1: Identify Given",
        "desc": "Note down given quantities",
        "math": ""
      },
      {
        "step": "Step 2: Apply Concept",
        "desc": "Execute the core operation",
        "math": ""
      },
      {
        "step": "Step 3: Final Answer",
        "desc": "Result obtained",
        "math": ""
      }
    ]
  },
  {
    "id": "q-g10-004",
    "subject": "Mathematics",
    "topic": "Trigonometry",
    "difficulty": "medium",
    "levelName": "Level 2: Procedural",
    "questionText": "If sin θ = 3/5, what is the value of cos θ in the first quadrant?",
    "options": [
      "1/5",
      "5/3",
      "3/4",
      "4/5"
    ],
    "correctIndex": 3,
    "explanation": "Using fundamental identity sin²θ + cos²θ = 1: cos θ = √(1 - 9/25) = 4/5.",
    "conceptSummary": "Using fundamental identity sin²θ + cos²θ = 1: cos θ = √(1 - 9/25) = 4/5.",
    "steps": [
      {
        "step": "Step 1: Identify Given",
        "desc": "Note down given quantities",
        "math": ""
      },
      {
        "step": "Step 2: Apply Concept",
        "desc": "Execute the core operation",
        "math": ""
      },
      {
        "step": "Step 3: Final Answer",
        "desc": "Result obtained",
        "math": ""
      }
    ]
  },
  {
    "id": "q-g10-005",
    "subject": "Mathematics",
    "topic": "Quadratic Equations",
    "difficulty": "medium",
    "levelName": "Level 2: Procedural",
    "questionText": "Calculate the discriminant of the quadratic equation 2x² - 4x + 3 = 0:",
    "options": [
      "-8",
      "8",
      "40",
      "-40"
    ],
    "correctIndex": 0,
    "explanation": "Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Roots are non-real complex.",
    "conceptSummary": "Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Roots are non-real complex.",
    "steps": [
      {
        "step": "Step 1: Identify Given",
        "desc": "Note down given quantities",
        "math": ""
      },
      {
        "step": "Step 2: Apply Concept",
        "desc": "Execute the core operation",
        "math": ""
      },
      {
        "step": "Step 3: Final Answer",
        "desc": "Result obtained",
        "math": ""
      }
    ]
  },
  {
    "id": "q-g10-006",
    "subject": "Mathematics",
    "topic": "Trigonometry",
    "difficulty": "medium",
    "levelName": "Level 2: Procedural",
    "questionText": "If sin θ = 3/5, what is the value of cos θ in the first quadrant?",
    "options": [
      "5/3",
      "4/5",
      "3/4",
      "1/5"
    ],
    "correctIndex": 1,
    "explanation": "Using fundamental identity sin²θ + cos²θ = 1: cos θ = √(1 - 9/25) = 4/5.",
    "conceptSummary": "Using fundamental identity sin²θ + cos²θ = 1: cos θ = √(1 - 9/25) = 4/5.",
    "steps": [
      {
        "step": "Step 1: Identify Given",
        "desc": "Note down given quantities",
        "math": ""
      },
      {
        "step": "Step 2: Apply Concept",
        "desc": "Execute the core operation",
        "math": ""
      },
      {
        "step": "Step 3: Final Answer",
        "desc": "Result obtained",
        "math": ""
      }
    ]
  },
  {
    "id": "q-g10-007",
    "subject": "Mathematics",
    "topic": "Quadratic Equations",
    "difficulty": "medium",
    "levelName": "Level 2: Procedural",
    "questionText": "Calculate the discriminant of the quadratic equation 2x² - 4x + 3 = 0:",
    "options": [
      "40",
      "8",
      "-8",
      "-40"
    ],
    "correctIndex": 2,
    "explanation": "Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Roots are non-real complex.",
    "conceptSummary": "Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Roots are non-real complex.",
    "steps": [
      {
        "step": "Step 1: Identify Given",
        "desc": "Note down given quantities",
        "math": ""
      },
      {
        "step": "Step 2: Apply Concept",
        "desc": "Execute the core operation",
        "math": ""
      },
      {
        "step": "Step 3: Final Answer",
        "desc": "Result obtained",
        "math": ""
      }
    ]
  },
  {
    "id": "q-g10-008",
    "subject": "Mathematics",
    "topic": "Trigonometry",
    "difficulty": "hard",
    "levelName": "Level 3: Multi-Step",
    "questionText": "If sin θ = 3/5, what is the value of cos θ in the first quadrant?",
    "options": [
      "1/5",
      "5/3",
      "3/4",
      "4/5"
    ],
    "correctIndex": 3,
    "explanation": "Using fundamental identity sin²θ + cos²θ = 1: cos θ = √(1 - 9/25) = 4/5.",
    "conceptSummary": "Using fundamental identity sin²θ + cos²θ = 1: cos θ = √(1 - 9/25) = 4/5.",
    "steps": [
      {
        "step": "Step 1: Identify Given",
        "desc": "Note down given quantities",
        "math": ""
      },
      {
        "step": "Step 2: Apply Concept",
        "desc": "Execute the core operation",
        "math": ""
      },
      {
        "step": "Step 3: Final Answer",
        "desc": "Result obtained",
        "math": ""
      }
    ]
  },
  {
    "id": "q-g10-009",
    "subject": "Mathematics",
    "topic": "Quadratic Equations",
    "difficulty": "hard",
    "levelName": "Level 3: Multi-Step",
    "questionText": "Calculate the discriminant of the quadratic equation 2x² - 4x + 3 = 0:",
    "options": [
      "-8",
      "8",
      "40",
      "-40"
    ],
    "correctIndex": 0,
    "explanation": "Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Roots are non-real complex.",
    "conceptSummary": "Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Roots are non-real complex.",
    "steps": [
      {
        "step": "Step 1: Identify Given",
        "desc": "Note down given quantities",
        "math": ""
      },
      {
        "step": "Step 2: Apply Concept",
        "desc": "Execute the core operation",
        "math": ""
      },
      {
        "step": "Step 3: Final Answer",
        "desc": "Result obtained",
        "math": ""
      }
    ]
  },
  {
    "id": "q-g10-010",
    "subject": "Mathematics",
    "topic": "Trigonometry",
    "difficulty": "hard",
    "levelName": "Level 3: Multi-Step",
    "questionText": "If sin θ = 3/5, what is the value of cos θ in the first quadrant?",
    "options": [
      "5/3",
      "4/5",
      "3/4",
      "1/5"
    ],
    "correctIndex": 1,
    "explanation": "Using fundamental identity sin²θ + cos²θ = 1: cos θ = √(1 - 9/25) = 4/5.",
    "conceptSummary": "Using fundamental identity sin²θ + cos²θ = 1: cos θ = √(1 - 9/25) = 4/5.",
    "steps": [
      {
        "step": "Step 1: Identify Given",
        "desc": "Note down given quantities",
        "math": ""
      },
      {
        "step": "Step 2: Apply Concept",
        "desc": "Execute the core operation",
        "math": ""
      },
      {
        "step": "Step 3: Final Answer",
        "desc": "Result obtained",
        "math": ""
      }
    ]
  },
  {
    "id": "q-g10-011",
    "subject": "Mathematics",
    "topic": "Quadratic Equations",
    "difficulty": "easy",
    "levelName": "Level 1: Foundational",
    "questionText": "Calculate the discriminant of the quadratic equation 2x² - 4x + 3 = 0:",
    "options": [
      "40",
      "8",
      "-8",
      "-40"
    ],
    "correctIndex": 2,
    "explanation": "Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Roots are non-real complex.",
    "conceptSummary": "Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Roots are non-real complex.",
    "steps": [
      {
        "step": "Step 1: Identify Given",
        "desc": "Note down given quantities",
        "math": ""
      },
      {
        "step": "Step 2: Apply Concept",
        "desc": "Execute the core operation",
        "math": ""
      },
      {
        "step": "Step 3: Final Answer",
        "desc": "Result obtained",
        "math": ""
      }
    ]
  },
  {
    "id": "q-g10-012",
    "subject": "Mathematics",
    "topic": "Trigonometry",
    "difficulty": "easy",
    "levelName": "Level 1: Foundational",
    "questionText": "If sin θ = 3/5, what is the value of cos θ in the first quadrant?",
    "options": [
      "1/5",
      "5/3",
      "3/4",
      "4/5"
    ],
    "correctIndex": 3,
    "explanation": "Using fundamental identity sin²θ + cos²θ = 1: cos θ = √(1 - 9/25) = 4/5.",
    "conceptSummary": "Using fundamental identity sin²θ + cos²θ = 1: cos θ = √(1 - 9/25) = 4/5.",
    "steps": [
      {
        "step": "Step 1: Identify Given",
        "desc": "Note down given quantities",
        "math": ""
      },
      {
        "step": "Step 2: Apply Concept",
        "desc": "Execute the core operation",
        "math": ""
      },
      {
        "step": "Step 3: Final Answer",
        "desc": "Result obtained",
        "math": ""
      }
    ]
  }
],
    title: "Class 10 CBSE Pre-Board Mock Examination: Mathematics & Science",
    type: "Pre-Board",
    category: "Board / Pre-Board Mock Exams",
    gradeLevel: 10,
    subject: "Math",
    assignedBy: "Senior Secondary Board, Greenwood Public School",
    classId: "APS-10A",
    questionCount: 20,
    durationMinutes: 60,
    dueDate: "Board Preparation",
    status: "active",
    description: "Authentic CBSE Class X Board exam simulation with case-study questions, assertions-reasons, and step marking."
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
    id: "res-g7-01",
    title: "Class 7 Mathematics: Integers & Operational Sign Rules",
    subject: "Mathematics",
    grade: 7,
    gradeLevel: 7,
    gradeWing: "Middle (6–8)",
    topic: "Integers",
    difficulty: "Foundational",
    type: "Concept Guide",
    readTime: "5 min read",
    thumbnail: "🔢",
    summary: "Complete mastery of positive and negative integers, number line directions, sign multiplication rules, and additive inverse properties.",
    formulas: [
      { name: "Subtraction Rule", rule: "a - (-b) = a + b", tip: "Subtracting a negative is equivalent to adding a positive" },
      { name: "Negative Product", rule: "(-a) · (-b) = +(a · b)", tip: "Product of two negative integers is always positive" },
      { name: "Mixed Sign Product", rule: "(-a) · b = -(a · b)", tip: "Product of positive and negative integers is always negative" },
      { name: "Quotient Rule", rule: "(-a) / b = a / (-b) = -(a / b)", tip: "Division of integers with unlike signs gives a negative quotient" }
    ],
    body: `# Chapter 1: Integers — Theory & Core Rules

An **integer** is any number from the set {... -3, -2, -1, 0, 1, 2, 3 ...}. Integers extend the whole numbers into negative territory to model values below reference baselines such as temperatures below freezing, depths below sea level, and financial debits.

### 1. Fundamental Properties of Integers
* **Closure Property:** If $a$ and $b$ are integers, then $a + b$, $a - b$, and $a \\times b$ are always integers. Integer division is NOT closed (e.g. $3 \\div 2 = 1.5$, not an integer).
* **Commutative Property:** $a + b = b + a$ and $a \\times b = b \\times a$. Subtraction and division are NOT commutative ($5 - 2 \\neq 2 - 5$).
* **Associative Property:** $(a + b) + c = a + (b + c)$ and $(a \\times b) \\times c = a \\times (b \\times c)$.
* **Distributive Law:** $a \\times (b + c) = (a \\times b) + (a \\times c)$.

### 2. Operational Sign Rules
1. **Addition:**
   - Same signs: Add absolute values and preserve the common sign: $(-7) + (-5) = -12$.
   - Different signs: Subtract smaller absolute value from larger, take sign of larger: $(-9) + 4 = -5$.
2. **Subtraction:**
   - Add the additive inverse: $a - b = a + (-b)$. Example: $8 - (-3) = 8 + 3 = 11$.
3. **Multiplication & Division:**
   - Like signs yield POSITIVE: $(-) \\times (-) = (+)$, $(+) \\div (+) = (+)$.
   - Unlike signs yield NEGATIVE: $(-) \\times (+) = (-)$, $(+) \\div (-) = (-)$.`
  },
  {
    id: "res-g7-02",
    title: "Class 7 Mathematics: Fractions, Decimals & Reciprocal Division",
    subject: "Mathematics",
    grade: 7,
    gradeLevel: 7,
    gradeWing: "Middle (6–8)",
    topic: "Fractions and Decimals",
    difficulty: "Intermediate",
    type: "Concept Guide",
    readTime: "6 min read",
    thumbnail: "🍰",
    summary: "Visual guide to multiplication of fractions, finding reciprocals, and reciprocal division step-by-step.",
    formulas: [
      { name: "Fraction Multiplication", rule: "(a/b) · (c/d) = (a · c) / (b · d)", tip: "Multiply numerators together and denominators together" },
      { name: "Fraction Division", rule: "(a/b) ÷ (c/d) = (a/b) · (d/c)", tip: "Invert second fraction (reciprocal) and multiply" },
      { name: "Reciprocal Definition", rule: "(a/b) · (b/a) = 1", tip: "Two non-zero numbers whose product is 1 are mutual reciprocals" },
      { name: "Decimal Multiplication", rule: "0.a · 0.b = count total decimal places", tip: "Multiply ignoring decimal, then shift decimal left by sum of places" }
    ],
    body: `# Chapter 2: Fractions and Decimals

A **fraction** represents part of a whole or ratio of two quantities: $\\frac{a}{b}$ where $b \\neq 0$.

### 1. Types of Fractions
* **Proper Fraction:** Numerator is smaller than denominator ($\\frac{3}{7} < 1$).
* **Improper Fraction:** Numerator is greater than or equal to denominator ($\\frac{9}{4} \\ge 1$).
* **Mixed Fraction:** Combination of whole number and proper fraction ($2\\frac{1}{4} = \\frac{9}{4}$).

### 2. Why Dividing by a Fraction Means Multiplying by Its Reciprocal
Consider: $6 \\div \\frac{1}{2}$.
This asks: "How many halves are in 6 whole units?"
Since every single whole unit contains two halves, 6 units contain $6 \\times 2 = 12$ halves.
Thus: $6 \\div \\frac{1}{2} = 6 \\times \\frac{2}{1} = 12$.

### 3. Worked Example:
Calculate: $\\frac{3}{5} \\div \\frac{9}{10}$
* Step 1: Write reciprocal of divisor $\\frac{9}{10} \\implies \\frac{10}{9}$.
* Step 2: Multiply: $\\frac{3}{5} \\times \\frac{10}{9} = \\frac{3 \\times 10}{5 \\times 9} = \\frac{30}{45}$.
* Step 3: Simplify by HCF (15): $\\frac{30 \\div 15}{45 \\div 15} = \\frac{2}{3}$.`
  },
  {
    id: "res-g7-03",
    title: "Class 7 Mathematics: Rational Numbers & Standard Form",
    subject: "Mathematics",
    grade: 7,
    gradeLevel: 7,
    gradeWing: "Middle (6–8)",
    topic: "Rational Numbers",
    difficulty: "Foundational",
    type: "Concept Guide",
    readTime: "5 min read",
    thumbnail: "📐",
    summary: "Understanding rational numbers p/q, positive vs negative rationals, reducing to standard form, and number line mapping.",
    formulas: [
      { name: "Standard Form", rule: "p/q with q > 0 and HCF(|p|, q) = 1", tip: "Denominator must be positive and fraction fully reduced" },
      { name: "Equivalent Rationals", rule: "(p · m) / (q · m) = p/q", tip: "Multiply numerator and denominator by same non-zero integer" },
      { name: "Rational Comparison", rule: "a/b vs c/d => Compare (a · d) with (b · c)", tip: "Cross multiplication comparison when b, d > 0" }
    ],
    body: `# Chapter 3: Rational Numbers

A number that can be written in the form $\\frac{p}{q}$, where $p$ and $q$ are integers and $q \\neq 0$, is called a **Rational Number**.

### 1. Comparison with Fractions
* Every fraction is a rational number, but not every rational number is a fraction (e.g. $-\\frac{3}{5}$ is rational but not a traditional fraction of physical objects).
* All integers are rational numbers because any integer $n$ can be written as $\\frac{n}{1}$.

### 2. Standard Form of a Rational Number
A rational number $\\frac{p}{q}$ is said to be in **standard form** if:
1. Its denominator $q$ is a positive integer ($q > 0$).
2. The only common factor between $p$ and $q$ is 1 (coprime).

**Example:** Reduce $\\frac{-36}{48}$ to standard form:
* $\\text{HCF}(36, 48) = 12$.
* Divide numerator and denominator by 12: $\\frac{-36 \\div 12}{48 \\div 12} = \\frac{-3}{4}$.`
  },
  {
    id: "res-g7-04",
    title: "Class 7 Mathematics: Simple Linear Equations & Transposition",
    subject: "Mathematics",
    grade: 7,
    gradeLevel: 7,
    gradeWing: "Middle (6–8)",
    topic: "Simple Equations",
    difficulty: "Intermediate",
    type: "Formula Sheet",
    readTime: "5 min read",
    thumbnail: "⚖️",
    summary: "Balance scale method vs transposition method for solving one-variable linear equations.",
    formulas: [
      { name: "Transposition Rule", rule: "ax + b = c => ax = c - b => x = (c - b) / a", tip: "Changing sides changes sign: + becomes -, · becomes ÷" },
      { name: "Additive Inversion", rule: "x - k = m => x = m + k", tip: "Add k to both sides" },
      { name: "Division Inversion", rule: "x / k = m => x = m · k", tip: "Multiply both sides by k" }
    ],
    body: `# Chapter 4: Simple Equations

An **equation** is a condition on a variable stating that two mathematical expressions have equal value. The value of the variable for which the equation is satisfied is called the **solution** or **root**.

### 1. Transposition Method
Transposing means moving a term from one side of the equality sign to the other side:
* A $+$ term becomes a $-$ term upon transposition.
* A $-$ term becomes a $+$ term upon transposition.
* A $\\times$ factor becomes a $\\div$ divisor.
* A $\\div$ divisor becomes a $\\times$ factor.

### 2. Worked Problem:
Solve: $3(x - 2) + 5 = 20$
* Step 1: Subtract 5 from both sides: $3(x - 2) = 20 - 5 = 15$.
* Step 2: Divide both sides by 3: $x - 2 = \\frac{15}{3} = 5$.
* Step 3: Add 2 to both sides: $x = 5 + 2 = 7$.
* Verification: $\\text{LHS} = 3(7 - 2) + 5 = 3(5) + 5 = 15 + 5 = 20 = \\text{RHS}$.`
  },
  {
    id: "res-g7-05",
    title: "Class 7 Mathematics: Lines, Angles & Transversal Properties",
    subject: "Mathematics",
    grade: 7,
    gradeLevel: 7,
    gradeWing: "Middle (6–8)",
    topic: "Lines and Angles",
    difficulty: "Intermediate",
    type: "Concept Guide",
    readTime: "6 min read",
    thumbnail: "📐",
    summary: "Complementary, supplementary, linear pairs, vertically opposite angles, and parallel lines cut by a transversal.",
    formulas: [
      { name: "Complementary Angles", rule: "∠A + ∠B = 90°", tip: "Two angles whose sum is 90 degrees" },
      { name: "Supplementary Angles", rule: "∠A + ∠B = 180°", tip: "Two angles whose sum is 180 degrees" },
      { name: "Linear Pair", rule: "Adjacent angles on straight line sum to 180°", tip: "Forms a continuous straight line" },
      { name: "Vertically Opposite", rule: "∠1 = ∠3 and ∠2 = ∠4", tip: "Opposite angles formed by two intersecting lines are equal" }
    ],
    body: `# Chapter 5: Lines and Angles

### 1. Angle Pairs
* **Complementary Angles:** Sum = $90^\\circ$. If one angle is $35^\\circ$, its complement is $90^\\circ - 35^\\circ = 55^\\circ$.
* **Supplementary Angles:** Sum = $180^\\circ$. If one angle is $110^\\circ$, its supplement is $180^\\circ - 110^\\circ = 70^\\circ$.
* **Vertically Opposite Angles:** When two lines intersect at a point, the vertically opposite angles are equal.

### 2. Angles Made by a Transversal with Parallel Lines
When a transversal intersects two parallel lines ($l \\parallel m$):
1. **Corresponding Angles are Equal:** $\\angle 1 = \\angle 5, \\angle 2 = \\angle 6, \\angle 3 = \\angle 7, \\angle 4 = \\angle 8$.
2. **Alternate Interior Angles are Equal:** $\\angle 3 = \\angle 5, \\angle 4 = \\angle 6$.
3. **Co-Interior Angles are Supplementary:** $\\angle 3 + \\angle 6 = 180^\\circ, \\angle 4 + \\angle 5 = 180^\\circ$.`
  },
  {
    id: "res-g7-06",
    title: "Class 7 Mathematics: Triangles & Pythagoras Theorem",
    subject: "Mathematics",
    grade: 7,
    gradeLevel: 7,
    gradeWing: "Middle (6–8)",
    topic: "Triangles and Properties",
    difficulty: "Intermediate",
    type: "Concept Guide",
    readTime: "7 min read",
    thumbnail: "🔺",
    summary: "Medians, altitudes, angle sum property, exterior angle theorem, triangle inequality, and Pythagoras theorem.",
    formulas: [
      { name: "Angle Sum Property", rule: "∠A + ∠B + ∠C = 180°", tip: "Total measure of three interior angles of a triangle is 180°" },
      { name: "Exterior Angle Theorem", rule: "Exterior ∠ = Sum of two interior opposite ∠s", tip: "Exterior angle equals sum of remote interior angles" },
      { name: "Triangle Inequality", rule: "a + b > c", tip: "Sum of lengths of any two sides must exceed the third side" },
      { name: "Pythagoras Theorem", rule: "Hypotenuse² = Base² + Altitude²", tip: "In right-angled triangle: c² = a² + b²" }
    ],
    body: `# Chapter 6: The Triangle and Its Properties

A **triangle** is a 3-sided closed polygon.

### 1. Key Internal Lines
* **Median:** Connects a vertex to the midpoint of the opposite side (every triangle has 3 medians meeting at the centroid).
* **Altitude:** Perpendicular line segment drawn from a vertex to the opposite line/side (meets at the orthocentre).

### 2. Exterior Angle Theorem
An exterior angle of a triangle equals the sum of its two interior opposite angles:
$$\\text{Ext } \\angle = \\angle 1 + \\angle 2$$

### 3. Pythagoras Property (Right Triangles)
In a right-angled triangle with legs $a, b$ and hypotenuse $c$:
$$c^2 = a^2 + b^2$$
*Common Triplets:* $(3, 4, 5)$, $(6, 8, 10)$, $(5, 12, 13)$, $(8, 15, 17)$.`
  },
  {
    id: "res-g7-07",
    title: "Class 7 Mathematics: Comparing Quantities, Percentages & Simple Interest",
    subject: "Mathematics",
    grade: 7,
    gradeLevel: 7,
    gradeWing: "Middle (6–8)",
    topic: "Comparing Quantities",
    difficulty: "Intermediate",
    type: "Formula Sheet",
    readTime: "6 min read",
    thumbnail: "📊",
    summary: "Ratios, percentage conversions, profit & loss formulas, and calculating simple interest.",
    formulas: [
      { name: "Percentage Formula", rule: "% = (Part / Whole) · 100", tip: "Convert fraction or decimal to percentage" },
      { name: "Profit Percentage", rule: "Profit % = ((SP - CP) / CP) · 100", tip: "Profit is always calculated with reference to CP" },
      { name: "Loss Percentage", rule: "Loss % = ((CP - SP) / CP) · 100", tip: "Loss is always calculated with reference to CP" },
      { name: "Simple Interest", rule: "I = (P · R · T) / 100", tip: "P = Principal, R = Rate % per annum, T = Time in years" },
      { name: "Total Amount", rule: "A = P + I", tip: "Total sum repaid at end of loan period" }
    ],
    body: `# Chapter 7: Comparing Quantities

Comparing two quantities in the same unit can be done using **ratios** ($a:b = \\frac{a}{b}$) or **percentages** (parts per hundred).

### 1. Commercial Arithmetic (Profit & Loss)
* **Cost Price (CP):** The amount paid to buy or manufacture a good.
* **Selling Price (SP):** The amount at which the good is sold.
* If $SP > CP \\implies \\text{Profit} = SP - CP$.
* If $CP > SP \\implies \\text{Loss} = CP - SP$.

### 2. Simple Interest (SI)
$$I = \\frac{P \\times R \\times T}{100}$$
* $P$ = Principal (money borrowed or deposited)
* $R$ = Annual rate of interest in %
* $T$ = Time duration in years
* $\\text{Total Amount } A = P + I$`
  },
  {
    id: "res-g7-08",
    title: "Class 7 Mathematics: Algebraic Expressions & Terms",
    subject: "Mathematics",
    grade: 7,
    gradeLevel: 7,
    gradeWing: "Middle (6–8)",
    topic: "Algebraic Expressions",
    difficulty: "Foundational",
    type: "Concept Guide",
    readTime: "5 min read",
    thumbnail: "🧩",
    summary: "Terms, factors, numerical coefficients, like vs unlike terms, and evaluating algebraic expressions.",
    formulas: [
      { name: "Combining Like Terms", rule: "ax + bx = (a + b)x", tip: "Only terms with exact same variable powers can be added" },
      { name: "Distributive Property", rule: "k · (ax + b) = k·ax + k·b", tip: "Multiply k across each term inside" },
      { name: "Evaluation", rule: "Substitute variable value directly", tip: "Follow PEMDAS / BODMAS priority" }
    ],
    body: `# Chapter 8: Algebraic Expressions

An **algebraic expression** is formed by combining variables (symbols representing unknown numbers) and constants using arithmetic operations ($+, -, \\times, \\div$).

### 1. Anatomy of an Expression: $7x^2 - 4xy + 9$
* **Terms:** Parts added together: $7x^2$, $-4xy$, and $9$.
* **Factors:** Components multiplied: For $7x^2$, factors are $7, x, x$.
* **Numerical Coefficient:** Number multiplying variable ($7$ for $7x^2$, $-4$ for $-4xy$).

### 2. Like vs. Unlike Terms
* **Like Terms:** Terms having identical algebraic factors (e.g., $4xy$ and $-8xy$; $3a^2b$ and $5a^2b$). Like terms can be added or subtracted.
* **Unlike Terms:** Different variable factors (e.g., $3x$ and $3y$; $2x^2$ and $2x$). Unlike terms CANNOT be merged into a single term.`
  },
  {
    id: "res-g7-09",
    title: "Class 7 Mathematics: Exponents & Powers Laws",
    subject: "Mathematics",
    grade: 7,
    gradeLevel: 7,
    gradeWing: "Middle (6–8)",
    topic: "Exponents and Powers",
    difficulty: "Intermediate",
    type: "Formula Sheet",
    readTime: "5 min read",
    thumbnail: "⚡",
    summary: "The 6 fundamental laws of indices and expressing numbers in scientific standard form.",
    formulas: [
      { name: "Product of Powers", rule: "aᵐ · aⁿ = aᵐ⁺ⁿ", tip: "Add exponents when multiplying powers of the same base" },
      { name: "Quotient of Powers", rule: "aᵐ / aⁿ = aᵐ⁻ⁿ", tip: "Subtract exponents when dividing powers of the same base" },
      { name: "Power of a Power", rule: "(aᵐ)ⁿ = aᵐ·ⁿ", tip: "Multiply powers" },
      { name: "Power of a Product", rule: "(a · b)ᵐ = aᵐ · bᵐ", tip: "Distribute exponent across factors" },
      { name: "Zero Exponent Rule", rule: "a⁰ = 1", tip: "Any non-zero base raised to power 0 equals 1" }
    ],
    body: `# Chapter 9: Exponents and Powers

In the expression $a^n$, $a$ is called the **base** and $n$ is called the **exponent** or **power**. It represents repeated multiplication of $a$ by itself $n$ times.

### The Six Laws of Exponents
1. $a^m \\times a^n = a^{m+n}$
2. $a^m \\div a^n = a^{m-n}$ (for $m > n$)
3. $(a^m)^n = a^{m \\times n}$
4. $a^m \\times b^m = (a \\times b)^m$
5. $a^m \\div b^m = (\\frac{a}{b})^m$
6. $a^0 = 1$ (where $a \\neq 0$)

### Scientific Standard Form
Expressing large quantities as $k \\times 10^n$, where $1.0 \\le k < 10$:
* Distance from Earth to Sun $\\approx 149,600,000\\text{ km} = 1.496 \\times 10^8\\text{ km}$.`
  },
  {
    id: "res-g7-10",
    title: "Class 7 Mathematics: Perimeter & Area of Plane Figures",
    subject: "Mathematics",
    grade: 7,
    gradeLevel: 7,
    gradeWing: "Middle (6–8)",
    topic: "Perimeter and Area",
    difficulty: "Intermediate",
    type: "Formula Sheet",
    readTime: "6 min read",
    thumbnail: "📏",
    summary: "Formulas for perimeter and area of squares, rectangles, parallelograms, triangles, and circles.",
    formulas: [
      { name: "Rectangle", rule: "Area = l · b, Perimeter = 2(l + b)", tip: "Length times breadth" },
      { name: "Square", rule: "Area = s², Perimeter = 4s", tip: "Side squared" },
      { name: "Parallelogram", rule: "Area = Base · Height", tip: "Perpendicular height to base" },
      { name: "Triangle", rule: "Area = (1/2) · Base · Height", tip: "Half base times perpendicular height" },
      { name: "Circle Circumference", rule: "C = 2 · π · r = π · d", tip: "π ≈ 22/7 or 3.14" },
      { name: "Circle Area", rule: "A = π · r²", tip: "π times radius squared" }
    ],
    body: `# Chapter 10: Perimeter and Area

* **Perimeter:** Distance around a closed two-dimensional figure.
* **Area:** The measure of the surface enclosed by the perimeter.

### 1. Parallelograms & Triangles
* Area of Parallelogram $= b \\times h$
* Area of Triangle $= \\frac{1}{2} \\times b \\times h$

### 2. Circle Geometry
* **Circumference:** $C = 2\\pi r = \\pi d$
* **Area:** $A = \\pi r^2$
* Where $\\pi = \\frac{22}{7} \\approx 3.14159$.

**Example:** Find area of circular garden with radius $14\\text{ m}$:
$$A = \\frac{22}{7} \\times 14 \\times 14 = 22 \\times 2 \\times 14 = 616\\text{ m}^2$$`
  },
  {
    id: "res-07",
    title: "Greenwood Public School — CBSE Official Curriculum Class VII (2026–2027)",
    subject: "All",
    grade: 7,
    gradeLevel: 7,
    gradeWing: "Middle (6–8)",
    topic: "CBSE Syllabus",
    difficulty: "Foundational",
    type: "Curriculum Documents",
    readTime: "Official Syllabus",
    thumbnail: "🏛️",
    summary: "Official Greenwood Public School Class 7 CBSE curriculum syllabus overview covering Mathematics, Science, English, Social Science, and Hindi.",
    body: `# Greenwood Public School, Sector-9, Gurugram
## Official CBSE Curriculum Structure — Class VII (Session 2026–2027)
**CBSE Affiliation No:** 530649 | **School Code:** 40643 | **Source:** https://www.greenwoodgurgaon.com

### 1. Mathematics Competencies
- Integers: Properties of addition and subtraction, multiplication and division of integers.
- Fractions & Decimals: Multiplication and division of fractions, decimal arithmetic.
- Simple Equations: Setting up and solving linear equations in one variable.
- Lines and Angles: Complementary, supplementary, vertically opposite angles, transversal lines.
- The Triangle and its Properties: Medians, altitudes, angle sum property, exterior angle theorem, Pythagoras theorem.
- Comparing Quantities: Ratios, percentages, profit and loss, simple interest.
- Perimeter and Area: Squares, rectangles, triangles, parallelograms, circles (circumference and area).

### 2. Science Competencies
- Nutrition in Plants: Autotrophic and heterotrophic nutrition, photosynthesis mechanism.
- Heat and Temperature: Conduction, convection, radiation, clinical and laboratory thermometers.
- Acids, Bases and Salts: Natural indicators (litmus, turmeric, china rose), neutralization reactions.
- Physical and Chemical Changes: Rusting of iron, crystallization, chemical reactions.
- Motion and Time: Uniform and non-uniform motion, measurement of speed, distance-time graphs.
- Electric Current and Its Effects: Electric circuit components, magnetic effect, electromagnet, electric bell.
- Light: Rectilinear propagation, reflection from mirrors, spherical mirrors, lenses, dispersion of light.`
  }
];

export const MOCK_SOLUTIONS = [
  {
    id: "sol-01",
    title: "Dividing Unlike Fractions: (2/3) ÷ (4/9)",
    subject: "Math",
    grade: 7,
    chapter: "Fractions & Decimals",
    topic: "Fractions",
    difficulty: "medium",
    isExamFavorite: true,
    problemStatement: "Evaluate: (2/3) ÷ (4/9) and express your answer in simplest irreducible form.",
    given: ["First fraction = 2/3 (dividend)", "Second fraction = 4/9 (divisor)", "Operation = Division (÷)"],
    toFind: "Simplest reduced fractional value of (2/3) ÷ (4/9)",
    coreConcept: "Dividing by a fraction is equivalent to multiplying by its reciprocal (invert and multiply).",
    formula: "(a/b) ÷ (c/d) = (a/b) × (d/c) = (a × d) / (b × c)",
    steps: [
      {
        stepNumber: 1,
        title: "Recognize Fraction Division as Reciprocal Multiplication",
        explanation: "Invert the divisor (second fraction) by swapping its numerator and denominator to find its reciprocal.",
        math: "(2/3) ÷ (4/9)  -->  (2/3) × (9/4)"
      },
      {
        stepNumber: 2,
        title: "Cross-Cancel Common Factors Before Multiplying",
        explanation: "Notice that 2 and 4 share factor 2 (2÷2=1, 4÷2=2), and 9 and 3 share factor 3 (9÷3=3, 3÷3=1).",
        math: "(1/1) × (3/2) = (1 × 3) / (1 × 2)"
      },
      {
        stepNumber: 3,
        title: "Multiply and Simplify to Lowest Terms",
        explanation: "Multiply the remaining terms: (1 × 3) / (1 × 2) = 3/2. Convert to mixed number if required.",
        math: "3/2 = 1 1/2"
      }
    ],
    finalAnswer: "3/2 (or 1 1/2)",
    verification: "Check by inverse operation: (3/2) × (4/9) = (3 × 4) / (2 × 9) = 12/18 = 2/3. Matches original dividend exactly!",
    commonMistakes: [
      "Flipping the first fraction instead of the second fraction.",
      "Multiplying numerators directly without finding the reciprocal: (2×4)/(3×9) = 8/27 (Incorrect!).",
      "Forgetting to reduce 18/12 to simplest terms."
    ],
    relatedPractice: {
      question: "Evaluate: (3/5) ÷ (9/10)",
      answer: "2/3",
      hint: "Invert 9/10 to 10/9 and cross-cancel common factors 5 and 10, then 3 and 9."
    }
  },
  {
    id: "sol-02",
    title: "Solving Two-Step Linear Equations: 3(2x - 1) = 4x + 9",
    subject: "Math",
    grade: 7,
    chapter: "Simple Equations",
    topic: "Algebra Basics",
    difficulty: "hard",
    isExamFavorite: true,
    problemStatement: "Solve for the variable x in the equation: 3(2x - 1) = 4x + 9.",
    given: ["Linear equation: 3(2x - 1) = 4x + 9", "Variable x has unknown single value"],
    toFind: "The numeric value of x that satisfies the equality",
    coreConcept: "Properties of Equality: Whatever inverse operation is performed on the left-hand side must also be performed on the right-hand side.",
    formula: "Distributive Property: a(b + c) = ab + ac; Transposition: ax = b => x = b/a",
    steps: [
      {
        stepNumber: 1,
        title: "Distribute the 3 Across the Parentheses",
        explanation: "Multiply 3 by 2x, and 3 by -1 to clear the brackets:",
        math: "3 × (2x) - 3 × (1) = 6x - 3  ==>  6x - 3 = 4x + 9"
      },
      {
        stepNumber: 2,
        title: "Collect Variable Terms on the Left-Hand Side",
        explanation: "Subtract 4x from both sides of the equation:",
        math: "(6x - 4x) - 3 = 9  ==>  2x - 3 = 9"
      },
      {
        stepNumber: 3,
        title: "Isolate the Variable Term by Adding 3",
        explanation: "Apply the additive inverse by adding 3 to both sides:",
        math: "2x = 9 + 3  ==>  2x = 12"
      },
      {
        stepNumber: 4,
        title: "Solve for x by Dividing by the Coefficient",
        explanation: "Divide both sides by 2:",
        math: "x = 12 / 2  ==>  x = 6"
      }
    ],
    finalAnswer: "x = 6",
    verification: "Substitute x = 6 into LHS: 3(2(6) - 1) = 3(12 - 1) = 3(11) = 33. RHS: 4(6) + 9 = 24 + 9 = 33. LHS = RHS = 33 (Verified!)",
    commonMistakes: [
      "Multiplying only the 2x by 3 and forgetting to multiply -1 (writing 6x - 1 instead of 6x - 3).",
      "Sign error when moving -3 across the equals sign (subtracting 3 instead of adding 3)."
    ],
    relatedPractice: {
      question: "Solve for y: 4(3y + 2) = 5y + 29",
      answer: "y = 3",
      hint: "Expand 4(3y + 2) = 12y + 8, then subtract 5y and subtract 8."
    }
  },
  {
    id: "sol-03",
    title: "Net Force & Acceleration: Newton's Second Law",
    subject: "Science",
    grade: 7,
    chapter: "Motion and Time",
    topic: "Forces & Motion",
    difficulty: "medium",
    isExamFavorite: true,
    problemStatement: "A trolley with mass m = 15 kg accelerates along a smooth track at a = 3 m/s². Calculate the magnitude of the unbalanced net force applied.",
    given: ["Mass of trolley m = 15 kg", "Acceleration a = 3 m/s²", "Surface = Smooth (friction negligible)"],
    toFind: "Net Force F acting on the trolley in Newtons (N)",
    coreConcept: "Newton's Second Law of Motion: The rate of change of momentum is directly proportional to the applied unbalanced force and occurs in the direction of the force.",
    formula: "F = m × a  (where F is in Newtons, m in kg, a in m/s²)",
    steps: [
      {
        stepNumber: 1,
        title: "Identify Known Values in Standard SI Units",
        explanation: "Check that mass is in kilograms (kg) and acceleration is in meters per second squared (m/s²).",
        math: "m = 15\\text{ kg}, \\quad a = 3\\text{ m/s}^2"
      },
      {
        stepNumber: 2,
        title: "Substitute Known Values into Newton's Second Law",
        explanation: "Multiply mass by acceleration:",
        math: "F = 15\\text{ kg} \\times 3\\text{ m/s}^2 = 45\\text{ kg}\\cdot\\text{m/s}^2"
      },
      {
        stepNumber: 3,
        title: "Express Result in Standard Derived Unit",
        explanation: "Recall that 1 kg·m/s² is defined as 1 Newton (N).",
        math: "F = 45\\text{ N}"
      }
    ],
    finalAnswer: "45 N (Newtons)",
    verification: "Dimensional check: [F] = [M][L][T]^-2 = kg · m/s² = N. Reverse calculate: a = F / m = 45 / 15 = 3 m/s² (Consistent!)",
    commonMistakes: [
      "Confusing Mass (kg) with Weight (N).",
      "Using non-standard units (e.g. grams or cm/s²) without converting to kg and m/s² first."
    ],
    relatedPractice: {
      question: "What acceleration is produced when a force of 60 N acts on a mass of 12 kg?",
      answer: "5 m/s²",
      hint: "Rearrange F = ma to a = F / m = 60 / 12."
    }
  },
  {
    id: "sol-04",
    title: "Photosynthesis Balanced Equation: Carbon Dioxide to Glucose",
    subject: "Science",
    grade: 7,
    chapter: "Nutrition in Plants",
    topic: "Photosynthesis",
    difficulty: "hard",
    isExamFavorite: true,
    problemStatement: "Write the balanced chemical word and molecular equation for photosynthesis, and identify the source of each reactant and fate of each product.",
    given: ["Reactants = Carbon dioxide, Water, Solar Energy", "Catalysts = Chlorophyll inside chloroplasts", "Products = Glucose, Oxygen gas"],
    toFind: "Balanced stoichiometric equation and physiological pathway explanation",
    coreConcept: "Autotrophic nutrition: Green plants convert inorganic carbon and water into organic chemical energy using radiant photon energy.",
    formula: "6CO_2 + 6H_2O + \\text{Light Energy} \\xrightarrow{\\text{Chlorophyll}} C_6H_{12}O_6 + 6O_2",
    steps: [
      {
        stepNumber: 1,
        title: "Identify Reactants and Entry Pathways",
        explanation: "CO2 enters leaves from atmosphere through microscopic stomata; H2O is absorbed by roots from soil and transported via xylem vessels.",
        math: "6\\text{CO}_2 \\text{ (from air)} + 6\\text{H}_2\\text{O} \\text{ (from soil)}"
      },
      {
        stepNumber: 2,
        title: "Light Absorption and Photolysis",
        explanation: "Chlorophyll absorbs red and blue light wavelengths to split H2O into hydrogen and oxygen (photolysis).",
        math: "2\\text{H}_2\\text{O} \\xrightarrow{\\text{Light}} 4\\text{H}^+ + 4e^- + \\text{O}_2 \\uparrow"
      },
      {
        stepNumber: 3,
        title: "Carbon Fixation (Glucose Synthesis)",
        explanation: "Hydrogen reduces CO2 to synthesize one hexose sugar molecule (glucose).",
        math: "6\\text{CO}_2 + 12\\text{H}^+ + 12e^- \\rightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{H}_2\\text{O}"
      }
    ],
    finalAnswer: "6CO2 + 6H2O + Sunlight -> C6H12O6 + 6O2",
    verification: "Atom count check: Left side has 6 Carbon, 12 Hydrogen, 18 Oxygen. Right side has 6 Carbon, 12 Hydrogen, 18 Oxygen. Law of Conservation of Mass is strictly preserved!",
    commonMistakes: [
      "Stating that oxygen is produced from CO2 instead of water (oxygen comes strictly from photolysis of H2O).",
      "Forgetting that plants respire 24/7 using mitochondria while photosynthesizing only in the presence of light."
    ],
    relatedPractice: {
      question: "Which test confirms the presence of starch produced during photosynthesis in a de-starched green leaf?",
      answer: "Iodine test (turns blue-black in the presence of starch).",
      hint: "Boil leaf in water, then alcohol to remove chlorophyll, then add drops of iodine solution."
    }
  },
  {
    id: "sol-g3-01",
    title: "Place Value in 3-Digit Numbers: Finding the Value of 7 in 472",
    subject: "Mathematics",
    grade: 3,
    chapter: "Fun with Numbers",
    topic: "3-Digit Numbers & Place Value",
    difficulty: "easy",
    isExamFavorite: true,
    problemStatement: "In the number 472, identify the face value and the place value of the digit 7.",
    given: ["Number: 472", "Target digit: 7"],
    toFind: "Face value and place value of the digit 7",
    coreConcept: "Place value depends on the position of the digit (Ones = 1, Tens = 10, Hundreds = 100), while face value is the number itself.",
    formula: "\\text{Place Value} = \\text{Face Value} \\times \\text{Position Multiplier}",
    steps: [
      {
        stepNumber: 1,
        title: "Identify Face Value",
        explanation: "The face value of a digit is simply the digit itself, regardless of where it appears in the number.",
        math: "\\text{Face Value of 7} = 7"
      },
      {
        stepNumber: 2,
        title: "Identify Column Position",
        explanation: "Write down the columns: Hundreds (4), Tens (7), Ones (2). Digit 7 is in the Tens column.",
        math: "4 \\times 100 + 7 \\times 10 + 2 \\times 1"
      },
      {
        stepNumber: 3,
        title: "Calculate Place Value",
        explanation: "Multiply the face value (7) by the tens multiplier (10).",
        math: "7 \\times 10 = 70"
      }
    ],
    finalAnswer: "Face value = 7; Place value = 70 (Tens place)",
    verification: "Sum the place values: 400 + 70 + 2 = 472. Matches original number!",
    commonMistakes: [
      "Confusing place value (70) with face value (7).",
      "Writing 700 instead of 70 by confusing the tens column with hundreds."
    ],
    relatedPractice: {
      question: "What is the place value of 5 in the number 538?",
      answer: "500 (Hundreds place)",
      hint: "Look at which column 5 sits in: Hundreds, Tens, or Ones?"
    }
  },
  {
    id: "sol-g3-02",
    title: "3-Digit Addition with Regrouping: 185 + 67",
    subject: "Mathematics",
    grade: 3,
    chapter: "Give and Take",
    topic: "Addition with Regrouping",
    difficulty: "medium",
    isExamFavorite: true,
    problemStatement: "Calculate the total sum of 185 and 67 by aligning column place values and carrying over.",
    given: ["First addend = 185", "Second addend = 67"],
    toFind: "Total sum with carrying",
    coreConcept: "When the sum of digits in any place exceeds 9, carry the tens value to the next column to the left.",
    formula: "\\text{Sum} = 185 + 67",
    steps: [
      {
        stepNumber: 1,
        title: "Add the Ones Column",
        explanation: "5 ones + 7 ones = 12 ones. Write down 2 in the ones column, carry over 1 ten.",
        math: "5 + 7 = 12 \\implies \\text{write 2, carry 1 ten}"
      },
      {
        stepNumber: 2,
        title: "Add the Tens Column",
        explanation: "1 (carried) + 8 tens + 6 tens = 15 tens. Write 5 in the tens column, carry 1 hundred.",
        math: "1 + 8 + 6 = 15 \\implies \\text{write 5, carry 1 hundred}"
      },
      {
        stepNumber: 3,
        title: "Add the Hundreds Column",
        explanation: "1 (carried) + 1 hundred = 2 hundreds.",
        math: "1 + 1 = 2"
      }
    ],
    finalAnswer: "252",
    verification: "Subtract one addend from sum: 252 - 67 = 185. Exact check!",
    commonMistakes: [
      "Forgetting to add the carry digit into the tens column.",
      "Writing 12 in the ones column directly (resulting in 1812)."
    ],
    relatedPractice: {
      question: "Calculate: 146 + 78",
      answer: "224",
      hint: "Remember to carry 1 from ones to tens, and from tens to hundreds."
    }
  },
  {
    id: "sol-g3-03",
    title: "Plant Photosynthesis: How Leaves Make Food",
    subject: "Environmental Studies",
    grade: 3,
    chapter: "The Living World Around Us",
    topic: "Plants and Animals",
    difficulty: "easy",
    isExamFavorite: true,
    problemStatement: "Explain why leaves are called the 'food factories' or 'kitchens' of green plants.",
    given: ["Green leaves contain chlorophyll", "Plants need sunlight, water, and air to grow"],
    toFind: "The biological mechanism by which leaves prepare nutrition for the plant",
    coreConcept: "Leaves use chlorophyll to capture sunlight and combine water from soil with air to prepare food.",
    formula: "\\text{Water} + \\text{Air (Carbon Dioxide)} + \\text{Sunlight} \\xrightarrow{\\text{Chlorophyll}} \\text{Food (Starch)} + \\text{Oxygen}",
    steps: [
      {
        stepNumber: 1,
        title: "Sunlight Capture by Chlorophyll",
        explanation: "Green leaves contain a green pigment called chlorophyll that absorbs sunshine.",
        math: "\\text{Solar Energy Trapped}"
      },
      {
        stepNumber: 2,
        title: "Water and Air Intake",
        explanation: "Roots absorb water from soil, and tiny pores on leaves take in carbon dioxide from the air.",
        math: "\\text{Water from Roots} + \\text{Air through Stomata}"
      },
      {
        stepNumber: 3,
        title: "Food Preparation & Oxygen Release",
        explanation: "The leaf prepares glucose food for the plant and releases fresh oxygen for animals and humans to breathe.",
        math: "\\text{Food Stored} + \\text{Oxygen Released}"
      }
    ],
    finalAnswer: "Leaves synthesize food for the entire plant using chlorophyll, water, air, and sunlight.",
    verification: "Covering a leaf with black paper stops sunlight; that leaf fails to produce starch.",
    commonMistakes: [
      "Thinking roots prepare the food (roots only absorb water and minerals).",
      "Believing plants take in oxygen to make food (they absorb carbon dioxide and release oxygen)."
    ],
    relatedPractice: {
      question: "Which gas is released by green plants during daytime food preparation?",
      answer: "Oxygen gas",
      hint: "It is the gas all animals and humans need to breathe."
    }
  },
  {
    id: "sol-g10-01",
    title: "Nature of Roots & Discriminant: 2x² - 4x + 3 = 0",
    subject: "Mathematics",
    grade: 10,
    chapter: "Real Numbers & Quadratic Equations",
    topic: "Quadratic Equations",
    difficulty: "hard",
    isExamFavorite: true,
    problemStatement: "Determine the discriminant D of the quadratic equation 2x² - 4x + 3 = 0 and comment on the nature of its roots.",
    given: ["Quadratic equation: 2x² - 4x + 3 = 0", "Standard form: ax² + bx + c = 0"],
    toFind: "Value of discriminant D and mathematical nature of the roots",
    coreConcept: "The discriminant D = b² - 4ac dictates whether roots are real and distinct (D > 0), real and equal (D = 0), or non-real/complex (D < 0).",
    formula: "D = b^2 - 4ac",
    steps: [
      {
        stepNumber: 1,
        title: "Identify Standard Coefficients",
        explanation: "Comparing with ax² + bx + c = 0, we identify: a = 2, b = -4, c = 3.",
        math: "a = 2, \\quad b = -4, \\quad c = 3"
      },
      {
        stepNumber: 2,
        title: "Compute Discriminant",
        explanation: "Substitute into formula D = (-4)² - 4(2)(3) = 16 - 24.",
        math: "D = 16 - 24 = -8"
      },
      {
        stepNumber: 3,
        title: "Analyze Nature of Roots",
        explanation: "Since D = -8 < 0, the square root of D is non-real. Hence, the quadratic equation has no real roots.",
        math: "D < 0 \\implies \\text{No real roots (imaginary conjugate pair)}"
      }
    ],
    finalAnswer: "D = -8; The equation has no real roots.",
    verification: "By quadratic formula: x = [4 ± √(-8)] / 4 = [4 ± 2i√2] / 4 = 1 ± (i√2)/2. Roots contain imaginary unit i.",
    commonMistakes: [
      "Calculating (-4)² as -16 instead of +16.",
      "Concluding two equal roots when D < 0 (equal roots require D = 0)."
    ],
    relatedPractice: {
      question: "Find the discriminant of: x² - 6x + 9 = 0",
      answer: "D = 0; Two equal real roots (x = 3).",
      hint: "Calculate b² - 4ac where a = 1, b = -6, c = 9."
    }
  },
  {
    id: "sol-g10-02",
    title: "Ohm's Law: Calculating Voltage Across a Resistor (V = IR)",
    subject: "Science",
    grade: 10,
    chapter: "Electricity and Magnetic Effects",
    topic: "Electricity and Ohm's Law",
    difficulty: "medium",
    isExamFavorite: true,
    problemStatement: "A current of 2.5 A flows through a circuit conductor with resistance 8.0 Ω. Calculate the potential difference across the conductor.",
    given: ["Current I = 2.5 A", "Resistance R = 8.0 Ω"],
    toFind: "Potential difference (Voltage V)",
    coreConcept: "Ohm's Law states that at constant temperature, current through a conductor is directly proportional to potential difference: V = IR.",
    formula: "V = I \\times R",
    steps: [
      {
        stepNumber: 1,
        title: "Verify SI Units",
        explanation: "Current is in Amperes (A) and resistance is in Ohms (Ω). No unit conversion needed.",
        math: "I = 2.5 \\text{ A}, \\quad R = 8.0 \\ \\Omega"
      },
      {
        stepNumber: 2,
        title: "Apply Ohm's Law Formula",
        explanation: "Multiply current by resistance: V = 2.5 × 8.0.",
        math: "V = 2.5 \\times 8.0 = 20.0 \\text{ Volts}"
      }
    ],
    finalAnswer: "20.0 V",
    verification: "Check resistance: R = V / I = 20.0 / 2.5 = 8.0 Ω. Fully consistent!",
    commonMistakes: [
      "Dividing voltage by current instead of multiplying.",
      "Writing power units (Watts) instead of Volts (V)."
    ],
    relatedPractice: {
      question: "What current flows through a 12 Ω resistor connected to a 24 V battery?",
      answer: "2.0 A",
      hint: "Rearrange V = IR to I = V / R."
    }
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
