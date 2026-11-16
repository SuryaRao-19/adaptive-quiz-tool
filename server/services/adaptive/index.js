/**
 * AdaptIQ 3.0 — Central Deterministic Rule-Based Adaptive Learning Engine
 * server/services/adaptive/index.js
 * 
 * Bundles:
 * 1. adaptiveEngine (BKT, Rasch IRT, Hake gain, 3-up/2-down rule, pedagogical decision log)
 * 2. questionSelector (exposure tracking, repetition prevention, formal blueprint locking)
 * 3. misconceptionEngine (conceptual, calculation, prerequisite, formula error detection >= 2 threshold)
 * 4. spacedRepetitionEngine (Leitner 5-box interval progression, revision schedule)
 */

const adaptiveEngine = require('./adaptiveEngine');
const questionSelector = require('./questionSelector');
const misconceptionEngine = require('./misconceptionEngine');
const spacedRepetitionEngine = require('./spacedRepetitionEngine');
const prerequisiteGraph = require('./prerequisiteGraph');
const learnerModel = require('./learnerModel');
const templateQuestionGenerator = require('./templateQuestionGenerator');

module.exports = {
  ...adaptiveEngine,
  ...questionSelector,
  ...misconceptionEngine,
  ...spacedRepetitionEngine,
  ...prerequisiteGraph,
  ...learnerModel,
  ...templateQuestionGenerator,

  // Modular namespaces
  adaptiveEngine,
  questionSelector,
  misconceptionEngine,
  spacedRepetitionEngine,
  prerequisiteGraph,
  learnerModel,
  templateQuestionGenerator
};
