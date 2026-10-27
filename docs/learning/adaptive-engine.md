# AdaptIQ Adaptive Learning Engine & Pedagogical Science

## 1. Pedagogical Foundation
AdaptIQ replaces opaque black-box machine learning algorithms with an explainable, modular adaptive architecture designed around established cognitive learning science principles.

## 2. Bayesian Knowledge Tracing (BKT)
BKT models student skill mastery as a two-state Hidden Markov Model (Unlearned vs. Learned).

### Parameters:
- \(L_0\) (Prior Mastery): Default 0.20
- \(T\) (Transition / Learning Rate): Default 0.15
- \(G\) (Guess Probability): Default 0.25 (standard 4-option MCQ)
- \(S\) (Slip Probability): Default 0.10 (careless error)

### Probability Update Formulation:
For a prior mastery \(p\):

**On Correct Response:**
\[
p_{\text{obs}} = \frac{p(1 - S)}{p(1 - S) + (1 - p)G}
\]

**On Incorrect Response:**
\[
p_{\text{obs}} = \frac{p S}{p S + (1 - p)(1 - G)}
\]

**Transition Update:**
\[
p_{\text{next}} = p_{\text{obs}} + (1 - p_{\text{obs}})T
\]

Numerical clamping prevents probabilities from collapsing to 0 or 1, preserving responsiveness to future evidence.

### Instructional Tiers:
- `needs_focus`: Mastery < 0.60 (identified for targeted remedial practice)
- `in_progress`: 0.60 \(\le\) Mastery < 0.85
- `mastered`: Mastery \(\ge\) 0.85

## 3. Dynamic Difficulty Calibration
- **Promotion Rule**: 3 consecutive correct answers promote difficulty (`easy` \(\to\) `medium` \(\to\) `hard` \(\to\) `very_hard`).
- **Demotion Rule**: 2 consecutive incorrect answers de-escalate difficulty to rebuild foundational confidence.
- Streak counters reset upon level transition to ensure clean evaluation at the new difficulty tier.

## 4. Spaced Repetition (Leitner 5-Box Schedule)
Memory consolidation is tracked independently from official assessment scoring:
- **Box 1**: 1-day interval (Newly introduced or recently missed)
- **Box 2**: 3-day interval
- **Box 3**: 7-day interval
- **Box 4**: 14-day interval
- **Box 5**: 30-day interval (Long-term retention)

When a student answers correctly, the skill advances to the next box. An incorrect answer returns the skill to Box 1 for immediate reinforcement.

## 5. Confidence-Based Marking & Metacognition
Before receiving feedback, students can indicate their confidence level:
- `guessing`
- `somewhat_sure`
- `very_sure`

This reveals metacognitive patterns:
1. **Mastered Confident**: Correct + Very Sure.
2. **Lucky Guess**: Correct + Guessing (needs reinforcement).
3. **Dangerous Misconception**: Incorrect + Very Sure (highest priority intervention).
4. **Expected Gap**: Incorrect + Guessing (normal learning frontier).
