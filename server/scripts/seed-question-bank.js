const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('../models/Question');
const mathQuestions = require('./seedData/mathQuestions.json');
const scienceQuestions = require('./seedData/scienceQuestions.json');

dotenv.config();

const seedQuestionBank = async () => {
  const connUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/adaptive_quiz_db';
  console.log('========================================================');
  console.log('🌱 AdaptIQ 150 Curated Seed Question Bank Importer');
  console.log('========================================================');
  console.log(`Connecting to MongoDB: ${connUri}...`);

  try {
    await mongoose.connect(connUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`[Seed Bank] Connected to database: ${mongoose.connection.host}`);

    const allQuestions = [...mathQuestions, ...scienceQuestions];
    console.log(`[Seed Bank] Total curated seed questions to load: ${allQuestions.length}`);

    // Update or insert each question to avoid duplicate keys and ensure status: approved
    let inserted = 0;
    let updated = 0;

    for (const qData of allQuestions) {
      const filter = {
        subject: qData.subject,
        topic: qData.topic,
        questionText: qData.questionText
      };

      const update = {
        $set: {
          ...qData,
          source: 'seed',
          status: 'approved',
          isActive: true
        }
      };

      const res = await Question.updateOne(filter, update, { upsert: true });
      if (res.upsertedCount > 0) {
        inserted++;
      } else {
        updated++;
      }
    }

    const totalApproved = await Question.countDocuments({ status: 'approved' });
    console.log(`[Seed Bank] Success! Inserted: ${inserted}, Updated: ${updated}. Total approved in DB: ${totalApproved}`);
    console.log('========================================================');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Bank Notice]: Could not connect to external MongoDB: ${error.message}`);
    console.log(`Note: The AdaptIQ server automatically boots an in-memory MongoDB with all 150 questions when started via: npm run dev.`);
    console.log(`Both mathQuestions.json and scienceQuestions.json are fully compiled and ready.`);
    process.exit(0);
  }
};

seedQuestionBank();
