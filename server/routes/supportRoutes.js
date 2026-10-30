const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const keys = require('../config/keys');

// Rate limiter for support submissions: maximum 10 requests per 15 minutes per IP
const supportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    errorType: 'RATE_LIMITED',
    message: 'Too many submissions from this IP address. Please try again after 15 minutes.'
  }
});

// GET /api/support/config - returns whether backend Web3Forms proxy is configured
router.get('/config', (req, res) => {
  const isConfigured = Boolean(keys.WEB3FORMS_ACCESS_KEY && keys.WEB3FORMS_ACCESS_KEY.length > 5);
  res.json({
    success: true,
    configured: isConfigured,
    provider: 'Web3Forms',
    service: 'AdaptIQ Support Gateway'
  });
});

// POST /api/support/submit - optional backend proxy to keep Web3Forms credentials server-side
router.post('/submit', supportLimiter, async (req, res) => {
  try {
    const {
      formType = 'contact_enquiry',
      name,
      email,
      subject,
      message,
      botcheck,
      category,
      bugTitle,
      stepsToReproduce,
      expectedBehaviour,
      actualBehaviour,
      deviceInfo
    } = req.body;

    // 1. Honeypot Spam Check
    if (botcheck && String(botcheck).trim() !== '') {
      return res.status(400).json({
        success: false,
        errorType: 'SPAM_REJECTED',
        message: 'Bot submission detected and rejected.'
      });
    }

    // 2. Validate mandatory message or description
    const content = message || actualBehaviour || '';
    if (!content || String(content).trim().length < 5) {
      return res.status(400).json({
        success: false,
        errorType: 'VALIDATION_ERROR',
        message: 'Message content is required.'
      });
    }

    // 3. Resolve Access Key (Server-side key preferred; optional client override)
    const accessKey = keys.WEB3FORMS_ACCESS_KEY || req.body.access_key;
    if (!accessKey) {
      return res.status(503).json({
        success: false,
        errorType: 'MISSING_ACCESS_KEY',
        message: 'Web3Forms access key is not configured on the server.'
      });
    }

    // 4. Construct clean, safe payload
    const payload = {
      access_key: accessKey,
      subject: subject || `[AdaptIQ] ${formType.toUpperCase()}: ${name || 'User'}`,
      from_name: 'AdaptIQ Support Gateway',
      name: (name || 'Anonymous User').slice(0, 80),
      email: email ? String(email).trim().slice(0, 100) : 'support@adaptiq.edu',
      form_type: formType,
      category: category || 'General',
      message: String(content).slice(0, 5000),
      submitted_at: new Date().toISOString()
    };

    if (bugTitle) payload.bug_title = String(bugTitle).slice(0, 120);
    if (stepsToReproduce) payload.steps_to_reproduce = String(stepsToReproduce).slice(0, 1500);
    if (expectedBehaviour) payload.expected_behaviour = String(expectedBehaviour).slice(0, 800);
    if (deviceInfo) payload.device_diagnostics = JSON.stringify(deviceInfo);

    // 5. Forward to Web3Forms API
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return res.status(200).json({
        success: true,
        message: data.message || 'Submission successfully transmitted to support.'
      });
    } else {
      return res.status(400).json({
        success: false,
        errorType: 'API_ERROR',
        message: data.message || 'Remote email delivery failed.'
      });
    }
  } catch (err) {
    console.error('[Web3Forms Gateway Proxy Error]:', err.message);
    return res.status(500).json({
      success: false,
      errorType: 'SERVER_ERROR',
      message: 'Failed to process support request. Please try again later.'
    });
  }
});

module.exports = router;
