const Question = require('../models/Question');
const keys = require('../config/keys');
const { calculateNextDifficulty } = require('../engine/adaptiveEngine');

// Heuristic fallback generator when AI API key is not present or call fails
const generateLocalFallbackQuestions = (subject, topic, difficulty, count) => {
  const generated = [];
  const templates = {
    Math: [
      {
        text: (i) => `Evaluate the following algebraic expression for x = ${i + 3}: 3x - ${i * 2 + 1}.`,
        ans: (i) => `${3 * (i + 3) - (i * 2 + 1)}`,
        wrong: (i) => [
          `${3 * (i + 3) + (i * 2 + 1)}`,
          `${(i + 3) * 3}`,
          `${3 * (i + 3) - i}`
        ],
        expl: "Substitute the given value for x, perform the multiplication first, then subtract the constant.",
        concept: "Follow standard order of operations (PEMDAS) when evaluating algebraic expressions.",
        misconception: "Subtracting before completing the multiplication."
      },
      {
        text: (i) => `A rectangular garden has a length of ${i + 8} meters and a width of ${i + 4} meters. What is its perimeter?`,
        ans: (i) => `${2 * (i + 8 + i + 4)} meters`,
        wrong: (i) => [
          `${(i + 8) * (i + 4)} square meters`,
          `${i + 8 + i + 4} meters`,
          `${4 * (i + 8)} meters`
        ],
        expl: "Perimeter of a rectangle is calculated as P = 2(length + width).",
        concept: "Perimeter measures the linear distance around the outer boundary.",
        misconception: "Confusing perimeter with area (multiplying length by width)."
      },
      {
        text: (i) => `In a classroom of ${20 + i * 2} students, ${(i + 2) * 5}% received an A on the diagnostic quiz. How many students earned an A?`,
        ans: (i) => `${Math.round((20 + i * 2) * ((i + 2) * 5) / 100)} students`,
        wrong: (i) => [
          `${(i + 2) * 5} students`,
          `${Math.round((20 + i * 2) * ((i + 2) * 5) / 10)} students`,
          `${20 + i} students`
        ],
        expl: "Multiply the total number of students by the percentage expressed as a decimal.",
        concept: "To find the percentage of a total, multiply by (percent / 100).",
        misconception: "Assuming the percentage itself is the exact count of students."
      }
    ],
    Science: [
      {
        text: (i) => `During an experiment on ${topic}, a student observes that adding thermal energy causes the particles to move faster. What property increases directly with this molecular speed?`,
        ans: () => "Kinetic energy of the particles",
        wrong: () => [
          "Gravitational mass of the substance",
          "Electrical charge of the atoms",
          "The number of neutrons in the nucleus"
        ],
        expl: "Temperature is a direct macroscopic manifestation of average microscopic kinetic energy.",
        concept: "Thermal energy increases molecular kinetic velocity and collision rates.",
        misconception: "Thinking heating an object creates extra atoms or adds mass."
      },
      {
        text: (i) => `In an ecosystem community related to ${topic}, how does energy flow between successive trophic levels?`,
        ans: () => "Approximately 10% is transferred to new biomass, with 90% lost primarily as metabolic heat.",
        wrong: () => [
          "100% of the energy is conserved and stored at the apex predator level.",
          "Energy increases by 50% at each step due to predation.",
          "Energy flows in reverse from top carnivores back into sunlight."
        ],
        expl: "The Second Law of Thermodynamics governs ecological trophic efficiency (roughly 10% rule).",
        concept: "Energy enters as sunlight, flows through trophic levels, and dissipates as ambient heat.",
        misconception: "Believing biological energy transfer is 100% efficient without thermodynamic losses."
      },
      {
        text: (i) => `When analyzing ${topic}, why is a controlled variable essential in a valid scientific investigation?`,
        ans: () => "To ensure that any observed changes are solely caused by the independent variable.",
        wrong: () => [
          "To speed up the experiment so it finishes in half the time.",
          "To guarantee that every hypothesis is proven correct.",
          "To change as many conditions simultaneously as possible."
        ],
        expl: "Controlled variables isolate the causal relationship between independent and dependent variables.",
        concept: "Valid experiments maintain all extraneous factors constant to eliminate confounding bias.",
        misconception: "Changing multiple variables at once in a fair test."
      }
    ]
  };

  const pool = templates[subject] || templates.Math;

  for (let i = 0; i < count; i++) {
    const tmpl = pool[i % pool.length];
    const qText = tmpl.text(i);
    const correctVal = tmpl.ans(i);
    const distractors = tmpl.wrong(i);
    
    // Shuffle options
    const options = [correctVal, ...distractors].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correctVal);

    generated.push({
      subject,
      topic,
      difficulty,
      questionText: qText,
      options,
      correctAnswerIndex: correctIndex,
      explanation: tmpl.expl,
      steps: [
        {
          step: "Step 1: Identify Key Parameters",
          desc: "Extract given quantities and relevant principles for " + topic + ".",
          math: "Identify knowns and unknowns"
        },
        {
          step: "Step 2: Apply the Principle",
          desc: tmpl.expl,
          math: "Apply formula / scientific law"
        },
        {
          step: "Step 3: Conclude and Verify",
          desc: tmpl.concept,
          math: "Correct Option: " + correctVal
        }
      ],
      conceptSummary: tmpl.concept,
      misconception: tmpl.misconception,
      source: 'ai_generated',
      status: 'pending_review'
    });
  }

  return generated;
};

// @desc Generate questions using Gemini AI (with fallback)
// @route POST /api/questions/generate
const generateQuestions = async (req, res, next) => {
  try {
    const { subject = 'Math', topic = 'Fractions', difficulty = 'medium', count = 5 } = req.body;

    const safeCount = Math.min(Math.max(parseInt(count, 10) || 5, 1), 30);
    const cleanSubject = subject === 'Science' ? 'Science' : 'Math';
    const cleanTopic = (topic || 'Foundations').trim();
    const cleanDifficulty = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium';

    let rawQuestions = [];

    // Check if Gemini API Key is configured
    if (keys.AI_API_KEY && keys.AI_API_KEY.trim()) {
      try {
        const prompt = `You are a curriculum assessment designer for Grade 6-8 Math and Science aligned with UN Sustainable Development Goal 4 (Quality Education).
Generate exactly ${safeCount} high-quality, pedagogically rigorous Multiple Choice Questions (MCQ).
Subject: ${cleanSubject}
Topic: ${cleanTopic}
Difficulty: ${cleanDifficulty}

CRITICAL RULES:
1. Each question must have exactly 4 plausible options.
2. The 3 distractors MUST reflect authentic student misconceptions (e.g. adding denominators, arithmetic sign errors, confusing units), NOT random numbers.
3. correctAnswerIndex must be an integer (0, 1, 2, or 3) matching the correct option.
4. explanation: Plain-language, encouraging step-by-step breakdown.
5. steps: Array of 2 to 4 structured steps: [{"step": "Step 1...", "desc": "...", "math": "..."}].
6. conceptSummary: 1-sentence foundational takeaway.
7. misconception: Explicitly identify the student pitfall.

Return ONLY a valid JSON array of objects conforming to this schema without any markdown formatting or commentary:
[
  {
    "questionText": "...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswerIndex": 0,
    "explanation": "...",
    "steps": [
      { "step": "Step 1: ...", "desc": "...", "math": "..." },
      { "step": "Step 2: ...", "desc": "...", "math": "..." }
    ],
    "conceptSummary": "...",
    "misconception": "..."
  }
]`;

        const modelName = keys.AI_MODEL || 'gemini-1.5-flash';
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${keys.AI_API_KEY.trim()}`;

        const apiResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096
            }
          })
        });

        if (apiResponse.ok) {
          const data = await apiResponse.json();
          let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          // Strip markdown code fences if present
          text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

          // Locate JSON array boundaries
          const startIdx = text.indexOf('[');
          const endIdx = text.lastIndexOf(']');
          if (startIdx !== -1 && endIdx !== -1) {
            const jsonSubstring = text.substring(startIdx, endIdx + 1);
            const parsed = JSON.parse(jsonSubstring);
            if (Array.isArray(parsed) && parsed.length > 0) {
              rawQuestions = parsed;
            }
          }
        } else {
          console.warn('[AI Question Gen] Gemini API error, using algorithmic fallback:', await apiResponse.text());
        }
      } catch (geminiErr) {
        console.warn('[AI Question Gen] Gemini call exception, using algorithmic fallback:', geminiErr.message);
      }
    }

    // Fallback if AI call didn't yield questions
    if (rawQuestions.length === 0) {
      rawQuestions = generateLocalFallbackQuestions(cleanSubject, cleanTopic, cleanDifficulty, safeCount);
    }

    // Strict sanitization and validation
    const validQuestions = [];
    for (const q of rawQuestions) {
      if (!q.questionText || !Array.isArray(q.options) || q.options.length !== 4) continue;
      
      const correctIdx = Number(q.correctAnswerIndex);
      if (isNaN(correctIdx) || correctIdx < 0 || correctIdx > 3) continue;

      const steps = Array.isArray(q.steps) && q.steps.length >= 2 ? q.steps : [
        { step: "Step 1: Core Concept", desc: "Identify given parameters in " + cleanTopic, math: "Analysis" },
        { step: "Step 2: Solution", desc: q.explanation || "Solve problem", math: "Verification" }
      ];

      validQuestions.push({
        subject: cleanSubject,
        topic: cleanTopic,
        difficulty: cleanDifficulty,
        questionText: q.questionText.trim(),
        options: q.options.map(o => String(o).trim()),
        correctAnswerIndex: correctIdx,
        explanation: (q.explanation || 'Step-by-step conceptual solution.').trim(),
        steps,
        conceptSummary: (q.conceptSummary || 'Foundational concept in ' + cleanTopic).trim(),
        misconception: (q.misconception || 'Common distractor misunderstanding').trim(),
        source: 'ai_generated',
        status: 'pending_review',
        createdBy: req.user._id,
        isActive: true
      });

      if (validQuestions.length >= safeCount) break;
    }

    if (validQuestions.length === 0) {
      return res.status(500).json({ success: false, message: 'Failed to format valid questions from generator.' });
    }

    // Insert into database
    const createdQuestions = await Question.insertMany(validQuestions);

    res.status(201).json({
      success: true,
      message: `Generated ${createdQuestions.length} questions tagged as 'pending_review'.`,
      count: createdQuestions.length,
      questions: createdQuestions
    });
  } catch (error) {
    next(error);
  }
};

// @desc Add a new question to the bank (Teacher or Admin)
// @route POST /api/questions
const addQuestion = async (req, res, next) => {
  try {
    const { 
      subject, 
      topic, 
      difficulty, 
      text, 
      questionText, 
      options, 
      correctAnswer, 
      correctAnswerIndex, 
      explanation, 
      videoUrl, 
      solutionSteps, 
      steps, 
      conceptSummary, 
      misconception,
      status = 'approved',
      source = 'manual'
    } = req.body;

    const actualText = text || questionText;
    const actualCorrect = correctAnswer !== undefined ? Number(correctAnswer) : Number(correctAnswerIndex);
    const actualSteps = solutionSteps || steps || [];

    if (!subject || !topic || !actualText || !options || options.length !== 4 || actualCorrect === undefined || !explanation) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subject, topic, difficulty, question text, 4 options, correct answer index, and explanation are required.' 
      });
    }

    const newQuestion = await Question.create({
      subject,
      topic: topic.trim(),
      difficulty: difficulty || 'medium',
      questionText: actualText.trim(),
      options: options.map(o => o.trim()),
      correctAnswerIndex: actualCorrect,
      explanation: explanation.trim(),
      videoUrl: videoUrl || '',
      steps: actualSteps,
      conceptSummary: conceptSummary || '',
      misconception: misconception || '',
      source: source || 'manual',
      status: status || 'approved',
      createdBy: req.user._id,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Question added to question bank successfully.',
      question: newQuestion
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all questions (Filterable by subject, topic, difficulty, status, source)
// @route GET /api/questions
const getQuestions = async (req, res, next) => {
  try {
    const { subject, topic, difficulty, status, source, search } = req.query;
    const filter = { isActive: true };

    if (subject && subject !== 'All') filter.subject = subject;
    if (topic && topic !== 'All') filter.topic = topic;
    if (difficulty && difficulty !== 'All') filter.difficulty = difficulty;
    if (source && source !== 'All') filter.source = source;

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search && search.trim()) {
      filter.questionText = { $regex: search.trim(), $options: 'i' };
    }

    const questions = await Question.find(filter).sort({ createdAt: -1 });

    // Phase 6 & 7: Aggregate Empirical Telemetry & Rasch 1PL Calibration Metrics
    const Attempt = require('../models/Attempt');
    const {
      calculateEmpiricalPassRate,
      detectDifficultyAnomaly,
      estimateRaschItemDifficulty
    } = require('../engine/raschEngine');

    const questionIds = questions.map(q => q._id);
    let telemetryMap = {};
    try {
      const stats = await Attempt.aggregate([
        { $match: { questionId: { $in: questionIds } } },
        {
          $group: {
            _id: '$questionId',
            totalResponses: { $sum: 1 },
            correctResponses: {
              $sum: { $cond: [{ $eq: ['$isCorrect', true] }, 1, 0] }
            }
          }
        }
      ]);

      for (const s of stats) {
        telemetryMap[s._id.toString()] = {
          total: s.totalResponses,
          correct: s.correctResponses
        };
      }
    } catch (e) {
      // Graceful fallback if aggregation unavailable
    }

    const enhancedQuestions = questions.map(q => {
      const qObj = q.toObject();
      const stat = telemetryMap[q._id.toString()] || { total: 0, correct: 0 };
      const passRateObj = calculateEmpiricalPassRate(stat.correct, stat.total);
      const anomalyObj = detectDifficultyAnomaly(q.difficulty, passRateObj);
      const raschObj = estimateRaschItemDifficulty(stat.correct, stat.total);

      qObj.telemetry = {
        sampleSize: passRateObj.sampleSize,
        passRate: passRateObj.passRate,
        passRatePercent: passRateObj.passRatePercent,
        status: passRateObj.status,
        anomaly: anomalyObj,
        rasch: raschObj
      };
      return qObj;
    });

    res.status(200).json({
      success: true,
      count: enhancedQuestions.length,
      questions: enhancedQuestions
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update question review status (Approve or Reject)
// @route PATCH /api/questions/:id/status
const updateQuestionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending_review'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'approved', 'rejected', or 'pending_review'." });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    question.status = status;
    if (status === 'rejected') {
      question.isActive = false;
    } else {
      question.isActive = true;
    }

    await question.save();

    res.status(200).json({
      success: true,
      message: `Question status updated to '${status}'.`,
      question
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update question content (Edit by Teacher/Admin)
// @route PUT /api/questions/:id
const updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    const allowedUpdates = [
      'questionText', 'options', 'correctAnswerIndex', 'explanation',
      'steps', 'conceptSummary', 'misconception', 'difficulty', 'topic', 'subject', 'status'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        question[field] = req.body[field];
      }
    });

    await question.save();

    res.status(200).json({
      success: true,
      message: 'Question updated successfully.',
      question
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get distinct syllabus topics
// @route GET /api/questions/topics
const getTopics = async (req, res, next) => {
  try {
    const { subject } = req.query;
    const filter = subject && subject !== 'All' 
      ? { subject, isActive: true, status: 'approved' } 
      : { isActive: true, status: 'approved' };
    const topics = await Question.distinct('topic', filter);
    res.status(200).json({
      success: true,
      subject: subject || 'All',
      topics
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete a question from the bank
// @route DELETE /api/questions/:id
const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    await Question.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateQuestions,
  addQuestion,
  getQuestions,
  updateQuestionStatus,
  updateQuestion,
  getTopics,
  deleteQuestion
};
