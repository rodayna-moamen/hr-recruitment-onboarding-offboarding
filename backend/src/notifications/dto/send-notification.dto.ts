import { IsString, IsEmail, IsEnum, IsOptional, IsObject } from 'class-validator';
import { NotificationType, NotificationChannel } from '../models/notification-log.schema';

export class SendNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @IsString()
  recipientId: string;

  @IsEmail()
  recipientEmail: string;

  @IsOptional()
  @IsString()
  recipientName?: string;

  @IsString()
  subject: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  relatedEntityId?: string;

  @IsOptional()
  @IsString()
  relatedEntityType?: string;
}

