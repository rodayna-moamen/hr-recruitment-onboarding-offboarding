# Notifications System Implementation

## Overview

A comprehensive email notification system has been implemented for the recruitment subsystem. This system automatically sends email notifications to candidates when their application status changes, when interviews are scheduled, and when applications are rejected.

## Architecture

### Module Structure

```
backend/src/notifications/
├── notifications.module.ts          # Module definition
├── notifications.service.ts        # Core notification service
├── notifications.controller.ts     # API endpoints
├── models/
│   └── notification-log.schema.ts  # Notification log schema
└── dto/
    └── send-notification.dto.ts    # DTO for sending notifications
```

### Key Components

1. **NotificationsService**: Core service that handles email sending via nodemailer
2. **NotificationLog Schema**: Tracks all notifications sent (for audit and debugging)
3. **Email Templates**: HTML-formatted email templates for different notification types

## Features Implemented

### ✅ Application Status Updates (US-5)
- **Trigger**: Automatically sent when application status changes
- **Location**: `recruitment.service.ts` → `triggerStatusChangeNotifications()`
- **Notification Types**:
  - `submitted` → Application received
  - `in_process` → Application progressing
  - `offer` → Offer extended
  - `hired` → Hired
  - `rejected` → Application rejected

### ✅ Rejection Notifications (US-6)
- **Trigger**: When application is explicitly rejected via rejection template
- **Location**: `recruitment.service.ts` → `sendRejectionNotification()`
- **Features**:
  - Custom rejection message from template
  - Professional rejection email
  - Automatic status update to `rejected`

### ✅ Interview Scheduling Notifications
- **Trigger**: When interview is scheduled
- **Location**: `recruitment.service.ts` → `sendInterviewInvites()`
- **Features**:
  - Interview date and time
  - Interview method (onsite, video, phone)
  - Video link (if applicable)
  - Calendar event information

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# SMTP Configuration (for production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@hr-system.com
```

### Development Mode

If SMTP credentials are not configured, the system will:
- Log emails to console instead of sending
- Still create notification logs
- Allow testing without actual email sending

## Integration Points

### Recruitment Service Integration

The notifications service is integrated into the recruitment service at these points:

1. **Status Updates**: `updateApplicationStatus()` → `triggerStatusChangeNotifications()`
2. **Rejections**: `sendRejectionNotification()` → `sendApplicationRejection()`
3. **Interviews**: `scheduleInterview()` → `sendInterviewInvites()`

### Candidate Data Retrieval

The system retrieves candidate information in two ways:
1. **From Populated Application**: If `candidateId` is populated, uses that data
2. **From Candidate Model**: If not populated, fetches directly from `Candidate` model

## Notification Log Schema

All notifications are logged with:
- Type (application_status_update, interview_scheduled, etc.)
- Channel (email, sms, in_app)
- Recipient information
- Status (pending, sent, failed, delivered)
- Timestamps (sentAt, deliveredAt)
- Error messages (if failed)
- Related entity (applicationId, interviewId, etc.)

## API Endpoints

### Send Notification
```
POST /notifications
Body: SendNotificationDto
```

### Get Notification History
```
GET /notifications/history/:recipientId?limit=50
```

### Get Notification by ID
```
GET /notifications/:id
```

## Email Templates

All emails use a professional HTML template with:
- Company branding header
- Responsive design
- Clear call-to-action
- Footer with disclaimer

## Error Handling

- Notification failures don't break the main workflow
- Errors are logged for debugging
- Notification status is tracked in the log
- Failed notifications can be retried manually

## Testing

### Manual Testing

1. **Test Status Update Notification**:
   - Update an application status
   - Check notification log
   - Verify email was sent (or logged in dev mode)

2. **Test Rejection Notification**:
   - Reject an application with a template
   - Check notification log
   - Verify rejection email

3. **Test Interview Notification**:
   - Schedule an interview
   - Check notification log
   - Verify interview invite email

### Production Setup

1. Configure SMTP credentials in `.env`
2. Test with a real email address
3. Monitor notification logs for failures
4. Set up email delivery monitoring

## Future Enhancements

- [ ] SMS notifications
- [ ] In-app notifications
- [ ] Notification preferences (opt-in/opt-out)
- [ ] Email templates customization UI
- [ ] Retry mechanism for failed notifications
- [ ] Notification digest (daily/weekly summaries)
- [ ] Multi-language support

## Troubleshooting

### Emails Not Sending

1. Check SMTP credentials in `.env`
2. Verify SMTP host/port are correct
3. Check notification logs for error messages
4. Ensure candidate has valid email address

### Notification Logs Not Created

1. Check if NotificationsService is injected
2. Verify NotificationsModule is imported in RecruitmentModule
3. Check application logs for errors

### Candidate Email Not Found

1. Ensure candidate has `personalEmail` field set
2. Check if candidate is properly populated in application
3. Verify Candidate model is accessible

## Notes

- The system gracefully handles missing email addresses
- Notifications are sent asynchronously (don't block main workflow)
- All notifications are logged for audit purposes
- Email sending can be disabled by not configuring SMTP (dev mode)

