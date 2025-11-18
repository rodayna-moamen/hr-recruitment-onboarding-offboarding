import { Schema } from 'mongoose';

export const AccessRevocationSchema = new Schema(
  {
    revocationId: { type: String, required: true },
    employeeId: { type: String, required: true },
    systems: [
      {
        systemName: { type: String, required: true },
        accountId: String,
        revokeAt: Date,
        revokedAt: Date,
        status: { type: String, enum: ['scheduled', 'in-progress', 'completed'], default: 'scheduled' },
      },
    ],
    assetsRecovered: [
      {
        assetTag: String,
        status: { type: String, enum: ['pending', 'returned'], default: 'pending' },
        receivedBy: String,
        receivedAt: Date,
      },
    ],
    owner: {
      department: { type: String, default: 'IT' },
      contact: String,
    },
  },
  { _id: false },
);

