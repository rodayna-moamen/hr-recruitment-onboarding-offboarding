import { Schema } from 'mongoose';

export const OffboardingNotificationSchema = new Schema(
  {
    notificationId: { type: String, required: true },
    employeeId: { type: String, required: true },
    type: {
      type: String,
      enum: ['benefits-termination', 'final-pay', 'manager-alert', 'employee-update'],
      required: true,
    },
    channel: { type: String, enum: ['email', 'portal', 'system'], default: 'email' },
    payload: Schema.Types.Mixed,
    sentAt: Date,
    triggeredBy: String,
    status: { type: String, enum: ['queued', 'sent', 'failed'], default: 'queued' },
    employeeProfileId: { type: String, ref: 'Employee' }, // References employeeId in employees collection
    leaveIds: [{ type: String, ref: 'Leave' }], // References leaveId in leaves collection (for encashment calculation)
    employeeBenefitsId: String, // Employee benefits reference (may be in separate collection or embedded in employee/payroll)
  },
  { _id: false },
);

