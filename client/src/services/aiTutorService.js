// AdaptIQ Socratic AI Tutor Service
// Routes via secure server-side proxy POST /api/chat with persisted MongoDB chat history
// (Keys are kept strictly confidential on the server)
import api from './api';

// Math & Science Specialized Socratic Heuristics Knowledge Base for fallback
const KNOWLEDGE_BASE = {
  fractions: {
    addition: (problem) => `To add fractions (like in "${problem || 'a/b + c/d'}"):
1. Check Denominators: Are they identical? If not, find the Least Common Denominator (LCD).
2. Scale Numerators: Multiply top and bottom of each fraction by the factor that produces the LCD.
3. Add Only Numerators: Keep the denominator the same since it represents the size of each slice!
4. Simplify: Reduce the fraction to lowest terms.
💡 Tip: For 1/3 + 1/6: convert 1/3 to 2/6, then 2/6 + 1/6 = 3/6 = 1/2. What problem are you working on?`,

    division: (problem) => `For fraction division (like "${problem || 'a/b ÷ c/d'}"):
Remember Keep-Change-Flip (Reciprocal):
1. KEEP the first fraction as-is.
2. CHANGE the division sign (÷) into multiplication (×).
3. FLIP the second fraction upside down (c/d becomes d/c).
4. Multiply across: Numerators together, denominators together!
🍕 Intuition: 3 ÷ (1/2) is asking "how many half-pizzas fit in 3 whole pizzas?" Answer: 6!`,

    multiplication: (problem) => `Multiplying fractions is straightforward:
1. Multiply numerators across: top × top.
2. Multiply denominators across: bottom × bottom.
3. Simplify the resulting fraction.
Example: (2/3) × (3/4) = 6/12 = 1/2.`
  },

  algebra: {
    equations: (problem) => `In algebraic equations (like "${problem || 'ax + b = c'}"):
Think of an equation like a balanced see-saw:
1. Goal: Isolate the unknown variable on one side.
2. Inverse Operations: Undo addition with subtraction; undo multiplication with division.
3. Golden Rule: Whatever you do to one side of the equal sign, you MUST do to the other side!
Example: For 2x + 4 = 12:
- Subtract 4 from both sides: 2x = 8
- Divide both sides by 2: x = 4.
What equation are you working on right now?`
  },

  photosynthesis: {
    process: () => `Photosynthesis is nature's solar power factory!
Core breakdown:
1. Equation: 6CO₂ (Carbon Dioxide) + 6H₂O (Water) + Sunlight → C₆H₁₂O₆ (Glucose) + 6O₂ (Oxygen).
2. Light Reactions: Chlorophyll captures sunlight and splits water molecules, producing oxygen.
3. Calvin Cycle: Carbon dioxide is synthesized into energy-rich glucose sugar.
💡 Common trap: Plants also perform cellular respiration day and night!`
  }
};

export const getOfflineSocraticResponse = (message, context = {}) => {
  const query = (message || "").toLowerCase();
  const topic = (context.topic || "").toLowerCase();

  if (query.includes('fraction') || topic.includes('fraction')) {
    if (query.includes('divide') || query.includes('division') || query.includes('÷')) {
      return KNOWLEDGE_BASE.fractions.division(context.problem);
    }
    if (query.includes('multiply') || query.includes('multiplication') || query.includes('times')) {
      return KNOWLEDGE_BASE.fractions.multiplication(context.problem);
    }
    return KNOWLEDGE_BASE.fractions.addition(context.problem);
  }

  if (query.includes('algebra') || query.includes('equation') || query.includes('solve for x') || topic.includes('algebra')) {
    return KNOWLEDGE_BASE.algebra.equations(context.problem);
  }

  if (query.includes('photo') || query.includes('plant') || query.includes('leaf') || topic.includes('photosynthesis')) {
    return KNOWLEDGE_BASE.photosynthesis.process();
  }

  return `That's an insightful question about ${context.subject || 'STEM'} (${context.topic || 'General Concepts'})! 💡\n\nTo help you reason through it:\n1. What is the fundamental property or formula at play here?\n2. What variables or clues are given in the problem statement?\n\nTell me what you think the first step should be, and we'll solve it together!`;
};

/**
 * Ask AI Tutor via secure server proxy
 */
export const askAITutor = async (arg1, arg2 = {}, arg3 = [], arg4 = false) => {
  let message, context, chatHistory, isTestMode;
  if (typeof arg1 === 'object' && arg1 !== null && arg1.message !== undefined) {
    message = arg1.message;
    context = arg1.context || {};
    chatHistory = arg1.chatHistory || [];
    isTestMode = arg1.isTestMode || false;
  } else {
    message = arg1;
    context = arg2;
    chatHistory = arg3;
    isTestMode = arg4;
  }

  if (isTestMode) {
    return {
      text: "AI Tutor is disabled during Test Mode to preserve academic integrity. Complete your test first, then review solutions together!",
      source: "policy_guard",
      isTestBlocked: true
    };
  }

  try {
    const res = await api.post('/chat', {
      message,
      topic: context.topic || 'General',
      subject: context.subject || 'Science & Mathematics',
      isTestMode
    });

    if (res.data && res.data.reply) {
      return {
        text: res.data.reply.content,
        source: "server_proxy",
        userMessage: res.data.userMessage,
        reply: res.data.reply
      };
    }

    return {
      text: getOfflineSocraticResponse(message, context),
      source: "offline_socratic_engine"
    };
  } catch (error) {
    if (error.response && error.response.status === 403) {
      return {
        text: error.response.data.message || "AI Tutor is disabled during Test Mode.",
        source: "policy_guard",
        isTestBlocked: true
      };
    }

    console.warn("Backend chat proxy error, using local Socratic engine:", error);
    return {
      text: getOfflineSocraticResponse(message, context),
      source: "offline_socratic_engine"
    };
  }
};

/**
 * Fetch persisted chat history from server
 */
export const getChatHistory = async () => {
  try {
    const res = await api.get('/chat/history');
    return res.data;
  } catch (e) {
    return { success: false, messages: [] };
  }
};

/**
 * Clear chat history
 */
export const clearChatHistory = async () => {
  try {
    const res = await api.delete('/chat/history');
    return res.data;
  } catch (e) {
    return { success: false };
  }
};
