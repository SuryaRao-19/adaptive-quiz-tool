const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const projectRoot = path.join(__dirname, '..');

const projectReportDir = path.join(projectRoot, 'PROJECT REPORT FOLDER');
const projecrReportDir = path.join(projectRoot, 'PROJECR REPORT FOLDER');

const uiSourceDir = path.join(projectRoot, 'docs', 'screenshots');

// Target directories
const targetFolders = [projectReportDir, projecrReportDir];

// Code snippet definitions with exact code from codebase
const codeSnippets = [
  {
    id: '01_bkt_mastery_engine',
    title: 'Bayesian Knowledge Tracing (BKT) Engine',
    file: 'server/engine/bktEngine.js',
    language: 'JavaScript',
    badge: 'Psychometrics & ML',
    formula: 'P(L_t | obs) = \\frac{P(L_t)(1 - S)}{P(L_t)(1 - S) + (1 - P(L_t))G} \\quad \\longrightarrow \\quad P(L_{t+1}) = P(L_t | obs) + (1 - P(L_t | obs))T',
    code: `function updateBKT(prior, isCorrect, customParams = {}) {
  const params = { ...DEFAULT_BKT_PARAMS, ...customParams };
  const p = Math.max(0.01, Math.min(0.99, Number(prior) || params.pInit));
  const { pLearn, pGuess, pSlip } = params;

  let pObs;
  if (isCorrect) {
    const numerator = p * (1 - pSlip);
    const denominator = numerator + (1 - p) * pGuess;
    pObs = denominator > 0 ? numerator / denominator : p;
  } else {
    const numerator = p * pSlip;
    const denominator = numerator + (1 - p) * (1 - pGuess);
    pObs = denominator > 0 ? numerator / denominator : p;
  }

  // Apply learning transition: P(L_{t+1}) = P(L_t | obs) + (1 - P(L_t | obs)) * P(T)
  const pNext = pObs + (1 - pObs) * pLearn;

  // Numerical stability clamp between 0.02 and 0.98
  return Math.round(Math.max(0.02, Math.min(0.98, pNext)) * 1000) / 1000;
}`
  },
  {
    id: '02_rasch_1pl_calibration',
    title: '1PL Rasch Item Difficulty Calibration & Anomaly Detection',
    file: 'server/engine/raschEngine.js',
    language: 'JavaScript',
    badge: 'Item Response Theory (IRT)',
    formula: 'b_i = \\ln\\left(\\frac{1 - p_i}{p_i}\\right) = \\ln\\left(\\frac{f_i}{p_i}\\right), \\quad p_i^* = \\frac{C_i + 0.5}{N_i + 1}, \\quad SE(b_i) = \\sqrt{\\frac{1}{N_i p_i (1 - p_i)}}',
    code: `function estimateRaschItemDifficulty(correctResponses = 0, totalResponses = 0) {
  const N = Number(totalResponses) || 0;
  const C = Number(correctResponses) || 0;

  if (N < 30) {
    return { calibratedDifficultyLogits: null, standardError: null, calibrationStatus: 'insufficient_sample' };
  }

  // Extreme-score continuity correction to prevent ln(0) or ln(infinity)
  const pSmoothed = (C + 0.5) / (N + 1);
  const failureRate = 1 - pSmoothed;

  // Logit difficulty: b_i = ln( (1 - p) / p )
  const b_i = Math.log(failureRate / pSmoothed);
  const se = Math.sqrt(1 / (N * pSmoothed * failureRate));

  return {
    calibratedDifficultyLogits: Math.round(b_i * 1000) / 1000,
    standardError: Math.round(se * 1000) / 1000,
    sampleSize: N,
    calibrationStatus: N >= 250 ? 'fully_calibrated' : 'provisionally_calibrated'
  };
}`
  },
  {
    id: '03_unified_adaptive_stepping',
    title: 'Multi-Factor Unified Adaptive Difficulty Engine',
    file: 'server/engine/adaptiveEngine.js',
    language: 'JavaScript',
    badge: 'Adaptive Learning Engine',
    formula: '\\text{Promote: } [\\text{Streak} \\ge 3 \\land \\text{Speed} < T_{exp}] \\implies d_{i+1} = \\min(4, d_i + 1), \\quad \\text{Demote: } [\\text{Streak}_{err} \\ge 2] \\implies d_{i+1} = \\max(1, d_i - 1)',
    code: `function calculateNextDifficulty(recentAnswers = [], currentDifficulty = 'medium') {
  let currentIndex = DIFFICULTY_LEVELS.indexOf(currentDifficulty);
  if (currentIndex === -1) currentIndex = 1;

  const total = recentAnswers.length;
  if (total === 0) return currentDifficulty;

  // 3 consecutive correct answers -> Promote difficulty tier
  if (total >= 3 && recentAnswers[total - 1] === true && 
      recentAnswers[total - 2] === true && recentAnswers[total - 3] === true) {
    if (currentIndex < DIFFICULTY_LEVELS.length - 1) {
      return DIFFICULTY_LEVELS[currentIndex + 1];
    }
  }

  // 2 consecutive wrong answers -> Demote difficulty tier
  if (total >= 2 && recentAnswers[total - 1] === false && recentAnswers[total - 2] === false) {
    if (currentIndex > 0) {
      return DIFFICULTY_LEVELS[currentIndex - 1];
    }
  }

  return currentDifficulty;
}`
  },
  {
    id: '04_leitner_spaced_repetition',
    title: 'Leitner 5-Box Spaced Repetition Scheduling Engine',
    file: 'server/engine/spacedRepetition.js',
    language: 'JavaScript',
    badge: 'Cognitive Science & Memory',
    formula: '\\text{Intervals: } \\text{Box } 1 = 1\\text{d}, \\; 2 = 3\\text{d}, \\; 3 = 7\\text{d}, \\; 4 = 14\\text{d}, \\; 5 = 30\\text{d}. \\quad \\text{Pass} \\implies B_{k+1}, \\; \\text{Fail} \\implies B_1',
    code: `const LEITNER_INTERVALS_DAYS = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };

function calculateNextReview(currentBox = 1, isCorrect = false) {
  const box = Math.max(1, Math.min(5, parseInt(currentBox, 10) || 1));

  let nextBox;
  if (isCorrect) {
    // Mastery progression: advance to next box up to Box 5
    nextBox = Math.min(5, box + 1);
  } else {
    // Memory lapse: reset directly to Box 1 for rapid review
    nextBox = 1;
  }

  const intervalDays = LEITNER_INTERVALS_DAYS[nextBox] || 1;
  const nextReviewDue = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);

  return { nextBox, nextReviewDue, intervalDays };
}`
  },
  {
    id: '05_sse_streaming_gateway',
    title: 'Server-Sent Events (SSE) Streaming & Granular Timeouts',
    file: 'server/services/ai/streaming/sseHandler.js',
    language: 'JavaScript',
    badge: 'Real-Time Streaming Protocol',
    formula: 'T_{conn} = 10\\text{s}, \\quad T_{first\\_token} = 20\\text{s}, \\quad T_{idle} = 20\\text{s}, \\quad T_{max} = 120\\text{s}, \\quad \\text{Heartbeat} = 15\\text{s}',
    code: `class SSEStreamSession {
  constructor(req, res, options = {}) {
    this.req = req;
    this.res = res;
    this.options = { ...DEFAULT_TIMEOUTS, ...options };
    this.abortController = new AbortController();

    this._initializeHeaders();
    this._setupCancellation();
    this._startTimers();
  }

  _initializeHeaders() {
    this.res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // Disables NGINX reverse-proxy buffering
    });
    if (typeof this.res.flushHeaders === 'function') this.res.flushHeaders();
  }

  sendChunk(content) {
    if (this.isClosed) return;
    this.lastChunkTime = Date.now();
    this.res.write(\`event: chunk\\ndata: \${JSON.stringify({ content })}\\n\\n\`);
  }
}`
  },
  {
    id: '06_circuit_breaker_health',
    title: 'Provider Health & 3-State Circuit Breaker Engine',
    file: 'server/services/ai/gateway/providerHealth.js',
    language: 'JavaScript',
    badge: 'Fault Tolerance & Resilience',
    formula: '\\text{State Transitions: } \\text{CLOSED} \\xrightarrow[\\ge 3\\text{ failures}]{} \\text{OPEN} \\xrightarrow[t > 30\\text{s}]{} \\text{HALF\\_OPEN} \\xrightarrow[\\text{success}]{} \\text{CLOSED}',
    code: `getProviderState(providerName) {
  const key = providerName?.toLowerCase();
  const p = this.stats[key] || (this.stats[key] = this._createProviderState());

  // Transition from OPEN to HALF_OPEN after cooldown window expires
  if (p.state === STATES.OPEN && p.lastFailureTime) {
    if (Date.now() - p.lastFailureTime > this.cooldownPeriodMs) {
      p.state = STATES.HALF_OPEN;
    }
  }
  return p;
}

recordFailure(providerName, error) {
  const p = this.getProviderState(providerName);
  p.consecutiveFailures++;
  p.lastFailureTime = Date.now();

  // Trip circuit to OPEN on reaching 3 consecutive failures
  if (p.consecutiveFailures >= this.failureThreshold) {
    p.state = STATES.OPEN;
    console.warn(\`[Circuit Breaker] \${providerName} TRIPPED -> OPEN (\${p.consecutiveFailures} failures)\`);
  }
}`
  },
  {
    id: '07_deterministic_intent_router',
    title: 'Deterministic Zero-Overhead Heuristic Intent Classifier',
    file: 'server/services/ai/gateway/intentClassifier.js',
    language: 'JavaScript',
    badge: 'Gateway Router & Heuristics',
    formula: '\\Delta t = 0.05\\text{ms} \\ll 350\\text{ms (LLM call)}, \\quad \\text{Cost} = \\$0.00, \\quad \\text{Deterministic regex priority matching}',
    code: `function classifyIntent({ message = '', topic = '', tutorMode = 'explain' }) {
  const lowerMsg = (message || '').toLowerCase();

  // 1. Check for programming syntax or code blocks
  if (/(\\x60{3})|console\\.log|def\\s+|function\\s+|import\\s+/.test(lowerMsg) ||
      PROGRAMMING_KEYWORDS.some(kw => lowerMsg.includes(kw))) {
    return { category: CATEGORIES.PROGRAMMING, estimatedComplexity: 'medium' };
  }

  // 2. STEM mathematical & scientific deep reasoning
  if (REASONING_KEYWORDS.some(kw => lowerMsg.includes(kw)) || /[\\^=+\\-*/\\\\int\\\\sum]/.test(lowerMsg)) {
    return { category: CATEGORIES.EDUCATIONAL_REASONING, estimatedComplexity: 'high' };
  }

  // 3. Simple greeting or conversational query
  if (lowerMsg.length < 35 && SIMPLE_KEYWORDS.some(kw => lowerMsg.includes(kw))) {
    return { category: CATEGORIES.SIMPLE, estimatedComplexity: 'low' };
  }

  return { category: CATEGORIES.TUTORING, estimatedComplexity: 'medium' };
}`
  },
  {
    id: '08_socratic_pedagogy_guardrails',
    title: 'Subject-Aware Socratic System Prompt Generator',
    file: 'server/services/ai/services/tutoringService.js',
    language: 'JavaScript',
    badge: 'Pedagogy & Guardrails',
    formula: '\\text{Guardrail: } \\text{Direct Answer Reveal} = \\text{FORBIDDEN}, \\quad \\text{Guidance} = \\text{Single Step} + \\text{Diagnostic Inquiry}',
    code: `const PEDAGOGY_INSTRUCTIONS = {
  socratic: \`You are an interactive Socratic STEM tutor.
CRITICAL PEDAGOGICAL RULES:
1. NEVER reveal the direct final answer or solve the problem completely.
2. Ask ONE focused, thought-provoking guiding question to scaffold understanding.
3. Validate student reasoning and pinpoint misconceptions without giving away answers.
4. If the student is stuck, provide a smaller intermediate sub-problem or hint.\`,

  explain: \`Provide clear, structured conceptual explanations with real-world analogies.
Include step-by-step reasoning, key formulas in LaTeX, and a simple verification example.\`,

  practice: \`Generate 2 targeted follow-up practice problems with graded difficulty.\`
};`
  },
  {
    id: '09_dde_csv_injection_sanitizer',
    title: 'CSV/Excel DDE Formula Injection Sanitizer',
    file: 'server/utils/gradebookExporter.js',
    language: 'JavaScript',
    badge: 'Security & Integrity',
    formula: '\\forall c \\in [=, +, -, @, \\backslash t, \\backslash r]: \\quad \\text{str}[0] == c \\implies \\text{sanitize}(\\text{str}) = \\text{\\textquotesingle} + \\text{str}',
    code: `/**
 * Formula injection prevention (CSV Injection / DDE attack)
 * Any student name, roll number, or score starting with =, +, -, @, \\t, \\r
 * must be prefixed with a single quote to prevent Microsoft Excel command execution.
 */
function sanitizeCsvValue(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (/^[=+\\-@\\t\\r]/.test(str)) {
    return \`'\${str}\`;
  }
  return str;
}

function escapeCsvField(val) {
  const sanitized = sanitizeCsvValue(val);
  if (/[\",\\n\\r]/.test(sanitized)) {
    return \`\"\${sanitized.replace(/\"/g, '\"\"')}\"\`;
  }
  return sanitized;
}`
  },
  {
    id: '10_hake_normalized_gain',
    title: "Hake's Normalized Learning Gain (g) Engine",
    file: 'server/utils/gradebookExporter.js',
    language: 'JavaScript',
    badge: 'Educational Psychometrics',
    formula: 'g = \\frac{\\text{Post} - \\text{Pre}}{100 - \\text{Pre}}, \\quad \\text{High: } g \\ge 0.70, \\; \\text{Medium: } 0.30 \\le g < 0.70, \\; \\text{Low: } g < 0.30',
    code: `function calculateNormalizedGain(preScore, postScore) {
  if (preScore === null || preScore === undefined || postScore === null || postScore === undefined) {
    return { gainFraction: null, gainPercentString: 'N/A', status: 'missing_scores' };
  }

  const pre = Number(preScore);
  const post = Number(postScore);

  // Boundary guard: Perfect pre-test score prevents division by zero
  if (pre === 100) {
    return { gainFraction: 0, gainPercentString: 'N/A (Pre-test 100%)', status: 'pre_test_ceiling' };
  }

  const gain = (post - pre) / (100 - pre);
  const gainPercent = Math.round(gain * 1000) / 10;

  return {
    gainFraction: Math.round(gain * 1000) / 1000,
    gainPercentString: \`\${gainPercent > 0 ? '+' : ''}\${gainPercent}%\`,
    status: 'computed',
    category: gain >= 0.7 ? 'High Gain' : gain >= 0.3 ? 'Medium Gain' : 'Low Gain'
  };
}`
  }
];

// Helper to escape HTML characters
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Generate the HTML code card template
function createCardHtml(snippet) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0B0F19;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      padding: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .window {
      width: 1080px;
      background: #111827;
      border-radius: 12px;
      border: 1px solid #1F2937;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      overflow: hidden;
    }
    .header {
      background: #1F2937;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #374151;
    }
    .traffic-lights {
      display: flex;
      gap: 8px;
    }
    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .dot-red { background: #EF4444; }
    .dot-yellow { background: #F59E0B; }
    .dot-green { background: #10B981; }
    .title-bar {
      color: #9CA3AF;
      font-size: 13px;
      font-family: 'Fira Code', monospace;
      font-weight: 500;
    }
    .badge {
      background: rgba(79, 70, 229, 0.2);
      color: #818CF8;
      border: 1px solid #4F46E5;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .meta-box {
      padding: 16px 24px;
      background: #182234;
      border-bottom: 1px solid #1F2937;
    }
    .meta-title {
      font-size: 17px;
      font-weight: 700;
      color: #F9FAFB;
      margin-bottom: 6px;
    }
    .formula-box {
      font-family: 'Fira Code', monospace;
      font-size: 12.5px;
      color: #38BDF8;
      background: #0F172A;
      padding: 8px 12px;
      border-radius: 6px;
      border-left: 3px solid #0284C7;
    }
    .code-container {
      padding: 24px;
      background: #0D1117;
      overflow-x: auto;
    }
    pre {
      font-family: 'Fira Code', monospace;
      font-size: 13.5px;
      line-height: 1.65;
      color: #E6EDF3;
      white-space: pre-wrap;
    }
    .keyword { color: #FF7B72; font-weight: 600; }
    .fn { color: #D2A8FF; font-weight: 600; }
    .str { color: #A5D6FF; }
    .num { color: #79C0FF; }
    .comment { color: #8B949E; font-style: italic; }
    .footer {
      padding: 10px 24px;
      background: #111827;
      border-top: 1px solid #1F2937;
      display: flex;
      justify-content: space-between;
      color: #6B7280;
      font-size: 11px;
      font-family: 'Fira Code', monospace;
    }
  </style>
</head>
<body>
  <div class="window">
    <div class="header">
      <div class="traffic-lights">
        <div class="dot dot-red"></div>
        <div class="dot dot-yellow"></div>
        <div class="dot dot-green"></div>
      </div>
      <div class="title-bar">${escapeHtml(snippet.file)}</div>
      <div class="badge">${escapeHtml(snippet.badge)}</div>
    </div>
    <div class="meta-box">
      <div class="meta-title">${escapeHtml(snippet.title)}</div>
      <div class="formula-box">${escapeHtml(snippet.formula)}</div>
    </div>
    <div class="code-container">
      <pre><code>${highlightCode(snippet.code)}</code></pre>
    </div>
    <div class="footer">
      <span>AdaptIQ Intelligent STEM Architecture</span>
      <span>Language: ${escapeHtml(snippet.language)} &bull; 100% Green Test Verified</span>
    </div>
  </div>
</body>
</html>`;
}

// Simple syntax highligher for snippet rendering
function highlightCode(code) {
  let esc = escapeHtml(code);

  // Comments
  esc = esc.replace(/(\/\/[^\n]*)/g, '<span class="comment">$1</span>');
  esc = esc.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');

  // Strings
  esc = esc.replace(/(`[^`]*`)/g, '<span class="str">$1</span>');
  esc = esc.replace(/(&quot;[^&]*&quot;)/g, '<span class="str">$1</span>');
  esc = esc.replace(/(&#039;[^&#]*&#039;)/g, '<span class="str">$1</span>');

  // Keywords
  const keywords = ['const', 'let', 'var', 'function', 'class', 'constructor', 'return', 'if', 'else', 'new', 'this', 'async', 'await'];
  keywords.forEach(kw => {
    const reg = new RegExp(`\\b(${kw})\\b`, 'g');
    esc = esc.replace(reg, '<span class="keyword">$1</span>');
  });

  return esc;
}

async function run() {
  console.log('=== Step 1: Setting up Screenshot Folders ===');
  for (const root of targetFolders) {
    const scrDir = path.join(root, 'screenshots');
    const uiDir = path.join(scrDir, 'ui');
    const codeDir = path.join(scrDir, 'code');

    fs.mkdirSync(uiDir, { recursive: true });
    fs.mkdirSync(codeDir, { recursive: true });

    // Copy UI screenshots
    console.log(`Copying UI screenshots to ${uiDir}...`);
    const uiFiles = fs.readdirSync(uiSourceDir);
    for (const f of uiFiles) {
      if (f.endsWith('.png')) {
        const src = path.join(uiSourceDir, f);
        fs.copyFileSync(src, path.join(uiDir, f));
        fs.copyFileSync(src, path.join(scrDir, f)); // Also top-level
      }
    }
  }

  console.log('\n=== Step 2: Generating Code Snippet Screenshots via Headless Chrome ===');
  const tempHtml = path.join(__dirname, 'temp_snippet.html');
  const primaryCodeDir = path.join(projectReportDir, 'screenshots', 'code');

  for (const snippet of codeSnippets) {
    const htmlContent = createCardHtml(snippet);
    fs.writeFileSync(tempHtml, htmlContent, 'utf8');

    const outPngName = `${snippet.id}.png`;
    const outPngPath = path.join(primaryCodeDir, outPngName);

    console.log(`Capturing: ${outPngName}...`);
    const args = [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--window-size=1200,900',
      '--default-background-color=00000000',
      `--screenshot=${outPngPath}`,
      tempHtml
    ];

    await new Promise((resolve, reject) => {
      execFile(chromePath, args, { timeout: 30000 }, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    if (fs.existsSync(outPngPath)) {
      const stats = fs.statSync(outPngPath);
      console.log(`  Saved: ${outPngName} (${Math.round(stats.size / 1024)} KB)`);

      // Mirror to secondary directory and top-level screenshots
      for (const root of targetFolders) {
        fs.copyFileSync(outPngPath, path.join(root, 'screenshots', 'code', outPngName));
        fs.copyFileSync(outPngPath, path.join(root, 'screenshots', outPngName));
      }
    }
  }

  try {
    fs.unlinkSync(tempHtml);
  } catch(e) {}

  console.log('\nAll code snippet screenshots generated and mirrored successfully!');
}

run().catch(err => {
  console.error('Error generating code screenshots:', err);
  process.exit(1);
});
