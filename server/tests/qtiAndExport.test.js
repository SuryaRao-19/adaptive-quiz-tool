const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  sanitizeCsvValue,
  escapeCsvField,
  calculateNormalizedGain,
  generateGradebookCsv
} = require('../utils/gradebookExporter');
const { escapeXml, generateQtiXml } = require('../utils/qtiExporter');

describe('Gradebook Exporter - Security & Normalized Gain Math', () => {
  it('protects against formula injection / DDE attacks on leading special characters', () => {
    assert.strictEqual(sanitizeCsvValue('=SUM(A1:A10)'), "'=SUM(A1:A10)");
    assert.strictEqual(sanitizeCsvValue('+cmd|/c calc'), "'+cmd|/c calc");
    assert.strictEqual(sanitizeCsvValue('-10'), "'-10");
    assert.strictEqual(sanitizeCsvValue('@SUM'), "'@SUM");
    assert.strictEqual(sanitizeCsvValue('\tTAB'), "'\tTAB");
    assert.strictEqual(sanitizeCsvValue('Regular Student'), 'Regular Student');
  });

  it('escapes quotes and commas in CSV fields', () => {
    assert.strictEqual(escapeCsvField('Smith, John'), '"Smith, John"');
    assert.strictEqual(escapeCsvField('Name with "Quotes"'), '"Name with ""Quotes"""');
  });

  it('calculates normalized learning gain g = (Post - Pre) / (100 - Pre) correctly', () => {
    // Pre = 40, Post = 70 -> gain = (70 - 40) / (100 - 40) = 30 / 60 = 0.5 (50%)
    const res = calculateNormalizedGain(40, 70);
    assert.strictEqual(res.gainFraction, 0.5);
    assert.strictEqual(res.gainPercent, 50);
    assert.strictEqual(res.gainPercentString, '+50%');
    assert.strictEqual(res.status, 'computed');
  });

  it('handles negative learning gain when post-test is lower than pre-test', () => {
    // Pre = 60, Post = 50 -> (50 - 60) / (100 - 60) = -10 / 40 = -0.25 (-25%)
    const res = calculateNormalizedGain(60, 50);
    assert.strictEqual(res.gainFraction, -0.25);
    assert.strictEqual(res.gainPercent, -25);
    assert.strictEqual(res.gainPercentString, '-25%');
  });

  it('handles boundary condition when pre-test is 100 without dividing by zero', () => {
    const res = calculateNormalizedGain(100, 100);
    assert.strictEqual(res.gainFraction, null);
    assert.strictEqual(res.gainPercentString, 'N/A (Pre-test 100%)');
    assert.strictEqual(res.status, 'pre_test_maxed');
  });

  it('handles missing scores gracefully', () => {
    const res1 = calculateNormalizedGain(null, 70);
    assert.strictEqual(res1.gainPercentString, 'N/A');
    const res2 = calculateNormalizedGain(40, null);
    assert.strictEqual(res2.gainPercentString, 'N/A');
  });

  it('generates compliant CSV with preserved leading zeros in roll numbers', () => {
    const records = [
      {
        rollNumber: '007',
        fullName: 'James Bond',
        preScore: 40,
        postScore: 80,
        questionsPracticed: 55
      }
    ];

    const csv = generateGradebookCsv(records);
    assert.match(csv, /="007"/, 'Preserves leading zeros in roll number');
    assert.match(csv, /James Bond/);
    assert.match(csv, /\+66\.7%/);
  });
});

describe('IMS QTI v2.1 Exporter', () => {
  it('escapes XML special characters safely', () => {
    assert.strictEqual(escapeXml('x < y & a > b "quote"'), 'x &lt; y &amp; a &gt; b &quot;quote&quot;');
  });

  it('generates valid IMS QTI v2.1 XML package for multiple choice items', () => {
    const sampleQuestions = [
      {
        _id: 'q_test_1',
        topic: 'Fractions',
        questionText: 'What is 1/2 + 1/4?',
        options: ['2/6', '3/4', '3/6', '1/6'],
        correctAnswerIndex: 1,
        explanation: 'Find common denominator 4. 2/4 + 1/4 = 3/4.'
      }
    ];

    const xml = generateQtiXml(sampleQuestions, 'Math Diagnostic QTI');
    assert.match(xml, /xmlns="http:\/\/www\.imsglobal\.org\/xsd\/imsqti_v2p1"/);
    assert.match(xml, /<assessmentItem/);
    assert.match(xml, /<responseDeclaration identifier="RESPONSE"/);
    assert.match(xml, /<correctResponse>\s*<value>ChoiceB<\/value>\s*<\/correctResponse>/);
    assert.match(xml, /<itemBody>\s*<p>What is 1\/2 \+ 1\/4\?<\/p>/);
    assert.match(xml, /<simpleChoice identifier="ChoiceB">3\/4<\/simpleChoice>/);
    assert.match(xml, /Find common denominator 4/);
  });
});
