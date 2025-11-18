import { Schema } from 'mongoose';

export const SigningBonusSchema = new Schema(
  {
    bonusId: { type: String, required: true },
    employeeId: { type: String, required: true },
    offerId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'EGP' },
    payoutDate: { type: Date, required: true },
    prerequisites: [
      {
        description: String,
        completed: { type: Boolean, default: false },
        completedAt: Date,
      },
    ],
    status: { type: String, enum: ['pending', 'scheduled', 'paid'], default: 'pending' },
    payrollReference: String,
  },
  { _id: false },
);

