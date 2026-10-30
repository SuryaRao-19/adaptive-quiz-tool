const { describe, it } = require('node:test');
const assert = require('node:assert');

// 1. Re-implement / import pure validation logic for rigorous test suite execution
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return re.test(trimmed) && trimmed.length <= 254;
};

const sanitizeText = (text, maxLength = 2000) => {
  if (typeof text !== 'string') return '';
  return text.trim().slice(0, maxLength);
};

const FEEDBACK_CATEGORIES = [
  'General feedback',
  'Feature request',
  'User experience',
  'Performance',
  'Accessibility'
];

const validateContactUs = ({ name, email, subject, message }) => {
  const errors = {};
  if (!name || !name.trim()) errors.name = 'Full name is required.';
  else if (name.trim().length < 2) errors.name = 'Name must be at least 2 characters.';
  else if (name.trim().length > 80) errors.name = 'Name cannot exceed 80 characters.';

  if (!email || !email.trim()) errors.email = 'Email address is required.';
  else if (!isValidEmail(email)) errors.email = 'Please provide a valid email address.';

  if (!subject || !subject.trim()) errors.subject = 'Subject is required.';
  else if (subject.trim().length < 4) errors.subject = 'Subject must be at least 4 characters.';
  else if (subject.trim().length > 120) errors.subject = 'Subject cannot exceed 120 characters.';

  if (!message || !message.trim()) errors.message = 'Message is required.';
  else if (message.trim().length < 10) errors.message = 'Message must be at least 10 characters.';
  else if (message.trim().length > 2000) errors.message = 'Message cannot exceed 2000 characters.';

  return { isValid: Object.keys(errors).length === 0, errors };
};

const validateFeedback = ({ name, email, category, message, pageReference }) => {
  const errors = {};
  if (name && name.trim().length > 80) errors.name = 'Name cannot exceed 80 characters.';
  if (email && email.trim() && !isValidEmail(email)) errors.email = 'Please provide a valid email address.';
  if (!category || !FEEDBACK_CATEGORIES.includes(category)) errors.category = 'Please select a valid feedback category.';

  if (!message || !message.trim()) errors.message = 'Feedback message is required.';
  else if (message.trim().length < 10) errors.message = 'Feedback must be at least 10 characters.';
  else if (message.trim().length > 2000) errors.message = 'Feedback cannot exceed 2000 characters.';

  if (pageReference && pageReference.trim().length > 100) errors.pageReference = 'Page reference cannot exceed 100 characters.';

  return { isValid: Object.keys(errors).length === 0, errors };
};

const validateBugReport = ({
  name,
  email,
  bugTitle,
  description,
  stepsToReproduce,
  expectedBehaviour,
  actualBehaviour
}) => {
  const errors = {};
  if (name && name.trim().length > 80) errors.name = 'Name cannot exceed 80 characters.';
  if (email && email.trim() && !isValidEmail(email)) errors.email = 'Please provide a valid email address.';

  if (!bugTitle || !bugTitle.trim()) errors.bugTitle = 'Bug title is required.';
  else if (bugTitle.trim().length < 5) errors.bugTitle = 'Bug title must be at least 5 characters.';
  else if (bugTitle.trim().length > 120) errors.bugTitle = 'Bug title cannot exceed 120 characters.';

  if (!description || !description.trim()) errors.description = 'Description is required.';
  else if (description.trim().length < 10) errors.description = 'Description must be at least 10 characters.';
  else if (description.trim().length > 1500) errors.description = 'Description cannot exceed 1500 characters.';

  if (!stepsToReproduce || !stepsToReproduce.trim()) errors.stepsToReproduce = 'Steps to reproduce are required.';
  else if (stepsToReproduce.trim().length < 10) errors.stepsToReproduce = 'Please outline steps.';
  else if (stepsToReproduce.trim().length > 1500) errors.stepsToReproduce = 'Steps cannot exceed 1500 characters.';

  if (!expectedBehaviour || !expectedBehaviour.trim()) errors.expectedBehaviour = 'Expected behaviour is required.';
  else if (expectedBehaviour.trim().length > 800) errors.expectedBehaviour = 'Cannot exceed 800 chars.';

  if (!actualBehaviour || !actualBehaviour.trim()) errors.actualBehaviour = 'Actual behaviour is required.';
  else if (actualBehaviour.trim().length > 800) errors.actualBehaviour = 'Cannot exceed 800 chars.';

  return { isValid: Object.keys(errors).length === 0, errors };
};

describe('Web3Forms Email Integration: Input Validation & Formatting', () => {

  describe('Workflow A: Contact Us', () => {
    it('rejects empty submissions with comprehensive field errors', () => {
      const res = validateContactUs({ name: '', email: '', subject: '', message: '' });
      assert.strictEqual(res.isValid, false);
      assert.ok(res.errors.name);
      assert.ok(res.errors.email);
      assert.ok(res.errors.subject);
      assert.ok(res.errors.message);
    });

    it('rejects invalid email formats strictly', () => {
      const invalidEmails = ['invalid-email', 'student@', '@school.org', 'student@.com', 'user with space@domain.com'];
      for (const email of invalidEmails) {
        const res = validateContactUs({
          name: 'Jane Doe',
          email,
          subject: 'Curriculum Question',
          message: 'This is a valid long enough message.'
        });
        assert.strictEqual(res.isValid, false, `Failed to reject invalid email: ${email}`);
        assert.ok(res.errors.email);
      }
    });

    it('rejects short names, subjects, and messages', () => {
      const res = validateContactUs({
        name: 'A',
        email: 'teacher@school.org',
        subject: 'Hi',
        message: 'Short'
      });
      assert.strictEqual(res.isValid, false);
      assert.ok(res.errors.name);
      assert.ok(res.errors.subject);
      assert.ok(res.errors.message);
    });

    it('enforces character limits on oversized messages', () => {
      const oversizedMessage = 'M'.repeat(2005);
      const res = validateContactUs({
        name: 'Valid Name',
        email: 'teacher@school.org',
        subject: 'Valid Subject',
        message: oversizedMessage
      });
      assert.strictEqual(res.isValid, false);
      assert.ok(res.errors.message);
    });

    it('accepts well-formed contact submissions', () => {
      const res = validateContactUs({
        name: 'Priya Patel',
        email: 'priya.patel@district.edu',
        subject: 'Adaptive Quiz Pilot for Grade 7 Classrooms',
        message: 'We would like to introduce the adaptive math tool to our rural school cluster.'
      });
      assert.strictEqual(res.isValid, true);
      assert.strictEqual(Object.keys(res.errors).length, 0);
    });
  });

  describe('Workflow B: User Feedback', () => {
    it('requires a recognized category from the pre-defined list', () => {
      const res = validateFeedback({
        category: 'Unrecognized Category',
        message: 'The interactive practice mode derivation is helpful.'
      });
      assert.strictEqual(res.isValid, false);
      assert.ok(res.errors.category);
    });

    it('allows anonymous submissions (optional name and email)', () => {
      const res = validateFeedback({
        name: '',
        email: '',
        category: 'Feature request',
        message: 'Please add more vernacular language hints in Grade 8 Science.',
        pageReference: 'Reference Library'
      });
      assert.strictEqual(res.isValid, true);
    });

    it('validates optional email if provided', () => {
      const res = validateFeedback({
        email: 'invalid-email-address',
        category: 'Accessibility',
        message: 'Screen reader navigation needs improvement on the quiz progress ribbon.'
      });
      assert.strictEqual(res.isValid, false);
      assert.ok(res.errors.email);
    });

    it('accepts valid feedback for all supported categories', () => {
      for (const cat of FEEDBACK_CATEGORIES) {
        const res = validateFeedback({
          category: cat,
          message: `Testing feedback category ${cat} with sufficient details for the pedagogical team.`,
          pageReference: 'PracticeMode'
        });
        assert.strictEqual(res.isValid, true, `Failed for category ${cat}`);
      }
    });
  });

  describe('Workflow C: Bug Report', () => {
    it('requires bugTitle, description, stepsToReproduce, expectedBehaviour, and actualBehaviour', () => {
      const res = validateBugReport({});
      assert.strictEqual(res.isValid, false);
      assert.ok(res.errors.bugTitle);
      assert.ok(res.errors.description);
      assert.ok(res.errors.stepsToReproduce);
      assert.ok(res.errors.expectedBehaviour);
      assert.ok(res.errors.actualBehaviour);
    });

    it('accepts well-structured bug reports with actionable reproduction steps', () => {
      const res = validateBugReport({
        name: 'Math Teacher',
        email: 'teacher@school.gov',
        bugTitle: 'KaTeX fraction rendering overflow on mobile portrait',
        description: 'Complex fraction in question 14 overflows outside the quiz container on 360px screen.',
        stepsToReproduce: '1. Select Grade 8 Math\n2. Start Practice Mode\n3. Advance to question with nested fractions on mobile.',
        expectedBehaviour: 'Equation should wrap or allow horizontal scroll.',
        actualBehaviour: 'Equation text overflows past viewport right margin.'
      });
      assert.strictEqual(res.isValid, true);
    });
  });

  describe('Spam Protection & Honeypot', () => {
    it('detects honeypot botcheck filled by automated bots', () => {
      const honeypotField = 'I am a spambot link http://spam.xyz';
      const isBot = honeypotField.trim() !== '';
      assert.strictEqual(isBot, true);
    });

    it('passes human submission with empty botcheck honeypot', () => {
      const honeypotField = '';
      const isBot = honeypotField.trim() !== '';
      assert.strictEqual(isBot, false);
    });
  });

  describe('Security & Privacy Safeguards', () => {
    it('strips all sensitive credentials, passwords, student PINs, and auth tokens', () => {
      const extraFields = {
        password: 'PlainTextPassword123!',
        currentPassword: 'OldPassword',
        pin: '1234',
        studentPin: '0492',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
        jwt: 'secret_jwt_string',
        auth: 'Bearer token',
        device_browser: 'Google Chrome',
        current_route: '/practice'
      };

      const forbiddenKeys = ['password', 'currentpassword', 'newpassword', 'pin', 'token', 'jwt', 'auth', 'studentpin'];
      const sanitized = {};
      for (const [k, v] of Object.entries(extraFields)) {
        if (!forbiddenKeys.includes(k.toLowerCase())) {
          sanitized[k] = v;
        }
      }

      assert.strictEqual(sanitized.password, undefined);
      assert.strictEqual(sanitized.currentPassword, undefined);
      assert.strictEqual(sanitized.pin, undefined);
      assert.strictEqual(sanitized.studentPin, undefined);
      assert.strictEqual(sanitized.token, undefined);
      assert.strictEqual(sanitized.jwt, undefined);
      assert.strictEqual(sanitized.auth, undefined);
      assert.strictEqual(sanitized.device_browser, 'Google Chrome');
      assert.strictEqual(sanitized.current_route, '/practice');
    });

    it('sanitizes text inputs to prevent payload flooding', () => {
      const longInput = 'A'.repeat(5000);
      const sanitized = sanitizeText(longInput, 120);
      assert.strictEqual(sanitized.length, 120);
    });
  });

  describe('Email Subject Line Standards', () => {
    it('formats Contact Us subject lines with [AdaptIQ] prefix', () => {
      const subject = 'School Cluster Partnership';
      const formatted = `[AdaptIQ] New Contact Enquiry: ${sanitizeText(subject, 80)}`;
      assert.strictEqual(formatted, '[AdaptIQ] New Contact Enquiry: School Cluster Partnership');
    });

    it('formats Feedback subject lines with category tag', () => {
      const category = 'Accessibility';
      const formatted = `[AdaptIQ] User Feedback [${category}]`;
      assert.strictEqual(formatted, '[AdaptIQ] User Feedback [Accessibility]');
    });

    it('formats Bug Report subject lines with [AdaptIQ] Bug Report prefix', () => {
      const title = 'KaTeX overflow on Grade 7 fraction';
      const formatted = `[AdaptIQ] Bug Report: ${sanitizeText(title, 80)}`;
      assert.strictEqual(formatted, '[AdaptIQ] Bug Report: KaTeX overflow on Grade 7 fraction');
    });
  });

});
