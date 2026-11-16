/**
 * Master AI Gateway
 * Central orchestrator connecting Model Registry, Intent Router, Fallback Engine,
 * Socratic Tutoring prompts, Conversation Memory, and SSE Streaming.
 */

const { modelRegistry } = require('./modelRegistry');
const { modelRouter } = require('./modelRouter');
const { fallbackManager } = require('./fallbackManager');
const { providerHealth } = require('./providerHealth');
const { buildTutorSystemPrompt, TUTOR_MODES } = require('../services/tutoringService');
const { conversationService } = require('../services/conversationService');
const { createSSESession } = require('../streaming/sseHandler');
const { recordAIRequest, recordAIUsage } = require('../../gemini/aiStorageService');
const { tokenUsageService } = require('../tokenUsageService');
const QuizAttempt = require('../../../models/QuizAttempt');

class AIGateway {
  /**
   * Checks if student is in an active test mode session
   * @param {string} userId 
   */
  async isStudentInTestMode(userId) {
    try {
      if (!userId) return false;
      const recentTest = await QuizAttempt.findOne({
        studentId: userId,
        quizType: 'post_test',
        createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
      });
      return Boolean(recentTest);
    } catch (e) {
      return false;
    }
  }

  /**
   * Real-time SSE streaming conversational chat
   */
  async streamChat({
    req,
    res,
    userId,
    conversationId = null,
    message,
    subject = 'Science & Mathematics',
    topic = 'General',
    tutorMode = TUTOR_MODES.EXPLAIN,
    mode = 'auto',
    requestedModel = null,
    studentContext = null,
    isTestMode = false
  }) {
    const sseSession = createSSESession(req, res);

    try {
      // 1. Academic Integrity Test Mode Guard
      const activeTest = isTestMode || (await this.isStudentInTestMode(userId));
      if (activeTest) {
        sseSession.sendChunk('AI Tutor is disabled during Test Mode to uphold academic integrity. Complete your test first, then review concepts together!');
        sseSession.sendDone({ isTestBlocked: true });
        return;
      }

      // 2. Validate input
      const cleanMessage = String(message || '').trim().slice(0, 1500);
      if (!cleanMessage) {
        sseSession.sendError(new Error('Message content is required'), 'BAD_REQUEST');
        return;
      }

      // 3. Ensure Conversation exists
      let convId = conversationId;
      if (!convId) {
        const titleSnippet = cleanMessage.length > 30 ? cleanMessage.slice(0, 30) + '...' : cleanMessage;
        const newConv = await conversationService.createConversation({
          userId,
          title: titleSnippet,
          subject,
          topic,
          tutorMode
        });
        convId = newConv.id;
      }

      // 4. Save user message
      await conversationService.addMessage({
        conversationId: convId,
        userId,
        role: 'user',
        content: cleanMessage
      });

      // 5. Fetch sliding context window
      const historyTurns = await conversationService.getContextWindow(convId, userId, {
        maxTurns: 8,
        maxTokens: 3500
      });

      // 6. Route Model
      const routingDecision = modelRouter.route({
        mode,
        requestedModel,
        message: cleanMessage,
        topic,
        subject,
        tutorMode,
        historyLength: historyTurns.length
      });

      // Send routing metadata event to frontend immediately
      sseSession.sendMetadata({
        type: 'routing_decision',
        conversationId: convId,
        routingMode: routingDecision.mode,
        selectedModel: routingDecision.selectedModel,
        provider: routingDecision.provider,
        intentCategory: routingDecision.intentCategory,
        reason: routingDecision.reason
      });

      // 7. Build subject-aware system prompt
      const systemInstruction = buildTutorSystemPrompt({
        mode: tutorMode,
        subject,
        topic,
        studentContext,
        intent: routingDecision.detailedIntent || routingDecision.intentCategory
      });

      // 8. Execute streaming with fallback
      let fullStreamedText = '';
      let activeMetadata = null;

      const fallbackResult = await fallbackManager.executeWithFallback({
        initialModel: routingDecision.selectedModel,
        fallbackCandidates: routingDecision.fallbackCandidates,
        signal: sseSession.signal,
        executor: async ({ model, provider, isFallback }) => {
          if (isFallback) {
            sseSession.sendMetadata({
              type: 'fallback_activated',
              activeModel: model,
              provider: provider.name
            });
          }

          return await provider.generateStream({
            model,
            messages: historyTurns,
            prompt: cleanMessage,
            systemInstruction,
            signal: sseSession.signal,
            onChunk: (chunk) => {
              fullStreamedText += chunk;
              sseSession.sendChunk(chunk);
            },
            onMetadata: (meta) => {
              activeMetadata = meta;
            }
          });
        }
      });

      // 9. Persist assistant response
      await conversationService.addMessage({
        conversationId: convId,
        userId,
        role: 'assistant',
        content: fullStreamedText,
        modelProvider: fallbackResult.actualProvider,
        modelName: fallbackResult.actualModel,
        tokenUsage: activeMetadata?.usage || null
      });

      // 10. Record telemetry (fire & forget to avoid slowing user down)
      const inputToks = activeMetadata?.usage?.inputTokens || tokenUsageService.estimateTokens(cleanMessage);
      const outputToks = activeMetadata?.usage?.outputTokens || tokenUsageService.estimateTokens(fullStreamedText);
      tokenUsageService.recordUsage({
        userId,
        model: fallbackResult.actualModel,
        provider: fallbackResult.actualProvider,
        feature: 'ai_tutor_chat',
        inputTokens: inputToks,
        outputTokens: outputToks
      });

      recordAIRequest({
        userId,
        featureType: 'ai_tutor_chat',
        modelName: fallbackResult.actualModel,
        status: 'COMPLETED'
      }).then(aiReq => {
        if (aiReq?.id) {
          recordAIUsage({
            userId,
            requestId: aiReq.id,
            modelName: fallbackResult.actualModel,
            inputTokens: inputToks,
            outputTokens: outputToks,
            estimatedCost: activeMetadata?.usage?.estimatedCost || 0
          }).catch(() => {});
        }
      }).catch(() => {});

      // 11. Send completion metadata & close stream
      sseSession.sendMetadata({
        type: 'response_complete',
        conversationId: convId,
        actualModel: fallbackResult.actualModel,
        actualProvider: fallbackResult.actualProvider,
        fallbackActivated: fallbackResult.fallbackActivated,
        usage: activeMetadata?.usage || null
      });

      sseSession.sendDone({
        conversationId: convId,
        actualModel: fallbackResult.actualModel
      });

    } catch (err) {
      if (err.message === 'REQUEST_CANCELLED') {
        sseSession.sendError(new Error('Generation cancelled by user.'), 'REQUEST_CANCELLED');
      } else {
        console.error('[AI Gateway] Chat stream error:', err.message);
        sseSession.sendError(err, err.code || 'INTERNAL_ERROR');
      }
    }
  }

  /**
   * Unary non-streaming conversational chat
   */
  async chat({
    userId,
    conversationId = null,
    message,
    subject = 'Science & Mathematics',
    topic = 'General',
    tutorMode = TUTOR_MODES.EXPLAIN,
    mode = 'auto',
    requestedModel = null,
    studentContext = null,
    isTestMode = false
  }) {
    // 1. Test Mode Guard
    const activeTest = isTestMode || (await this.isStudentInTestMode(userId));
    if (activeTest) {
      return {
        text: 'AI Tutor is disabled during Test Mode to uphold academic integrity.',
        isTestBlocked: true
      };
    }

    const cleanMessage = String(message || '').trim().slice(0, 1500);
    if (!cleanMessage) throw new Error('Message content is required');

    let convId = conversationId;
    if (!convId) {
      const titleSnippet = cleanMessage.length > 30 ? cleanMessage.slice(0, 30) + '...' : cleanMessage;
      const newConv = await conversationService.createConversation({
        userId,
        title: titleSnippet,
        subject,
        topic,
        tutorMode
      });
      convId = newConv.id;
    }

    await conversationService.addMessage({
      conversationId: convId,
      userId,
      role: 'user',
      content: cleanMessage
    });

    const historyTurns = await conversationService.getContextWindow(convId, userId);

    const routingDecision = modelRouter.route({
      mode,
      requestedModel,
      message: cleanMessage,
      topic,
      subject,
      tutorMode,
      historyLength: historyTurns.length
    });

    const systemInstruction = buildTutorSystemPrompt({
      mode: tutorMode,
      subject,
      topic,
      studentContext,
      intent: routingDecision.detailedIntent || routingDecision.intentCategory
    });

    const fallbackResult = await fallbackManager.executeWithFallback({
      initialModel: routingDecision.selectedModel,
      fallbackCandidates: routingDecision.fallbackCandidates,
      executor: async ({ model, provider }) => {
        return await provider.generate({
          model,
          messages: historyTurns,
          prompt: cleanMessage,
          systemInstruction
        });
      }
    });

    const inToks = fallbackResult.usage?.inputTokens || tokenUsageService.estimateTokens(cleanMessage);
    const outToks = fallbackResult.usage?.outputTokens || tokenUsageService.estimateTokens(fallbackResult.text || '');
    tokenUsageService.recordUsage({
      userId,
      model: fallbackResult.actualModel,
      provider: fallbackResult.actualProvider,
      feature: 'ai_tutor_chat',
      inputTokens: inToks,
      outputTokens: outToks
    });

    await conversationService.addMessage({
      conversationId: convId,
      userId,
      role: 'assistant',
      content: fallbackResult.text,
      modelProvider: fallbackResult.actualProvider,
      modelName: fallbackResult.actualModel,
      tokenUsage: fallbackResult.usage || null
    });

    return {
      text: fallbackResult.text,
      conversationId: convId,
      actualModel: fallbackResult.actualModel,
      actualProvider: fallbackResult.actualProvider,
      fallbackActivated: fallbackResult.fallbackActivated,
      routingMode: routingDecision.mode,
      usage: fallbackResult.usage
    };
  }

  /**
   * Centralized structured content generation with model routing & fallback
   */
  async generateStructured({
    userId = null,
    featureType = 'general_content',
    prompt,
    systemInstruction = null,
    schema = null,
    requestedModel = null,
    mode = 'auto',
    temperature = 0.4,
    signal = null
  }) {
    const routingDecision = modelRouter.route({
      mode,
      requestedModel,
      message: prompt,
      requiresStructuredOutput: true
    });

    const fallbackResult = await fallbackManager.executeWithFallback({
      initialModel: routingDecision.selectedModel,
      fallbackCandidates: routingDecision.fallbackCandidates,
      signal,
      executor: async ({ model, provider }) => {
        return await provider.generate({
          model,
          prompt,
          systemInstruction,
          schema,
          temperature,
          signal
        });
      }
    });

    const structInToks = fallbackResult.usage?.inputTokens || tokenUsageService.estimateTokens(prompt);
    const structOutToks = fallbackResult.usage?.outputTokens || tokenUsageService.estimateTokens(fallbackResult.text || JSON.stringify(fallbackResult.data || ''));
    tokenUsageService.recordUsage({
      userId,
      model: fallbackResult.actualModel,
      provider: fallbackResult.actualProvider,
      feature: featureType || 'structured_content',
      inputTokens: structInToks,
      outputTokens: structOutToks
    });

    return {
      text: fallbackResult.text,
      data: fallbackResult.data,
      actualModel: fallbackResult.actualModel,
      actualProvider: fallbackResult.actualProvider,
      fallbackActivated: fallbackResult.fallbackActivated,
      routingMode: routingDecision.mode,
      usage: fallbackResult.usage
    };
  }

  /**
   * Retrieves token usage and budget analytics dashboard
   */
  getTokenUsageDashboard() {
    return tokenUsageService.getDashboardMetrics();
  }

  /**
   * Retrieves list of all configured and available models
   */
  listModels() {
    return modelRegistry.listModels(false);
  }

  /**
   * Retrieves live provider health metrics
   */
  getHealth() {
    return providerHealth.getMetrics();
  }
}

const aiGateway = new AIGateway();

module.exports = {
  AIGateway,
  aiGateway
};
