const ChatMessage = require('../models/ChatMessage');
const QuizAttempt = require('../models/QuizAttempt');
const keys = require('../config/keys');

const SOCRATIC_SYSTEM_PROMPT = `You are AdaptIQ AI Tutor, an empathetic, highly encouraging, and pedagogically sound academic tutor aligned with UN Sustainable Development Goal 4 (Quality Education).
Your core tutoring rules:
1. Socratic Guidance: Never blurt out the direct multiple-choice answer or letter choice (e.g. 'Option B') directly. Ask probing questions, offer intuitive real-world analogies, and guide the student step-by-step.
2. Tone: Warm, patient, curious, and supportive. Use clear formatting (markdown, bullet points, math equations where helpful).
3. Brevity & Clarity: Keep explanations digestible. Avoid overwhelming the student with wall-of-text responses.
4. Adaptability: Adjust your tone and complexity according to the student's questions and feedback.`;

// Local Socratic heuristic fallback when AI API Key is not configured
const generateFallbackResponse = (message, topic = 'General', subject = 'Science & Mathematics') => {
  const lower = message.toLowerCase();
  
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return `Hello! 👋 I'm your AdaptIQ AI Tutor. I'm here to help you explore concepts in ${subject}${topic !== 'General' ? ` and ${topic}` : ''}. What concept or problem would you like to work through together?`;
  }
  
  if (lower.includes('what is') || lower.includes('explain') || lower.includes('define')) {
    return `That's a great concept to explore! 💡\n\nTo break down **${message.replace(/(what is|explain|define)/i, '').trim() || topic}**, let's start with the core intuition:\n- What comes to your mind when you first think about this term?\n- Have you seen this in action before, or is there a specific formula/step you're tackling right now?\n\nTell me what you think first, and we'll build the understanding together!`;
  }

  if (lower.includes('formula') || lower.includes('equation') || lower.includes('solve')) {
    return `Let's tackle this step by step! 📐\n\n1. First, what variables or values are given in the problem?\n2. What are we trying to find or solve for?\n3. Which fundamental relationship or equation links what you know to what you need?\n\nShare the specific values or equation you're looking at, and let's work through the first step!`;
  }

  return `Great question! In ${subject} (${topic}), mastering this idea comes down to understanding the foundational principles.\n\nLet's unpack this together: What part of this problem or concept feels most confusing right now? Share your initial thoughts or attempt, and I'll guide you through the next step! 🚀`;
};

// @desc Send message to AI Tutor and receive Socratic response
// @route POST /api/chat
const sendMessage = async (req, res, next) => {
  try {
    const { message, topic = 'General', subject = 'Science & Mathematics', isTestMode = false } = req.body;

    // Server-Authoritative Integrity Lock (Phase 7.1)
    // Check if student has an active post-test attempt created within the last 60 minutes
    const activeTest = await QuizAttempt.findOne({
      studentId: req.user._id,
      quizType: 'post_test',
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
    });

    if (isTestMode || activeTest) {
      return res.status(403).json({
        success: false,
        message: 'AI Tutor is disabled during Test Mode to uphold academic integrity.'
      });
    }

    if (!message || !String(message).trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    const cleanContent = String(message).trim().slice(0, 1000); // Bounded length prevention

    const userId = req.user._id;

    // Persist user's message
    const userMsg = await ChatMessage.create({
      userId,
      role: 'user',
      content: cleanContent,
      contextTopic: topic,
      contextSubject: subject,
      timestamp: new Date()
    });

    let aiReplyText = '';

    // If AI_API_KEY is configured, call Gemini API
    if (keys.AI_API_KEY && keys.AI_API_KEY.trim()) {
      try {
        const recentMessages = await ChatMessage.find({ userId })
          .sort({ timestamp: -1 })
          .limit(8)
          .lean();
        
        recentMessages.reverse();

        const contents = [
          {
            role: 'user',
            parts: [{ text: `${SOCRATIC_SYSTEM_PROMPT}\nCurrent Subject: ${subject}, Topic: ${topic}` }]
          },
          {
            role: 'model',
            parts: [{ text: 'Understood. I am AdaptIQ AI Tutor. I will guide the student Socratically, encouraging conceptual understanding step-by-step.' }]
          }
        ];

        recentMessages.forEach(m => {
          contents.push({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          });
        });

        // Add latest if not already in recentMessages
        if (!recentMessages.some(m => m._id.toString() === userMsg._id.toString())) {
          contents.push({
            role: 'user',
            parts: [{ text: message.trim() }]
          });
        }

        const modelName = keys.AI_MODEL || 'gemini-1.5-flash';
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${keys.AI_API_KEY.trim()}`;

        const apiResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800
            }
          })
        });

        if (apiResponse.ok) {
          const data = await apiResponse.json();
          const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidate) {
            aiReplyText = candidate;
          }
        } else {
          const errText = await apiResponse.text();
          console.warn('Gemini API call failed, falling back to Socratic engine:', errText);
        }
      } catch (geminiError) {
        console.warn('Error contacting Gemini API:', geminiError.message);
      }
    }

    // If no API key or API call failed, use intelligent Socratic fallback
    if (!aiReplyText) {
      aiReplyText = generateFallbackResponse(message, topic, subject);
    }

    // Persist assistant message
    const botMsg = await ChatMessage.create({
      userId,
      role: 'assistant',
      content: aiReplyText,
      contextTopic: topic,
      contextSubject: subject,
      timestamp: new Date()
    });

    res.status(200).json({
      success: true,
      userMessage: userMsg,
      reply: botMsg
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get chat history for current logged in user
// @route GET /api/chat/history
const getHistory = async (req, res, next) => {
  try {
    const messages = await ChatMessage.find({ userId: req.user._id })
      .sort({ timestamp: 1 })
      .limit(60)
      .lean();

    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc Clear chat history for user
// @route DELETE /api/chat/history
const clearHistory = async (req, res, next) => {
  try {
    await ChatMessage.deleteMany({ userId: req.user._id });
    res.status(200).json({ success: true, message: 'Chat history cleared successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getHistory,
  clearHistory
};
