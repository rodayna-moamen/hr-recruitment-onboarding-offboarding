import { Schema } from 'mongoose';

export const CommunicationLogSchema = new Schema(
  {
    communicationId: { type: String, required: true },
    audienceType: {
      type: String,
      enum: ['candidate', 'recruiter', 'panel', 'manager', 'newHire'],
      required: true,
    },
    channel: { type: String, enum: ['email', 'sms', 'portal', 'webhook'], default: 'email' },
    templateCode: String,
    subject: String,
    payload: Schema.Types.Mixed,
    status: { type: String, enum: ['queued', 'sent', 'failed'], default: 'queued' },
    relatedEntities: {
      requisitionId: String,
      applicationId: String,
      interviewId: String,
      offerId: String,
      onboardingId: String,
      offboardingId: String,
    },
    triggeredBy: {
      userId: String,
      name: String,
      subsystem: {
        type: String,
        enum: ['recruitment', 'onboarding', 'offboarding'],
      },
    },
    sentAt: Date,
    error: Schema.Types.Mixed,
  },
  { _id: false },
);

