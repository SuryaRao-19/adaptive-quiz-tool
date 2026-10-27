const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://suryasampathrao_db_user:Adaptiq2026@cluster0.p7ntivh.mongodb.net/adaptiq_db?retryWrites=true&w=majority',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_school_jwt_key_change_in_production_987654321',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // AI Provider configuration (server-side only, never exposed to client)
  AI_PROVIDER: process.env.AI_PROVIDER || 'gemini', // 'gemini' | 'openai'
  AI_API_KEY: process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '',
  AI_MODEL: process.env.AI_MODEL || 'gemini-1.5-flash',

  // Web3Forms access key
  WEB3FORMS_ACCESS_KEY: process.env.WEB3FORMS_ACCESS_KEY || ''
};
