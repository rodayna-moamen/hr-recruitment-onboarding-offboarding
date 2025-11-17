import { Schema } from 'mongoose';

export const InterviewFeedbackSchema = new Schema(
  {
    feedbackId: { type: String, required: true },
    interviewId: { type: String, required: true },
    reviewerId: { type: String, required: true },
    reviewerName: String,
    submittedAt: { type: Date, default: Date.now },
    ratings: [
      {
        criterionId: { type: String, required: true },
        label: String,
        score: { type: Number, required: true },
        weight: Number,
        comments: String,
      },
    ],
    overallRecommendation: {
      type: String,
      enum: ['strong-hire', 'hire', 'hold', 'no-hire'],
    },
    attachments: [
      {
        fileName: String,
        url: String,
      },
    ],
  },
  { _id: false },
);

