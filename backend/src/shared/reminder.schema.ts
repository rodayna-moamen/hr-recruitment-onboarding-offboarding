import { Schema } from 'mongoose';

export const ReminderSchema = new Schema(
  {
    reminderId: { type: String, required: true },
    taskId: String,
    recipientId: { type: String, required: true },
    recipientType: { type: String, enum: ['candidate', 'employee', 'hr', 'manager'], required: true },
    channel: { type: String, enum: ['email', 'sms', 'portal', 'push'], default: 'email' },
    message: { type: String, required: true },
    dueDate: Date,
    sentAt: Date,
    status: { type: String, enum: ['pending', 'sent', 'delivered', 'failed'], default: 'pending' },
    retryCount: { type: Number, default: 0 },
  },
  { _id: false },
);

