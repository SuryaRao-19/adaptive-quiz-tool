const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://suryasampathrao_db_user:Adaptiq2026@cluster0.p7ntivh.mongodb.net/adaptiq_db?retryWrites=true&w=majority',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://adaptiq_user:adaptiq_password_2026@localhost:5432/adaptiq_db?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_school_jwt_key_change_in_production_987654321',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // AdaptIQ 3.0 Deterministic Adaptive Engine Mode
  ADAPTIVE_ENGINE_MODE: process.env.ADAPTIVE_ENGINE_MODE || 'DETERMINISTIC_RULE_BASED',

  // Google Classroom Integration
  GOOGLE_CLASSROOM_API_KEY: process.env.GOOGLE_CLASSROOM_API_KEY || '',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',

  // YouTube Data API v3
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || '',

  // Google Books API
  GOOGLE_BOOKS_API_KEY: process.env.GOOGLE_BOOKS_API_KEY || '',

  // Google Calendar API
  GOOGLE_CALENDAR_API_KEY: process.env.GOOGLE_CALENDAR_API_KEY || '',

  // Brevo (Sendinblue) Transactional Email
  BREVO_API_KEY: process.env.BREVO_API_KEY || '',
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL || 'notifications@aps-school.in',
  BREVO_SENDER_NAME: process.env.BREVO_SENDER_NAME || 'Asian Public School — AdaptIQ',

  // Sentry Telemetry
  SENTRY_DSN: process.env.SENTRY_DSN || '',

  // Web3Forms
  WEB3FORMS_ACCESS_KEY: process.env.WEB3FORMS_ACCESS_KEY || '',

  // Deprecated Legacy Keys (Kept empty/dynamic for backward compatibility)
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  AI_API_KEY: process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  OMNIROUTE_API_KEY: process.env.OMNIROUTE_API_KEY || ''
};
