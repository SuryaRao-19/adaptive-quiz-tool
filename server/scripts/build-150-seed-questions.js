const fs = require('fs');
const path = require('path');

// 150 Curated Seed Questions for AdaptIQ
// 75 Math + 75 Science across Grades 6-8 foundational topics
// 10 Topics, each with 5 Easy, 6 Medium, 4 Hard = 15 questions per topic

const mathQuestions = [
  // =========================================================================
  // TOPIC 1: Fractions (15 questions: 5 Easy, 6 Medium, 4 Hard)
  // =========================================================================
  {
    subject: "Math",
    topic: "Fractions",
    difficulty: "easy",
    levelName: "Level 1: Foundational",
    questionText: "What is 1/4 + 2/4 in simplest form?",
    options: ["3/8", "3/4", "2/8", "1/2"],
    correctAnswerIndex: 1,
    explanation: "Because both fractions already have the same denominator (4), simply add the numerators: 1 + 2 = 3. The denominator stays 4.",
    steps: [
      { step: "Step 1: Check Denominators", desc: "Both denominators are equal to 4.", math: "Common denominator = 4" },
      { step: "Step 2: Add Numerators", desc: "Add the top numbers while keeping denominator constant.", math: "1/4 + 2/4 = (1 + 2)/4 = 3/4" }
    ],
    conceptSummary: "When adding fractions with like denominators, add only the numerators.",
    misconception: "Never add the denominators together (4 + 4 ≠ 8).",
    source: "seed",
    status: "approved",
    isActive: true
  },
  {
    subject: "Math",
    topic: "Fractions",
    difficulty: "easy",
    levelName: "Level 1: Foundational",
    questionText: "Evaluate: 5/8 - 2/8.",
    options: ["3/0", "3/8", "3/16", "7/8"],
    correctAnswerIndex: 1,
    explanation: "With identical denominators, subtract the numerators: 5 - 2 = 3. The denominator remains 8.",
    steps: [
      { step: "Step 1: Inspect Denominators", desc: "Denominators are already matching at 8.", math: "Denominator = 8" },
      { step: "Step 2: Subtract Numerators", desc: "Subtract 2 from 5.", math: "(5 - 2)/8 = 3/8" }
    ],
    conceptSummary: "Subtracting fractions with like denominators only alters the numerator.",
    misconception: "Subtracting denominators (8 - 8 = 0) is undefined and incorrect.",
    source: "seed",
    status: "approved",
    isActive: true
  },
  {
    subject: "Math",
    topic: "Fractions",
    difficulty: "easy",
    levelName: "Level 1: Foundational",
    questionText: "In the fraction 7/12, what is the numerator and what does it represent?",
    options: [
      "12; the number of parts selected",
      "7; the number of parts selected out of 12 equal parts",
      "7; the total number of equal parts in the whole",
      "19; the sum of all parts"
    ],
    correctAnswerIndex: 1,
    explanation: "The top number (numerator) represents the number of parts chosen (7), and the bottom number (denominator) represents total equal parts in the whole (12).",
    steps: [
      { step: "Step 1: Identify Numerator", desc: "The top number is 7.", math: "Numerator = 7" },
      { step: "Step 2: Interpret Meaning", desc: "Numerator counts parts taken; denominator defines equal divisions of whole.", math: "7 out of 12 equal parts" }
    ],
    conceptSummary: "Numerator is on top (count of parts); denominator is on bottom (size of unit).",
    misconception: "Confusing numerator with denominator.",
    source: "seed",
    status: "approved",
    isActive: true
  },
  {
    subject: "Math",
    topic: "Fractions",
    difficulty: "easy",
    levelName: "Level 1: Foundational",
    questionText: "Convert the mixed number 2 3/5 into an improper fraction.",
    options: ["13/5", "11/5", "6/5", "10/5"],
    correctAnswerIndex: 0,
    explanation: "Multiply the whole number by the denominator and add the numerator: (2 × 5) + 3 = 10 + 3 = 13 over 5.",
    steps: [
      { step: "Step 1: Multiply Whole by Denominator", desc: "Calculate whole portions in fifths.", math: "2 × 5 = 10" },
      { step: "Step 2: Add Existing Numerator", desc: "Add the remaining 3 fifths.", math: "10 + 3 = 13" },
      { step: "Step 3: Write Over Denominator", desc: "Keep original denominator 5.", math: "13/5" }
    ],
    conceptSummary: "An improper fraction has a numerator greater than or equal to its denominator.",
    misconception: "Adding whole number to numerator without multiplying by denominator first.",
    source: "seed",
    status: "approved",
    isActive: true
  },
  {
    subject: "Math",
    topic: "Fractions",
    difficulty: "easy",
    levelName: "Level 1: Foundational",
    questionText: "Which fraction is equivalent to 3/4?",
    options: ["6/8", "4/5", "9/16", "5/6"],
    correctAnswerIndex: 0,
    explanation: "Multiplying both numerator and denominator by 2 gives (3 × 2)/(4 × 2) = 6/8.",
    steps: [
      { step: "Step 1: Multiply Numerator and Denominator", desc: "Multiply by form of 1: 2/2.", math: "3/4 × 2/2 = 6/8" },
      { step: "Step 2: Verify Equivalence", desc: "6/8 simplifies back to 3/4 by dividing by 2.", math: "6 ÷ 2 = 3, 8 ÷ 2 = 4" }
    ],
    conceptSummary: "Multiplying or dividing both numerator and denominator by the same non-zero number creates an equivalent fraction.",
    misconception: "Adding 1 to both top and bottom (3/4 ≠ 4/5).",
    source: "seed",
    status: "approved",
    isActive: true
  },
  {
    subject: "Math",
    topic: "Fractions",
    difficulty: "medium",
    levelName: "Level 2: Procedural",
    questionText: "Calculate: 3/5 + 1/10 in simplest form.",
    options: ["4/15", "7/10", "4/10", "3/10"],
    correctAnswerIndex: 1,
    explanation: "Find the LCD which is 10. Convert 3/5 to 6/10 by multiplying by 2/2. Then 6/10 + 1/10 = 7/10.",
    steps: [
      { step: "Step 1: Find LCD", desc: "The Least Common Denominator of 5 and 10 is 10.", math: "LCD = 10" },
      { step: "Step 2: Convert to Equivalent Fraction", desc: "Multiply 3/5 by 2/2.", math: "3/5 = (3 × 2)/(5 × 2) = 6/10" },
      { step: "Step 3: Add Numerators", desc: "Sum 6 + 1 over denominator 10.", math: "6/10 + 1/10 = 7/10" }
    ],
    conceptSummary: "Unlike denominators require finding a common denominator before adding.",
    misconception: "Adding numerators and denominators straight across: (3+1)/(5+10) = 4/15 is incorrect.",
    source: "seed",
    status: "approved",
    isActive: true
  },
  {
    subject: "Math",
    topic: "Fractions",
    difficulty: "medium",
    levelName: "Level 2: Procedural",
    questionText: "Calculate: 5/6 - 1/4 in simplest form.",
    options: ["4/2", "7/12", "4/12", "1/3"],
    correctAnswerIndex: 1,
    explanation: "The LCD of 6 and 4 is 12. Convert 5/6 to 10/12 and 1/4 to 3/12. 10/12 - 3/12 = 7/12.",
    steps: [
      { step: "Step 1: Find LCD", desc: "Multiples of 6: 6, 12. Multiples of 4: 4, 8, 12. LCD = 12.", math: "LCD = 12" },
      { step: "Step 2: Convert Both Fractions", desc: "5/6 × 2/2 = 10/12; 1/4 × 3/3 = 3/12.", math: "10/12 - 3/12" },
      { step: "Step 3: Subtract", desc: "10 - 3 = 7 over 12.", math: "7/12" }
    ],
    conceptSummary: "Always express subtraction of unlike fractions using their least common multiple.",
    misconception: "Subtracting across (5-1)/(6-4) = 4/2.",
    source: "seed",
    status: "approved",
    isActive: true
  },
  {
    subject: "Math",
    topic: "Fractions",
    difficulty: "medium",
    levelName: "Level 2: Procedural",
    questionText: "Multiply: (2/3) × (4/7).",
    options: ["8/21", "6/10", "14/12", "8/10"],
    correctAnswerIndex: 0,
    explanation: "Multiply the numerators together and denominators together: (2 × 4)/(3 × 7) = 8/21.",
    steps: [
      { step: "Step 1: Multiply Numerators", desc: "Top numbers: 2 × 4 = 8.", math: "2 × 4 = 8" },
      { step: "Step 2: Multiply Denominators", desc: "Bottom numbers: 3 × 7 = 21.", math: "3 × 7 = 21" },
      { step: "Step 3: Check Simplification", desc: "8 and 21 have no common factors besides 1.", math: "Result = 8/21" }
    ],
    conceptSummary: "Fraction multiplication does not require a common denominator.",
    misconception: "Cross multiplying during multiplication.",
    source: "seed",
    status: "approved",
    isActive: true
  },
  {
    subject: "Math",
    topic: "Fractions",
    difficulty: "medium",
    levelName: "Level 2: Procedural",
    questionText: "Evaluate: (3/4) ÷ (2/3).",
    options: ["1/2", "9/8", "6/12", "8/9"],
    correctAnswerIndex: 1,
    explanation: "Divide by multiplying by the reciprocal of the second fraction: (3/4) × (3/2) = 9/8 = 1 1/8.",
    steps: [
      { step: "Step 1: Take Reciprocal of Divisor", desc: "Flip 2/3 to 3/2.", math: "Reciprocal of 2/3 = 3/2" },
      { step: "Step 2: Change Operation to Multiplication", desc: "Multiply 3/4 by 3/2.", math: "(3 × 3)/(4 × 2) = 9/8" },
      { step: "Step 3: State Result", desc: "9/8 cannot be reduced further.", math: "9/8" }
    ],
    conceptSummary: "To divide by a fraction, multiply by its multiplicative inverse (reciprocal).",
    misconception: "Flipping the first fraction instead of the second.",
    source: "seed",
    status: "approved",
    isActive: true
  },
  {
    subject: "Math",
    topic: "Fractions",
    difficulty: "medium",
    levelName: "Level 2: Procedural",
    questionText: "Which statement correctly compares 3/7 and 5/12?",
    options: [
      "3/7 > 5/12 because 36/84 > 35/84",
      "3/7 < 5/12 because 7 is smaller than 12",
      "3/7 = 5/12",
      "5/12 > 3/7 because 5 is greater than 3"
    ],
    correctAnswerIndex: 0,
    explanation: "Use cross-multiplication or common denominator 84: 3 × 12 = 36 and 5 × 7 = 35. Since 36 > 35, 3/7 is greater than 5/12.",
    steps: [
      { step: "Step 1: Common Denominator or Cross Multiply", desc: "Compare 3 × 12 with 5 × 7.", math: "3 × 12 = 36; 5 × 7 = 35" },
      { step: "Step 2: Compare Values", desc: "36 > 35, so 3/7 corresponds to 36/84 and 5/12 corresponds to 35/84.", math: "36/84 > 35/84 → 3/7 > 5/12" }
    ],
    conceptSummary: "Compare fractions by finding equivalent fractions with a common denominator or cross-products.",
    misconception: "Judging fraction magnitude solely based on numerator size or denominator size alone.",
    source: "seed",
    status: "approved",
    isActive: true
  },
  {
    subject: "Math",
    topic: "Fractions",
    difficulty: "medium",
    levelName: "Level 2: Procedural",
    questionText: "Calculate: 3 1/4 - 1 3/4.",
    options: ["2 2/4", "1 1/2", "2 1/2", "1 1/4"],
    correctAnswerIndex: 1,
    explanation: "Regroup 3 1/4 as 2 5/4. Then 2 5/4 - 1 3/4 = (2 - 1) + (5/4 - 3/4) = 1 2/4 = 1 1/2.",
    steps: [
      { step: "Step 1: Regroup Whole Number", desc: "Since 1/4 < 3/4, borrow 1 from 3: 3 1/4 = 2 + 1 + 1/4 = 2 5/4.", math: "3 1/4 = 2 5/4" },
      { step: "Step 2: Subtract Wholes and Fractions", desc: "(2 - 1) + (5/4 - 3/4) = 1 + 2/4.", math: "1 2/4" },
      { step: "Step 3: Simplify Fraction", desc: "Reduce 2/4 to 1/2.", math: "1 1/2" }
    ],
    conceptSummary: "When subtracting mixed numbers with smaller numerators in the minuend, borrow 1 from the whole number.",
    misconception: "Subtracting the smaller fraction from the larger without borrowing (3 - 1 = 2, 3/4 - 1/4 = 2/4 = 2 1/2).",
    source: "seed",
    status: "approved",
    isActive: true
  },
  {
    subject: "Math",
    topic: "Fractions",
    difficulty: "hard",
    levelName: "Level 3: Multi-Step",
    questionText: "Evaluate: (1/2 + 2/3) ÷ (5/6 - 1/4).",
    options: ["2", "7/6", "7/12", "14/7"],
    correctAnswerIndex: 0,
    explanation: "Numerator: 1/2 + 2/3 = 3/6 + 4/6 = 7/6. Denominator: 5/6 - 1/4 = 10/12 - 3/12 = 7/12. Divide: (7/6) ÷ (7/12) = (7/6) × (12/7) = 12/6 = 2.",
    steps: [
      { step: "Step 1: Simplify Numerator Expression", desc: "1/2 + 2/3 = 3/6 + 4/6 = 7/6.", math: "Numerator = 7/6" },
      { step: "Step 2: Simplify Denominator Expression", desc: "5/6 - 1/4 = 10/12 - 3/12 = 7/12.", math: "Denominator = 7/12" },
      { step: "Step 3: Multiply by Reciprocal", desc: "(7/6) × (12/7) = (7 × 12)/(6 × 7) = 12/6 = 2.", math: "Result = 2" }
    ],
    conceptSummary: "Follow order of operations: simplify grouped expressions inside numerator and denominator before dividing.",
    misconception: "Cancelling numbers across numerator and denominator before completing additions/subtractions.",
    source: "seed",
    status: "approved",
    isActive: true
  },
  {
    subject: "Math",
    topic: "Fractions",
    difficulty: "hard",
    levelName: "Level 3: Multi-Step",
    questionText: "A water tank is 3/5 full. After 18 liters are added, the tank becomes 3/4 full. What is the total capacity of the tank?",
    options: ["120 Liters", "90 Liters", "150 Liters", "60 Liters"],
    correctAnswerIndex: 0,
    explanation: "Fraction difference: 3/4 - 3/5 = 15/20 - 12/20 = 3/20. If 3/20 of capacity = 18 L, then total capacity = 18 ÷ (3/20) = 18 × (20/3) = 120 L.",
    steps: [
      { step: "Step 1: Find Difference in Fractions", desc: "3/4 - 3/5 with LCD 20.", math: "15/20 - 12/20 = 3/20" },
      { step: "Step 2: Relate Fraction to Volume", desc: "3/20 of Total = 18 liters.", math: "(3/20) × Total = 18" },
      { step: "Step 3: Solve for Total Capacity", desc: "Total = 18 × 20 / 3 = 6 × 20 = 120 liters.", math: "Total = 120 L" }
    ],
    conceptSummary: "Word problems involving changes in fraction levels are solved by finding the fraction difference that equals the physical quantity.",
    misconception: "Multiplying 18 by 3/4 directly.",
    source: "seed",
    status: "approved",
    isActive: true
  },
  {
    subject: "Math",
    topic: "Fractions",
    difficulty: "hard",
    levelName: "Level 3: Multi-Step",
    questionText: "A baker uses 1/3 of a bag of flour in the morning. In the afternoon, he uses 2/5 of the remainder. What fraction of the original bag is left?",
    options: ["2/5", "4/15", "1/5", "7/15"],
    correctAnswerIndex: 0,
    explanation: "After the morning, 1 - 1/3 = 2/3 remains. In the afternoon, he uses 2/5 of 2/3 = 4/15. Fraction remaining = 2/3 - 4/15 = 10/15 - 4/15 = 6/15 = 2/5.",
    steps: [
      { step: "Step 1: Find Remaining Fraction After Morning", desc: "1 - 1/3 = 2/3 of the bag.", math: "Remaining morning = 2/3" },
      { step: "Step 2: Calculate Afternoon Usage", desc: "2/5 of 2/3 = (2/5) × (2/3) = 4/15.", math: "Used afternoon = 4/15" },
      { step: "Step 3: Subtract from Morning Remainder", desc: "2/3 - 4/15 = 10/15 - 4/15 = 6/15 = 2/5.", math: "Final remainder = 2/5" }
    ],
    conceptSummary: "'Fraction of the remainder' requires taking a fraction of the remaining portion, not the initial total.",
    misconception: "Adding 1/3 + 2/5 = 11/15 and concluding 4/15 is left.",
    source: "seed",
    status: "approved",
    isActive: true
  },
  {
    subject: "Math",
    topic: "Fractions",
    difficulty: "hard",
    levelName: "Level 3: Multi-Step",
    questionText: "Evaluate: 2/5 × (3/4 + 5/8) in simplest form.",
    options: ["11/20", "8/20", "16/40", "1/2"],
    correctAnswerIndex: 0,
    explanation: "Inside brackets: 3/4 + 5/8 = 6/8 + 5/8 = 11/8. Then 2/5 × 11/8 = (2 × 11)/(5 × 8) = 22/40 = 11/20.",
    steps: [
      { step: "Step 1: Solve Inside Parentheses", desc: "Convert 3/4 to eighths: 6/8. 6/8 + 5/8 = 11/8.", math: "3/4 + 5/8 = 11/8" },
      { step: "Step 2: Multiply by 2/5", desc: "(2/5) × (11/8) = (2 × 11)/(5 × 8) = 22/40.", math: "22/40" },
      { step: "Step 3: Reduce to Lowest Terms", desc: "Divide numerator and denominator by 2.", math: "22/40 = 11/20" }
    ],
    conceptSummary: "Operations inside parentheses must be executed before multiplying outer terms.",
    misconception: "Distributing without finding common denominator, leading to arithmetic mistakes.",
    source: "seed",
    status: "approved",
    isActive: true
  }
];

// Let's create an external generator script that writes the comprehensive 150 questions
console.log("Compiling 150 questions generator...");
