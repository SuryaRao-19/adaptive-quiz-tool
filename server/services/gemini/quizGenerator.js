const { generateStructuredContent, validateGeminiConfig } = require('./geminiClient');
const { validateQuizResponse } = require('./responseValidator');
const {
  recordAIRequest,
  completeAIRequest,
  recordGeneratedContent,
  recordAIUsage,
  recordAIInteraction
} = require('./aiStorageService');

/**
 * Heuristic offline fallback generator ensuring the platform continues working seamlessly without internet or API key
 */
function generateOfflineQuizFallback({
  subject = 'Math',
  topic = 'Fractions',
  difficulty = 'medium',
  count = 5,
  format = 'MCQ',
  gradeLevel = 7
}) {
  const isMath = subject.toLowerCase().includes('math');
  const questions = [];

  for (let i = 1; i <= count; i++) {
    if (isMath) {
      const num1 = i * 2;
      const num2 = i * 3;
      questions.push({
        questionText: `Solve the problem: Calculate (${num1} / ${num2}) simplified to its lowest terms.`,
        question: `Solve the problem: Calculate (${num1} / ${num2}) simplified to its lowest terms.`,
        type: format === 'true_false' ? 'true_false' : 'MCQ',
        options: format === 'true_false'
          ? ['True', 'False']
          : ['2/3', '1/2', '3/4', `${num1}/${num2}`],
        correctAnswer: format === 'true_false' ? 'True' : '2/3',
        correctAnswerIndex: 0,
        explanation: `Divide both the numerator (${num1}) and denominator (${num2}) by their Greatest Common Factor (${i}) to get 2/3.`,
        steps: [
          { step: 'Step 1: Identify GCF', desc: `Find the common divisor for ${num1} and ${num2}.`, math: `GCF = ${i}` },
          { step: 'Step 2: Divide both terms', desc: 'Divide top and bottom by the common factor.', math: `${num1}÷${i} / ${num2}÷${i} = 2/3` }
        ],
        topic,
        difficulty,
        learningObjective: `Simplify rational fractions in Grade ${gradeLevel}`,
        marks: 1,
        conceptSummary: 'Fractions are simplified by dividing numerator and denominator by their greatest common factor.',
        misconception: 'Subtracting the common factor instead of dividing.',
        source: 'ai_fallback',
        status: 'pending_review'
      });
    } else {
      questions.push({
        questionText: `In the study of ${topic}, which principle explains energy conservation across trophic interactions?`,
        question: `In the study of ${topic}, which principle explains energy conservation across trophic interactions?`,
        type: format === 'true_false' ? 'true_false' : 'MCQ',
        options: format === 'true_false'
          ? ['True', 'False']
          : [
              'First Law of Thermodynamics (Energy is neither created nor destroyed)',
              'Law of Universal Gravitation',
              'Archimedes Principle of Buoyancy',
              'Dalton Atomic Theory'
            ],
        correctAnswer: format === 'true_false' ? 'True' : 'First Law of Thermodynamics (Energy is neither created nor destroyed)',
        correctAnswerIndex: 0,
        explanation: 'Energy transforms between radiant, chemical, and thermal forms without net creation or loss.',
        steps: [
          { step: 'Step 1: State the Law', desc: 'Recall the First Law of Thermodynamics.', math: 'ΔU = Q - W' },
          { step: 'Step 2: Relate to Ecosystem', desc: 'Solar radiation converts to biochemical bonds.', math: 'Solar -> Chemical' }
        ],
        topic,
        difficulty,
        learningObjective: `Understand fundamental energy dynamics in Grade ${gradeLevel} Science`,
        marks: 1,
        conceptSummary: 'Energy is conserved during chemical and physical transitions.',
        misconception: 'Assuming biological systems can create brand new energy.',
        source: 'ai_fallback',
        status: 'pending_review'
      });
    }
  }

  return questions;
}

/**
 * Feature A — AI Quiz Generator
 * Generates pedagogically rigorous questions conforming to official schema and requirements
 */
async function generateQuiz({
  subject = 'Math',
  topic = 'Fractions',
  subtopic = '',
  difficulty = 'medium',
  count = 5,
  format = 'MCQ',
  learningObjective = '',
  gradeLevel = 7,
  userId = null
}) {
  const safeCount = Math.min(Math.max(parseInt(count, 10) || 5, 1), 25);
  const cleanSubject = String(subject).trim();
  const cleanTopic = String(topic).trim();
  const cleanSubtopic = String(subtopic || '').trim();
  const cleanDifficulty = ['easy', 'medium', 'hard', 'very_hard'].includes(String(difficulty).toLowerCase())
    ? String(difficulty).toLowerCase()
    : 'medium';
  const cleanGrade = Math.min(Math.max(parseInt(gradeLevel, 10) || 7, 1), 12);
  const cleanObjective = learningObjective ? String(learningObjective).trim() : `Master core conceptual fundamentals of ${cleanTopic}`;

  const requestId = await recordAIRequest({
    userId,
    featureType: 'QUIZ_GENERATOR',
    modelName: 'gemini-3.8-flash',
    metadata: { subject: cleanSubject, topic: cleanTopic, count: safeCount, difficulty: cleanDifficulty }
  });

  const configCheck = validateGeminiConfig();
  if (!configCheck.configured) {
    console.warn('[Quiz Generator] Gemini not configured, using offline pedagogical fallback.');
    const fallbackQuestions = generateOfflineQuizFallback({
      subject: cleanSubject,
      topic: cleanTopic,
      difficulty: cleanDifficulty,
      count: safeCount,
      format,
      gradeLevel: cleanGrade
    });

    const contentId = await recordGeneratedContent({
      requestId,
      contentType: 'quiz_questions',
      generatedContent: fallbackQuestions,
      validationStatus: 'VALID'
    });

    await completeAIRequest({ requestId, status: 'COMPLETED' });

    return {
      success: true,
      source: 'offline_fallback',
      requestId,
      contentId,
      model: 'heuristic_offline',
      count: fallbackQuestions.length,
      questions: fallbackQuestions
    };
  }

  const prompt = `You are an expert assessment author and STEM curriculum specialist aligned with UN Sustainable Development Goal 4 (Quality Education).
Create exactly ${safeCount} high-quality, scientifically and mathematically sound questions for Grade ${cleanGrade} students.

Parameters:
- Subject: ${cleanSubject}
- Topic: ${cleanTopic}
${cleanSubtopic ? `- Subtopic: ${cleanSubtopic}` : ''}
- Academic Level: Grade ${cleanGrade}
- Difficulty Level: ${cleanDifficulty}
- Question Format: ${format}
- Learning Objective: ${cleanObjective}

CRITICAL RULES:
1. For MCQ or multiple_select, supply exactly 4 options. Distractors MUST represent real student misconceptions (e.g. arithmetic sign confusion, missing units, adding denominators).
2. For true_false, options MUST be ["True", "False"].
3. correctAnswer MUST accurately identify the correct response.
4. correctAnswerIndex MUST be the zero-based index of correctAnswer in options (for multiple choice).
5. explanation: clear, encouraging, step-by-step breakdown.
6. steps: array of 2-4 breakdown steps: [{"step": "Step 1...", "desc": "...", "math": "..."}].
7. marks: integer between 1 and 4 based on complexity.
8. No duplicate or near-duplicate questions.

Return JSON in this exact structure:
{
  "questions": [
    {
      "question": "Clear problem statement",
      "type": "${format}",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "correctAnswerIndex": 0,
      "explanation": "Detailed pedagogical explanation...",
      "steps": [
        { "step": "Step 1: Understand", "desc": "...", "math": "..." },
        { "step": "Step 2: Calculate", "desc": "...", "math": "..." }
      ],
      "topic": "${cleanTopic}",
      "difficulty": "${cleanDifficulty}",
      "learningObjective": "${cleanObjective}",
      "marks": 1,
      "conceptSummary": "One-sentence takeaway rule",
      "misconception": "Typical student error avoided"
    }
  ]
}`;

  try {
    const aiResult = await generateStructuredContent({
      prompt,
      systemInstruction: 'You generate structured academic quizzes for students. All output must be strictly valid JSON according to schema.',
      temperature: 0.35,
      maxTokens: 4096
    });

    const validation = validateQuizResponse(aiResult.data, cleanSubject, cleanTopic);

    if (!validation.isValid || validation.questions.length === 0) {
      console.warn('[Quiz Generator] Model response failed schema validation. Falling back to offline fallback.');
      const fallbackQuestions = generateOfflineQuizFallback({
        subject: cleanSubject,
        topic: cleanTopic,
        difficulty: cleanDifficulty,
        count: safeCount,
        format,
        gradeLevel: cleanGrade
      });

      const contentId = await recordGeneratedContent({
        requestId,
        contentType: 'quiz_questions',
        generatedContent: fallbackQuestions,
        validationStatus: 'PARTIAL'
      });

      await completeAIRequest({ requestId, status: 'COMPLETED' });

      return {
        success: true,
        source: 'offline_fallback_after_validation_error',
        requestId,
        contentId,
        count: fallbackQuestions.length,
        questions: fallbackQuestions
      };
    }

    const contentId = await recordGeneratedContent({
      requestId,
      contentType: 'quiz_questions',
      generatedContent: validation.questions,
      validationStatus: 'VALID'
    });

    if (aiResult.usage) {
      await recordAIUsage({
        userId,
        requestId,
        modelName: aiResult.usage.model,
        inputTokens: aiResult.usage.inputTokens,
        outputTokens: aiResult.usage.outputTokens,
        estimatedCost: aiResult.usage.estimatedCost
      });
    }

    await recordAIInteraction({
      userId,
      featureType: 'QUIZ_GENERATOR',
      requestReference: requestId,
      metadata: { count: validation.questions.length, topic: cleanTopic }
    });

    await completeAIRequest({ requestId, status: 'COMPLETED' });

    return {
      success: true,
      source: 'gemini_api',
      requestId,
      contentId,
      model: aiResult.usage?.model,
      count: validation.questions.length,
      questions: validation.questions,
      usage: aiResult.usage
    };
  } catch (err) {
    console.error('[Quiz Generator Error]', err.message);
    await completeAIRequest({ requestId, status: 'FAILED', metadata: { error: err.message } });

    // Fallback gracefully
    const fallbackQuestions = generateOfflineQuizFallback({
      subject: cleanSubject,
      topic: cleanTopic,
      difficulty: cleanDifficulty,
      count: safeCount,
      format,
      gradeLevel: cleanGrade
    });

    return {
      success: true,
      source: 'offline_fallback_on_error',
      requestId,
      count: fallbackQuestions.length,
      questions: fallbackQuestions,
      notice: 'Generated using local pedagogical engine due to AI service unavailability.'
    };
  }
}

module.exports = {
  generateQuiz,
  generateOfflineQuizFallback
};

