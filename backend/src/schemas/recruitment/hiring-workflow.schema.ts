import { Schema } from 'mongoose';

export const HiringWorkflowSchema = new Schema(
  {
    workflowId: { type: String, required: true },
    name: { type: String, required: true },
    stages: [
      {
        stageId: { type: String, required: true },
        label: { type: String, required: true },
        order: { type: Number, required: true },
        slaHours: { type: Number, default: 48 },
        autoAdvanceOn: [{ type: String, enum: ['completion', 'rejection', 'offerAccepted'] }],
        notifications: [
          {
            channel: { type: String, enum: ['email', 'portal', 'sms'], default: 'email' },
            templateCode: String,
            trigger: { type: String, enum: ['enter', 'exit'], default: 'enter' },
            audiences: [{ type: String, enum: ['candidate', 'recruiter', 'panel', 'manager'] }],
          },
        ],
        scoringTemplateId: String,
      },
    ],
    defaultStageId: String,
    completionStageId: String,
    metricsConfig: {
      trackTimePerStage: { type: Boolean, default: true },
      trackConversionRates: { type: Boolean, default: true },
    },
  },
  { _id: false },
);

