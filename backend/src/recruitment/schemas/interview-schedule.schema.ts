import { Schema } from 'mongoose';

export const PanelMemberSchema = new Schema(
  {
    employeeId: { type: String, required: true },
    name: String,
    role: String,
    availability: {
      type: String,
      enum: ['invited', 'confirmed', 'declined', 'tentative'],
      default: 'invited',
    },
    scoreWeight: { type: Number, default: 1 },
  },
  { _id: false },
);

export const InterviewScheduleSchema = new Schema(
  {
    interviewId: { type: String, required: true },
    applicationId: { type: String, required: true },
    stageId: { type: String, required: true },
    schedule: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
      timezone: { type: String, default: 'Africa/Cairo' },
    },
    mode: { type: String, enum: ['onsite', 'virtual', 'phone'], default: 'virtual' },
    location: {
      meetingLink: String,
      room: String,
      address: String,
    },
    panel: [PanelMemberSchema],
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled',
    },
    reminderIds: [{ type: String }],
    feedbackIds: [{ type: String }],
    rescheduleHistory: [
      {
        reason: String,
        rescheduledBy: String,
        rescheduledAt: Date,
      },
    ],
  },
  { _id: false },
);

