import { Schema } from 'mongoose';

export const OnboardingTrackerSchema = new Schema(
  {
    trackerId: { type: String, required: true },
    employeeId: { type: String, required: true },
    checklistId: { type: String, required: true },
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },
    milestones: [
      {
        milestoneId: String,
        title: String,
        completed: { type: Boolean, default: false },
        completedAt: Date,
      },
    ],
    notifications: [{ type: String }],
    blockers: [
      {
        description: String,
        reportedAt: Date,
        resolvedAt: Date,
      },
    ],
    lastUpdatedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

