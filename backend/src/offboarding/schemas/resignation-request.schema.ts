import { Schema } from 'mongoose';

export const ResignationRequestSchema = new Schema(
  {
    requestId: { type: String, required: true },
    employeeId: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
    reason: { type: String, required: true },
    lastWorkingDay: { type: Date, required: true },
    status: {
      type: String,
      enum: ['submitted', 'under-review', 'approved', 'retracted'],
      default: 'submitted',
    },
    history: [
      {
        status: String,
        updatedAt: Date,
        updatedBy: String,
        notes: String,
      },
    ],
    attachments: [{ type: String }],
  },
  { _id: false },
);

