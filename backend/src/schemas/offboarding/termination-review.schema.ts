import { Schema } from 'mongoose';

export const TerminationReviewSchema = new Schema(
  {
    reviewId: { type: String, required: true },
    employeeId: { type: String, required: true },
    type: { type: String, enum: ['voluntary', 'involuntary'], required: true },
    initiatedBy: {
      userId: String,
      name: String,
      role: String,
    },
    reason: String,
    supportingDocuments: [{ type: String }],
    performanceData: {
      recentRatings: [{ type: Number }],
      warningCount: { type: Number, default: 0 },
    },
    decision: {
      status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' },
      decidedBy: String,
      decidedAt: Date,
      notes: String,
    },
    pmWarningId: { type: String, ref: 'PerformanceWarning' }, // Performance Management (Warnings/Low Scores)
    configurationTemplateId: { type: String, ref: 'OffboardingConfigTemplate' }, // None (Configuration)
    employeeProfileId: { type: String, ref: 'EmployeeProfile' }, // For inactive status
  },
  { _id: false },
);

