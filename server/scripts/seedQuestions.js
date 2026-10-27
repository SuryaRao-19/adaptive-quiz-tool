const dns = require('dns');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { seedData } = require('./seedFunction');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {}

dotenv.config();

const seedDatabase = async () => {
  const connUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/adaptive_quiz_db';
  try {
    console.log(`[Seed Script] Connecting to MongoDB: ${connUri}...`);
    await mongoose.connect(connUri, { serverSelectionTimeoutMS: 3000 });
    console.log('[Seed Script] Connected. Populating question bank and demo accounts...');
    await seedData();
    console.log('[Seed Script] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Script Error]: Could not connect to ${connUri} (${error.message})`);
    console.log(`[Notice] If you do not have MongoDB installed locally, you don't need to run 'npm run seed'!`);
    console.log(`The server now automatically starts a zero-config in-memory MongoDB and seeds all questions when you run: npm run dev`);
    process.exit(0);
  }
};

seedDatabase();
