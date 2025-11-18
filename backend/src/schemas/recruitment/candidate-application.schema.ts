import { Schema } from 'mongoose';
import { CandidateConsentSchema } from './candidate-profile.schema';

export const CandidateApplicationSchema = new Schema(
  {
    applicationId: { type: String, required: true },
    candidateId: { type: String, required: true },
    requisitionId: { type: String, required: true },
    source: {
      type: String,
      enum: ['career-site', 'referral', 'agency', 'internal', 'social'],
      default: 'career-site',
    },
    status: {
      type: String,
      enum: ['screening', 'shortlisting', 'interview', 'offer', 'hired', 'rejected'],
      required: true,
    },
    currentStageId: String,
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },
    stageHistory: [
      {
        stageId: { type: String, required: true },
        stageName: String,
        status: { type: String, enum: ['pending', 'in-progress', 'completed', 'rejected'] },
        updatedBy: {
          userId: String,
          name: String,
          role: String,
        },
        updatedAt: { type: Date, default: Date.now },
        comments: String,
      },
    ],
    attachments: [
      {
        type: String,
        fileName: String,
        url: String,
      },
    ],
    referralTag: {
      priorityBand: { type: String, enum: ['standard', 'priority'], default: 'standard' },
      notes: String,
    },
    consent: {
      personalDataProcessing: CandidateConsentSchema,
      backgroundCheck: CandidateConsentSchema,
    },
    communicationLogIds: [{ type: String }],
    analyticsId: String,
    cvs: [{ type: String }], // Array of CV/document IDs (documents may be in attachments or separate collection)
    statusTrackingId: { type: String }, // Status is tracked within application.status field, this is for external tracking if needed
    referralSource: String, // Referral source (embedded in application.source field or separate source info)
  },
  { _id: false },
);

