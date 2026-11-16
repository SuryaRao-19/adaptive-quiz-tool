/**
 * AdaptIQ 3.0 — Modular Integrations Registry
 * server/services/integrations/index.js
 */

const googleClassroomService = require('./googleClassroomService');
const youtubeService = require('./youtubeService');
const googleBooksService = require('./googleBooksService');
const googleCalendarService = require('./googleCalendarService');
const brevoEmailService = require('./brevoEmailService');
const sentryService = require('./sentryService');
const documentProcessingService = require('./documentProcessingService');

function getIntegrationsStatus() {
  return [
    googleClassroomService.getStatus(),
    youtubeService.getStatus(),
    googleBooksService.getStatus(),
    googleCalendarService.getStatus(),
    brevoEmailService.getStatus(),
    sentryService.getStatus(),
    documentProcessingService.getStatus()
  ];
}

module.exports = {
  googleClassroomService,
  youtubeService,
  googleBooksService,
  googleCalendarService,
  brevoEmailService,
  sentryService,
  documentProcessingService,
  getIntegrationsStatus
};
