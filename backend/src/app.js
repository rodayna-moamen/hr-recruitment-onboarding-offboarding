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

// CRUD routes generator
const createCollectionRoutes = (path, collectionName, idField) => {

  // READ ALL
  app.get(`/api/${path}`, async (req, res) => {
    try {
      const collection = getCollection(collectionName);
      const docs = await collection.find({}).toArray();
      res.json(docs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // READ ONE
  app.get(`/api/${path}/:id`, async (req, res) => {
    try {
      const collection = getCollection(collectionName);
      const doc = await collection.findOne({ [idField]: req.params.id });
      if (!doc) return res.status(404).json({ error: 'Record not found' });
      res.json(doc);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // CREATE
  app.post(`/api/${path}`, async (req, res) => {
    try {
      const collection = getCollection(collectionName);
      const result = await collection.insertOne(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // UPDATE
  app.put(`/api/${path}/:id`, async (req, res) => {
    try {
      const collection = getCollection(collectionName);
      const result = await collection.updateOne(
        { [idField]: req.params.id },
        { $set: req.body }
      );
      if (result.matchedCount === 0) return res.status(404).json({ error: 'Record not found' });
      res.json({ message: 'Updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE
  app.delete(`/api/${path}/:id`, async (req, res) => {
    try {
      const collection = getCollection(collectionName);
      const result = await collection.deleteOne({ [idField]: req.params.id });
      if (result.deletedCount === 0) return res.status(404).json({ error: 'Record not found' });
      res.json({ message: 'Deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

};

// Add CRUD routes for all collections
createCollectionRoutes('recruitment-jobs', 'recruitmentJobs', 'jobId');
createCollectionRoutes('onboarding-tasks', 'onboardingTasks', 'onboardingId');
createCollectionRoutes('offboarding-tasks', 'offboardingTasks', 'offboardingId');

module.exports = app;

