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
    templateId: { type: String, ref: 'HiringProcessTemplate' }, // Hiring process template reference
    evaluationCriteriaId: { type: String, ref: 'EvaluationCriteria' }, // REC-015 ref
    timeManagementEventId: { type: String, ref: 'TimeManagementEvent' }, // Calendar/time mgmt external ref
    interviewPanelFeedbackIds: [{ type: String, ref: 'InterviewFeedback' }],
    interviewPanelMemberIds: [{ type: String, ref: 'PanelMember' }],
  },
  { _id: false },
);

