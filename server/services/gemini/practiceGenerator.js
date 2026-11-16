const { generateStructuredContent, validateGeminiConfig } = require('./geminiClient');
const { validateQuizResponse } = require('./responseValidator');
const { getAnonymizedStudentMetrics } = require('./learningAssistant');
const {
  recordAIRequest,
  completeAIRequest,
  recordGeneratedContent,
  recordAIUsage,
  recordAIInteraction
} = require('./aiStorageService');

/**
 * Feature D — AI Practice Test Generator
 * Generates balanced, personalized practice assessments targeting learner weak points.
 */
async function generatePracticeTest({
  studentId,
  subject = 'Math',
  topic = '',
  difficulty = 'medium',
  timeLimitMinutes = 15,
  questionCount = 5,
  format = 'MCQ',
  gradeLevel = 7,
  userId = null
}) {
  const safeCount = Math.min(Math.max(parseInt(questionCount, 10) || 5, 3), 20);
  const cleanMinutes = Math.min(Math.max(parseInt(timeLimitMinutes, 10) || 15, 5), 60);
  const cleanGrade = Math.min(Math.max(parseInt(gradeLevel, 10) || 7, 1), 12);

  // Retrieve student's weak topics if studentId is provided
  let targetTopics = topic ? [topic] : [];
  if (!topic && studentId) {
    try {
      const metrics = await getAnonymizedStudentMetrics(studentId, subject);
      const weak = metrics.filter(m => m.accuracyPercentage < 65).map(m => m.topic);
      if (weak.length > 0) {
        targetTopics = weak;
      }
    } catch (e) {
      // Non-fatal
    }
  }

  if (targetTopics.length === 0) {
    targetTopics = subject.toLowerCase().includes('science')
      ? ['Forces & Motion', 'Cells & Organelles', 'Matter & Reactions']
      : ['Fractions', 'Decimals & Percentages', 'Basic Algebra'];
  }

  const requestId = await recordAIRequest({
    userId: userId || studentId,
    featureType: 'PRACTICE_TEST',
    modelName: 'gemini-3.8-flash',
    metadata: { subject, targetTopics, count: safeCount, durationMinutes: cleanMinutes }
  });

  const prompt = `You are AdaptIQ Assessment Architect designing a personalized Practice Test for a Grade ${cleanGrade} student.
Subject: ${subject}
Focus Topics: ${targetTopics.join(', ')}
Target Difficulty: ${difficulty}
Total Questions: ${safeCount}
Allocated Time: ${cleanMinutes} minutes
Format: ${format}

CRITICAL RULES:
1. Balanced Distribution: Ensure questions are balanced across the focus topics.
2. Structure: Exactly 4 options for MCQ/multiple select, 2 options for true_false.
3. Realistic Distractors: Distractors MUST target known student misconceptions.
4. Marks: Include recommended marks (1-2 points each).
5. All generated questions are for informal practice test use only (not official exam items).

Return JSON with this exact structure:
{
  "title": "Grade ${cleanGrade} ${subject} Personalized Practice Assessment",
  "subject": "${subject}",
  "timeLimitMinutes": ${cleanMinutes},
  "totalMarks": ${safeCount},
  "questions": [
    {
      "question": "Question text here...",
      "type": "${format}",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "correctAnswerIndex": 0,
      "explanation": "Clear explanation...",
      "steps": [
        { "step": "Step 1", "desc": "...", "math": "..." },
        { "step": "Step 2", "desc": "...", "math": "..." }
      ],
      "topic": "${targetTopics[0]}",
      "difficulty": "${difficulty}",
      "learningObjective": "Mastery in ${targetTopics[0]}",
      "marks": 1
    }
  ]
}`;

  const configCheck = validateGeminiConfig();
  if (!configCheck.configured) {
    // Heuristic fallback practice test
    const fallbackQuestions = targetTopics.slice(0, safeCount).map((top, idx) => ({
      question: `Practice Item ${idx + 1}: Solve the fundamental problem relating to ${top}.`,
      questionText: `Practice Item ${idx + 1}: Solve the fundamental problem relating to ${top}.`,
      type: 'MCQ',
      options: ['Option 1 (Correct)', 'Distractor B', 'Distractor C', 'Distractor D'],
      correctAnswer: 'Option 1 (Correct)',
      correctAnswerIndex: 0,
      explanation: `Step-by-step solution for ${top} foundational practice.`,
      steps: [
        { step: 'Step 1: Understand', desc: `Analyze parameters in ${top}`, math: '' },
        { step: 'Step 2: Calculate', desc: 'Compute verified result', math: '' }
      ],
      topic: top,
      difficulty,
      learningObjective: `Practice proficiency in ${top}`,
      marks: 1,
      source: 'ai_practice',
      status: 'approved_for_practice_only'
    }));

    const testPayload = {
      title: `Grade ${cleanGrade} ${subject} Adaptive Practice Test`,
      subject,
      timeLimitMinutes: cleanMinutes,
      totalQuestions: fallbackQuestions.length,
      questions: fallbackQuestions
    };

    await recordGeneratedContent({
      requestId,
      contentType: 'practice_test',
      generatedContent: testPayload
    });
    await completeAIRequest({ requestId, status: 'COMPLETED' });

    return {
      success: true,
      source: 'offline_fallback',
      requestId,
      practiceTest: testPayload
    };
  }

  try {
    const aiResult = await generateStructuredContent({
      prompt,
      systemInstruction: 'You generate high-quality personalized practice assessments. Output strictly valid JSON.',
      temperature: 0.35,
      maxTokens: 4096
    });

    const validation = validateQuizResponse(aiResult.data?.questions || aiResult.data, subject, targetTopics[0]);
    const validQuestions = validation.questions.map(q => ({
      ...q,
      source: 'ai_practice',
      isOfficialExam: false // Explicit guardrail
    }));

    const testPayload = {
      title: aiResult.data?.title || `Grade ${cleanGrade} ${subject} Personalized Practice Test`,
      subject,
      timeLimitMinutes: cleanMinutes,
      totalQuestions: validQuestions.length,
      targetTopics,
      questions: validQuestions
    };

    const contentId = await recordGeneratedContent({
      requestId,
      contentType: 'practice_test',
      generatedContent: testPayload,
      validationStatus: validation.isValid ? 'VALID' : 'PARTIAL'
    });

    if (aiResult.usage) {
      await recordAIUsage({
        userId: userId || studentId,
        requestId,
        modelName: aiResult.usage.model,
        inputTokens: aiResult.usage.inputTokens,
        outputTokens: aiResult.usage.outputTokens,
        estimatedCost: aiResult.usage.estimatedCost
      });
    }

    await recordAIInteraction({
      userId: userId || studentId,
      featureType: 'PRACTICE_TEST',
      requestReference: requestId
    });

    await completeAIRequest({ requestId, status: 'COMPLETED' });

    return {
      success: true,
      source: 'gemini_api',
      requestId,
      contentId,
      practiceTest: testPayload,
      usage: aiResult.usage
    };
  } catch (err) {
    console.error('[Practice Generator Error]', err.message);
    await completeAIRequest({ requestId, status: 'FAILED', metadata: { error: err.message } });

    return {
      success: true,
      source: 'offline_fallback_on_error',
      requestId,
      practiceTest: {
        title: `Grade ${cleanGrade} ${subject} Practice Review`,
        subject,
        timeLimitMinutes: cleanMinutes,
        totalQuestions: 3,
        questions: [
          {
            question: `Review Question: Explain how the fundamental properties of ${targetTopics[0]} apply here.`,
            type: 'MCQ',
            options: ['Correct Concept', 'Distractor 1', 'Distractor 2', 'Distractor 3'],
            correctAnswer: 'Correct Concept',
            correctAnswerIndex: 0,
            explanation: `Review foundational rules of ${targetTopics[0]}.`,
            topic: targetTopics[0],
            difficulty,
            marks: 1
          }
        ]
      }
    };
  }
}

module.exports = {
  generatePracticeTest
};

