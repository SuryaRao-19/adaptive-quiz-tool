/**
 * Gradebook Exporter Utility
 * Standardized Gradebook formatting with formula injection safety, normalized gain calculation,
 * and support for both CSV and XLSX binary exports.
 */
const xlsx = require('xlsx');

/**
 * Formula injection prevention (CSV Injection / DDE attack)
 * Any field starting with =, +, -, @, \t, \r must be prefixed with a single quote.
 */
function sanitizeCsvValue(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

/**
 * Escape CSV field (quotes and commas)
 */
function escapeCsvField(val) {
  const sanitized = sanitizeCsvValue(val);
  if (/[",\n\r]/.test(sanitized)) {
    return `"${sanitized.replace(/"/g, '""')}"`;
  }
  return sanitized;
}

/**
 * Calculate Normalized Learning Gain:
 * g = (Post - Pre) / (100 - Pre)
 * 
 * Handled edge cases:
 * - Pre === 100: Denominator is 0 -> 'N/A (Pre-test 100%)'
 * - Either score missing: 'N/A'
 * - Negative gains: Allowed and computed accurately (e.g. -12.5%)
 */
function calculateNormalizedGain(preScore, postScore) {
  if (preScore === null || preScore === undefined || postScore === null || postScore === undefined) {
    return { gainFraction: null, gainPercentString: 'N/A', status: 'missing_scores' };
  }

  const pre = Number(preScore);
  const post = Number(postScore);

  if (isNaN(pre) || isNaN(post)) {
    return { gainFraction: null, gainPercentString: 'N/A', status: 'invalid_scores' };
  }

  if (pre >= 100) {
    return { gainFraction: null, gainPercentString: 'N/A (Pre-test 100%)', status: 'pre_test_maxed' };
  }

  const denominator = 100 - pre;
  const numerator = post - pre;
  const gain = numerator / denominator;
  const gainPercent = Math.round(gain * 1000) / 10; // e.g. 45.2%

  const sign = gainPercent > 0 ? '+' : '';
  return {
    gainFraction: Math.round(gain * 10000) / 10000,
    gainPercent,
    gainPercentString: `${sign}${gainPercent}%`,
    status: 'computed'
  };
}

/**
 * Generate CSV Gradebook string
 */
function generateGradebookCsv(records) {
  const headers = [
    'Student Roll Number',
    'Student Name',
    'Pre-Test Score (%)',
    'Post-Test Score (%)',
    'Normalized Gain (g)',
    'Practice Questions Completed',
    'Mastery Status',
    'Assessment Status',
    'Report Generated Timestamp'
  ];

  const timestamp = new Date().toISOString();

  const rows = records.map(r => {
    const gainObj = calculateNormalizedGain(r.preScore, r.postScore);
    
    // Preserve leading zeros by wrapping roll number as text formula ="..." or string
    const rollFormatted = r.rollNumber !== undefined ? `="${sanitizeCsvValue(r.rollNumber)}"` : '';

    return [
      rollFormatted,
      escapeCsvField(r.fullName || r.studentName),
      r.preScore !== null && r.preScore !== undefined ? `${r.preScore}%` : 'N/A',
      r.postScore !== null && r.postScore !== undefined ? `${r.postScore}%` : 'N/A',
      escapeCsvField(gainObj.gainPercentString),
      r.questionsPracticed ?? 0,
      escapeCsvField(r.masteryStatus || (r.postScore >= 80 ? 'Mastered' : r.postScore >= 60 ? 'Proficient' : 'Developing')),
      escapeCsvField(r.assessmentStatus || (r.postScore !== null ? 'Completed' : r.preScore !== null ? 'In Practice' : 'Not Started')),
      escapeCsvField(timestamp)
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Generate XLSX Gradebook binary Buffer
 */
function generateGradebookXlsx(records) {
  const timestamp = new Date().toISOString();

  const dataRows = records.map(r => {
    const gainObj = calculateNormalizedGain(r.preScore, r.postScore);
    return {
      'Roll Number': String(r.rollNumber || ''),
      'Student Name': r.fullName || r.studentName || '',
      'Pre-Test Score (%)': r.preScore !== null && r.preScore !== undefined ? r.preScore : 'N/A',
      'Post-Test Score (%)': r.postScore !== null && r.postScore !== undefined ? r.postScore : 'N/A',
      'Normalized Gain (g)': gainObj.gainPercentString,
      'Practice Questions Answered': r.questionsPracticed ?? 0,
      'Mastery Status': r.masteryStatus || (r.postScore >= 80 ? 'Mastered' : r.postScore >= 60 ? 'Proficient' : 'Developing'),
      'Assessment Status': r.assessmentStatus || (r.postScore !== null ? 'Completed' : r.preScore !== null ? 'In Practice' : 'Not Started'),
      'Generated At': timestamp
    };
  });

  const worksheet = xlsx.utils.json_to_sheet(dataRows);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Class Gradebook');

  return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

module.exports = {
  sanitizeCsvValue,
  escapeCsvField,
  calculateNormalizedGain,
  generateGradebookCsv,
  generateGradebookXlsx
};
