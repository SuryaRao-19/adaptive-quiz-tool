const { describe, it } = require('node:test');
const assert = require('node:assert');
const xlsx = require('xlsx');
const {
  generateGradebookXlsx,
  generateGradebookCsv,
  sanitizeCsvValue,
  calculateNormalizedGain
} = require('../utils/gradebookExporter');

describe('Gradebook XLSX & CSV Export Services (Phase 7)', () => {
  const sampleRecords = [
    {
      rollNumber: '007',
      fullName: 'Alice Smith',
      preScore: 40,
      postScore: 80,
      questionsPracticed: 35,
      masteryStatus: 'Mastered',
      assessmentStatus: 'Completed'
    },
    {
      rollNumber: '008',
      fullName: 'Bob Jones',
      preScore: 60,
      postScore: 50, // negative gain
      questionsPracticed: 20,
      masteryStatus: 'Developing',
      assessmentStatus: 'Completed'
    },
    {
      rollNumber: '009',
      fullName: '=cmd|"/C calc"!A0', // formula injection attempt in student name
      preScore: 100, // maxed pre-test
      postScore: 100,
      questionsPracticed: 50,
      masteryStatus: 'Mastered',
      assessmentStatus: 'Completed'
    }
  ];

  it('generates valid XLSX binary buffer with zip/xlsx magic bytes (PK)', () => {
    const xlsxBuffer = generateGradebookXlsx(sampleRecords);
    assert(Buffer.isBuffer(xlsxBuffer), 'Result must be a Buffer');
    assert(xlsxBuffer.length > 100, 'XLSX buffer must be non-empty');

    // Check ZIP magic header: 0x50 0x4B 0x03 0x04 ("PK..")
    assert.strictEqual(xlsxBuffer[0], 0x50);
    assert.strictEqual(xlsxBuffer[1], 0x4B);
    assert.strictEqual(xlsxBuffer[2], 0x03);
    assert.strictEqual(xlsxBuffer[3], 0x04);
  });

  it('generates an XLSX workbook parseable by spreadsheet engines with correct sheet name and rows', () => {
    const xlsxBuffer = generateGradebookXlsx(sampleRecords);
    const workbook = xlsx.read(xlsxBuffer, { type: 'buffer' });

    assert(workbook.SheetNames.includes('Class Gradebook'), 'Must contain Class Gradebook worksheet');
    const sheet = workbook.Sheets['Class Gradebook'];
    const rows = xlsx.utils.sheet_to_json(sheet);

    assert.strictEqual(rows.length, 3);
    assert.strictEqual(rows[0]['Roll Number'], '007', 'Leading zero preserved');
    assert.strictEqual(rows[0]['Student Name'], 'Alice Smith');
    assert.strictEqual(rows[0]['Normalized Gain (g)'], '+66.7%');
    assert.strictEqual(rows[1]['Normalized Gain (g)'], '-25%');
    assert.strictEqual(rows[2]['Normalized Gain (g)'], 'N/A (Pre-test 100%)');
  });

  it('sanitizes formula injection characters (=, +, -, @, \\t, \\r) in CSV export', () => {
    assert.strictEqual(sanitizeCsvValue('=1+1'), '\'=1+1');
    assert.strictEqual(sanitizeCsvValue('+cmd'), '\'+cmd');
    assert.strictEqual(sanitizeCsvValue('-100'), '\'-100');
    assert.strictEqual(sanitizeCsvValue('@SUM(A1:A5)'), '\'@SUM(A1:A5)');
    assert.strictEqual(sanitizeCsvValue('\ttab'), '\'\ttab');
    assert.strictEqual(sanitizeCsvValue('Regular Name'), 'Regular Name');
  });

  it('generates compliant CSV gradebook with sanitized fields', () => {
    const csvString = generateGradebookCsv(sampleRecords);
    assert(typeof csvString === 'string');
    assert(csvString.includes('Student Roll Number'));
    assert(csvString.includes('="007"'), 'Roll number wrapped to preserve leading zeros in Excel CSV');
    assert(csvString.includes('\'=cmd'), 'Formula injection in name must be escaped');
  });

  it('computes normalized learning gain and handles edge cases accurately', () => {
    // Normal positive gain: (80 - 40) / (100 - 40) = 40 / 60 = 0.6667 -> 66.7%
    const g1 = calculateNormalizedGain(40, 80);
    assert.strictEqual(g1.gainPercentString, '+66.7%');
    assert.strictEqual(g1.status, 'computed');

    // Negative gain: (50 - 60) / (100 - 60) = -10 / 40 = -0.25 -> -25%
    const g2 = calculateNormalizedGain(60, 50);
    assert.strictEqual(g2.gainPercentString, '-25%');
    assert.strictEqual(g2.status, 'computed');

    // Pre-test 100%: denominator is 0
    const g3 = calculateNormalizedGain(100, 100);
    assert.strictEqual(g3.gainPercentString, 'N/A (Pre-test 100%)');
    assert.strictEqual(g3.status, 'pre_test_maxed');

    // Missing score
    const g4 = calculateNormalizedGain(null, 75);
    assert.strictEqual(g4.gainPercentString, 'N/A');
    assert.strictEqual(g4.status, 'missing_scores');
  });
});
