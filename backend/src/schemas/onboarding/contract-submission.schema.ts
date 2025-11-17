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
    recruitmentOfferLetterId: { type: String, ref: 'OfferLetter' }, // Recruitment (Signed Offer Letter/Contract)
    contractSigningDate: { type: Date, required: false }, // Recruitment (Contract Signing Date)
    contractDetailsId: { type: String, ref: 'ContractDetails' }, // Recruitment (Contract Details)
    newHireInputId: { type: String, ref: 'NewHireProfile' }, // None (New Hire Input)
  },
  { _id: false },
);

