const { generateStructuredContent, validateGeminiConfig } = require('./geminiClient');
const { validateAnswerExplanation } = require('./responseValidator');
const {
  recordAIRequest,
  completeAIRequest,
  recordGeneratedContent,
  recordAIUsage,
  recordAIInteraction
} = require('./aiStorageService');

/**
 * Feature B — AI Answer Explanation
 * Breaks down student mistakes, explains why the choice was incorrect, and provides pedagogical guidance.
 */
async function explainAnswer({
  questionText,
  options = [],
  studentAnswer,
  correctAnswer,
  subject = 'Math',
  topic = 'General',
  gradeLevel = 7,
  isTestMode = false,
  userId = null
}) {
  // ACADEMIC INTEGRITY LOCK: Never reveal solutions or explanations during active summative test mode
  if (isTestMode) {
    const error = new Error('Answer explanations are disabled during active Test Mode to uphold academic integrity.');
    error.status = 403;
    throw error;
  }

  if (!questionText || studentAnswer === undefined) {
    const error = new Error('questionText and studentAnswer are required.');
    error.status = 400;
    throw error;
  }

  const cleanGrade = Math.min(Math.max(parseInt(gradeLevel, 10) || 7, 1), 12);
  const requestId = await recordAIRequest({
    userId,
    featureType: 'ANSWER_EXPLANATION',
    modelName: 'gemini-3.8-flash',
    metadata: { subject, topic, gradeLevel: cleanGrade }
  });

  const configCheck = validateGeminiConfig();
  if (!configCheck.configured) {
    // Offline heuristic explanation
    const fallbackData = {
      correctAnswer: correctAnswer || 'Correct option',
      explanation: `In ${subject} (${topic}), this problem centers on recognizing the foundational definition and applying standard operations carefully.`,
      whyIncorrect: `Your answer ("${studentAnswer}") is a very common mistake! It typically occurs when confusing the order of operations or applying rules from an unrelated concept.`,
      stepByStepSolution: [
        'Step 1: Read the problem carefully and identify the given variables.',
        'Step 2: Recall the core formula or scientific principle for ' + topic + '.',
        'Step 3: Check your intermediate arithmetic step-by-step before concluding.'
      ],
      simpleExample: 'For example, think of a simpler case: if you have 1/2 of a whole and add 1/4, you express both in fourths (2/4 + 1/4 = 3/4) rather than adding straight across.',
      relatedPracticeQuestion: {
        question: `Try this related quick-check: What is the main relationship governing ${topic}?`,
        hint: 'Review Step 2 from the solution above!'
      }
    };

    await recordGeneratedContent({
      requestId,
      contentType: 'answer_explanation',
      generatedContent: fallbackData
    });
    await completeAIRequest({ requestId, status: 'COMPLETED' });

    return {
      success: true,
      source: 'offline_fallback',
      requestId,
      explanation: fallbackData
    };
  }

  const prompt = `You are AdaptIQ AI Tutor, an empathetic and supportive tutor helping a Grade ${cleanGrade} student understand a problem they answered incorrectly.

Question:
"${questionText}"

${options.length > 0 ? `Options: ${JSON.stringify(options)}` : ''}
Student's Answer: "${studentAnswer}"
${correctAnswer ? `Authoritative Correct Answer: "${correctAnswer}"` : ''}
Subject: ${subject}
Topic: ${topic}
Academic Level: Grade ${cleanGrade}

Generate an encouraging, step-by-step breakdown tailored to a Grade ${cleanGrade} learner.
Return JSON with this exact structure:
{
  "correctAnswer": "${correctAnswer || 'Correct Answer'}",
  "explanation": "Clear, friendly explanation of the underlying concept...",
  "whyIncorrect": "Empathetic explanation of WHY the student's selected answer is incorrect, highlighting the exact misconception...",
  "stepByStepSolution": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "simpleExample": "A relatable, real-world analogy or simplified numerical example...",
  "relatedPracticeQuestion": {
    "question": "A follow-up practice question for the student to try...",
    "hint": "Gentle nudge or hint..."
  }
}`;

  try {
    const aiResult = await generateStructuredContent({
      prompt,
      systemInstruction: 'You are an educational tutor explaining concepts clearly and patiently. Respond only in valid JSON.',
      temperature: 0.3,
      maxTokens: 2048
    });

    const validation = validateAnswerExplanation(aiResult.data);
    const explanationData = validation.isValid ? validation.data : {
      correctAnswer: correctAnswer || 'Correct answer',
      explanation: 'Conceptual explanation of the problem.',
      whyIncorrect: 'The selected answer does not satisfy the problem constraints.',
      stepByStepSolution: ['Analyze problem statement', 'Apply core formula', 'Verify solution'],
      simpleExample: 'Consider smaller values to build intuition.',
      relatedPracticeQuestion: { question: 'Try applying this principle to a similar problem.' }
    };

    const contentId = await recordGeneratedContent({
      requestId,
      contentType: 'answer_explanation',
      generatedContent: explanationData,
      validationStatus: validation.isValid ? 'VALID' : 'PARTIAL'
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
      featureType: 'ANSWER_EXPLANATION',
      requestReference: requestId
    });

    await completeAIRequest({ requestId, status: 'COMPLETED' });

    return {
      success: true,
      source: 'gemini_api',
      requestId,
      contentId,
      explanation: explanationData,
      usage: aiResult.usage
    };
  } catch (err) {
    console.error('[Answer Explainer Error]', err.message);
    await completeAIRequest({ requestId, status: 'FAILED', metadata: { error: err.message } });

    // Fallback heuristic
    return {
      success: true,
      source: 'offline_fallback_on_error',
      requestId,
      explanation: {
        correctAnswer: correctAnswer || 'Correct answer',
        explanation: `In ${subject} (${topic}), mastering this concept requires identifying the key parameters and applying the primary relationship carefully.`,
        whyIncorrect: `Your answer ("${studentAnswer}") is a very common distractor choice! Review the step-by-step breakdown to see where the misunderstanding occurred.`,
        stepByStepSolution: [
          'Step 1: Identify given quantities and units.',
          'Step 2: Apply the governing principle for ' + topic + '.',
          'Step 3: Double check your arithmetic and boundary conditions.'
        ],
        simpleExample: 'Consider breaking down complex multi-step fractions into simpler unit fractions first.',
        relatedPracticeQuestion: {
          question: `What fundamental law or formula connects the parameters in ${topic}?`,
          hint: 'Think about the core rule learned in class.'
        }
      }
    };
  }
}

module.exports = {
  explainAnswer
};

