import { Schema } from 'mongoose';

export const DocumentUploadSchema = new Schema(
  {
    documentId: { type: String, required: true },
    ownerType: { type: String, enum: ['candidate', 'newHire', 'employee'], required: true },
    ownerId: { type: String, required: true },
    documentType: {
      type: String,
      enum: ['cv', 'contract', 'id', 'certification', 'other'],
      required: true,
    },
    fileName: { type: String, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: {
      userId: String,
      name: String,
    },
    status: { type: String, enum: ['pending-review', 'approved', 'rejected'], default: 'pending-review' },
    reviewNotes: String,
  },
  { _id: false },
);

