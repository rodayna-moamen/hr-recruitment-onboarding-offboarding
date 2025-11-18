import { Schema } from 'mongoose';

export const CandidateConsentSchema = new Schema(
  {
    consentId: { type: String, required: true },
    candidateId: { type: String, required: true },
    type: {
      type: String,
      enum: ['personal-data', 'background-check', 'document-retention'],
      required: true,
    },
    status: { type: String, enum: ['pending', 'granted', 'revoked'], default: 'pending' },
    capturedAt: { type: Date, default: Date.now },
    capturedBy: {
      userId: String,
      name: String,
    },
    referenceDocument: String,
    expiryDate: Date,
    auditTrail: [
      {
        status: { type: String, enum: ['pending', 'granted', 'revoked'] },
        updatedAt: { type: Date, default: Date.now },
        updatedBy: String,
        notes: String,
      },
    ],
  },
  { _id: false },
);

