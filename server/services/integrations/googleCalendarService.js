/**
 * AdaptIQ 3.0 — Google Calendar & Exam Scheduling Service
 * server/services/integrations/googleCalendarService.js
 * 
 * Provides:
 * - Exam and assessment scheduling.
 * - Standard iCalendar (ICS) string generator for universal calendar downloads.
 * - Direct Google Calendar API v3 event synchronization when access token or API credentials exist.
 */

class GoogleCalendarService {
  constructor() {
    this.apiKey = process.env.GOOGLE_CALENDAR_API_KEY || null;
    this.isConfigured = Boolean(this.apiKey);
  }

  getStatus() {
    return {
      service: 'Google Calendar API',
      configured: this.isConfigured,
      mode: this.isConfigured ? 'LIVE_API' : 'ICS_EXPORT_SANDBOX'
    };
  }

  /**
   * Schedule an assessment event
   * @param {Object} eventDetails
   * @param {string} eventDetails.title
   * @param {string} eventDetails.description
   * @param {Date|string} eventDetails.startTime
   * @param {number} [eventDetails.durationMinutes=45]
   * @param {string} [accessToken]
   * @returns {Promise<Object>}
   */
  async scheduleAssessmentEvent(eventDetails, accessToken) {
    const start = new Date(eventDetails.startTime || Date.now());
    const durationMin = eventDetails.durationMinutes || 45;
    const end = new Date(start.getTime() + (durationMin * 60 * 1000));

    if (this.isConfigured && accessToken) {
      try {
        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            summary: eventDetails.title,
            description: eventDetails.description || 'AdaptIQ School Assessment',
            start: { dateTime: start.toISOString() },
            end: { dateTime: end.toISOString() },
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'popup', minutes: 30 },
                { method: 'email', minutes: 120 }
              ]
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          return {
            id: data.id,
            htmlLink: data.htmlLink,
            status: 'CONFIRMED_GOOGLE_CALENDAR',
            start: data.start,
            end: data.end
          };
        }
      } catch (err) {
        console.warn('[GoogleCalendarService] Live calendar sync failed, falling back to ICS:', err.message);
      }
    }

    // Generate RFC 5545 iCalendar format string
    const icsContent = this.generateIcsString({
      uid: `adaptiq_evt_${Date.now()}@aps-school.in`,
      title: eventDetails.title,
      description: eventDetails.description,
      start,
      end
    });

    return {
      id: `local_evt_${Date.now()}`,
      status: 'SCHEDULED_LOCAL',
      title: eventDetails.title,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationMinutes: durationMin,
      icsDataUrl: `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`,
      icsContent
    };
  }

  /**
   * Helper to build valid ICS file content
   */
  generateIcsString({ uid, title, description, start, end }) {
    const formatDate = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Asian Public School//AdaptIQ 3.0 Assessment Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(start)}`,
      `DTEND:${formatDate(end)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description || 'AdaptIQ Assessment'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
  }
}

module.exports = new GoogleCalendarService();
