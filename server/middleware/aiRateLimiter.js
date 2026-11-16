/**
 * AI Rate Limiter & Prompt Security Guard Middleware
 * Enforces per-user rate limiting, daily request quotas, input length bounds, and prompt injection defense.
 */

// In-memory token bucket / sliding window for per-user rate limits
const userRequestCounts = new Map(); // key: userId -> { count, windowStart }
const userDailyCounts = new Map();   // key: userId -> { count, dayKey }

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = {
  student: 25,
  teacher: 60,
  admin: 120,
  default: 20
};

const MAX_DAILY_QUOTA = {
  student: 100,
  teacher: 300,
  admin: 1000,
  default: 80
};

// Common prompt injection signatures and jailbreak attempts
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+(instructions|prompts|rules)/i,
  /disregard\s+(all\s+)?(previous|prior)\s+rules/i,
  /system\s*:\s*you\s+are\s+now/i,
  /you\s+are\s+now\s+in\s+developer\s+mode/i,
  /jailbreak/i,
  /dan\s+mode/i,
  /reveal\s+(the\s+)?(api|system)\s*(key|prompt|secret)/i,
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /drop\s+table/i,
  /exec\s*\(/i
];

/**
 * Sanitizes input string and protects against prompt injection
 */
function sanitizeInput(text, maxLength = 2500) {
  if (typeof text !== 'string') return '';
  let cleaned = text.trim().slice(0, maxLength);

  // Check injection heuristics
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, '[Content Removed: Policy Guard]');
    }
  }

  // Remove control characters except standard whitespace
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return cleaned;
}

/**
 * Middleware enforcing per-user rate limits and daily quotas
 */
function aiRateLimiter(req, res, next) {
  const userId = req.user?.id || req.user?._id?.toString() || req.ip || 'anonymous';
  const role = req.user?.role?.toLowerCase() || 'student';
  const now = Date.now();
  const dayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // 1. Sliding 15-Minute Window Check
  const windowLimit = MAX_REQUESTS_PER_WINDOW[role] || MAX_REQUESTS_PER_WINDOW.default;
  const userWindow = userRequestCounts.get(userId) || { count: 0, windowStart: now };

  if (now - userWindow.windowStart > RATE_LIMIT_WINDOW_MS) {
    userWindow.count = 0;
    userWindow.windowStart = now;
  }

  if (userWindow.count >= windowLimit) {
    const retryAfterSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - userWindow.windowStart)) / 1000);
    res.set('Retry-After', String(retryAfterSeconds));
    return res.status(429).json({
      success: false,
      message: `AI request rate limit exceeded (${windowLimit} requests per 15 minutes). Please retry in ${retryAfterSeconds} seconds.`,
      retryAfterSeconds
    });
  }

  // 2. Daily Quota Check
  const dailyLimit = MAX_DAILY_QUOTA[role] || MAX_DAILY_QUOTA.default;
  const userDaily = userDailyCounts.get(userId) || { count: 0, dayKey };

  if (userDaily.dayKey !== dayKey) {
    userDaily.count = 0;
    userDaily.dayKey = dayKey;
  }

  if (userDaily.count >= dailyLimit) {
    return res.status(429).json({
      success: false,
      message: `Daily AI usage quota exceeded (${dailyLimit} requests/day). Quota resets at midnight UTC.`
    });
  }

  // Increment usage counters
  userWindow.count++;
  userDaily.count++;
  userRequestCounts.set(userId, userWindow);
  userDailyCounts.set(userId, userDaily);

  // 3. Request Body Sanitization
  if (req.body && typeof req.body === 'object') {
    if (req.body.prompt) req.body.prompt = sanitizeInput(req.body.prompt);
    if (req.body.promptDetails) req.body.promptDetails = sanitizeInput(req.body.promptDetails);
    if (req.body.message) req.body.message = sanitizeInput(req.body.message);
    if (req.body.questionText) req.body.questionText = sanitizeInput(req.body.questionText);
    if (req.body.studentAnswer) req.body.studentAnswer = sanitizeInput(String(req.body.studentAnswer), 500);
  }

  next();
}

module.exports = {
  aiRateLimiter,
  sanitizeInput,
  INJECTION_PATTERNS
};

