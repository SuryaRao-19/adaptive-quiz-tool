# 🧮 AdaptIQ — Core Algorithms & Mathematical Formulations
## Mathematical Derivations, Parameters & Complete Production Source Code

This document provides a thorough technical breakdown of the 8 mathematical models and proprietary algorithms implemented in AdaptIQ.

---

## 1. Bayesian Knowledge Tracing (BKT) Algorithm
**Source File**: `server/engine/bktEngine.js`

### 1.1 Theoretical Concept
Bayesian Knowledge Tracing (Corbett & Anderson, 1995) models a student's cognitive mastery of a specific skill or learning objective as a two-state hidden Markov model where the skill is either in an unlearned state ($L_t = 0$) or a learned state ($L_t = 1$). BKT estimates the hidden probability $P(L_t)$ that the student knows the skill at time $t$ based on their observed sequence of correct or incorrect responses.

### 1.2 Mathematical Derivations
BKT operates in two distinct phases: (1) Observation update via Bayes' theorem, followed by (2) Learning transition.

#### Phase A: Observation Update (Posterior Probability)
- **Case 1: Observed Correct Response ($\text{obs}_t = 1$)**:
  $$P(L_t \mid \text{obs}_t = 1) = \frac{P(L_{t-1}) \cdot (1 - P(S))}{P(L_{t-1}) \cdot (1 - P(S)) + (1 - P(L_{t-1})) \cdot P(G)}$$
- **Case 2: Observed Incorrect Response ($\text{obs}_t = 0$)**:
  $$P(L_t \mid \text{obs}_t = 0) = \frac{P(L_{t-1}) \cdot P(S)}{P(L_{t-1}) \cdot P(S) + (1 - P(L_{t-1})) \cdot (1 - P(G))}$$

#### Phase B: Learning Transition
Between question opportunities, the student has a chance of transitioning from the unlearned to the learned state governed by the transition rate $P(T)$:
$$P(L_{t+1}) = P(L_t \mid \text{obs}_t) + \big(1 - P(L_t \mid \text{obs}_t)\big) \cdot P(T)$$

### 1.3 Parameter Specifications
| Parameter | Default Value | Psychometric Meaning |
| :--- | :--- | :--- |
| **$P(L_0)$** | `0.15` | Prior probability that a student already knows the skill before practice begins. |
| **$P(T)$** | `0.20` | Probability that a student transitions from unlearned to learned after seeing a question. |
| **$P(G)$** | `0.25` | Probability of guessing correctly despite not knowing the skill (standard 4-choice MCQ). |
| **$P(S)$** | `0.10` | Slip rate: Probability of making a careless error despite knowing the skill. |
| **Mastery Threshold** | `0.85` | A skill is declared "Mastered" when $P(L_t) \ge 0.85$. |

### 1.4 Production Code Snippet
```javascript
// server/engine/bktEngine.js
const DEFAULT_BKT_PARAMS = {
  pL0: 0.15,
  pT: 0.20,
  pG: 0.25,
  pS: 0.10,
  masteryThreshold: 0.85
};

function updateMastery(pL_prev, isCorrect, params = {}) {
  const pL0 = params.pL0 ?? DEFAULT_BKT_PARAMS.pL0;
  const pT  = params.pT  ?? DEFAULT_BKT_PARAMS.pT;
  const pG  = params.pG  ?? DEFAULT_BKT_PARAMS.pG;
  const pS  = params.pS  ?? DEFAULT_BKT_PARAMS.pS;

  let prior = (pL_prev === null || pL_prev === undefined) ? pL0 : pL_prev;
  prior = Math.min(Math.max(Number(prior) || pL0, 0.001), 0.999);

  let pL_given_obs;
  if (isCorrect) {
    const num = prior * (1 - pS);
    const den = (prior * (1 - pS)) + ((1 - prior) * pG);
    pL_given_obs = num / den;
  } else {
    const num = prior * pS;
    const den = (prior * pS) + ((1 - prior) * (1 - pG));
    pL_given_obs = num / den;
  }

  // Knowledge transition update
  const pL_next = pL_given_obs + (1 - pL_given_obs) * pT;
  return Math.min(Math.max(pL_next, 0.001), 0.999);
}

function getMasteryStatus(pL, threshold = DEFAULT_BKT_PARAMS.masteryThreshold) {
  if (pL >= threshold) return 'mastered';
  if (pL >= 0.60) return 'practicing';
  return 'needs_focus';
}
```

---

## 2. 1PL Rasch Item Difficulty Calibration Model (Item Response Theory)
**Source File**: `server/engine/raschEngine.js`

### 2.1 Theoretical Concept
In classical test theory, question difficulty is often subjective. Under the **One-Parameter Logistic (1PL) Rasch Model** (Georg Rasch, 1960), the probability of a correct response is modeled as a logistic function of the difference between the student's latent ability ($\theta_n$) and the item's intrinsic difficulty ($b_i$):
$$P(X_{ni} = 1 \mid \theta_n, b_i) = \frac{\exp(\theta_n - b_i)}{1 + \exp(\theta_n - b_i)}$$

### 2.2 Mathematical Formulation
Using empirical cohort telemetry (total successes $R_i$ and total attempts $N_i$):
1. **Empirical Pass Rate**:
   $$p_i = \frac{R_i}{N_i}$$
2. **Empirical Failure Rate**:
   $$f_i = 1 - p_i$$
3. **Item Difficulty in Logits ($b_i$)**:
   $$b_i = \ln\left(\frac{f_i}{p_i}\right) = \ln\left(\frac{1 - p_i}{p_i}\right)$$

- If $p_i = 0.50$ (50% pass rate) $\rightarrow b_i = \ln(0.5 / 0.5) = 0.00$ Logits (balanced medium).
- If $p_i = 0.20$ (20% pass rate) $\rightarrow b_i = \ln(0.8 / 0.2) = +1.386$ Logits (hard).
- If $p_i = 0.85$ (85% pass rate) $\rightarrow b_i = \ln(0.15 / 0.85) = -1.734$ Logits (easy).
- **Statistical Noise Guard**: To prevent erratic shifts caused by small classroom samples, calibration requires $N_i \ge 30$. Full psychometric calibration status is unlocked at $N_i \ge 250$.

### 2.3 Production Code Snippet
```javascript
// server/engine/raschEngine.js
const MIN_CALIBRATION_RESPONSES = 30;
const FULL_CALIBRATION_RESPONSES = 250;

function estimateRaschLogit(successes, total) {
  if (total < MIN_CALIBRATION_RESPONSES) {
    return {
      status: 'insufficient_sample',
      logitDifficulty: null,
      empiricalPassRate: total > 0 ? Math.round((successes / total) * 1000) / 1000 : null,
      message: `Sample size N=${total} is below minimum threshold (30 required).`
    };
  }

  // Constrain bounds to prevent division by zero or log(0)
  const p_i = Math.min(Math.max(successes / total, 0.005), 0.995);
  const f_i = 1 - p_i;
  const logit = Math.log(f_i / p_i); // ln(f_i / p_i)

  return {
    status: total >= FULL_CALIBRATION_RESPONSES ? 'fully_calibrated' : 'provisional',
    logitDifficulty: Math.round(logit * 1000) / 1000,
    empiricalPassRate: Math.round(p_i * 1000) / 1000,
    sampleSize: total
  };
}
```

---

## 3. Leitner 5-Box Spaced Repetition Memory System
**Source File**: `server/engine/spacedRepetition.js`

### 3.1 Theoretical Concept
Hermann Ebbinghaus discovered that human memory retention decays exponentially over time:
$$R = e^{-\frac{t}{S}}$$
Where $R$ is memory retention, $t$ is time elapsed, and $S$ is memory stability. Sebastian Leitner's 5-box methodology flattens this forgetting curve by systematically spacing out review intervals as mastery is demonstrated.

### 3.2 Interval Schedule
| Box Level | Review Interval | Learning State | Purpose |
| :---: | :---: | :--- | :--- |
| **Box 1** | **1 Day** | Novice / Mistake | Daily review for newly failed or nascent skills. |
| **Box 2** | **3 Days** | Early Learning | Reinforces short-term retention. |
| **Box 3** | **7 Days** | Intermediate | Weekly review consolidates working memory. |
| **Box 4** | **14 Days** | Advanced | Bi-weekly retrieval practice. |
| **Box 5** | **30 Days** | Mastered | Permanent consolidated long-term memory. |

### 3.3 Production Code Snippet
```javascript
// server/engine/spacedRepetition.js
const LEITNER_INTERVALS_DAYS = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };

function processReview(currentBox, isCorrect, lastReviewedAt = new Date()) {
  const box = Math.max(1, Math.min(Number(currentBox) || 1, 5));
  let nextBox;

  if (isCorrect) {
    nextBox = Math.min(box + 1, 5); // Promote up to Box 5
  } else {
    nextBox = 1; // Immediate demotion to Box 1 on any error
  }

  const intervalDays = LEITNER_INTERVALS_DAYS[nextBox];
  const nextDueDate = new Date(lastReviewedAt.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  return {
    box: nextBox,
    intervalDays,
    nextDueDate,
    status: nextBox === 5 ? 'mastered' : 'learning'
  };
}

function isOverdue(nextDueDate, referenceDate = new Date()) {
  if (!nextDueDate) return false;
  return new Date(nextDueDate).getTime() <= new Date(referenceDate).getTime();
}
```

---

## 4. Multi-Factor Unified Adaptive Difficulty Engine
**Source File**: `server/engine/adaptiveEngine.js`

### 4.1 Theoretical Concept
Maintains the student within Vygotsky's **Zone of Proximal Development (ZPD)**—the sweet spot between boredom and frustration.

### 4.2 State Machine Transition Rules
```
                 [3 Consecutive Correct]
          ┌───────────────────────────────────┐
          ▼                                   ▼
      ┌───────┐      [3 Correct]      ┌────────┐      [3 Correct]      ┌──────┐
      │ EASY  │ ─────────────────────►│ MEDIUM │ ─────────────────────►│ HARD │
      └───────┘                       └────────┘                       └──────┘
          ▲                               │   ▲                           │
          │         [2 Incorrect]         │   │       [2 Incorrect]       │
          └───────────────────────────────┘   └───────────────────────────┘
```

### 4.3 Production Code Snippet
```javascript
// server/engine/adaptiveEngine.js
function calculateNextDifficulty(currentDifficulty, recentResponses) {
  const diff = (currentDifficulty || 'medium').toLowerCase();
  
  if (!Array.isArray(recentResponses) || recentResponses.length === 0) {
    return diff;
  }

  // Count consecutive streaks from the most recent answer
  let correctStreak = 0;
  let incorrectStreak = 0;

  for (let i = recentResponses.length - 1; i >= 0; i--) {
    const isCorrect = Boolean(recentResponses[i].isCorrect);
    if (isCorrect) {
      if (incorrectStreak > 0) break;
      correctStreak++;
    } else {
      if (correctStreak > 0) break;
      incorrectStreak++;
    }
  }

  // Promotion Rule: 3 consecutive correct answers
  if (correctStreak >= 3) {
    if (diff === 'easy') return 'medium';
    if (diff === 'medium') return 'hard';
    return 'hard';
  }

  // Demotion Rule: 2 consecutive incorrect answers
  if (incorrectStreak >= 2) {
    if (diff === 'hard') return 'medium';
    if (diff === 'medium') return 'easy';
    return 'easy';
  }

  return diff;
}
```

---

## 5. Normalized Learning Gain (Hake's Average Gain $g$)
**Source File**: `server/utils/gradebookExporter.js`

### 5.1 Theoretical Concept
Proposed by physicist Richard Hake (1998), Normalized Learning Gain ($g$) measures the proportion of possible conceptual gain realized by a student between a pre-test and a post-test:
$$g = \frac{\text{Post-Test \%} - \text{Pre-Test \%}}{100\% - \text{Pre-Test \%}}$$

### 5.2 Category Thresholds
- **High Learning Gain ($g \ge 0.70$)**: Student achieved $\ge 70\%$ of their potential improvement.
- **Medium Learning Gain ($0.30 \le g < 0.70$)**: Standard expected classroom progression.
- **Low Learning Gain ($g < 0.30$)**: Student requires teacher intervention and targeted remediation.

### 5.3 Production Code Snippet
```javascript
// server/utils/gradebookExporter.js
function calculateNormalizedGain(preScore, postScore) {
  if (preScore === null || preScore === undefined || postScore === null || postScore === undefined) {
    return null;
  }
  const pre = Number(preScore);
  const post = Number(postScore);

  if (isNaN(pre) || isNaN(post)) return null;
  if (pre >= 100) return 0; // Ceiling boundary condition

  const actualGain = post - pre;
  const maxPossibleGain = 100 - pre;
  const g = actualGain / maxPossibleGain;

  return Math.round(g * 100) / 100; // Returns rounded 2-decimal normalized ratio
}
```

---

## 6. Jaccard Text Similarity Question Deduplication
**Source File**: `server/services/gemini/responseValidator.js`

### 6.1 Theoretical Concept
Measures token overlap between a newly generated AI question ($A$) and existing questions ($B$):
$$J(A, B) = \frac{|A \cap B|}{|A \cup B|}$$

### 6.2 Production Code Snippet
```javascript
// server/services/gemini/responseValidator.js
function calculateJaccardSimilarity(str1, str2) {
  const tokenize = s => new Set(
    String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2)
  );
  
  const setA = tokenize(str1);
  const setB = tokenize(str2);

  if (setA.size === 0 && setB.size === 0) return 1.0;
  if (setA.size === 0 || setB.size === 0) return 0.0;

  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);

  return intersection.size / union.size;
}

function isDuplicateQuestion(newText, existingQuestionArray, threshold = 0.68) {
  return existingQuestionArray.some(existing => {
    const sim = calculateJaccardSimilarity(newText, existing.questionText || existing.question);
    return sim >= threshold;
  });
}
```

---

## 7. Deterministic Zero-Overhead Intent Classifier
**Source File**: `server/services/ai/gateway/intentClassifier.js`

### 7.1 Production Code Snippet
```javascript
// server/services/ai/gateway/intentClassifier.js
const CATEGORIES = {
  SIMPLE: 'SIMPLE',
  EDUCATIONAL_REASONING: 'EDUCATIONAL_REASONING',
  PROGRAMMING: 'PROGRAMMING',
  TUTORING: 'TUTORING',
  CONTENT_GENERATION: 'CONTENT_GENERATION',
  LONG_CONTEXT: 'LONG_CONTEXT'
};

function classifyIntent({ message = '', topic = '', subject = '', tutorMode = 'explain', historyLength = 0, requiresStructuredOutput = false }) {
  const text = (message || '').toLowerCase().trim();
  const lowerSubject = (subject || '').toLowerCase();

  if (historyLength >= 12 || text.length > 3000) {
    return { category: CATEGORIES.LONG_CONTEXT, reason: 'High message volume requiring long context buffer.' };
  }

  if (requiresStructuredOutput || text.includes('generate quiz') || text.includes('create question')) {
    return { category: CATEGORIES.CONTENT_GENERATION, reason: 'Structured educational content generation.' };
  }

  if (text.includes('```') || text.includes('function') || text.includes('debug') || lowerSubject.includes('computer')) {
    return { category: CATEGORIES.PROGRAMMING, reason: 'Code debugging or algorithmic analysis.' };
  }

  if (tutorMode === 'socratic' || tutorMode === 'step_by_step') {
    return { category: CATEGORIES.TUTORING, reason: `Active tutor mode: ${tutorMode}.` };
  }

  if (text.includes('solve') || text.includes('derive') || text.includes('why') || lowerSubject.includes('math') || lowerSubject.includes('physics')) {
    return { category: CATEGORIES.EDUCATIONAL_REASONING, reason: 'Multi-step STEM reasoning or proof.' };
  }

  if (text.length < 35 && (text.includes('hi') || text.includes('hello') || text.includes('define'))) {
    return { category: CATEGORIES.SIMPLE, reason: 'Short greeting or factual lookup.' };
  }

  return { category: CATEGORIES.TUTORING, reason: 'Standard conversational academic tutoring.' };
}
```

---

## 8. Provider Circuit Breaker & Health Monitor
**Source File**: `server/services/ai/gateway/providerHealth.js`

### 8.1 State Transitions
- **`CLOSED`**: Healthy operation. All requests pass to provider.
- **`OPEN`**: 3 consecutive failures detected. Provider is temporarily bypassed to prevent retry storms.
- **`HALF_OPEN`**: After a 30-second cooldown period, a single trial request is permitted to test provider recovery.

### 8.2 Production Code Snippet
```javascript
// server/services/ai/gateway/providerHealth.js
class ProviderHealthMonitor {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 3;
    this.cooldownPeriodMs = options.cooldownPeriodMs || 30000; // 30s cooldown
    this.stats = {
      gemini: { state: 'CLOSED', consecutiveFailures: 0, latencies: [] },
      openai: { state: 'CLOSED', consecutiveFailures: 0, latencies: [] },
      anthropic: { state: 'CLOSED', consecutiveFailures: 0, latencies: [] }
    };
  }

  isAvailable(providerName) {
    const p = this.stats[providerName?.toLowerCase()];
    if (!p) return true;
    if (p.state === 'OPEN' && Date.now() - p.lastFailureTime > this.cooldownPeriodMs) {
      p.state = 'HALF_OPEN';
    }
    return p.state !== 'OPEN';
  }

  recordSuccess(providerName, durationMs) {
    const p = this.stats[providerName?.toLowerCase()];
    if (!p) return;
    p.consecutiveFailures = 0;
    p.state = 'CLOSED';
    p.latencies.push(durationMs);
    if (p.latencies.length > 10) p.latencies.shift();
  }

  recordFailure(providerName, error) {
    const p = this.stats[providerName?.toLowerCase()];
    if (!p) return;
    p.consecutiveFailures++;
    p.lastFailureTime = Date.now();
    if (p.consecutiveFailures >= this.failureThreshold) {
      p.state = 'OPEN';
    }
  }
}
```

