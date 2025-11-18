import { Schema } from 'mongoose';

export const OnboardingChecklistSchema = new Schema(
  {
    checklistId: { type: String, required: true },
    employeeId: { type: String, required: true },
    templateCode: { type: String, required: true },
    tasks: [
      {
        taskId: { type: String, required: true },
        title: { type: String, required: true },
        description: String,
        responsible: {
          type: String,
          enum: ['newHire', 'hr', 'manager', 'it', 'payroll'],
          default: 'newHire',
        },
        status: {
          type: String,
          enum: ['pending', 'in-progress', 'blocked', 'completed'],
          default: 'pending',
        },
        dueDate: Date,
        completedAt: Date,
        dependencies: [{ type: String }],
        reminders: [{ type: String }],
      },
    ],
    documentsRequired: [{ type: String }],
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started',
    },
    startDate: Date,
    endDate: Date,
    provisioningPlanId: String,
    configurationTemplateId: { type: String, ref: 'OnboardingConfigTemplate' }, // Ref: None (Configuration)
    notificationId: { type: String, ref: 'Notification' }, // References notificationId in notifications collection
  },
  { _id: false },
);

