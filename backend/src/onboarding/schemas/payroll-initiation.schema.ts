import { Schema } from 'mongoose';

export const PayrollInitiationSchema = new Schema(
  {
    payrollId: { type: String, required: true },
    employeeId: { type: String, required: true },
    contractId: { type: String, required: true },
    startCycleDate: { type: Date, required: true },
    payrollSystem: { type: String, required: true },
    costCenterId: String,
    salaryDetails: {
      base: Number,
      allowances: [
        {
          label: String,
          amount: Number,
        },
      ],
      currency: { type: String, default: 'EGP' },
    },
    bonuses: [
      {
        bonusType: { type: String, enum: ['signing', 'performance'] },
        amount: Number,
        payoutCycle: String,
      },
    ],
    status: { type: String, enum: ['pending', 'submitted', 'active'], default: 'pending' },
    submittedAt: Date,
    syncReference: String,
  },
  { _id: false },
);

