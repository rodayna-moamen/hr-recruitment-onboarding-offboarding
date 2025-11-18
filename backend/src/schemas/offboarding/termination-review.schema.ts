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
    performanceAppraisalIds: [{ type: String, ref: 'PerformanceAppraisal' }], // References appraisalId in performanceAppraisals collection
    decision: {
      status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' },
      decidedBy: String,
      decidedAt: Date,
      notes: String,
    },
    pmWarningId: String, // Performance warning ID (may be in separate performanceWarnings collection or embedded in performanceAppraisals)
    configurationTemplateId: { type: String, ref: 'OffboardingConfigTemplate' }, // None (Configuration)
    employeeProfileId: { type: String, ref: 'Employee' }, // References employeeId in employees collection
  },
  { _id: false },
);

