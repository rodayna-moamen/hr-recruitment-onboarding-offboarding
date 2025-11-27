// backend/testDummyData.js

console.log("🚀 Starting testDummyData script...");

require('dotenv').config();
const mongoose = require('mongoose');
const { recruitmentJobs, onboardingTasks, offboardingTasks } = require('./dummyData');

// Collection names
const collections = {
  recruitmentJobs: 'recruitmentJobs',
  onboardingTasks: 'onboardingTasks',
  offboardingTasks: 'offboardingTasks'
};

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Helper function to insert array data safely
    const insertData = async (collectionName, dataArray) => {
      if (!Array.isArray(dataArray) || dataArray.length === 0) {
        console.warn(`⚠️ No data to insert for ${collectionName}`);
        return;
      }
      await db.collection(collectionName).deleteMany({});
      const result = await db.collection(collectionName).insertMany(dataArray);
      console.log(`✅ Inserted ${result.insertedCount} documents into ${collectionName}`);
    };

    // Insert all collections
    await insertData(collections.recruitmentJobs, recruitmentJobs);
    await insertData(collections.onboardingTasks, onboardingTasks);
    await insertData(collections.offboardingTasks, offboardingTasks);

    mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
