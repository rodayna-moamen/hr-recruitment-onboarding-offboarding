import { Schema } from 'mongoose';

export const AssetReservationSchema = new Schema(
  {
    reservationId: { type: String, required: true },
    employeeId: { type: String, required: true },
    assets: [
      {
        assetTag: { type: String, required: true },
        type: { type: String, enum: ['laptop', 'monitor', 'desk', 'badge', 'phone', 'other'] },
        status: { type: String, enum: ['reserved', 'issued', 'returned'], default: 'reserved' },
        issuedAt: Date,
        returnedAt: Date,
      },
    ],
    workspace: {
      deskId: String,
      building: String,
      floor: String,
    },
    accessCards: [
      {
        cardId: String,
        status: { type: String, enum: ['pending', 'active', 'revoked'], default: 'pending' },
      },
    ],
    ownerDepartment: { type: String, default: 'Facilities' },
  },
  { _id: false },
);

