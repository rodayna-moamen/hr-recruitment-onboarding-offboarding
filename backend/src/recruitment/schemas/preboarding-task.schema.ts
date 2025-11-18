import { Schema } from 'mongoose';

export const PreboardingTaskSchema = new Schema(
  {
    taskId: { type: String, required: true },
    offerId: { type: String, required: true },
    type: {
      type: String,
      enum: ['contract-signing', 'form-submission', 'equipment', 'compliance'],
      required: true,
    },
    title: { type: String, required: true },
    description: String,
    checklistItems: [
      {
        label: String,
        required: { type: Boolean, default: true },
        completed: { type: Boolean, default: false },
        completedAt: Date,
      },
    ],
    assignee: {
      type: String,
      enum: ['candidate', 'hr', 'it', 'payroll'],
      default: 'candidate',
    },
    dueDate: Date,
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    linkedOnboardingChecklistId: String,
  },
  { _id: false },
);

