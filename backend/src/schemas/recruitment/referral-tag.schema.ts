import { Schema } from 'mongoose';

export const ReferralTagSchema = new Schema(
  {
    referralId: { type: String, required: true },
    candidateId: { type: String, required: true },
    source: { type: String, enum: ['employee', 'partner', 'program', 'other'], required: true },
    referredBy: {
      employeeId: String,
      name: String,
      department: String,
    },
    priorityBand: { type: String, enum: ['standard', 'priority'], default: 'priority' },
    benefitsAwarded: {
      fastTrackInterview: { type: Boolean, default: false },
      referralBonusEligible: { type: Boolean, default: false },
    },
    notes: String,
  },
  { _id: false },
);

