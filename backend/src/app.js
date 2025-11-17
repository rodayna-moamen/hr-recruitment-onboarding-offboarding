const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());

const getCollection = (name) => {
  if (!mongoose.connection.db) {
    throw new Error('MongoDB connection is not ready.');
  }

  return mongoose.connection.db.collection(name);
};

app.get('/', (req, res) => {
  res.json({
    message: 'HR Recruitment, Onboarding, and Offboarding API',
    status: 'running',
    endpoints: {
      recruitmentJobs: '/api/recruitment-jobs',
      onboardingTasks: '/api/onboarding-tasks',
      offboardingTasks: '/api/offboarding-tasks',
    },
  });
});

const createCollectionRoutes = (path, collectionName, idField) => {
  app.get(`/api/${path}`, async (req, res) => {
    try {
      const collection = getCollection(collectionName);
      const docs = await collection.find({}).toArray();
      res.json(docs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get(`/api/${path}/:id`, async (req, res) => {
    try {
      const collection = getCollection(collectionName);
      const doc = await collection.findOne({ [idField]: req.params.id });

      if (!doc) {
        return res.status(404).json({ error: 'Record not found' });
      }

      res.json(doc);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

createCollectionRoutes('recruitment-jobs', 'recruitmentJobs', 'jobId');
createCollectionRoutes('onboarding-tasks', 'onboardingTasks', 'onboardingId');
createCollectionRoutes('offboarding-tasks', 'offboardingTasks', 'offboardingId');

module.exports = app;
