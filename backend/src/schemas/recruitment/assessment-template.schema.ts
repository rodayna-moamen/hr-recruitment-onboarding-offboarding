import { Schema } from 'mongoose';

export const AssessmentTemplateSchema = new Schema(
  {
    templateId: { type: String, required: true },
    name: { type: String, required: true },
    roleFamily: String,
    version: { type: String, default: '1.0' },
    applicableStages: [{ type: String }],
    criteria: [
      {
        criterionId: { type: String, required: true },
        label: { type: String, required: true },
        description: String,
        weight: { type: Number, default: 1 },
        scoringScale: {
          min: { type: Number, default: 1 },
          max: { type: Number, default: 5 },
          labels: [{ type: String }],
        },
      },
    ],
    audit: {
      approvedBy: String,
      approvedAt: Date,
      policyRef: String,
    },
    status: { type: String, enum: ['draft', 'active', 'retired'], default: 'active' },
  },
  { _id: false },
);

