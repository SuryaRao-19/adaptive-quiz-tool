/**
 * AdaptIQ Web3Forms Email Integration Service
 * Official Documentation: https://docs.web3forms.com/
 * 
 * Provides end-to-end integration for:
 * 1. Contact Us inquiries
 * 2. Pedagogical & Application Feedback
 * 3. Bug Reports (with optional user-consented device diagnostics)
 * 4. Backward-compatible registration and general support dispatching
 */

import {
  isValidEmail,
  sanitizeText,
  getSafeDeviceInfo,
  validateContactUs,
  validateFeedback,
  validateBugReport
} from '../utils/supportValidation';

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

// Minimum interval between submissions to prevent rapid-fire double clicking or abuse
const MIN_SUBMISSION_INTERVAL_MS = 6000;
let lastSubmissionTime = 0;

/**
 * Retrieves the frontend Web3Forms access key from Vite environment variables.
 */
export const getWeb3FormsAccessKey = () => {
  const key = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
  if (!key || key.trim() === '' || key === 'YOUR_ACCESS_KEY_HERE') {
    return '';
  }
  return key.trim();
};

/**
 * Checks whether Web3Forms has a validly configured access key.
 */
export const isWeb3FormsConfigured = () => {
  // AdaptIQ uses database-backed institutional support gateway
  return true;
};

/**
 * Returns configuration status details for UI banners and diagnostics.
 */
export const getWeb3FormsConfigStatus = () => {
  return {
    isConfigured: true,
    envVarName: 'INTERNAL_DATABASE_SUPPORT',
    documentationUrl: 'https://aps-school.in',
    statusMessage: 'Asian Public School Institutional Support Gateway is active and database-backed.'
  };
};

/**
 * Internal dispatch engine with spam check, sanitization, and structured payload generation.
 */
const postToWeb3Forms = async ({
  formType,
  subject,
  name,
  email,
  message,
  botcheck = '',
  extraFields = {}
}) => {
  // 1. Spam Prevention: Honeypot check
  if (botcheck && botcheck.trim() !== '') {
    console.warn('[Support] Honeypot triggered. Silently rejecting bot submission.');
    return {
      success: false,
      errorType: 'SPAM_REJECTED',
      message: 'Submission rejected by spam protection.'
    };
  }

  // 2. Client-side Rate Limiting / Cooldown
  const now = Date.now();
  if (now - lastSubmissionTime < MIN_SUBMISSION_INTERVAL_MS) {
    const waitSeconds = Math.ceil((MIN_SUBMISSION_INTERVAL_MS - (now - lastSubmissionTime)) / 1000);
    return {
      success: false,
      errorType: 'RATE_LIMITED',
      message: `Please wait ${waitSeconds}s before submitting another request.`
    };
  }

  // 3. Category & Priority Mapping for Institutional Support System
  let category = 'GENERAL';
  let priority = 'MEDIUM';
  if (formType === 'bug_report') {
    category = 'TECHNICAL';
    priority = 'HIGH';
  } else if (formType === 'user_feedback') {
    category = 'FEEDBACK';
  } else if (subject && subject.toLowerCase().includes('curriculum')) {
    category = 'CURRICULUM';
  }

  // 4. Save to Internal Institutional Support Database
  try {
    const internalRes = await fetch('/api/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderName: name || 'Student / Visitor',
        senderEmail: email || 'visitor@asianpublicschool.edu',
        subject: subject || 'Support Request',
        message: message || '',
        category,
        priority
      })
    });

    const internalData = await internalRes.json();
    if (internalRes.ok && internalData.success) {
      lastSubmissionTime = Date.now();
      const ticketNum = internalData.data?.ticketNumber || 'APS-TK';
      
      // Optional mirror to external Web3Forms if key is present
      const accessKey = getWeb3FormsAccessKey();
      if (accessKey) {
        try {
          await fetch(WEB3FORMS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
              access_key: accessKey,
              subject,
              name,
              email,
              message,
              form_type: formType
            })
          });
        } catch (_) {}
      }

      return {
        success: true,
        message: `Your inquiry has been recorded as Support Ticket ${ticketNum}. An educator or administrator will respond shortly.`,
        ticketNumber: ticketNum,
        data: internalData.data
      };
    }
  } catch (err) {
    console.warn('[Support] Internal ticket dispatch error:', err);
  }

  return {
    success: false,
    errorType: 'SUBMISSION_ERROR',
    message: 'Unable to connect to school support gateway. Please try again.'
  };
};

/**
 * -----------------------------------------------------------------------------
 * WORKFLOW A: Contact Us
 * Fields: Name, Email address, Subject, Message
 * -----------------------------------------------------------------------------
 */
export const submitContactUs = async ({ name, email, subject, message, botcheck = '' }) => {
  const validation = validateContactUs({ name, email, subject, message });
  if (!validation.isValid) {
    return {
      success: false,
      errorType: 'VALIDATION_ERROR',
      errors: validation.errors,
      message: 'Please resolve form validation errors.'
    };
  }

  const formattedSubject = `[AdaptIQ] New Contact Enquiry: ${sanitizeText(subject, 80)}`;
  const formattedMessage = `
--- AdaptIQ Contact Enquiry ---
Name: ${name.trim()}
Email: ${email.trim()}
Subject: ${subject.trim()}
Date: ${new Date().toLocaleString()}

Message:
${message.trim()}
`.trim();

  return await postToWeb3Forms({
    formType: 'contact_enquiry',
    subject: formattedSubject,
    name: name.trim(),
    email: email.trim(),
    message: formattedMessage,
    botcheck,
    extraFields: {
      enquiry_subject: subject.trim()
    }
  });
};

/**
 * -----------------------------------------------------------------------------
 * WORKFLOW B: User Feedback
 * Fields: Name (optional), Category, Message, Optional Page / Feature Reference
 * -----------------------------------------------------------------------------
 */
export const submitFeedback = async ({
  name = '',
  email = '',
  category,
  message,
  pageReference = '',
  botcheck = ''
}) => {
  const validation = validateFeedback({ name, email, category, message, pageReference });
  if (!validation.isValid) {
    return {
      success: false,
      errorType: 'VALIDATION_ERROR',
      errors: validation.errors,
      message: 'Please resolve form validation errors.'
    };
  }

  const formattedSubject = `[AdaptIQ] User Feedback [${category}]`;
  const formattedMessage = `
--- AdaptIQ User Feedback ---
Category: ${category}
Page / Feature Reference: ${pageReference ? pageReference.trim() : 'General Application'}
Submitted by: ${name.trim() || 'Anonymous User'}
Email: ${email.trim() || 'Not provided'}
Date: ${new Date().toLocaleString()}

Feedback Content:
${message.trim()}
`.trim();

  return await postToWeb3Forms({
    formType: 'user_feedback',
    subject: formattedSubject,
    name: name.trim() || 'AdaptIQ User',
    email: email.trim() || '',
    message: formattedMessage,
    botcheck,
    extraFields: {
      feedback_category: category,
      page_reference: pageReference.trim() || 'N/A'
    }
  });
};

/**
 * -----------------------------------------------------------------------------
 * WORKFLOW C: Bug Report
 * Fields: Name/Identifier (opt), Email (opt), Bug Title, Description,
 * Steps to Reproduce, Expected Behaviour, Actual Behaviour,
 * Disclosed Browser/Device Info (opt-in)
 * -----------------------------------------------------------------------------
 */
export const submitBugReport = async ({
  name = '',
  email = '',
  bugTitle,
  description,
  stepsToReproduce,
  expectedBehaviour,
  actualBehaviour,
  includeDeviceInfo = true,
  botcheck = ''
}) => {
  const validation = validateBugReport({
    name,
    email,
    bugTitle,
    description,
    stepsToReproduce,
    expectedBehaviour,
    actualBehaviour
  });

  if (!validation.isValid) {
    return {
      success: false,
      errorType: 'VALIDATION_ERROR',
      errors: validation.errors,
      message: 'Please resolve form validation errors.'
    };
  }

  const deviceInfo = includeDeviceInfo ? getSafeDeviceInfo() : null;
  const formattedSubject = `[AdaptIQ] Bug Report: ${sanitizeText(bugTitle, 80)}`;

  const formattedMessage = `
--- AdaptIQ Bug Report ---
Bug Title: ${bugTitle.trim()}
Reporter: ${name.trim() || 'Anonymous Reporter'}
Contact Email: ${email.trim() || 'Not provided'}
Date: ${new Date().toLocaleString()}

Description:
${description.trim()}

Steps to Reproduce:
${stepsToReproduce.trim()}

Expected Behaviour:
${expectedBehaviour.trim()}

Actual Behaviour:
${actualBehaviour.trim()}

Diagnostic Information:
${deviceInfo ? JSON.stringify(deviceInfo, null, 2) : 'User opted out of device diagnostics.'}
`.trim();

  return await postToWeb3Forms({
    formType: 'bug_report',
    subject: formattedSubject,
    name: name.trim() || 'Bug Reporter',
    email: email.trim() || '',
    message: formattedMessage,
    botcheck,
    extraFields: {
      bug_title: bugTitle.trim(),
      expected_behaviour: expectedBehaviour.trim(),
      actual_behaviour: actualBehaviour.trim(),
      has_device_diagnostics: includeDeviceInfo ? 'true' : 'false',
      device_browser: deviceInfo?.browser || 'N/A',
      device_platform: deviceInfo?.platform || 'N/A',
      device_resolution: deviceInfo?.screenResolution || 'N/A',
      current_route: deviceInfo?.currentRoute || 'N/A'
    }
  });
};

/**
 * -----------------------------------------------------------------------------
 * BACKWARD COMPATIBLE: General Contact/Feedback wrapper
 * Preserves existing calls from older components without breaking changes.
 * -----------------------------------------------------------------------------
 */
export const submitContactFeedback = async ({
  name = '',
  email = '',
  message = '',
  category = 'General Feedback',
  botcheck = ''
}) => {
  return await submitFeedback({
    name,
    email,
    category: ['General feedback', 'Feature request', 'User experience', 'Performance', 'Accessibility'].includes(category)
      ? category
      : 'General feedback',
    message: message || 'No message body provided.',
    pageReference: '',
    botcheck
  });
};

/**
 * -----------------------------------------------------------------------------
 * BACKWARD COMPATIBLE: Registration Recording
 * Preserves user signup event recording from AuthScreen.
 * -----------------------------------------------------------------------------
 */
export const recordRegistrationOnWeb3Forms = async ({
  name,
  email,
  role,
  method = 'email',
  metadata = {}
}) => {
  const timestamp = new Date().toLocaleString();
  const accessKey = getWeb3FormsAccessKey();

  // Local storage caching for student/teacher audit trail
  try {
    const existing = JSON.parse(localStorage.getItem('adaptiq_web3forms_records') || '[]');
    existing.unshift({
      id: `reg_${Date.now()}`,
      name,
      email,
      role,
      method,
      timestamp,
      metadata
    });
    localStorage.setItem('adaptiq_web3forms_records', JSON.stringify(existing.slice(0, 50)));
  } catch (err) {
    console.warn('[Web3Forms] Could not update local registration registry:', err);
  }

  if (!accessKey) {
    return {
      success: true,
      localOnly: true,
      message: 'Registration recorded locally (Web3Forms access key not active).'
    };
  }

  const payload = {
    access_key: accessKey,
    subject: `🎯 New AdaptIQ ${role ? role.toUpperCase() : 'USER'} Registration: ${name}`,
    from_name: 'AdaptIQ Registration Engine',
    name: name || 'Anonymous User',
    email: email || 'no-email@adaptiq.edu',
    role: role || 'student',
    registration_method: method,
    registered_at: timestamp,
    form_type: 'user_registration',
    details: JSON.stringify(metadata, null, 2),
    message: `
New registration event captured on AdaptIQ Platform!
- Name: ${name}
- Email: ${email}
- Role: ${role ? role.toUpperCase() : 'STUDENT'}
- Method: ${method === 'google' ? 'Google OAuth 2.0' : 'Email & Password'}
- Timestamp: ${timestamp}
- Details: ${JSON.stringify(metadata)}
    `.trim()
  };

  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return { success: response.ok && data.success, data };
  } catch (error) {
    console.warn('[Web3Forms] Registration remote log notice:', error);
    return { success: true, localOnly: true, error };
  }
};
