/**
 * OmniRoute AI Infrastructure, Intent Classifier, and Curriculum Ingestion QA Suite
 * Asian Public School Demonstration Edition
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');

const { omniRouteProvider } = require('../services/ai/providers/omniRouteProvider');
const { tokenUsageService } = require('../services/ai/tokenUsageService');
const { classifyIntent, CATEGORIES, DETAILED_INTENTS } = require('../services/ai/gateway/intentClassifier');
const { buildTutorSystemPrompt } = require('../services/ai/services/tutoringService');
const { curriculumIngestionService } = require('../services/curriculumIngestionService');
const { modelRegistry } = require('../services/ai/gateway/modelRegistry');

describe('OmniRoute & Adaptive Intelligence QA Suite', () => {

  describe('1. Intent Classifier & Greeting Fix (Phase 3)', () => {
    it('Classifies casual greetings as GREETING regardless of tutorMode', () => {
      const g1 = classifyIntent('Hi', { tutorMode: 'socratic', topic: 'Fractions' });
      assert.strictEqual(g1.category, CATEGORIES.SIMPLE);
      assert.strictEqual(g1.detailedIntent, DETAILED_INTENTS.GREETING);
      assert.strictEqual(g1.intent, DETAILED_INTENTS.GREETING);

      const g2 = classifyIntent('Hello there!', { tutorMode: 'explain', topic: 'Photosynthesis' });
      assert.strictEqual(g2.detailedIntent, DETAILED_INTENTS.GREETING);

      const g3 = classifyIntent('Hey tutor', { tutorMode: 'socratic' });
      assert.strictEqual(g3.detailedIntent, DETAILED_INTENTS.GREETING);

      const g4 = classifyIntent('good morning', { tutorMode: 'socratic' });
      assert.strictEqual(g4.detailedIntent, DETAILED_INTENTS.GREETING);
    });

    it('Greeting does not trigger an unprompted lecture in Socratic prompt', () => {
      const prompt = buildTutorSystemPrompt({
        mode: 'socratic',
        subject: 'Mathematics',
        topic: 'Fractions',
        intent: 'GREETING'
      });
      assert.ok(prompt.includes('The student said a greeting'));
      assert.ok(prompt.includes('DO NOT launch into an unsolicited lecture'));
    });

    it('Accurately classifies formula and hint requests', () => {
      const f1 = classifyIntent('What is the formula for area of a triangle?', { subject: 'Math' });
      assert.strictEqual(f1.detailedIntent, DETAILED_INTENTS.FORMULA_REQUEST);

      const h1 = classifyIntent('Can you give me a small hint for this problem?', { subject: 'Math' });
      assert.strictEqual(h1.detailedIntent, DETAILED_INTENTS.HINT_REQUEST);
    });

    it('Accurately classifies analogies and practice requests', () => {
      const a1 = classifyIntent('Explain photosynthesis with a simple real life analogy', { subject: 'Science' });
      assert.strictEqual(a1.detailedIntent, DETAILED_INTENTS.ANALOGY_REQUEST);

      const p1 = classifyIntent('Give me a practice problem on fractions', { subject: 'Math' });
      assert.strictEqual(p1.detailedIntent, DETAILED_INTENTS.PRACTICE_REQUEST);
    });

    it('Classifies mathematical and scientific questions', () => {
      const m1 = classifyIntent('Solve for x: 3x + 12 = 36', { subject: 'Math' });
      assert.strictEqual(m1.detailedIntent, DETAILED_INTENTS.MATHEMATICAL_QUESTION);

      const s1 = classifyIntent('What happens during the light reaction in chloroplasts?', { subject: 'Science' });
      assert.strictEqual(s1.detailedIntent, DETAILED_INTENTS.SCIENCE_QUESTION);
    });
  });

  describe('2. OmniRoute AI Provider & Model Registry (Phase 2)', () => {
    it('OmniRoute provider conforms to BaseAIProvider interface', () => {
      assert.strictEqual(omniRouteProvider.name, 'omni');
      assert.strictEqual(typeof omniRouteProvider.generate, 'function');
      assert.strictEqual(typeof omniRouteProvider.generateStream, 'function');
      assert.strictEqual(typeof omniRouteProvider.generateEmbeddings, 'function');
      assert.strictEqual(typeof omniRouteProvider.transcribeAudio, 'function');
      assert.strictEqual(typeof omniRouteProvider.generateSpeech, 'function');
    });

    it('Model Registry registers OmniRoute models alongside Gemini', () => {
      const allModels = modelRegistry.listModels(false);
      const omniModels = allModels.filter(m => m.provider === 'omni');
      assert.ok(omniModels.length > 0);
      assert.ok(omniModels.some(m => m.id === 'omni-auto'));
      assert.ok(omniModels.some(m => m.id === 'omni-reasoning-r1'));
    });
  });

  describe('3. Token Usage & Budget Monitoring Service (Phase 2 & 10)', () => {
    it('Estimates tokens accurately based on character count heuristics', () => {
      const sample = 'Calculate the greatest common factor of 15 and 45.';
      const count = tokenUsageService.estimateTokens(sample);
      assert.ok(count > 5);
      assert.ok(count < 30);
    });

    it('Records usage and updates dashboard KPIs', () => {
      const initialMetrics = tokenUsageService.getDashboardMetrics();
      const initialTokens = initialMetrics.summary.totalTokensUsed;

      tokenUsageService.recordUsage({
        userId: 'student-test-01',
        model: 'omni-auto',
        provider: 'omni',
        feature: 'ai_tutor_chat',
        inputTokens: 120,
        outputTokens: 80
      });

      const updatedMetrics = tokenUsageService.getDashboardMetrics();
      assert.strictEqual(updatedMetrics.summary.totalTokensUsed, initialTokens + 200);
      assert.ok(updatedMetrics.summary.totalCostUsd >= initialMetrics.summary.totalCostUsd);
      assert.ok(updatedMetrics.perFeature.ai_tutor_chat !== undefined);
    });

    it('Checks budget limits and enforces safety thresholds', () => {
      const budget = tokenUsageService.checkBudget();
      assert.strictEqual(budget.allowed, true);
      assert.strictEqual(typeof budget.pctUsed, 'number');
    });
  });

  describe('4. Curriculum Ingestion Pipeline (Phase 1)', () => {
    it('Ingests raw curriculum text and parses into chapters, topics, and LOs', async () => {
      const rawText = `
        Chapter 1: Integers and Rational Numbers
        - Properties of Integer Addition: Closure, Commutative, Associative.
        - Multiplication and Division: Sign rules and distributive property.
        Learning Objectives: Apply commutative property; solve integers multi-step equations.

        Chapter 2: Fractions and Decimals
        - Unlike Fractions: Finding LCM and common denominators.
        - Decimal Arithmetic: Division of decimals by integers.
        Learning Objectives: Evaluate operations on fractions; reduce to simplest form.
      `;

      const result = await curriculumIngestionService.ingestDocument({
        schoolId: 'GPS-2026',
        documentName: 'Greenwood Public School Class VII Math Syllabus',
        gradeLevel: 7,
        subject: 'Mathematics',
        academicYear: '2026-2027',
        rawText,
        sourceUrl: 'https://www.greenwoodgurgaon.com'
      });

      assert.strictEqual(result.success, true);
      assert.ok(result.batch !== undefined);
      assert.strictEqual(result.batch.extractedContent.chapters.length, 2);
      assert.ok(result.batch.extractedContent.chapters[0].title.includes('Integers'));
      assert.ok(result.batch.extractedContent.chapters[0].topics.length > 0);
      assert.strictEqual(result.batch.status, 'REVIEW_PENDING');
    });

    it('Reviews and publishes ingestion batch into the question bank', async () => {
      const batches = curriculumIngestionService.listBatches();
      assert.ok(batches.length > 0);

      const latestBatch = batches[0];
      const reviewResult = await curriculumIngestionService.reviewBatch(latestBatch.id, {
        reviewerId: 'teacher-ananya',
        notes: 'Verified against Class 7 CBSE blueprint.'
      });
      assert.strictEqual(reviewResult.success, true);
      assert.strictEqual(reviewResult.batch.status, 'APPROVED');

      const publishResult = await curriculumIngestionService.publishBatchToQuestionBank(latestBatch.id);
      assert.strictEqual(publishResult.success, true);
      assert.strictEqual(publishResult.batch.status, 'PUBLISHED');
      assert.ok(publishResult.publishedCount > 0);
    });
  });
});
