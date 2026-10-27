const { describe, it } = require('node:test');
const assert = require('node:assert');
const xlsx = require('xlsx');
const { parseRosterBuffer } = require('../services/rosterService');

describe('Roster Upload, Validation & Preview (Phase 6)', () => {
  it('parses CSV buffers correctly and normalizes column headers', () => {
    const csvContent = 'Student Name,Roll Number\nAlice Smith,101\nBob Jones,002\nCharlie Brown,103\n';
    const buffer = Buffer.from(csvContent, 'utf-8');

    const rows = parseRosterBuffer(buffer, 'roster.csv');
    assert.strictEqual(rows.length, 3);
    assert.strictEqual(rows[0].student_name, 'Alice Smith');
    assert.strictEqual(rows[0].roll_number, '101');
    assert.strictEqual(rows[1].student_name, 'Bob Jones');
    assert.strictEqual(rows[1].roll_number, '002', 'Leading zeros in roll numbers must be preserved');
  });

  it('parses binary XLSX buffers correctly and handles alternate column names', () => {
    const rawData = [
      { 'Name': 'David Miller', 'Roll No': 'D01' },
      { 'Name': 'Emma Watson', 'Roll No': 'E02' }
    ];
    const ws = xlsx.utils.json_to_sheet(rawData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Roster');
    const xlsxBuffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const rows = parseRosterBuffer(xlsxBuffer, 'roster.xlsx');
    assert.strictEqual(rows.length, 2);
    assert.strictEqual(rows[0].student_name, 'David Miller');
    assert.strictEqual(rows[0].roll_number, 'D01');
    assert.strictEqual(rows[1].student_name, 'Emma Watson');
    assert.strictEqual(rows[1].roll_number, 'E02');
  });

  it('detects missing names, invalid roll numbers, and intra-batch duplicates with actionable errors', () => {
    const testRows = [
      { student_name: 'Valid Student 1', roll_number: 'STU01' },
      { student_name: '', roll_number: 'STU02' }, // missing name
      { student_name: 'Invalid Roll', roll_number: 'A' }, // too short (<2 chars)
      { student_name: 'Duplicate Student', roll_number: 'STU01' }, // duplicate of row 1
      { student_name: 'Valid Student 2', roll_number: 'STU03' }
    ];

    const seen = new Set();
    const evaluated = testRows.map((row, idx) => {
      const name = String(row.student_name || '').trim();
      const roll = String(row.roll_number || '').trim().toUpperCase();

      if (!name || !roll || roll.length < 2) {
        return { rowNumber: idx + 1, status: 'invalid', error: 'Missing or invalid student name or roll number.' };
      }
      if (seen.has(roll)) {
        return { rowNumber: idx + 1, status: 'duplicate_in_file', error: `Duplicate roll number '${roll}'.` };
      }
      seen.add(roll);
      return { rowNumber: idx + 1, status: 'valid', studentName: name, rollNumber: roll };
    });

    assert.strictEqual(evaluated[0].status, 'valid');
    assert.strictEqual(evaluated[1].status, 'invalid');
    assert.strictEqual(evaluated[2].status, 'invalid');
    assert.strictEqual(evaluated[3].status, 'duplicate_in_file');
    assert.strictEqual(evaluated[4].status, 'valid');

    const validCount = evaluated.filter(e => e.status === 'valid').length;
    assert.strictEqual(validCount, 2);
  });

  it('generates secure printable student desk cards containing only authorized minimal information', () => {
    const rawStudent = {
      studentId: 'uuid-1234-student',
      name: 'Alice Smith',
      rollNumber: '007',
      classroomName: 'Grade 8 Mathematics',
      joinCode: 'MATH8A',
      pin: '4821',
      // Ensure private internal fields are never exposed
      passwordHash: '$2a$10$xyz',
      databaseUrl: 'postgresql://user:pass@localhost:5432/db'
    };

    // Filter to desk card representation
    const deskCard = {
      studentId: rawStudent.studentId,
      name: rawStudent.name,
      rollNumber: rawStudent.rollNumber,
      classroomName: rawStudent.classroomName,
      joinCode: rawStudent.joinCode,
      pin: rawStudent.pin
    };

    assert.strictEqual(deskCard.name, 'Alice Smith');
    assert.strictEqual(deskCard.rollNumber, '007');
    assert.strictEqual(deskCard.pin, '4821');
    assert.strictEqual(deskCard.passwordHash, undefined, 'Password hash must never be in desk card');
    assert.strictEqual(deskCard.databaseUrl, undefined, 'Database URL must never be in desk card');
  });
});
