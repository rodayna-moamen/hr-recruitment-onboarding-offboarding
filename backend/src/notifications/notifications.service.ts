import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { NotificationLog, NotificationType, NotificationChannel, NotificationStatus } from './models/notification-log.schema';
import { SendNotificationDto } from './dto/send-notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectModel(NotificationLog.name)
    private notificationLogModel: Model<NotificationLog>,
    private configService: ConfigService,
  ) {
    this.initializeEmailTransporter();
  }

  private initializeEmailTransporter() {
    // Configure email transporter
    // In production, use environment variables for SMTP settings
    const smtpHost = this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com';
    const smtpPort = this.configService.get<number>('SMTP_PORT') || 587;
    const smtpUser = this.configService.get<string>('SMTP_USER') || '';
    const smtpPass = this.configService.get<string>('SMTP_PASSWORD') || '';

    // For development, use a test account or console logging
    if (!smtpUser || !smtpPass) {
      this.logger.warn('SMTP credentials not configured. Email notifications will be logged only.');
      // Create a mock transporter that logs instead of sending
      this.transporter = {
        sendMail: async (options) => {
          this.logger.log(`[MOCK EMAIL] To: ${options.to}, Subject: ${options.subject}`);
          this.logger.debug(`[MOCK EMAIL] Body: ${options.text || options.html}`);
          return { messageId: 'mock-' + Date.now(), accepted: [options.to as string], rejected: [] };
        },
      } as any;
    } else {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    }
  }

  /**
   * Send a notification via the specified channel
   */
  async sendNotification(dto: SendNotificationDto): Promise<NotificationLog> {
    // Create notification log entry
    const notificationLog = new this.notificationLogModel({
      type: dto.type,
      channel: dto.channel,
      recipientId: new Types.ObjectId(dto.recipientId),
      recipientEmail: dto.recipientEmail,
      recipientName: dto.recipientName,
      subject: dto.subject,
      content: dto.content,
      status: NotificationStatus.PENDING,
      metadata: dto.metadata,
      relatedEntityId: dto.relatedEntityId ? new Types.ObjectId(dto.relatedEntityId) : undefined,
      relatedEntityType: dto.relatedEntityType,
    });

    try {
      // Send based on channel
      if (dto.channel === NotificationChannel.EMAIL) {
        await this.sendEmail(dto);
        notificationLog.status = NotificationStatus.SENT;
        notificationLog.sentAt = new Date();
      } else if (dto.channel === NotificationChannel.SMS) {
        // SMS implementation would go here
        this.logger.warn('SMS notifications not yet implemented');
        notificationLog.status = NotificationStatus.FAILED;
        notificationLog.errorMessage = 'SMS channel not implemented';
      } else if (dto.channel === NotificationChannel.IN_APP) {
        // In-app notification implementation would go here
        this.logger.warn('In-app notifications not yet implemented');
        notificationLog.status = NotificationStatus.SENT;
        notificationLog.sentAt = new Date();
      }

      await notificationLog.save();
      return notificationLog;
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`, error.stack);
      notificationLog.status = NotificationStatus.FAILED;
      notificationLog.errorMessage = error.message;
      await notificationLog.save();
      throw error;
    }
  }

  /**
   * Send email notification
   */
  private async sendEmail(dto: SendNotificationDto): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('SMTP_FROM') || this.configService.get<string>('SMTP_USER') || 'noreply@hr-system.com',
      to: dto.recipientEmail,
      subject: dto.subject,
      html: this.formatEmailContent(dto.content, dto.type),
      text: dto.content, // Plain text fallback
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${dto.recipientEmail}: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${dto.recipientEmail}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Format email content with HTML template
   */
  private formatEmailContent(content: string, type: NotificationType): string {
    const baseTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9fafb; padding: 20px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>HR Recruitment System</h1>
            </div>
            <div class="content">
              ${content.replace(/\n/g, '<br>')}
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} HR System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    return baseTemplate;
  }

  /**
   * Send application status update notification
   */
  async sendApplicationStatusUpdate(
    candidateId: string,
    candidateEmail: string,
    candidateName: string,
    applicationId: string,
    oldStatus: string,
    newStatus: string,
    stage: string,
    comment?: string,
  ): Promise<NotificationLog> {
    const statusMessages: Record<string, string> = {
      submitted: 'Your application has been received and is under review.',
      in_process: 'Your application is progressing through our hiring process.',
      offer: 'Congratulations! We would like to extend an offer to you.',
      hired: 'Congratulations! You have been hired.',
      rejected: 'Thank you for your interest. Unfortunately, we are unable to proceed with your application at this time.',
    };

    const subject = `Application Status Update - ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1).replace('_', ' ')}`;
    const content = `
      <p>Dear ${candidateName},</p>
      <p>We wanted to inform you about an update regarding your job application.</p>
      <p><strong>Status:</strong> ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1).replace('_', ' ')}</p>
      <p><strong>Stage:</strong> ${stage.charAt(0).toUpperCase() + stage.slice(1).replace('_', ' ')}</p>
      ${statusMessages[newStatus] ? `<p>${statusMessages[newStatus]}</p>` : ''}
      ${comment ? `<p><strong>Additional Information:</strong> ${comment}</p>` : ''}
      <p>You can view the full details of your application by logging into your account.</p>
      <p>Thank you for your interest in joining our team.</p>
      <p>Best regards,<br>HR Team</p>
    `;

    return this.sendNotification({
      type: NotificationType.APPLICATION_STATUS_UPDATE,
      channel: NotificationChannel.EMAIL,
      recipientId: candidateId,
      recipientEmail: candidateEmail,
      recipientName: candidateName,
      subject,
      content,
      metadata: { oldStatus, newStatus, stage },
      relatedEntityId: applicationId,
      relatedEntityType: 'application',
    });
  }

  /**
   * Send application rejection notification
   */
  async sendApplicationRejection(
    candidateId: string,
    candidateEmail: string,
    candidateName: string,
    applicationId: string,
    reason?: string,
    template?: string,
  ): Promise<NotificationLog> {
    const subject = 'Application Update - Thank You for Your Interest';
    const content = template || `
      <p>Dear ${candidateName},</p>
      <p>Thank you for taking the time to apply for a position with us.</p>
      <p>After careful consideration, we have decided not to move forward with your application at this time.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>We appreciate your interest in our company and encourage you to apply for future positions that match your qualifications.</p>
      <p>We wish you the best in your career search.</p>
      <p>Best regards,<br>HR Team</p>
    `;

    return this.sendNotification({
      type: NotificationType.APPLICATION_REJECTED,
      channel: NotificationChannel.EMAIL,
      recipientId: candidateId,
      recipientEmail: candidateEmail,
      recipientName: candidateName,
      subject,
      content,
      metadata: { reason },
      relatedEntityId: applicationId,
      relatedEntityType: 'application',
    });
  }

  /**
   * Send interview scheduled notification
   */
  async sendInterviewScheduled(
    candidateId: string,
    candidateEmail: string,
    candidateName: string,
    interviewId: string,
    scheduledDate: Date,
    method: string,
    videoLink?: string,
  ): Promise<NotificationLog> {
    const subject = 'Interview Scheduled - Next Steps';
    const formattedDate = new Date(scheduledDate).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const content = `
      <p>Dear ${candidateName},</p>
      <p>We are pleased to inform you that an interview has been scheduled for your application.</p>
      <p><strong>Interview Date & Time:</strong> ${formattedDate}</p>
      <p><strong>Interview Method:</strong> ${method.charAt(0).toUpperCase() + method.slice(1)}</p>
      ${videoLink ? `<p><strong>Video Link:</strong> <a href="${videoLink}">${videoLink}</a></p>` : ''}
      <p>Please ensure you are available at the scheduled time. If you need to reschedule, please contact us as soon as possible.</p>
      <p>We look forward to speaking with you.</p>
      <p>Best regards,<br>HR Team</p>
    `;

    return this.sendNotification({
      type: NotificationType.INTERVIEW_SCHEDULED,
      channel: NotificationChannel.EMAIL,
      recipientId: candidateId,
      recipientEmail: candidateEmail,
      recipientName: candidateName,
      subject,
      content,
      metadata: { scheduledDate: scheduledDate.toISOString(), method, videoLink },
      relatedEntityId: interviewId,
      relatedEntityType: 'interview',
    });
  }

  /**
   * Get notification history for a recipient
   */
  async getNotificationHistory(recipientId: string, limit: number = 50): Promise<NotificationLog[]> {
    return this.notificationLogModel
      .find({ recipientId: new Types.ObjectId(recipientId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(notificationId: string): Promise<NotificationLog> {
    const notification = await this.notificationLogModel.findById(notificationId).exec();
    if (!notification) {
      throw new Error(`Notification with ID ${notificationId} not found`);
    }
    return notification;
  }

  /**
   * Log notification without sending (for consent tracking)
   */
  async logNotification(dto: SendNotificationDto): Promise<NotificationLog> {
    const notificationLog = new this.notificationLogModel({
      type: dto.type,
      channel: dto.channel || NotificationChannel.IN_APP,
      recipientId: new Types.ObjectId(dto.recipientId),
      recipientEmail: dto.recipientEmail,
      recipientName: dto.recipientName,
      subject: dto.subject,
      content: dto.content,
      status: NotificationStatus.SENT,
      sentAt: new Date(),
      metadata: dto.metadata,
      relatedEntityId: dto.relatedEntityId ? new Types.ObjectId(dto.relatedEntityId) : undefined,
      relatedEntityType: dto.relatedEntityType,
    });

    await notificationLog.save();
    return notificationLog;
  }
}

