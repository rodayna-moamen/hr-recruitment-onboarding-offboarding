import { Schema } from 'mongoose';

export const RecruitmentAnalyticsSchema = new Schema(
  {
    analyticsId: { type: String, required: true },
    requisitionId: { type: String, required: true },
    metrics: {
      timeToFillDays: Number,
      timeInStageHours: [
        {
          stageId: String,
          label: String,
          hours: Number,
        },
      ],
      sourceEffectiveness: [
        {
          source: String,
          applications: Number,
          hires: Number,
          conversionRate: Number,
        },
      ],
      offerAcceptanceRate: Number,
      interviewsPerHire: Number,
    },
    dashboardFilters: {
      departmentIds: [{ type: String }],
      locations: [{ type: String }],
      timePeriod: {
        start: Date,
        end: Date,
      },
    },
    generatedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

