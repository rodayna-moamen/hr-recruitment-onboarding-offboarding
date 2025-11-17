import { Schema } from 'mongoose';

export const OffboardingChecklistSchema = new Schema(
  {
    checklistId: { type: String, required: true },
    employeeId: { type: String, required: true },
    exitType: { type: String, enum: ['resignation', 'termination'], required: true },
    tasks: [
      {
        taskId: { type: String, required: true },
        title: String,
        department: { type: String, enum: ['HR', 'IT', 'Finance', 'Facilities', 'Security'] },
        status: {
          type: String,
          enum: ['pending', 'in-progress', 'completed'],
          default: 'pending',
        },
        dueDate: Date,
        completedAt: Date,
      },
    ],
    assetReturnPlanId: String,
    clearanceSignOffId: String,
    finalSettlementId: String,
    configurationTemplateId: { type: String, ref: 'OffboardingConfigTemplate' }, // None (Configuration)
    clearanceStatusUpdateIds: [{ type: String, ref: 'ClearanceStatusUpdate' }], // Clearance Status Updates (from Depts)
    employeeProfileId: { type: String, ref: 'EmployeeProfile' }, // For resignation reason / employee link
  },
  { _id: false },
);

