/**
 * Deterministic Zero-Overhead Intent Classifier (Multi-Grade Enhanced)
 * 
 * Accurately categorizes student & teacher requests locally using semantic heuristics,
 * tokens, code fences, and context metadata without adding latency or model API calls.
 * 
 * Supports:
 * - Greetings (Warm welcome greeting, prevent unsolicited STEM lectures on "hi")
 * - General questions
 * - Mathematical questions & calculations
 * - Science questions & derivations
 * - Requests for explanations
 * - Requests for hints
 * - Requests for analogies
 * - Requests for formulas
 * - Practice requests
 * - Misconception diagnosis
 */

const CATEGORIES = {
  SIMPLE: 'SIMPLE',
  EDUCATIONAL_REASONING: 'EDUCATIONAL_REASONING',
  PROGRAMMING: 'PROGRAMMING',
  TUTORING: 'TUTORING',
  CONTENT_GENERATION: 'CONTENT_GENERATION',
  LONG_CONTEXT: 'LONG_CONTEXT'
};

const DETAILED_INTENTS = {
  GREETING: 'GREETING',
  FORMULA_REQUEST: 'FORMULA_REQUEST',
  HINT_REQUEST: 'HINT_REQUEST',
  ANALOGY_REQUEST: 'ANALOGY_REQUEST',
  PRACTICE_REQUEST: 'PRACTICE_REQUEST',
  MISCONCEPTION_DIAGNOSIS: 'MISCONCEPTION_DIAGNOSIS',
  MATHEMATICAL_QUESTION: 'MATHEMATICAL_QUESTION',
  SCIENCE_QUESTION: 'SCIENCE_QUESTION',
  GENERAL_EXPLANATION: 'GENERAL_EXPLANATION',
  PROGRAMMING_QUESTION: 'PROGRAMMING_QUESTION',
  GENERAL_QUESTION: 'GENERAL_QUESTION'
};

const GREETING_PATTERNS = [
  /^(hi|hello|hey|heyy|greetings|good\s*(morning|afternoon|evening|day)|namaste|hola|what's\s*up|sup)[!.,?\s]*$/i,
  /^(hi|hello|hey)\s+(tutor|adaptiq|bot|there|sir|ma'?am)[!.,?\s]*$/i,
  /^(how\s*are\s*you|who\s*are\s*you)[!.,?\s]*$/i
];

const FORMULA_KEYWORDS = [
  'formula', 'equation', 'identity', 'theorem', 'what is the formula for',
  'how do i calculate', 'formula of', 'law of', 'expression for'
];

const HINT_KEYWORDS = [
  'give me a hint', 'need a hint', 'stuck', 'clue', 'nudge',
  'help me start', 'first step', 'can you give a hint'
];

const ANALOGY_KEYWORDS = [
  'analogy', 'real-world', 'real life example', 'metaphor', 'like what in real life',
  'visualize this', 'simple terms', 'daily life'
];

const PRACTICE_KEYWORDS = [
  'give me a question', 'test me', 'quiz me', 'practice problem', 'give me an exercise',
  'another problem', 'sample question', 'practice question', 'try a question'
];

const MISCONCEPTION_KEYWORDS = [
  'why is my answer wrong', 'what mistake did i make', 'is this correct',
  'where did i go wrong', 'why did i get this wrong', 'check my work', 'is my solution right'
];

const PROGRAMMING_KEYWORDS = [
  'function', 'const', 'let', 'var', 'def ', 'class ', 'import ', 'return',
  'python', 'javascript', 'typescript', 'java', 'c++', 'sql', 'select', 'from',
  'where', 'insert', 'update', 'bug', 'debug', 'syntax error', 'array', 'pointer',
  'recursion', 'algorithm', 'binary tree', 'stack', 'queue', 'hashmap', 'big-o'
];

const REASONING_KEYWORDS = [
  'why does', 'prove', 'derivation', 'derive', 'theorem', 'integral', 'derivative',
  'calculus', 'quadratic', 'polynomial', 'solve for', 'photosynthesis',
  'thermodynamics', 'mitosis', 'meiosis', 'quantum', 'relativity', 'stoichiometry',
  'momentum', 'kinetic', 'potential energy', 'vector', 'matrix', 'transposition'
];

const MATH_PATTERNS = [
  /\b(fraction|rational number|integer|equation|algebra|geometry|perimeter|area|volume|exponent|polynomial|triangle|pythagoras)\b/i,
  /[\d\s]+[\+\-\*\/=][\d\s]+/,
  /\b(x\^2|ax\^2|solve for x|evaluate|simplify)\b/i
];

const SCIENCE_PATTERNS = [
  /\b(cell|chlorophyll|force|gravity|velocity|acceleration|friction|atom|molecule|acid|base|metal|respiration|photosynthesis)\b/i
];

/**
 * Classifies an incoming AI request into educational routing category and detailed intent
 */
function classifyIntent(firstArg = {}, secondArg = {}) {
  let message, topic, subject, tutorMode, historyLength, requiresStructuredOutput;
  if (typeof firstArg === 'string') {
    message = firstArg;
    ({
      topic = '',
      subject = '',
      tutorMode = 'explain',
      historyLength = 0,
      requiresStructuredOutput = false
    } = secondArg);
  } else if (firstArg && typeof firstArg === 'object') {
    ({
      message = '',
      topic = '',
      subject = '',
      tutorMode = 'explain',
      historyLength = 0,
      requiresStructuredOutput = false
    } = firstArg);
  } else {
    message = '';
    topic = '';
    subject = '';
    tutorMode = 'explain';
    historyLength = 0;
    requiresStructuredOutput = false;
  }

  const text = (message || '').trim();
  const lower = text.toLowerCase();
  const lowerTopic = (topic || '').toLowerCase();
  const lowerSubject = (subject || '').toLowerCase();

  // 1. Strict Greeting Check FIRST (Prevents unprompted STEM lectures on 'hi')
  const isGreetingMatch = GREETING_PATTERNS.some(pattern => pattern.test(text)) || 
    (lower.length <= 15 && ['hi', 'hello', 'hey', 'greetings', 'namaste'].includes(lower.replace(/[^\w\s]/g, '')));

  if (isGreetingMatch) {
    return {
      category: CATEGORIES.SIMPLE,
      detailedIntent: DETAILED_INTENTS.GREETING,
      intent: DETAILED_INTENTS.GREETING,
      reason: 'Student conversational greeting or opening turn.',
      estimatedComplexity: 'low'
    };
  }

  // 2. Long context check (> 12 conversation turns or long text)
  if (historyLength >= 12 || text.length > 3000) {
    return {
      category: CATEGORIES.LONG_CONTEXT,
      detailedIntent: DETAILED_INTENTS.GENERAL_QUESTION,
      intent: DETAILED_INTENTS.GENERAL_QUESTION,
      reason: 'High message volume or large context window requiring long-context buffer.',
      estimatedComplexity: 'high'
    };
  }

  // 3. Structured content generation check
  if (requiresStructuredOutput || text.includes('generate quiz') || text.includes('create question')) {
    return {
      category: CATEGORIES.CONTENT_GENERATION,
      detailedIntent: DETAILED_INTENTS.PRACTICE_REQUEST,
      intent: DETAILED_INTENTS.PRACTICE_REQUEST,
      reason: 'Structured educational content generation request.',
      estimatedComplexity: 'medium'
    };
  }

  // 4. Programming check
  const hasCodeFence = text.includes('```') || text.includes('`');
  const isProgSubject = lowerSubject.includes('computer') || lowerSubject.includes('coding');
  if (hasCodeFence || (isProgSubject && PROGRAMMING_KEYWORDS.some(k => lower.includes(k))) || lower.includes('debug')) {
    return {
      category: CATEGORIES.PROGRAMMING,
      detailedIntent: DETAILED_INTENTS.PROGRAMMING_QUESTION,
      intent: DETAILED_INTENTS.PROGRAMMING_QUESTION,
      reason: 'Code debugging, programming assignment, or algorithmic analysis.',
      estimatedComplexity: 'high'
    };
  }

  // 5. Practice Request check
  if (PRACTICE_KEYWORDS.some(k => lower.includes(k))) {
    return {
      category: CATEGORIES.TUTORING,
      detailedIntent: DETAILED_INTENTS.PRACTICE_REQUEST,
      intent: DETAILED_INTENTS.PRACTICE_REQUEST,
      reason: 'Student explicitly requested a practice problem or diagnostic question.',
      estimatedComplexity: 'medium'
    };
  }

  // 6. Hint Request check
  if (HINT_KEYWORDS.some(k => lower.includes(k)) || /\bhints?\b/i.test(lower)) {
    return {
      category: CATEGORIES.TUTORING,
      detailedIntent: DETAILED_INTENTS.HINT_REQUEST,
      intent: DETAILED_INTENTS.HINT_REQUEST,
      reason: 'Student requested a progressive pedagogical hint.',
      estimatedComplexity: 'low'
    };
  }

  // 7. Misconception / Check Work check
  if (MISCONCEPTION_KEYWORDS.some(k => lower.includes(k))) {
    return {
      category: CATEGORIES.EDUCATIONAL_REASONING,
      detailedIntent: DETAILED_INTENTS.MISCONCEPTION_DIAGNOSIS,
      intent: DETAILED_INTENTS.MISCONCEPTION_DIAGNOSIS,
      reason: 'Student seeking diagnosis of a mathematical or scientific error.',
      estimatedComplexity: 'high'
    };
  }

  // 8. Analogy Request check
  if (ANALOGY_KEYWORDS.some(k => lower.includes(k))) {
    return {
      category: CATEGORIES.TUTORING,
      detailedIntent: DETAILED_INTENTS.ANALOGY_REQUEST,
      intent: DETAILED_INTENTS.ANALOGY_REQUEST,
      reason: 'Student requested an intuitive real-world metaphor.',
      estimatedComplexity: 'medium'
    };
  }

  // 9. Formula Request check
  if (FORMULA_KEYWORDS.some(k => lower.includes(k)) || /\bformulas?\b/i.test(lower)) {
    return {
      category: CATEGORIES.EDUCATIONAL_REASONING,
      detailedIntent: DETAILED_INTENTS.FORMULA_REQUEST,
      intent: DETAILED_INTENTS.FORMULA_REQUEST,
      reason: 'Student requested a formal mathematical or scientific equation.',
      estimatedComplexity: 'medium'
    };
  }

  // 10. Educational Reasoning (Math or Science derivation)
  const isMath = lowerSubject.includes('math') || MATH_PATTERNS.some(p => p.test(text));
  const isScience = lowerSubject.includes('sci') || lowerSubject.includes('phys') || lowerSubject.includes('chem') || lowerSubject.includes('bio') || SCIENCE_PATTERNS.some(p => p.test(text));

  if (
    REASONING_KEYWORDS.some(k => lower.includes(k)) ||
    (isMath && (lower.includes('solve') || MATH_PATTERNS.some(p => p.test(text)))) ||
    (isScience && (REASONING_KEYWORDS.some(k => lower.includes(k)) || lower.includes('reaction') || lower.includes('chloroplast') || lower.includes('what happens') || lower.includes('how does')))
  ) {
    const dIntent = (isScience && !isMath) ? DETAILED_INTENTS.SCIENCE_QUESTION : DETAILED_INTENTS.MATHEMATICAL_QUESTION;
    return {
      category: CATEGORIES.EDUCATIONAL_REASONING,
      detailedIntent: dIntent,
      intent: dIntent,
      reason: 'Multi-step mathematical derivation or conceptual STEM explanation.',
      estimatedComplexity: 'high'
    };
  }

  // 11. General Explanation
  if (lower.includes('explain') || lower.includes('what is') || lower.includes('define')) {
    return {
      category: CATEGORIES.TUTORING,
      detailedIntent: DETAILED_INTENTS.GENERAL_EXPLANATION,
      intent: DETAILED_INTENTS.GENERAL_EXPLANATION,
      reason: 'Direct conceptual explanation request.',
      estimatedComplexity: 'medium'
    };
  }

  // Default to General Question in Tutoring Category
  return {
    category: CATEGORIES.TUTORING,
    detailedIntent: DETAILED_INTENTS.GENERAL_QUESTION,
    intent: DETAILED_INTENTS.GENERAL_QUESTION,
    reason: 'Standard conversational academic tutoring turn.',
    estimatedComplexity: 'medium'
  };
}

module.exports = {
  CATEGORIES,
  DETAILED_INTENTS,
  classifyIntent
};
