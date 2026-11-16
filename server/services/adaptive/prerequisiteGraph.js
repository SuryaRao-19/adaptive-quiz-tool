/**
 * AdaptIQ 3.0 — Prerequisite Graph Service
 * server/services/adaptive/prerequisiteGraph.js
 * 
 * Deterministic directed acyclic graph (DAG) representing curriculum dependencies
 * for CBSE Grades 3, 7, and 10 across Mathematics, Science, and English.
 * 
 * Enables:
 * - Remedial trajectory pathfinding when students struggle with higher-order concepts
 * - Root-cause diagnostic gap detection
 * - Curriculum pacing alignment
 */

const CURRICULUM_PREREQUISITE_DAG = {
  // ---------------------------------------------------------
  // GRADE 3 MATHEMATICS
  // ---------------------------------------------------------
  '3-Digit Numbers & Place Value': {
    grade: 3,
    subject: 'Mathematics',
    chapter: 'Fun with Numbers',
    prerequisites: ['2-digit numbers', 'Place value basics'],
    masteryThreshold: 0.75
  },
  'Number Sequences & Ordering': {
    grade: 3,
    subject: 'Mathematics',
    chapter: 'Fun with Numbers',
    prerequisites: ['3-Digit Numbers & Place Value', 'Counting'],
    masteryThreshold: 0.75
  },
  'Addition with Regrouping': {
    grade: 3,
    subject: 'Mathematics',
    chapter: 'Give and Take',
    prerequisites: ['3-Digit Numbers & Place Value', '2-digit addition'],
    masteryThreshold: 0.75
  },
  'Subtraction with Borrowing': {
    grade: 3,
    subject: 'Mathematics',
    chapter: 'Give and Take',
    prerequisites: ['Addition with Regrouping', 'Place Value'],
    masteryThreshold: 0.75
  },
  'Multiplication Tables': {
    grade: 3,
    subject: 'Mathematics',
    chapter: 'How Many Times?',
    prerequisites: ['Addition with Regrouping', 'Repeated addition'],
    masteryThreshold: 0.80
  },
  '2D Shapes and Properties': {
    grade: 3,
    subject: 'Mathematics',
    chapter: 'Shapes and Designs',
    prerequisites: ['Basic shapes', 'Counting sides'],
    masteryThreshold: 0.70
  },
  'Telling Time': {
    grade: 3,
    subject: 'Mathematics',
    chapter: 'Time Goes On',
    prerequisites: ['Numbers 1 to 12', 'Skip counting by 5'],
    masteryThreshold: 0.75
  },
  'Length Conversion': {
    grade: 3,
    subject: 'Mathematics',
    chapter: 'Measurement',
    prerequisites: ['Multiplication Tables', 'Place Value'],
    masteryThreshold: 0.75
  },

  // ---------------------------------------------------------
  // GRADE 7 MATHEMATICS
  // ---------------------------------------------------------
  'Integer Multiplication': {
    grade: 7,
    subject: 'Mathematics',
    chapter: 'Integers and Rational Numbers',
    prerequisites: ['Multiplication Tables', 'Negative numbers on number line'],
    masteryThreshold: 0.80
  },
  'Rational Numbers': {
    grade: 7,
    subject: 'Mathematics',
    chapter: 'Integers and Rational Numbers',
    prerequisites: ['Integer Multiplication', 'Fractions & Operations'],
    masteryThreshold: 0.80
  },
  'Simple Linear Equations': {
    grade: 7,
    subject: 'Mathematics',
    chapter: 'Linear Equations in One Variable',
    prerequisites: ['Rational Numbers', 'Algebraic Expressions'],
    masteryThreshold: 0.80
  },
  'Triangles and Properties': {
    grade: 7,
    subject: 'Mathematics',
    chapter: 'Lines and Angles & Triangles',
    prerequisites: ['Lines and Angles', 'Angle Sum Concept'],
    masteryThreshold: 0.75
  },
  'Lines and Angles': {
    grade: 7,
    subject: 'Mathematics',
    chapter: 'Lines and Angles & Triangles',
    prerequisites: ['2D Shapes and Properties', 'Degree measurement'],
    masteryThreshold: 0.75
  },
  'Profit and Loss': {
    grade: 7,
    subject: 'Mathematics',
    chapter: 'Comparing Quantities',
    prerequisites: ['Percentages', 'Rational Numbers'],
    masteryThreshold: 0.80
  },

  // ---------------------------------------------------------
  // GRADE 7 SCIENCE
  // ---------------------------------------------------------
  'Plant and Animal Nutrition': {
    grade: 7,
    subject: 'Science',
    chapter: 'Nutrition in Plants and Animals',
    prerequisites: ['Components of Food', 'Living Organisms Basics'],
    masteryThreshold: 0.75
  },
  'Chemical Indicators & Neutralization': {
    grade: 7,
    subject: 'Science',
    chapter: 'Acids, Bases and Salts',
    prerequisites: ['Taste and properties of substances', 'Solutions and solubility'],
    masteryThreshold: 0.75
  },
  'Types of Changes': {
    grade: 7,
    subject: 'Science',
    chapter: 'Physical and Chemical Changes',
    prerequisites: ['States of Matter', 'Reversibility of processes'],
    masteryThreshold: 0.75
  },
  'Physics Foundations': {
    grade: 7,
    subject: 'Science',
    chapter: 'Motion and Time',
    prerequisites: ['Measurement of time', 'Units of length'],
    masteryThreshold: 0.75
  },

  // ---------------------------------------------------------
  // GRADE 10 MATHEMATICS
  // ---------------------------------------------------------
  'Real Numbers': {
    grade: 10,
    subject: 'Mathematics',
    chapter: 'Real Numbers & Quadratic Equations',
    prerequisites: ['Rational Numbers', 'Prime Factorization', 'Euclidean Division'],
    masteryThreshold: 0.85
  },
  'Quadratic Equations': {
    grade: 10,
    subject: 'Mathematics',
    chapter: 'Real Numbers & Quadratic Equations',
    prerequisites: ['Simple Linear Equations', 'Polynomials & Factoring'],
    masteryThreshold: 0.85
  },
  'Arithmetic Progressions': {
    grade: 10,
    subject: 'Mathematics',
    chapter: 'Arithmetic Progressions & Trigonometry',
    prerequisites: ['Number Sequences & Ordering', 'Linear algebraic substitution'],
    masteryThreshold: 0.80
  },
  'Introduction to Trigonometry': {
    grade: 10,
    subject: 'Mathematics',
    chapter: 'Arithmetic Progressions & Trigonometry',
    prerequisites: ['Triangles and Properties', 'Pythagoras Theorem', 'Ratios & Proportions'],
    masteryThreshold: 0.85
  },
  'Theoretical Probability': {
    grade: 10,
    subject: 'Mathematics',
    chapter: 'Statistics and Probability',
    prerequisites: ['Fractions & Operations', 'Combinatorial counting'],
    masteryThreshold: 0.75
  },

  // ---------------------------------------------------------
  // GRADE 10 SCIENCE
  // ---------------------------------------------------------
  'Chemical Reactions and Redox': {
    grade: 10,
    subject: 'Science',
    chapter: 'Chemical Reactions and Equations',
    prerequisites: ['Types of Changes', 'Chemical Formulas & Valency'],
    masteryThreshold: 0.85
  },
  'Life Processes': {
    grade: 10,
    subject: 'Science',
    chapter: 'Heredity and Evolution & Life Processes',
    prerequisites: ['Plant and Animal Nutrition', 'Cell structure and transport'],
    masteryThreshold: 0.85
  },
  'Electricity and Ohm\'s Law': {
    grade: 10,
    subject: 'Science',
    chapter: 'Electricity and Magnetic Effects',
    prerequisites: ['Physics Foundations', 'Electric current and potential difference'],
    masteryThreshold: 0.85
  },
  'Ray Optics and Human Eye': {
    grade: 10,
    subject: 'Science',
    chapter: 'Light and Optics',
    prerequisites: ['Reflection and Refraction Basics', 'Geometrical angles'],
    masteryThreshold: 0.85
  }
};

/**
 * Returns immediate prerequisites for a topic
 */
function getDirectPrerequisites(topicName) {
  if (!topicName) return [];
  const cleanName = topicName.trim();
  const entry = CURRICULUM_PREREQUISITE_DAG[cleanName];
  if (entry && Array.isArray(entry.prerequisites)) {
    return entry.prerequisites;
  }

  // Substring match
  const match = Object.keys(CURRICULUM_PREREQUISITE_DAG).find(k => 
    k.toLowerCase().includes(cleanName.toLowerCase()) || cleanName.toLowerCase().includes(k.toLowerCase())
  );
  return match ? CURRICULUM_PREREQUISITE_DAG[match].prerequisites : [];
}

/**
 * Returns full transitive prerequisite ancestry (depth-first traversal)
 */
function getRemedialTrajectory(topicName, visited = new Set()) {
  if (!topicName || visited.has(topicName)) return [];
  visited.add(topicName);

  const direct = getDirectPrerequisites(topicName);
  let fullChain = [];

  for (const prereq of direct) {
    const parentChain = getRemedialTrajectory(prereq, visited);
    fullChain = [...fullChain, ...parentChain, prereq];
  }

  // Deduplicate preserving pedagogical order (earliest prerequisite first)
  return Array.from(new Set(fullChain));
}

/**
 * Identifies the root prerequisite gap among a list of struggling topics
 */
function identifyRootPrerequisiteGap(strugglingTopics = [], studentMasteryMap = {}) {
  if (!Array.isArray(strugglingTopics) || strugglingTopics.length === 0) {
    return null;
  }

  for (const topic of strugglingTopics) {
    const trajectory = getRemedialTrajectory(topic);
    // Find earliest unmastered concept recorded in student mastery map
    for (const prereq of trajectory) {
      if (studentMasteryMap[prereq] !== undefined) {
        const mastery = studentMasteryMap[prereq];
        if (mastery < 0.70) {
          return {
            strugglingTargetTopic: topic,
            rootPrerequisite: prereq,
            masteryLevel: mastery,
            recommendedAction: `Review foundational prerequisite "${prereq}" before continuing "${topic}".`
          };
        }
      }
    }

    // If no recorded prior gaps, look for direct prerequisite
    const direct = getDirectPrerequisites(topic);
    if (direct.length > 0) {
      return {
        strugglingTargetTopic: topic,
        rootPrerequisite: direct[0],
        masteryLevel: studentMasteryMap[direct[0]] ?? 0.5,
        recommendedAction: `Review foundational prerequisite "${direct[0]}" before continuing "${topic}".`
      };
    }
  }

  return {
    strugglingTargetTopic: strugglingTopics[0],
    rootPrerequisite: strugglingTopics[0],
    masteryLevel: studentMasteryMap[strugglingTopics[0]] ?? 0.5,
    recommendedAction: `Target targeted practice on "${strugglingTopics[0]}".`
  };
}

module.exports = {
  CURRICULUM_PREREQUISITE_DAG,
  getDirectPrerequisites,
  getRemedialTrajectory,
  identifyRootPrerequisiteGap
};
