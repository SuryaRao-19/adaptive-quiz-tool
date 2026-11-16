/**
 * AdaptIQ 3.0 — Comprehensive Modular API Integrations Test Suite
 * server/tests/integrations.test.js
 * 
 * Verifies:
 * - Google Classroom Service
 * - YouTube Educational Discovery Service
 * - Google Books Reference Service
 * - Google Calendar & ICS Generator Service
 * - Brevo Transactional Email Service
 * - Sentry Telemetry Service
 * - Document Processing & Syllabus Extraction Service
 * - Unified Integrations Status Reporter
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const {
  googleClassroomService,
  youtubeService,
  googleBooksService,
  googleCalendarService,
  brevoEmailService,
  sentryService,
  documentProcessingService,
  getIntegrationsStatus
} = require('../services/integrations');

describe('AdaptIQ 3.0 — Modular Integration Services', () => {

  test('1. Google Classroom service lists courses and student rosters with graceful fallback', async () => {
    const status = googleClassroomService.getStatus();
    assert.strictEqual(status.service, 'Google Classroom');

    const courses = await googleClassroomService.listCourses();
    assert.ok(Array.isArray(courses));
    assert.ok(courses.length >= 2);
    assert.ok(courses.some(c => c.name.includes('Grade 10-A')));

    const roster = await googleClassroomService.getCourseRoster('aps_classroom_g10_math');
    assert.ok(Array.isArray(roster));
    assert.ok(roster.length >= 2);

    const syncResult = await googleClassroomService.syncAssignment('aps_classroom_g10_math', {
      title: 'Quadratic Equations Adaptive Practice'
    });
    assert.ok(syncResult.id);
  });

  test('2. YouTube service searches educational videos with memory cache and curated catalog', async () => {
    const status = youtubeService.getStatus();
    assert.strictEqual(status.service, 'YouTube Data API v3');

    const videos = await youtubeService.searchEducationalVideos({
      query: 'Photosynthesis light reaction',
      grade: '10',
      subject: 'Science'
    });

    assert.ok(Array.isArray(videos));
    assert.ok(videos.length > 0);
    assert.ok(videos[0].title);
    assert.ok(videos[0].videoUrl);

    // Verify cache stores query
    assert.ok(youtubeService.cache.size >= 1);
  });

  test('3. Google Books service retrieves NCERT reference textbooks and study guides', async () => {
    const status = googleBooksService.getStatus();
    assert.strictEqual(status.service, 'Google Books API');

    const books = await googleBooksService.searchBooks({
      query: 'Trigonometry',
      grade: '10',
      subject: 'Mathematics'
    });

    assert.ok(Array.isArray(books));
    assert.ok(books.length >= 1);
    assert.ok(books.some(b => b.title.includes('NCERT')));
  });

  test('4. Google Calendar service schedules assessments and generates valid RFC 5545 ICS string', async () => {
    const status = googleCalendarService.getStatus();
    assert.strictEqual(status.service, 'Google Calendar API');

    const eventResult = await googleCalendarService.scheduleAssessmentEvent({
      title: 'Class 10-A Mathematics Periodic Test 1',
      description: 'CBSE Term 1 Diagnostic Assessment',
      startTime: new Date(Date.now() + 86400000).toISOString(),
      durationMinutes: 60
    });

    assert.ok(eventResult.id);
    assert.ok(eventResult.icsContent);
    assert.ok(eventResult.icsContent.includes('BEGIN:VCALENDAR'));
    assert.ok(eventResult.icsContent.includes('END:VCALENDAR'));
    assert.ok(eventResult.icsContent.includes('Class 10-A Mathematics Periodic Test 1'));
  });

  test('5. Brevo Email service delivers transactional notifications with formatted HTML', async () => {
    const status = brevoEmailService.getStatus();
    assert.strictEqual(status.service, 'Brevo (Sendinblue) Email');

    const emailRes = await brevoEmailService.sendAssessmentResultsNotification({
      studentEmail: 'aarav.sharma@aps-school.in',
      studentName: 'Aarav Sharma',
      assessmentTitle: 'Term 1 Mid-Term Science',
      scorePercentage: 92,
      rankOrBand: 'Exemplary'
    });

    assert.strictEqual(emailRes.success, true);
    assert.ok(emailRes.messageId);
    assert.ok(brevoEmailService.sentLog.length >= 1);
  });

  test('6. Sentry service logs errors, messages, and breadcrumbs without throwing unhandled exceptions', () => {
    const status = sentryService.getStatus();
    assert.strictEqual(status.service, 'Sentry Telemetry');

    const errorLog = sentryService.captureException(new Error('Test handled exception for telemetry audit'));
    assert.strictEqual(errorLog.logged, true);

    const messageLog = sentryService.captureMessage('Audit verification message', 'info');
    assert.strictEqual(messageLog.level, 'info');

    const breadcrumb = sentryService.addBreadcrumb({ category: 'auth', message: 'User logged in' });
    assert.strictEqual(breadcrumb.recorded, true);
  });

  test('7. Document processing service extracts chapters and learning objectives without LLMs', () => {
    const syllabusText = `
      Chapter 1: Chemical Reactions and Equations
      • Chemical equation and balanced chemical equations
      • Types of chemical reactions: combination, decomposition, displacement
      • Oxidation and reduction effects in everyday life: corrosion, rancidity

      Chapter 2: Acids, Bases and Salts
      • Chemical properties of acids and bases
      • pH scale and importance in everyday life
      • Preparation and uses of Bleaching Powder, Baking Soda, Washing Soda
    `;

    const extracted = documentProcessingService.extractCurriculumStructure(syllabusText, {
      grade: '10',
      subject: 'Science'
    });

    assert.strictEqual(extracted.success, true);
    assert.strictEqual(extracted.totalChaptersFound, 2);
    assert.strictEqual(extracted.chapters[0].title, 'Chemical Reactions and Equations');
    assert.ok(extracted.chapters[0].learningObjectives.length >= 3);
    assert.strictEqual(extracted.chapters[1].title, 'Acids, Bases and Salts');
  });

  test('8. Unified Integrations status returns health for all 7 integration modules', () => {
    const allStatuses = getIntegrationsStatus();
    assert.strictEqual(allStatuses.length, 7);
    const serviceNames = allStatuses.map(s => s.service);
    assert.ok(serviceNames.includes('Google Classroom'));
    assert.ok(serviceNames.includes('YouTube Data API v3'));
    assert.ok(serviceNames.includes('Google Books API'));
    assert.ok(serviceNames.includes('Google Calendar API'));
    assert.ok(serviceNames.includes('Brevo (Sendinblue) Email'));
    assert.ok(serviceNames.includes('Sentry Telemetry'));
    assert.ok(serviceNames.includes('Document & Syllabus Processor'));
  });
});
