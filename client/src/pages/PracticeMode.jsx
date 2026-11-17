import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Flame, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  RotateCcw,
  Trophy,
  Brain,
  Award,
  Zap,
  Layers,
  ChevronRight,
  ShieldCheck,
  BookOpen,
  Play,
  HelpCircle,
  Clock,
  Check,
  Target,
  FileCheck,
  Lightbulb,
  GraduationCap
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { DifficultyBadge } from '../components/ui/DifficultyBadge';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { MathRenderer } from '../components/ui/MathRenderer';
import { STEMDiagram } from '../components/ui/STEMDiagram';
import { QuizRibbon } from '../components/QuizRibbon';
import { SpeechButton } from '../components/ui/SpeechButton';
import { useAssessmentKeyboardShortcuts } from '../hooks/useAssessmentKeyboardShortcuts';
import { getQuestions } from '../services/quizService';
import { recordAttempt } from '../services/progressService';
import { saveOfflineAttempt, syncPendingAttempts } from '../services/offlineStorage';
import api from '../services/api';

// Multi-Grade CBSE Curricula for Greenwood Public School
const GRADE_CURRICULA = {
  3: {
    Mathematics: {
      name: "Mathematics",
      icon: "📐",
      chapters: [
        { id: "ch_g3_numbers", name: "Fun with Numbers", topics: ["3-Digit Numbers & Place Value", "Number Sequences & Ordering"] },
        { id: "ch_g3_give_take", name: "Give and Take", topics: ["Addition with Regrouping", "Subtraction with Borrowing"] },
        { id: "ch_g3_times", name: "How Many Times?", topics: ["Multiplication Tables", "Multiplication Properties"] },
        { id: "ch_g3_shapes", name: "Shapes and Time", topics: ["2D Shapes and Properties", "Telling Time", "Length Conversion"] }
      ]
    },
    English: {
      name: "English",
      icon: "📖",
      chapters: [
        { id: "ch_g3_nouns", name: "Nouns & Pronouns", topics: ["Identification of Nouns", "Pronouns"] },
        { id: "ch_g3_verbs", name: "Verbs & Tenses", topics: ["Past Tense Forms", "Action Verbs"] },
        { id: "ch_g3_preps", name: "Adjectives & Prepositions", topics: ["Prepositions of Position & Direction", "Descriptive Adjectives"] },
        { id: "ch_g3_vocab", name: "Vocabulary & Word Power", topics: ["Synonyms (Words with Similar Meaning)", "Antonyms (Words with Opposite Meaning)"] }
      ]
    },
    "Environmental Studies": {
      name: "Environmental Studies (EVS)",
      icon: "🌱",
      chapters: [
        { id: "ch_g3_living", name: "Living World Around Us", topics: ["Plants and Animals", "Living Beings"] },
        { id: "ch_g3_water", name: "Water O Water", topics: ["Water Cycle and Conservation", "States of Water"] },
        { id: "ch_g3_health", name: "Food & Human Body", topics: ["Human Body and Healthy Nutrition", "Sense Organs"] },
        { id: "ch_g3_env", name: "Neighborhood & Nature", topics: ["Shelter, Community Helpers & Conservation", "Eco-friendly Habits"] }
      ]
    }
  },
  7: {
    Mathematics: {
      name: "Mathematics",
      icon: "📐",
      chapters: [
        { id: "ch_g7_integers", name: "Integers & Rational Numbers", topics: ["Integer Multiplication", "Rational Numbers"] },
        { id: "ch_g7_equations", name: "Linear Equations", topics: ["Simple Linear Equations", "Algebraic Expressions"] },
        { id: "ch_g7_geometry", name: "Lines, Angles & Triangles", topics: ["Triangles and Properties", "Lines and Angles"] },
        { id: "ch_g7_quantities", name: "Comparing Quantities", topics: ["Profit and Loss", "Percentages"] }
      ]
    },
    Science: {
      name: "Science",
      icon: "🔬",
      chapters: [
        { id: "ch_g7_nutrition", name: "Nutrition in Plants & Animals", topics: ["Plant and Animal Nutrition", "Digestive Systems"] },
        { id: "ch_g7_acids", name: "Acids, Bases & Salts", topics: ["Chemical Indicators & Neutralization", "Heat Transfer & pH Basics"] },
        { id: "ch_g7_changes", name: "Physical & Chemical Changes", topics: ["Types of Changes", "Rusting Mechanism"] },
        { id: "ch_g7_motion", name: "Motion & Time", topics: ["Physics Foundations", "Speed, Circuits and Optics"] }
      ]
    },
    English: {
      name: "English",
      icon: "📖",
      chapters: [
        { id: "ch_g7_grammar", name: "Grammar & Concord", topics: ["Advanced Grammar & Concord", "Subject-Verb Concord"] },
        { id: "ch_g7_vocab", name: "Vocabulary & Reading", topics: ["Voice, Speech & Idiomatic Expressions", "Vocabulary in Context"] }
      ]
    }
  },
  10: {
    Mathematics: {
      name: "Mathematics",
      icon: "📐",
      chapters: [
        { id: "ch_g10_real", name: "Real Numbers & Polynomials", topics: ["Real Numbers", "Fundamental Theorem of Arithmetic"] },
        { id: "ch_g10_quad", name: "Quadratic Equations", topics: ["Quadratic Equations", "Nature of Roots & Discriminant"] },
        { id: "ch_g10_ap", name: "Arithmetic Progressions", topics: ["Arithmetic Progressions", "nth Term of an AP"] },
        { id: "ch_g10_trig", name: "Introduction to Trigonometry", topics: ["Introduction to Trigonometry", "Trigonometric Ratios & Identities"] },
        { id: "ch_g10_stat", name: "Statistics & Probability", topics: ["Theoretical Probability", "Classical Probability Calculation"] }
      ]
    },
    Science: {
      name: "Science",
      icon: "🔬",
      chapters: [
        { id: "ch_g10_chem", name: "Chemical Reactions & Equations", topics: ["Chemical Reactions and Redox", "Types of Reactions & pH Chemistry"] },
        { id: "ch_g10_bio", name: "Life Processes", topics: ["Life Processes", "Circulation, Excretion and Respiration"] },
        { id: "ch_g10_elec", name: "Electricity & Magnetism", topics: ["Electricity and Ohm's Law", "Magnetic Effects of Electric Current"] },
        { id: "ch_g10_optics", name: "Light & Optics", topics: ["Ray Optics and Human Eye", "Reflection, Refraction and Dispersion"] }
      ]
    },
    English: {
      name: "English",
      icon: "📖",
      chapters: [
        { id: "ch_g10_grammar", name: "Advanced Grammar", topics: ["Advanced Grammar & Concord", "Subject-Verb Concord"] },
        { id: "ch_g10_comp", name: "Reading & Analysis", topics: ["Voice, Speech & Idiomatic Expressions", "Textual Analysis"] }
      ]
    }
  }
};

// 7 Clean Practice Options
const PRACTICE_OPTIONS = [
  {
    id: "continue",
    title: "Continue Learning",
    desc: "Pick up right where you left off in your curriculum",
    icon: Play,
    badge: "Recommended",
    badgeVariant: "emerald"
  },
  {
    id: "topic",
    title: "Practice a Topic",
    desc: "Focus deep on a single concept module",
    icon: Target,
    badge: "Focused",
    badgeVariant: "indigo"
  },
  {
    id: "chapter",
    title: "Practice a Chapter",
    desc: "Multi-topic review covering an entire chapter",
    icon: BookOpen,
    badge: "Comprehensive",
    badgeVariant: "purple"
  },
  {
    id: "mixed",
    title: "Mixed Practice",
    desc: "Cross-chapter curriculum questions calibrated to your skill",
    icon: Layers,
    badge: "Adaptive",
    badgeVariant: "cyan"
  },
  {
    id: "weak_topics",
    title: "Improve Weak Topics",
    desc: "Targeted drill on identified misconceptions and learning gaps",
    icon: TrendingUp,
    badge: "Targeted",
    badgeVariant: "rose"
  },
  {
    id: "exam_prep",
    title: "Exam Preparation",
    desc: "Timed practice following CBSE Board pattern",
    icon: FileCheck,
    badge: "Timed",
    badgeVariant: "amber"
  },
  {
    id: "quick_practice",
    title: "Quick Practice",
    desc: "Fast 5-question confidence booster with instant feedback",
    icon: Zap,
    badge: "Instant",
    badgeVariant: "emerald"
  }
];

const LEVEL_CONFIG = {
  easy: { level: 1, name: "Level 1: Novice", tier: "Foundational", xpReward: 50, nextReq: 150 },
  medium: { level: 2, name: "Level 2: Apprentice", tier: "Procedural", xpReward: 75, nextReq: 300 },
  hard: { level: 3, name: "Level 3: Adept", tier: "Multi-Step", xpReward: 100, nextReq: 500 },
  very_hard: { level: 4, name: "Level 4: Master", tier: "Conceptual", xpReward: 150, nextReq: 800 }
};

// Verified Question Bank Fallback Pool for Practice Mode (Grade 7, 3, 10)
const CURATED_PRACTICE_BANK = [
  // Grade 7 Mathematics
  {
    id: "g7_m_01",
    gradeLevel: 7,
    subject: "Mathematics",
    chapter: "Integers & Rational Numbers",
    topic: "Integer Multiplication",
    difficulty: "medium",
    questionText: "Calculate the exact value of the integer expression: (-15) + (-28) - (-43) = ?",
    options: ["0", "-86", "-30", "56"],
    correctAnswerIndex: 0,
    explanation: "Subtracting a negative number is equivalent to adding its opposite: (-15) + (-28) + 43 = -43 + 43 = 0.",
    steps: [
      { step: "Step 1: Simplify Negative Subtraction", desc: "Recognize that -(-43) becomes +43: (-15) + (-28) + 43." },
      { step: "Step 2: Sum Same-Sign Integers", desc: "Combine negative values: (-15) + (-28) = -43." },
      { step: "Step 3: Final Arithmetic", desc: "Evaluate -43 + 43 = 0." }
    ]
  },
  {
    id: "g7_m_02",
    gradeLevel: 7,
    subject: "Mathematics",
    chapter: "Integers & Rational Numbers",
    topic: "Integer Multiplication",
    difficulty: "medium",
    questionText: "Evaluate the product of three integers: (-6) × (-7) × (-2) = ?",
    options: ["-84", "+84", "-42", "+14"],
    correctAnswerIndex: 0,
    explanation: "An odd number of negative factors produces a negative product: (-6) × (-7) = +42, and (+42) × (-2) = -84.",
    steps: [
      { step: "Step 1: Multiply First Two Factors", desc: "(-6) × (-7) = +42." },
      { step: "Step 2: Multiply by Third Factor", desc: "(+42) × (-2) = -84." }
    ]
  },
  {
    id: "g7_m_03",
    gradeLevel: 7,
    subject: "Mathematics",
    chapter: "Integers & Rational Numbers",
    topic: "Rational Numbers",
    difficulty: "medium",
    questionText: "Evaluate the addition of fractions: (3/7) + (2/5) = ?",
    options: ["29/35", "5/12", "6/35", "1/2"],
    correctAnswerIndex: 0,
    explanation: "Find the common denominator LCM(7, 5) = 35. (3 × 5)/35 + (2 × 7)/35 = 15/35 + 14/35 = 29/35.",
    steps: [
      { step: "Step 1: Find Common Denominator", desc: "The LCM of denominators 7 and 5 is 35." },
      { step: "Step 2: Convert to Equivalent Fractions", desc: "3/7 = 15/35 and 2/5 = 14/35." },
      { step: "Step 3: Add Numerators", desc: "15/35 + 14/35 = 29/35." }
    ]
  },
  {
    id: "g7_m_04",
    gradeLevel: 7,
    subject: "Mathematics",
    chapter: "Integers & Rational Numbers",
    topic: "Rational Numbers",
    difficulty: "medium",
    questionText: "Simplify the rational division: (4/9) ÷ (2/3) = ?",
    options: ["2/3", "8/27", "3/2", "6/18"],
    correctAnswerIndex: 0,
    explanation: "Multiply the dividend by the reciprocal of the divisor: (4/9) × (3/2) = (4 × 3)/(9 × 2) = 12/18 = 2/3.",
    steps: [
      { step: "Step 1: Reciprocal", desc: "The reciprocal of 2/3 is 3/2." },
      { step: "Step 2: Multiply and Simplify", desc: "(4/9) × (3/2) = 12/18 = 2/3." }
    ]
  },
  {
    id: "g7_m_05",
    gradeLevel: 7,
    subject: "Mathematics",
    chapter: "Linear Equations",
    topic: "Simple Linear Equations",
    difficulty: "medium",
    questionText: "Solve for x in the simple linear equation: 5x - 7 = 28",
    options: ["x = 7", "x = 3", "x = 5", "x = 35"],
    correctAnswerIndex: 0,
    explanation: "Add 7 to both sides: 5x = 35. Divide both sides by 5: x = 7.",
    steps: [
      { step: "Step 1: Isolate Variable", desc: "Add 7 to both sides: 5x = 28 + 7 = 35." },
      { step: "Step 2: Solve", desc: "Divide by 5: x = 35 / 5 = 7." }
    ]
  },
  {
    id: "g7_m_06",
    gradeLevel: 7,
    subject: "Mathematics",
    chapter: "Linear Equations",
    topic: "Simple Linear Equations",
    difficulty: "medium",
    questionText: "Solve for y: (y / 3) + 5 = 12",
    options: ["y = 21", "y = 7", "y = 36", "y = 15"],
    correctAnswerIndex: 0,
    explanation: "Subtract 5 from both sides: y / 3 = 7. Multiply both sides by 3: y = 21.",
    steps: [
      { step: "Step 1: Transpose Constant", desc: "y / 3 = 12 - 5 = 7." },
      { step: "Step 2: Multiply by 3", desc: "y = 7 × 3 = 21." }
    ]
  },
  {
    id: "g7_m_07",
    gradeLevel: 7,
    subject: "Mathematics",
    chapter: "Lines, Angles & Triangles",
    topic: "Lines and Angles",
    difficulty: "medium",
    questionText: "Two supplementary angles have measures (x + 15)° and (x - 15)°. Find the value of x:",
    options: ["90°", "45°", "180°", "60°"],
    correctAnswerIndex: 0,
    explanation: "Supplementary angles sum to 180°: (x + 15) + (x - 15) = 180° => 2x = 180° => x = 90°.",
    steps: [
      { step: "Step 1: Formulate Equation", desc: "(x + 15) + (x - 15) = 180." },
      { step: "Step 2: Combine Like Terms", desc: "2x = 180 => x = 90°." }
    ]
  },
  {
    id: "g7_m_08",
    gradeLevel: 7,
    subject: "Mathematics",
    chapter: "Lines, Angles & Triangles",
    topic: "Triangles and Properties",
    difficulty: "medium",
    questionText: "In an isosceles triangle, the vertex angle is 40°. What is the measure of each equal base angle?",
    options: ["70°", "80°", "60°", "50°"],
    correctAnswerIndex: 0,
    explanation: "Sum of angles in a triangle is 180°. Remaining sum = 180° - 40° = 140°. Each base angle = 140° / 2 = 70°.",
    steps: [
      { step: "Step 1: Angle Sum Property", desc: "Total sum of angles in a triangle = 180°." },
      { step: "Step 2: Subtract Vertex Angle", desc: "180° - 40° = 140°." },
      { step: "Step 3: Divide by 2", desc: "140° / 2 = 70°." }
    ]
  },
  {
    id: "g7_m_09",
    gradeLevel: 7,
    subject: "Mathematics",
    chapter: "Comparing Quantities",
    topic: "Percentages",
    difficulty: "medium",
    questionText: "Calculate 15% of 240:",
    options: ["36", "24", "48", "30"],
    correctAnswerIndex: 0,
    explanation: "(15 / 100) × 240 = 0.15 × 240 = 36.",
    steps: [
      { step: "Step 1: Convert Percentage", desc: "15% = 15/100." },
      { step: "Step 2: Multiply by 240", desc: "(15 × 240) / 100 = 3600 / 100 = 36." }
    ]
  },
  {
    id: "g7_m_10",
    gradeLevel: 7,
    subject: "Mathematics",
    chapter: "Comparing Quantities",
    topic: "Profit and Loss",
    difficulty: "medium",
    questionText: "A book purchased for ₹400 is sold for ₹480. What is the profit percentage?",
    options: ["20%", "25%", "15%", "18%"],
    correctAnswerIndex: 0,
    explanation: "Profit = ₹480 - ₹400 = ₹80. Profit % = (80 / 400) × 100 = 20%.",
    steps: [
      { step: "Step 1: Compute Profit", desc: "Selling Price - Cost Price = 480 - 400 = ₹80." },
      { step: "Step 2: Calculate Percentage", desc: "(80 / 400) × 100 = 20%." }
    ]
  },
  // Grade 7 Science
  {
    id: "g7_s_01",
    gradeLevel: 7,
    subject: "Science",
    chapter: "Nutrition in Plants & Animals",
    topic: "Plant and Animal Nutrition",
    difficulty: "medium",
    questionText: "Which specialized kidney-shaped cells regulate the opening and closing of leaf stomata?",
    options: ["Guard cells", "Epidermal cells", "Xylem vessels", "Phloem tubes"],
    correctAnswerIndex: 0,
    explanation: "Guard cells swell when water flows into them, opening the stomatal pore, and shrink when they lose water, closing the pore.",
    steps: [
      { step: "Step 1: Identify Cells", desc: "Stomata are flanked by paired guard cells." },
      { step: "Step 2: Function", desc: "Turgor pressure changes in guard cells dictate pore opening for gas exchange." }
    ]
  },
  {
    id: "g7_s_02",
    gradeLevel: 7,
    subject: "Science",
    chapter: "Nutrition in Plants & Animals",
    topic: "Plant and Animal Nutrition",
    difficulty: "medium",
    questionText: "Where is bile juice produced and where is it stored in the human digestive system?",
    options: [
      "Produced in liver, stored in gallbladder",
      "Produced in stomach, stored in pancreas",
      "Produced in pancreas, stored in liver",
      "Produced in small intestine, stored in stomach"
    ],
    correctAnswerIndex: 0,
    explanation: "The liver continuously secretes bile, which is stored and concentrated in the gallbladder before release into the small intestine.",
    steps: [
      { step: "Step 1: Secretion Organ", desc: "Liver hepatocytes synthesize bile juice." },
      { step: "Step 2: Storage Organ", desc: "Gallbladder stores and concentrates bile." }
    ]
  },
  {
    id: "g7_s_03",
    gradeLevel: 7,
    subject: "Science",
    chapter: "Acids, Bases & Salts",
    topic: "Chemical Indicators & Neutralization",
    difficulty: "medium",
    questionText: "What color change occurs when neutral litmus paper is exposed to an acidic solution?",
    options: ["Turns red", "Turns green", "Remains blue", "Turns yellow"],
    correctAnswerIndex: 0,
    explanation: "Acids turn blue or neutral litmus paper red. Bases turn red litmus paper blue.",
    steps: [
      { step: "Step 1: Chemical Indicator", desc: "Litmus is a natural dye extracted from lichens." },
      { step: "Step 2: Reaction with Acid", desc: "In presence of acidic hydrogen ions, litmus pigment turns red." }
    ]
  },
  {
    id: "g7_s_04",
    gradeLevel: 7,
    subject: "Science",
    chapter: "Motion & Time",
    topic: "Physics Foundations",
    difficulty: "medium",
    questionText: "A vehicle covers a distance of 150 km in 2.5 hours. Calculate its uniform speed:",
    options: ["60 km/h", "50 km/h", "75 km/h", "40 km/h"],
    correctAnswerIndex: 0,
    explanation: "Speed = Distance / Time = 150 km / 2.5 h = 60 km/h.",
    steps: [
      { step: "Step 1: Formula", desc: "Speed = Distance ÷ Time." },
      { step: "Step 2: Calculation", desc: "150 ÷ 2.5 = 60 km/h." }
    ]
  },
  {
    id: "g7_s_05",
    gradeLevel: 7,
    subject: "Science",
    chapter: "Acids, Bases & Salts",
    topic: "Heat Transfer & pH Basics",
    difficulty: "medium",
    questionText: "By which heat transfer mechanism does thermal energy reach Earth from the Sun through the vacuum of space?",
    options: ["Radiation", "Conduction", "Convection", "Advection"],
    correctAnswerIndex: 0,
    explanation: "Radiation transfers thermal energy via electromagnetic waves and does not require a material medium, allowing heat to cross empty space.",
    steps: [
      { step: "Step 1: Medium Requirement", desc: "Space is a vacuum devoid of solid, liquid or gas particles." },
      { step: "Step 2: Conduction vs Radiation", desc: "Conduction requires physical contact; radiation travels freely through vacuum." }
    ]
  }
];

const getCuratedFallbackQuestions = (grade, subject = 'Mathematics', topic = 'All', count = 10) => {
  let pool = CURATED_PRACTICE_BANK.filter(q => {
    if (grade && q.gradeLevel !== Number(grade)) return false;
    if (subject && subject !== 'All' && q.subject.toLowerCase() !== subject.toLowerCase()) return false;
    if (topic && topic !== 'All') {
      const tQ = topic.toLowerCase();
      const match = q.topic.toLowerCase().includes(tQ) || tQ.includes(q.topic.toLowerCase()) || q.chapter.toLowerCase().includes(tQ);
      if (!match) return false;
    }
    return true;
  });

  if (pool.length === 0) {
    pool = CURATED_PRACTICE_BANK.filter(q => {
      if (grade && q.gradeLevel !== Number(grade)) return false;
      if (subject && subject !== 'All' && q.subject.toLowerCase() !== subject.toLowerCase()) return false;
      return true;
    });
  }

  if (pool.length === 0) {
    pool = CURATED_PRACTICE_BANK.filter(q => q.gradeLevel === Number(grade) || q.gradeLevel === 7);
  }

  if (pool.length === 0) {
    pool = CURATED_PRACTICE_BANK;
  }

  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const PracticeMode = () => {
  const { user } = useContext(AuthContext);
  const { currentTheme } = useContext(ThemeContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Grade is strictly derived from authenticated student enrollment
  const effectiveGrade = Number(user?.gradeLevel || user?.grade || 7);
  const curricula = GRADE_CURRICULA[effectiveGrade] || GRADE_CURRICULA[7];
  const availableSubjectKeys = Object.keys(curricula);

  // URL parameters or defaults
  const paramSubject = searchParams.get('subject') || availableSubjectKeys[0] || 'Mathematics';
  const paramTopic = searchParams.get('topic');
  const autoStart = searchParams.get('autostart') === 'true';
  const paramReason = searchParams.get('reason');

  // Pre-Practice Configuration State
  const [sessionStarted, setSessionStarted] = useState(autoStart);
  const [selectedMode, setSelectedMode] = useState('continue');
  const [configSubject, setConfigSubject] = useState(
    availableSubjectKeys.includes(paramSubject) ? paramSubject : availableSubjectKeys[0]
  );
  
  // Chapter & Topic state
  const activeSubjectData = curricula[configSubject] || curricula[availableSubjectKeys[0]];
  const [selectedChapterId, setSelectedChapterId] = useState(activeSubjectData?.chapters[0]?.id);
  const currentChapter = activeSubjectData?.chapters.find(c => c.id === selectedChapterId) || activeSubjectData?.chapters[0];
  const [selectedTopic, setSelectedTopic] = useState(paramTopic || currentChapter?.topics[0] || 'General');

  const [configDifficulty, setConfigDifficulty] = useState('medium'); // easy, medium, hard, adaptive
  const [questionCountTarget, setQuestionCountTarget] = useState(10); // 5, 10, 15, 20

  // Session In-Flight State
  const [questionsList, setQuestionsList] = useState([]);
  const [currentLevelKey, setCurrentLevelKey] = useState('medium');
  const [currentXP, setCurrentXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [streakMultiplier, setStreakMultiplier] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [confidence, setConfidence] = useState('somewhat_sure');
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [revisionDeckAdded, setRevisionDeckAdded] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // Keep track of served question IDs to prevent duplicate questions in session
  const [usedQuestionIds, setUsedQuestionIds] = useState(() => {
    try {
      const stored = sessionStorage.getItem(`gps_used_q_${effectiveGrade}_${configSubject}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch (_) {
      return new Set();
    }
  });

  // Load questions when session starts or subject changes
  const loadQuestionsForSession = async (subj, top, count = 10) => {
    setIsLoadingQuestions(true);
    try {
      const excludeArray = Array.from(usedQuestionIds);
      const res = await getQuestions({
        grade: effectiveGrade,
        subject: subj,
        topic: selectedMode === 'mixed' ? 'All' : top,
        exclude: excludeArray.join(','),
        limit: count * 3
      });

      if (res && res.success && Array.isArray(res.questions) && res.questions.length > 0) {
        // Strict deduplication by ID and normalized text
        const seen = new Set();
        const unique = [];
        for (const q of res.questions) {
          const qId = String(q._id || q.id || '');
          const qText = (q.questionText || q.statement || '').toLowerCase().trim();
          if ((qId && seen.has(qId)) || (qText && seen.has(qText))) continue;
          if (qId) seen.add(qId);
          if (qText) seen.add(qText);
          unique.push(q);
        }

        // Shuffle deterministically
        const shuffled = [...unique].sort(() => 0.5 - Math.random());
        const selectedSlice = shuffled.slice(0, count);

        // Record selected IDs into usedQuestionIds
        setUsedQuestionIds(prev => {
          const nextSet = new Set(prev);
          selectedSlice.forEach(q => {
            const id = String(q._id || q.id || '');
            if (id) nextSet.add(id);
          });
          try {
            sessionStorage.setItem(`gps_used_q_${effectiveGrade}_${subj}`, JSON.stringify(Array.from(nextSet)));
          } catch (_) {}
          return nextSet;
        });

        setQuestionsList(selectedSlice);
      } else {
        // Verified in-client fallback pool
        const fallbacks = getCuratedFallbackQuestions(effectiveGrade, subj, top, count);
        setQuestionsList(fallbacks);
      }
    } catch (err) {
      console.warn('Failed to load questions from server, using verified fallback bank:', err);
      const fallbacks = getCuratedFallbackQuestions(effectiveGrade, subj, top, count);
      setQuestionsList(fallbacks);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Automatically ensure questions are loaded whenever session starts
  useEffect(() => {
    if (sessionStarted && questionsList.length === 0 && !isLoadingQuestions) {
      loadQuestionsForSession(configSubject, selectedTopic, questionCountTarget);
    }
  }, [sessionStarted, configSubject, selectedTopic]);

  const handleStartPractice = (modeToUse = selectedMode) => {
    setSelectedMode(modeToUse);
    const count = modeToUse === 'quick_practice' ? 5 : (modeToUse === 'exam_prep' ? 15 : questionCountTarget);
    setQuestionCountTarget(count);
    setSessionStartTime(Date.now());
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setFeedback(null);
    setStreak(0);
    setStreakMultiplier(1);
    setSessionHistory([]);
    setCurrentXP(0);
    setIsCompleted(false);
    setRevisionDeckAdded(false);
    setCurrentLevelKey(configDifficulty === 'adaptive' ? 'medium' : configDifficulty);

    loadQuestionsForSession(configSubject, selectedTopic, count).then(() => {
      setSessionStarted(true);
    });
  };

  // Resilient fallback question: guarantees authentic question and 4 real MCQ options
  const fallbackQ = useMemo(() => {
    return getCuratedFallbackQuestions(effectiveGrade, configSubject, selectedTopic, 1)[0] || {
      questionText: "Calculate the value of the integer expression: (-15) + (-28) - (-43) = ?",
      options: ["0", "-86", "-30", "56"],
      correctAnswerIndex: 0,
      explanation: "Subtracting a negative number is equivalent to adding: (-15) + (-28) + 43 = 0."
    };
  }, [effectiveGrade, configSubject, selectedTopic]);

  const currentQ = questionsList[currentIndex] || fallbackQ;

  const activeLevelData = LEVEL_CONFIG[currentLevelKey] || LEVEL_CONFIG.medium;

  const handleSelectOption = (idx) => {
    if (!isAnswerChecked) {
      setSelectedOption(idx);
    }
  };

  const handleCheckAnswer = async () => {
    if (selectedOption === null) return;

    const correctIdx = currentQ.correctAnswerIndex ?? currentQ.correctIndex ?? 0;
    const isCorrect = selectedOption === correctIdx;
    setIsAnswerChecked(true);

    const qId = currentQ._id || currentQ.id || `q_${currentIndex + 1}`;
    setUsedQuestionIds(prev => new Set([...prev, qId]));

    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      await saveOfflineAttempt({
        eventId,
        questionId: qId,
        selectedAnswerIndex: selectedOption,
        confidence,
        mode: 'practice',
        subject: configSubject,
        topic: selectedTopic,
        difficulty: currentLevelKey,
        isCorrect,
        timeTaken: 20
      });
    } catch (e) {
      console.warn('Offline save note:', e);
    }

    const xpEarned = isCorrect ? activeLevelData.xpReward * streakMultiplier : 0;
    setCurrentXP(prev => prev + xpEarned);

    // Call adaptive evaluation
    api.post('/adaptive/evaluate', {
      currentMastery: 0.72,
      recentAnswers: sessionHistory.map(h => h.isCorrect),
      currentDifficulty: currentLevelKey,
      responseIsCorrect: isCorrect,
      topic: selectedTopic
    }).catch(() => {});

    setFeedback({
      isCorrect,
      explanation: currentQ.explanation,
      steps: currentQ.steps || currentQ.workedSolution?.steps || [],
      conceptSummary: currentQ.conceptSummary || currentQ.workedSolution?.concept || '',
      misconception: currentQ.misconception || currentQ.workedSolution?.commonMistake || '',
      xpEarned
    });

    const newHistory = [
      ...sessionHistory,
      {
        questionNumber: currentIndex + 1,
        questionText: currentQ.questionText,
        selectedOption,
        correctIdx,
        isCorrect,
        level: currentLevelKey,
        topic: selectedTopic
      }
    ];
    setSessionHistory(newHistory);

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      const newMult = newStreak >= 3 ? 3 : (newStreak >= 2 ? 2 : 1);
      setStreakMultiplier(newMult);

      if (configDifficulty === 'adaptive' && newStreak >= 3) {
        if (currentLevelKey === 'easy') setCurrentLevelKey('medium');
        else if (currentLevelKey === 'medium') setCurrentLevelKey('hard');
      }
    } else {
      setStreak(0);
      setStreakMultiplier(1);
      if (configDifficulty === 'adaptive') {
        if (currentLevelKey === 'hard') setCurrentLevelKey('medium');
        else if (currentLevelKey === 'medium') setCurrentLevelKey('easy');
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 >= (questionsList.length || questionCountTarget)) {
      setIsCompleted(true);
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
      setFeedback(null);
    }
  };

  const handleAddMistakesToRevision = () => {
    const mistakes = sessionHistory.filter(h => !h.isCorrect);
    mistakes.forEach(m => {
      api.post('/adaptive/review-card', {
        card: { topic: m.topic, questionText: m.questionText },
        isCorrect: false
      }).catch(() => {});
    });
    setRevisionDeckAdded(true);
  };

  // Keyboard navigation
  useAssessmentKeyboardShortcuts({
    onSelectOption: handleSelectOption,
    onSubmit: isAnswerChecked ? handleNextQuestion : handleCheckAnswer,
    onNext: handleNextQuestion,
    canSubmit: selectedOption !== null,
    isSubmitted: isAnswerChecked,
    enabled: sessionStarted && !isCompleted
  });

  // Age-adapted persona badges
  const renderAgeAdaptedBadge = () => {
    if (effectiveGrade === 3) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 shadow-sm">
          🌟 Primary Wing • Grade 3
        </span>
      );
    } else if (effectiveGrade === 7) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 shadow-sm">
          📐 Middle Wing • Grade 7 CBSE
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1.5 shadow-sm">
          🎯 Senior Secondary • Grade 10 Board Calibrated
        </span>
      );
    }
  };

  // =========================================================================
  // VIEW 1: "WHAT WOULD YOU LIKE TO PRACTISE TODAY?"
  // =========================================================================
  if (!sessionStarted) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
        {/* Header Banner */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {renderAgeAdaptedBadge()}
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Greenwood Public School, Sector-9
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              What would you like to practise today?
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              Hello {user?.name || 'Student'}! Choose a practice mode below to reinforce core CBSE competencies with real-time adaptive feedback.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Button
              variant="primary"
              size="lg"
              iconRight={Play}
              onClick={() => handleStartPractice('continue')}
              className="w-full sm:w-auto shadow-elevated"
            >
              Start Practice
            </Button>
          </div>
        </div>

        {/* 7 Practice Options Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select Practice Modality
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Grade {effectiveGrade} Enrolled Subjects: {availableSubjectKeys.join(', ')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {PRACTICE_OPTIONS.map(opt => {
              const Icon = opt.icon;
              const isSelected = selectedMode === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSelectedMode(opt.id);
                    if (opt.id === 'quick_practice') {
                      handleStartPractice('quick_practice');
                    }
                  }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between h-40 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-subtle ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isSelected 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant={opt.badgeVariant} size="sm">
                      {opt.badge}
                    </Badge>
                  </div>

                  <div>
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                      {opt.title}
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {opt.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scope Selector: Subject, Chapter & Topic (Visible for Topic, Chapter, or Continue) */}
        <Card className="p-6 space-y-6 border border-slate-200/90 dark:border-slate-800 shadow-card bg-white dark:bg-slate-900">
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Curriculum Scope & Parameters
            </h3>

            {/* Subject Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                1. Choose Subject
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {availableSubjectKeys.map(subjKey => {
                  const subj = curricula[subjKey];
                  const isSelected = configSubject === subjKey;
                  return (
                    <button
                      key={subjKey}
                      type="button"
                      onClick={() => {
                        setConfigSubject(subjKey);
                        const defaultCh = subj.chapters[0];
                        if (defaultCh) {
                          setSelectedChapterId(defaultCh.id);
                          setSelectedTopic(defaultCh.topics[0] || 'General');
                        }
                      }}
                      className={`p-3.5 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-cyan-300 font-bold shadow-subtle'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-xl">{subj.icon}</span>
                      <div>
                        <div className="text-xs font-extrabold">{subj.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Grade {effectiveGrade} CBSE</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chapter and Topic Selector */}
            {selectedMode !== 'mixed' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    2. Chapter Module
                  </label>
                  <select
                    value={selectedChapterId}
                    onChange={(e) => {
                      const chId = e.target.value;
                      setSelectedChapterId(chId);
                      const ch = activeSubjectData?.chapters.find(c => c.id === chId);
                      if (ch && ch.topics.length > 0) {
                        setSelectedTopic(ch.topics[0]);
                      }
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    {activeSubjectData?.chapters.map(ch => (
                      <option key={ch.id} value={ch.id}>{ch.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    3. Specific Concept Topic
                  </label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    {currentChapter?.topics.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Difficulty & Length Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Adaptive Engine Difficulty
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'easy', label: 'Easy' },
                    { id: 'medium', label: 'Medium' },
                    { id: 'hard', label: 'Hard' },
                    { id: 'adaptive', label: 'Auto ⚡' }
                  ].map(diff => (
                    <button
                      key={diff.id}
                      type="button"
                      onClick={() => setConfigDifficulty(diff.id)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        configDifficulty === diff.id
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-subtle'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {diff.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Target Questions
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setQuestionCountTarget(cnt)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        questionCountTarget === cnt
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-subtle'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {cnt} Qs
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Targeting: <strong className="text-slate-900 dark:text-white">{configSubject}</strong> • {selectedTopic}
            </div>

            <Button
              variant="primary"
              size="lg"
              iconRight={Play}
              onClick={() => handleStartPractice()}
              disabled={isLoadingQuestions}
              className="w-full sm:w-auto px-8 shadow-elevated"
            >
              {isLoadingQuestions ? 'Loading Questions...' : 'Start Practising Now'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: SESSION END SUMMARY SCREEN
  // =========================================================================
  if (isCompleted) {
    const correctCount = sessionHistory.filter(h => h.isCorrect).length;
    const accuracy = sessionHistory.length > 0 ? Math.round((correctCount / sessionHistory.length) * 100) : 0;
    const timeSpentSeconds = Math.max(15, Math.round((Date.now() - sessionStartTime) / 1000));
    const minutes = Math.floor(timeSpentSeconds / 60);
    const seconds = timeSpentSeconds % 60;

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-elevated text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center text-3xl mx-auto shadow-subtle">
            🏆
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Practice Session Completed!
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-md mx-auto">
            {effectiveGrade === 3 ? "🌟 Super work Alex! You did a fantastic job today!" : `Great work! You completed ${sessionHistory.length} questions in ${selectedTopic} (${configSubject}).`}
          </p>
        </div>

        {/* Score & KPIs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 text-center border-l-4 border-l-emerald-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Score</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {correctCount} / {sessionHistory.length}
            </div>
          </Card>
          <Card className="p-4 text-center border-l-4 border-l-indigo-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Accuracy</span>
            <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-cyan-400 mt-1">
              {accuracy}%
            </div>
          </Card>
          <Card className="p-4 text-center border-l-4 border-l-amber-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">XP Earned</span>
            <div className="text-xl sm:text-2xl font-black text-amber-500 mt-1">
              +{currentXP} XP
            </div>
          </Card>
          <Card className="p-4 text-center border-l-4 border-l-purple-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time Spent</span>
            <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
              {minutes}m {seconds}s
            </div>
          </Card>
        </div>

        {/* Question Log Review */}
        <Card className="p-6 space-y-4 border border-slate-200 dark:border-slate-800">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            Session Question Breakdown
          </h3>
          <div className="space-y-2">
            {sessionHistory.map((h, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  h.isCorrect 
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
                    : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {h.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span className="font-bold">Q{h.questionNumber}:</span>
                  <span className="line-clamp-1">{h.questionText}</span>
                </div>
                <Badge variant={h.isCorrect ? 'success' : 'danger'} size="sm">
                  {h.isCorrect ? 'Correct' : 'Needs Practice'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">

          <Button
            variant="primary"
            icon={RotateCcw}
            onClick={() => setSessionStarted(false)}
          >
            Practise Another Concept
          </Button>

          <Button
            variant="outline"
            icon={BookOpen}
            onClick={() => navigate('/solutions')}
          >
            Review Step-by-Step Solutions
          </Button>

          <Button
            variant="ghost"
            icon={ArrowRight}
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: ACTIVE PRACTICE QUESTION CANVAS
  // =========================================================================
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fadeIn">
      {/* Top Header & Session Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSessionStarted(false)}
          >
            Exit
          </Button>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {configSubject} • {selectedTopic}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Grade {effectiveGrade} CBSE • Question {currentIndex + 1} of {questionsList.length || questionCountTarget}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {renderAgeAdaptedBadge()}
          <DifficultyBadge difficulty={currentLevelKey} size="sm" />
        </div>
      </div>

      {/* Diagnostic Weakness Deterministic Recommendation Banner */}
      {paramReason && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-start gap-2.5 text-xs">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-indigo-900 dark:text-cyan-300 block uppercase tracking-wider text-[10px]">
              Diagnostic Calibrated Remediation
            </span>
            <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">
              "{paramReason}"
            </p>
          </div>
        </div>
      )}

      {/* Progress & Streak Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-600 dark:text-slate-400">
            Progress: {currentIndex + 1} / {questionsList.length || questionCountTarget}
          </span>
          <div className="flex items-center gap-2">
            {streak > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 flex items-center gap-1 animate-pulse">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {streak}x Streak
              </span>
            )}
            <span className="text-indigo-600 dark:text-cyan-400 font-extrabold">
              +{currentXP} XP
            </span>
          </div>
        </div>
        <ProgressBar
          progress={((currentIndex + (isAnswerChecked ? 1 : 0)) / (questionsList.length || questionCountTarget)) * 100}
          height="h-2"
          color="bg-indigo-600"
        />
      </div>

      {/* Main Question Card */}
      <Card className="p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-800 shadow-card bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
          <span className="uppercase tracking-wider">
            {currentQ.chapter || currentChapter?.name || 'Curriculum Concept'}
          </span>
          <SpeechButton text={currentQ.questionText} />
        </div>

        {/* Question Text */}
        <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
          <MathRenderer content={currentQ.questionText || currentQ.question || 'Loading question...'} />
        </div>

        {/* 4 Options Grid */}
        <div className="space-y-3">
          {(currentQ.options && currentQ.options.length > 0 ? currentQ.options : ["Option A", "Option B", "Option C", "Option D"]).map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const correctIdx = currentQ.correctAnswerIndex ?? currentQ.correctIndex ?? 0;
            const isThisCorrect = idx === correctIdx;

            let optStyle = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-400';

            if (isAnswerChecked) {
              if (isThisCorrect) {
                optStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-400';
              } else if (isSelected && !isThisCorrect) {
                optStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
              } else {
                optStyle = 'border-slate-200 dark:border-slate-800 opacity-50';
              }
            } else if (isSelected) {
              optStyle = 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-950 dark:text-white ring-2 ring-indigo-500/20';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(idx)}
                disabled={isAnswerChecked}
                className={`w-full p-4 rounded-2xl border-2 text-left font-semibold text-sm transition-all flex items-center justify-between ${optStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-slate-900 dark:text-white font-medium">
                    <MathRenderer content={String(opt || `Option ${String.fromCharCode(65 + idx)}`)} />
                  </span>
                </div>

                {isAnswerChecked && isThisCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                {isAnswerChecked && isSelected && !isThisCorrect && (
                  <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Action Button: Check Answer or Next Question */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {isAnswerChecked ? "Press Enter or click Next" : "Select an option to check your answer"}
          </span>

          {!isAnswerChecked ? (
            <Button
              variant="primary"
              size="lg"
              onClick={handleCheckAnswer}
              disabled={selectedOption === null}
            >
              Check Answer
            </Button>
          ) : (
            <Button
              variant="glow"
              size="lg"
              iconRight={ArrowRight}
              onClick={handleNextQuestion}
            >
              {currentIndex + 1 >= (questionsList.length || questionCountTarget) ? "View Summary" : "Next Question"}
            </Button>
          )}
        </div>
      </Card>

      {/* Immediate Instant Feedback Banner with Worked Solution */}
      {isAnswerChecked && feedback && (
        <Card className={`p-6 border-2 space-y-4 animate-slideDown ${
          feedback.isCorrect
            ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30'
            : 'border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {feedback.isCorrect ? (
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  ✓
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                  !
                </div>
              )}
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {feedback.isCorrect 
                    ? (effectiveGrade === 3 ? "🌟 Great Job Alex! Keep shining!" : "Correct! Step completed successfully.")
                    : (effectiveGrade === 3 ? "🌱 Good try Alex! Let's review the solution together:" : "Concept Review & Worked Solution:")}
                </h4>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {feedback.isCorrect ? `+${feedback.xpEarned} XP earned` : "Added to session review log"}
                </span>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              icon={BookOpen}
              onClick={() => navigate('/solutions')}
            >
              View in Solutions Hub
            </Button>
          </div>

          {/* Explanation */}
          {feedback.explanation && (
            <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <strong className="block mb-1 text-slate-900 dark:text-white font-bold">Explanation:</strong>
              <MathRenderer content={feedback.explanation} />
            </div>
          )}

          {/* Worked Steps */}
          {feedback.steps && feedback.steps.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Worked Solution Steps:
              </span>
              {feedback.steps.map((st, i) => (
                <div key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                  <span className="font-bold text-indigo-600 dark:text-cyan-400 shrink-0">•</span>
                  <span>{st.desc || st.step || JSON.stringify(st)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
export default PracticeMode;
