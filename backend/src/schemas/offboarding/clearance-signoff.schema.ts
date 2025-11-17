import { Schema } from 'mongoose';

export const ClearanceSignOffSchema = new Schema(
  {
    signOffId: { type: String, required: true },
    employeeId: { type: String, required: true },
    departments: [
      {
        name: { type: String, enum: ['IT', 'Finance', 'Facilities', 'HR', 'LineManager'], required: true },
        approverId: String,
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        approvedAt: Date,
        notes: String,
      },
    ],
    outstandingItems: [
      {
        description: String,
        department: String,
        resolved: { type: Boolean, default: false },
      },
    ],
    clearanceStatusUpdateId: { type: String, ref: 'ClearanceStatusUpdate' }, // For department clearance status updates
  },
  { _id: false },
);

