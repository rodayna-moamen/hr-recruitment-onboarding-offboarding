import { Schema } from 'mongoose';

export const ContractSubmissionSchema = new Schema(
  {
    submissionId: { type: String, required: true },
    offerId: { type: String, required: true },
    candidateId: { type: String, required: true },
    contractUrl: { type: String, required: true },
    signedAt: { type: Date, required: true },
    signerIp: String,
    receivedBy: {
      userId: String,
      name: String,
    },
    status: { type: String, enum: ['pending', 'validated', 'needs-correction'], default: 'pending' },
    validationNotes: String,
  },
  { _id: false },
);

