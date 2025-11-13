// testDummyData.js

console.log("🚀 Starting testDummyData script...");

require('dotenv').config();
const mongoose = require('mongoose');
const { recruitmentJobs, onboardingTasks, offboardingTasks } = require('./dummyData');

// Replace with your actual collection names
const recruitmentJobsCollection = 'recruitmentJobs';
const onboardingTasksCollection = 'onboardingTasks';
const offboardingTasksCollection = 'offboardingTasks';

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Insert Recruitment Jobs
    await db.collection(recruitmentJobsCollection).deleteMany({});
    await db.collection(recruitmentJobsCollection).insertMany(recruitmentJobs);
    console.log(`✅ Inserted ${recruitmentJobs.length} recruitmentJobs`);

    // Insert Onboarding Tasks
    await db.collection(onboardingTasksCollection).deleteMany({});
    await db.collection(onboardingTasksCollection).insertMany(onboardingTasks);
    console.log(`✅ Inserted ${onboardingTasks.length} onboardingTasks`);

    // Insert Offboarding Tasks
    await db.collection(offboardingTasksCollection).deleteMany({});
    await db.collection(offboardingTasksCollection).insertMany(offboardingTasks);
    console.log(`✅ Inserted ${offboardingTasks.length} offboardingTasks`);

    mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
