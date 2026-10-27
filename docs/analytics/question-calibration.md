# Empirical Question Calibration & Rasch 1PL Foundations

## 1. Empirical Item Telemetry (Phase 6)

### 1.1 Mathematical Formulation
For question $i$:
$$p_i = \frac{C_i}{N_i}$$
$$f_i = 1 - p_i$$
- $C_i$: Validated correct responses from verified student attempts.
- $N_i$: Total validated responses.
- When $N_i = 0$, $p_i$ is **unavailable** (`N/A`), not 0%.

### 1.2 Difficulty Anomaly Heuristics
- **Easy Tier**: Expected pass rate $p_i \ge 0.60$. If $p_i < 0.60$ and $N_i \ge 10$, flagged as `"Review Recommended: Unusually high failure rate"`.
- **Medium Tier**: Expected $0.35 \le p_i \le 0.85$. If $p_i < 0.30$ or $p_i > 0.90$, flagged for review.
- **Hard/Very Hard Tier**: Expected $p_i \le 0.80$. If $p_i > 0.80$, flagged for distractor review.
- **Sample Sufficiency**: $N_i < 10$ marked as `"Insufficient Data"`.

---

## 2. Rasch 1PL Model Calibration Readiness (Phase 7)

### 2.1 Theoretical Formulation
The one-parameter logistic (1PL) Rasch model defines the probability of correct response:
$$P(X_{ni} = 1) = \frac{1}{1 + \exp[-(\theta_n - b_i)]}$$
Where:
- $\theta_n$: Learner ability parameter
- $b_i$: Item difficulty parameter in logits

### 2.2 Log-Odds Item Parameter Estimation
Under sample mean ability centering ($\bar{\theta} = 0$):
$$b_i = \ln\left(\frac{1 - p_i}{p_i}\right) = \ln\left(\frac{f_i}{p_i}\right)$$
Standard Error:
$$SE(b_i) = \sqrt{\frac{1}{N_i \cdot p_i \cdot (1 - p_i)}}$$

### 2.3 Sample Sufficiency Criteria
- **$N < 30$**: Insufficient sample for Rasch parameter estimation. No estimates are fabricated.
- **$30 \le N < 250$**: Pilot Calibration.
- **$N \ge 250$**: Operational 1PL Rasch Calibration with stable standard error.
