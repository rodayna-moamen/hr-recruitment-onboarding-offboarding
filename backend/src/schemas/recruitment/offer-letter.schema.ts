import { Schema } from 'mongoose';

export const OfferLetterSchema = new Schema(
  {
    offerId: { type: String, required: true },
    applicationId: { type: String, required: true },
    templateCode: { type: String, required: true },
    status: {
      type: String,
      enum: ['draft', 'pending-approval', 'sent', 'accepted', 'declined', 'expired'],
      default: 'draft',
    },
    compensation: {
      currency: { type: String, default: 'EGP' },
      baseSalary: Number,
      allowances: [
        {
          label: String,
          amount: Number,
        },
      ],
      bonus: {
        type: {
          type: String,
          enum: ['signing', 'retention', 'performance'],
        },
        amount: Number,
        payoutDate: Date,
      },
      benefits: [{ type: String }],
    },
    approvals: [
      {
        sequence: { type: Number, required: true },
        approverRole: { type: String, required: true },
        approverId: String,
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        actedAt: Date,
        comments: String,
      },
    ],
    documents: [
      {
        fileName: String,
        url: String,
        signerType: { type: String, enum: ['candidate', 'employer'] },
        signedAt: Date,
        signatureProvider: String,
      },
    ],
    acceptance: {
      acceptedAt: Date,
      acceptedBy: String,
      signedDocumentUrl: String,
    },
    preboardingTasks: [{ type: String }],
    integrationRefs: {
      payrollEmployeeId: String,
      onboardingChecklistId: String,
    },
    expiresAt: Date,
    financialApprovalId: { type: String, ref: 'FinancialApproval' }, // REC-027
    offerTemplateId: { type: String, ref: 'OfferTemplate' },
    candidateSignatureId: { type: String, ref: 'CandidateSignature' },
    offerAcceptanceStatus: { type: String, enum: ['pending','accepted','rejected'], default: 'pending' },
  },
  { _id: false },
);

