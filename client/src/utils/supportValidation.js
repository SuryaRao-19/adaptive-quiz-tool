/**
 * AdaptIQ Support & Feedback Validation Utilities
 * Ensures input integrity, sanitization, spam protection, and privacy compliance.
 */

// RFC 5322-compliant email validator
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  // Standard robust email pattern
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return re.test(trimmed) && trimmed.length <= 254;
};

/**
 * Trims text and constrains length to prevent buffer/payload flooding.
 */
export const sanitizeText = (text, maxLength = 2000) => {
  if (typeof text !== 'string') return '';
  return text.trim().slice(0, maxLength);
};

/**
 * Collects strictly non-sensitive browser and device diagnostic metadata.
 * Explicitly excludes: authentication tokens, student PINs, passwords,
 * session cookies, classroom records, and personal identifying credentials.
 */
export const getSafeDeviceInfo = () => {
  if (typeof window === 'undefined') {
    return { environment: 'Server/Node' };
  }

  const nav = window.navigator || {};
  const scr = window.screen || {};

  // Simple heuristic for browser family without tracking libraries
  const ua = nav.userAgent || '';
  let browserFamily = 'Unknown Browser';
  if (ua.includes('Firefox/')) browserFamily = 'Mozilla Firefox';
  else if (ua.includes('Edg/')) browserFamily = 'Microsoft Edge';
  else if (ua.includes('Chrome/')) browserFamily = 'Google Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browserFamily = 'Apple Safari';

  return {
    browser: browserFamily,
    platform: nav.platform || 'Unknown OS',
    language: nav.language || 'en',
    screenResolution: `${scr.width || 0}x${scr.height || 0}`,
    viewportSize: `${window.innerWidth || 0}x${window.innerHeight || 0}`,
    devicePixelRatio: window.devicePixelRatio || 1,
    onlineStatus: nav.onLine ? 'Online' : 'Offline',
    currentRoute: window.location.pathname || '/',
    collectedAtUtc: new Date().toISOString()
  };
};

/**
 * Validation rules for Contact Us form
 */
export const validateContactUs = ({ name, email, subject, message }) => {
  const errors = {};

  if (!name || !name.trim()) {
    errors.name = 'Full name is required.';
  } else if (name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  } else if (name.trim().length > 80) {
    errors.name = 'Name cannot exceed 80 characters.';
  }

  if (!email || !email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please provide a valid email address (e.g., name@domain.com).';
  }

  if (!subject || !subject.trim()) {
    errors.subject = 'Subject is required.';
  } else if (subject.trim().length < 4) {
    errors.subject = 'Subject must be at least 4 characters.';
  } else if (subject.trim().length > 120) {
    errors.subject = 'Subject cannot exceed 120 characters.';
  }

  if (!message || !message.trim()) {
    errors.message = 'Message is required.';
  } else if (message.trim().length < 10) {
    errors.message = 'Please provide more details (at least 10 characters).';
  } else if (message.trim().length > 2000) {
    errors.message = 'Message cannot exceed 2000 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Valid categories for Feedback form
 */
export const FEEDBACK_CATEGORIES = [
  'General feedback',
  'Feature request',
  'User experience',
  'Performance',
  'Accessibility'
];

/**
 * Validation rules for Feedback form
 */
export const validateFeedback = ({ name, email, category, message, pageReference }) => {
  const errors = {};

  if (name && name.trim().length > 80) {
    errors.name = 'Name cannot exceed 80 characters.';
  }

  if (email && email.trim() && !isValidEmail(email)) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!category || !FEEDBACK_CATEGORIES.includes(category)) {
    errors.category = 'Please select a valid feedback category.';
  }

  if (!message || !message.trim()) {
    errors.message = 'Feedback message is required.';
  } else if (message.trim().length < 10) {
    errors.message = 'Feedback must be at least 10 characters.';
  } else if (message.trim().length > 2000) {
    errors.message = 'Feedback cannot exceed 2000 characters.';
  }

  if (pageReference && pageReference.trim().length > 100) {
    errors.pageReference = 'Page or feature reference cannot exceed 100 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validation rules for Bug Report form
 */
export const validateBugReport = ({
  name,
  email,
  bugTitle,
  description,
  stepsToReproduce,
  expectedBehaviour,
  actualBehaviour
}) => {
  const errors = {};

  if (name && name.trim().length > 80) {
    errors.name = 'Reporter name cannot exceed 80 characters.';
  }

  if (email && email.trim() && !isValidEmail(email)) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!bugTitle || !bugTitle.trim()) {
    errors.bugTitle = 'Bug title is required.';
  } else if (bugTitle.trim().length < 5) {
    errors.bugTitle = 'Bug title must be at least 5 characters.';
  } else if (bugTitle.trim().length > 120) {
    errors.bugTitle = 'Bug title cannot exceed 120 characters.';
  }

  if (!description || !description.trim()) {
    errors.description = 'Bug description is required.';
  } else if (description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters.';
  } else if (description.trim().length > 1500) {
    errors.description = 'Description cannot exceed 1500 characters.';
  }

  if (!stepsToReproduce || !stepsToReproduce.trim()) {
    errors.stepsToReproduce = 'Steps to reproduce are required.';
  } else if (stepsToReproduce.trim().length < 10) {
    errors.stepsToReproduce = 'Please outline step-by-step instructions to reproduce.';
  } else if (stepsToReproduce.trim().length > 1500) {
    errors.stepsToReproduce = 'Steps to reproduce cannot exceed 1500 characters.';
  }

  if (!expectedBehaviour || !expectedBehaviour.trim()) {
    errors.expectedBehaviour = 'Expected behaviour is required.';
  } else if (expectedBehaviour.trim().length > 800) {
    errors.expectedBehaviour = 'Expected behaviour cannot exceed 800 characters.';
  }

  if (!actualBehaviour || !actualBehaviour.trim()) {
    errors.actualBehaviour = 'Actual behaviour is required.';
  } else if (actualBehaviour.trim().length > 800) {
    errors.actualBehaviour = 'Actual behaviour cannot exceed 800 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
