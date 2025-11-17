import { Schema } from 'mongoose';

export const AccessProvisioningSchema = new Schema(
  {
    provisioningId: { type: String, required: true },
    employeeId: { type: String, required: true },
    systems: [
      {
        systemName: { type: String, required: true },
        accessLevel: String,
        accountEmail: String,
        status: { type: String, enum: ['pending', 'requested', 'completed'], default: 'pending' },
        requestedAt: Date,
        completedAt: Date,
      },
    ],
    ssoSetup: {
      status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
      completedAt: Date,
    },
    revocationPlan: {
      scheduledAt: Date,
      revokeOnExit: { type: Boolean, default: true },
    },
    owner: {
      team: { type: String, enum: ['it', 'security'] },
      contact: String,
    },
  },
  { _id: false },
);

