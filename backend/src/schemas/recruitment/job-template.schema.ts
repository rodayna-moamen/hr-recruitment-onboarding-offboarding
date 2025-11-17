import { Schema } from 'mongoose';

export const JobTemplateSchema = new Schema(
  {
    templateId: { type: String, required: true },
    title: { type: String, required: true },
    department: {
      id: { type: String, required: true },
      name: { type: String, required: true },
    },
    locationDefaults: [{ type: String }],
    employmentTypes: [
      { type: String, enum: ['full-time', 'part-time', 'contract', 'internship'] },
    ],
    jobSummary: { type: String, required: true },
    responsibilities: [{ type: String }],
    qualifications: [{ type: String }],
    skills: [{ type: String }],
    brandContent: {
      heroTitle: String,
      highlights: [{ type: String }],
      mediaAssets: [{ type: String }],
    },
    approvalMatrix: [
      {
        role: { type: String, required: true },
        required: { type: Boolean, default: true },
      },
    ],
    metadata: {
      createdBy: String,
      updatedBy: String,
      version: { type: String, default: '1.0' },
    },
  },
  { _id: false },
);

