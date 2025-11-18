import { Schema } from 'mongoose';

export const JobPostingSchema = new Schema(
  {
    postingId: { type: String, required: true },
    requisitionId: { type: String, required: true },
    templateId: String,
    channel: { type: String, enum: ['internal', 'external', 'referral', 'agency'], required: true },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    branding: {
      heroTitle: String,
      employerValueProps: [{ type: String }],
      mediaAssets: [{ type: String }],
      footerText: String,
    },
    previewUrl: String,
    publishedAt: Date,
    expiresAt: Date,
    seo: {
      slug: String,
      keywords: [{ type: String }],
      metaDescription: String,
    },
    orgStructureJobId: { type: String, ref: 'OrganizationalJob' }, // Reference to Organizational Structure/Job
  },
  { _id: false },
);

