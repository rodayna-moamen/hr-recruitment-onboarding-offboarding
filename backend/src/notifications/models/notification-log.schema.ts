import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationLogDocument = HydratedDocument<NotificationLog>;

export enum NotificationType {
  APPLICATION_STATUS_UPDATE = 'application_status_update',
  APPLICATION_REJECTED = 'application_rejected',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  INTERVIEW_REMINDER = 'interview_reminder',
  OFFER_SENT = 'offer_sent',
  OFFER_ACCEPTED = 'offer_accepted',
  OFFER_REJECTED = 'offer_rejected',
  ONBOARDING_REMINDER = 'onboarding_reminder',
  OFFBOARDING_NOTIFICATION = 'offboarding_notification',
  CONSENT_GIVEN = 'consent_given',
  CONSENT_WITHDRAWN = 'consent_withdrawn',
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  IN_APP = 'in_app',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  DELIVERED = 'delivered',
}

@Schema({ collection: 'notification_logs', timestamps: true })
export class NotificationLog {
  @Prop({ type: String, enum: Object.values(NotificationType), required: true })
  type: NotificationType;

  @Prop({ type: String, enum: Object.values(NotificationChannel), required: true })
  channel: NotificationChannel;

  @Prop({ type: Types.ObjectId, required: true })
  recipientId: Types.ObjectId;

  @Prop({ type: String, required: true })
  recipientEmail: string;

  @Prop({ type: String })
  recipientName?: string;

  @Prop({ type: String, required: true })
  subject: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, enum: Object.values(NotificationStatus), default: NotificationStatus.PENDING })
  status: NotificationStatus;

  @Prop({ type: Date })
  sentAt?: Date;

  @Prop({ type: Date })
  deliveredAt?: Date;

  @Prop({ type: String })
  errorMessage?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: Types.ObjectId })
  relatedEntityId?: Types.ObjectId; // e.g., applicationId, interviewId, offerId

  @Prop({ type: String })
  relatedEntityType?: string; // e.g., 'application', 'interview', 'offer'
}

export const NotificationLogSchema = SchemaFactory.createForClass(NotificationLog);

// Index for efficient queries
NotificationLogSchema.index({ recipientId: 1, createdAt: -1 });
NotificationLogSchema.index({ type: 1, status: 1 });
NotificationLogSchema.index({ relatedEntityId: 1, relatedEntityType: 1 });

