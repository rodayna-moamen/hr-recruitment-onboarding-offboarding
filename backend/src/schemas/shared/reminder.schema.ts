import { Schema } from 'mongoose';

export const ReminderSchema = new Schema(
  {
    reminderId: { type: String, required: true },
    targetEntity: {
      type: String,
      enum: ['onboardingTask', 'documentUpload', 'interview', 'offboardingTask'],
      required: true,
    },
    entityId: { type: String, required: true },
    audience: { type: String, enum: ['candidate', 'newHire', 'manager', 'panel', 'hr'], required: true },
    channel: { type: String, enum: ['email', 'portal', 'sms'], default: 'email' },
    subject: String,
    bodyTemplate: String,
    dueDate: { type: Date, required: true },
    sent: { type: Boolean, default: false },
    sentAt: Date,
  },
  { _id: false },
);

