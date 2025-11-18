import { Schema } from 'mongoose';

export const CandidateConsentSchema = new Schema(
  {
    status: { type: String, enum: ['pending', 'granted', 'revoked'], default: 'pending' },
    capturedAt: Date,
    reference: String,
  },
  { _id: false },
);

export const CandidateProfileSchema = new Schema(
  {
    candidateId: { type: String, required: true },
    personalInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      preferredName: String,
      nationality: String,
      currentLocation: String,
    },
    contact: {
      email: { type: String, required: true },
      phone: String,
      linkedin: String,
    },
    experienceYears: { type: Number, min: 0 },
    education: [
      {
        degree: String,
        major: String,
        institution: String,
        graduationYear: Number,
      },
    ],
    documents: [
      {
        type: { type: String, enum: ['cv', 'portfolio', 'certification', 'id', 'other'] },
        fileName: String,
        url: String,
        uploadedAt: Date,
      },
    ],
    referrals: [
      {
        referralId: String,
        source: { type: String, enum: ['employee', 'alumni', 'agency', 'other'] },
        referredByEmployeeId: String,
        priorityScore: Number,
      },
    ],
    consent: {
      personalDataProcessing: CandidateConsentSchema,
      backgroundCheck: CandidateConsentSchema,
    },
    portalAccess: {
      status: { type: String, enum: ['invited', 'active', 'locked'], default: 'invited' },
      lastLoginAt: Date,
    },
    tags: [{ type: String }],
    talentPoolStatus: {
      type: String,
      enum: ['active', 'inactive', 'hired', 'blacklisted'],
      default: 'active',
    },
  },
  { _id: false },
);

