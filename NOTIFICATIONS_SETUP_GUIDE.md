# Notifications Setup Guide

## ✅ What Was Done

All notification triggers have been properly integrated throughout the recruitment, onboarding, and offboarding subsystems. The system now uses **only nodemailer** for email sending.

### Changes Made:

1. **Fixed Notification Type Usage**
   - Replaced all `'type' as any` with proper `NotificationType` enum values
   - Replaced all `'channel' as any` with proper `NotificationChannel` enum values
   - Added proper imports in all services

2. **Enhanced Notification Triggers**
   - ✅ **Application Status Updates**: Automatically sends when status changes
   - ✅ **Application Rejections**: Sends rejection emails with templates
   - ✅ **Interview Scheduling**: Sends invites to candidates and panel members
   - ✅ **Offer Acceptance/Rejection**: Sends confirmation emails
   - ✅ **Onboarding Reminders**: Sends reminders for pending tasks
   - ✅ **System Access Provisioning**: Notifies employees when access is provisioned
   - ✅ **Offboarding Notifications**: Notifies employees when offboarding is initiated
   - ✅ **Performance Warnings**: Sends alerts to HR managers

3. **Improved Email Fetching**
   - All services now properly fetch candidate/employee emails
   - Fallback mechanisms if email is not found
   - Proper error handling for missing email addresses

## 📋 What You Need to Do

### Step 1: Configure SMTP Settings

Add these environment variables to your `backend/.env` file:

```env
# SMTP Email Configuration (for nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@hr-system.com
```

**For Gmail:**
1. Enable 2-Step Verification: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character app password as `SMTP_PASSWORD`

**For Other Providers:**
- See `smtp email guide.md` for Outlook, Yahoo, and custom SMTP configurations

### Step 2: Restart Backend Server

After adding SMTP configuration:
```bash
cd backend
npm run start:dev
```

### Step 3: Test Notifications

The system will automatically send notifications for:

1. **Application Status Changes**
   - Update an application status via API or frontend
   - Check candidate's email inbox

2. **Application Rejections**
   - Reject an application with a template
   - Check candidate's email inbox

3. **Interview Scheduling**
   - Schedule an interview
   - Check candidate's email inbox

4. **Offer Responses**
   - Accept or reject an offer
   - Check candidate's email inbox

5. **Onboarding Reminders**
   - Reminders are sent automatically for tasks with approaching deadlines
   - Check employee's email inbox

6. **System Access Provisioning**
   - System Admin provisions access
   - Check employee's email inbox

7. **Offboarding**
   - Initiate termination/resignation
   - Check employee's email inbox

### Step 4: Check Notification Logs

All notifications are logged in MongoDB:
```javascript
// Query notification logs
db.notification_logs.find().sort({ createdAt: -1 }).limit(10)
```

Check for:
- `status: "sent"` - Email sent successfully
- `status: "failed"` - Email failed (check `errorMessage`)
- `status: "pending"` - Email queued but not sent yet

## 🔍 Development Mode

If SMTP credentials are **NOT** configured:
- Emails are logged to the console instead of being sent
- Notification logs are still created
- System continues to function normally
- Useful for testing without actual email sending

You'll see logs like:
```
[MOCK EMAIL] To: candidate@example.com, Subject: Application Status Update
```

## 📊 Notification Types

All notification types are defined in `NotificationType` enum:

- `APPLICATION_STATUS_UPDATE` - Status changes
- `APPLICATION_REJECTED` - Rejections
- `INTERVIEW_SCHEDULED` - Interview invites
- `INTERVIEW_REMINDER` - Interview reminders
- `OFFER_SENT` - Offer sent to candidate
- `OFFER_ACCEPTED` - Offer accepted
- `OFFER_REJECTED` - Offer rejected
- `ONBOARDING_REMINDER` - Onboarding task reminders
- `OFFBOARDING_NOTIFICATION` - Offboarding initiated
- `CONSENT_GIVEN` - Consent logged
- `CONSENT_WITHDRAWN` - Consent withdrawn
- `PERFORMANCE_WARNING` - Performance warnings to HR

## 🛠️ Troubleshooting

### Emails Not Sending

1. **Check SMTP credentials** in `.env`
2. **Check backend logs** for error messages
3. **Check notification logs** in MongoDB for `errorMessage`
4. **Verify email addresses** - Ensure candidates/employees have valid emails
5. **Check firewall** - Port 587 must be open

### Common Errors

- **"Invalid login"** - Wrong username/password or app password not generated
- **"Connection timeout"** - Firewall blocking port 587
- **"Authentication failed"** - 2FA not enabled or wrong app password
- **"Relay access denied"** - SMTP server requires authentication

### Notification Logs Not Created

1. Check if `NotificationsService` is injected
2. Verify `NotificationsModule` is imported in `RecruitmentModule`
3. Check application logs for errors

## 📝 Notes

- All notifications use **nodemailer exclusively** - no other email services
- Notifications are sent asynchronously (don't block main workflow)
- All notifications are logged for audit purposes
- Email sending can be disabled by not configuring SMTP (dev mode)
- The system gracefully handles missing email addresses

## ✅ Verification Checklist

- [ ] SMTP credentials added to `.env`
- [ ] Backend server restarted
- [ ] Test application status update notification
- [ ] Test rejection notification
- [ ] Test interview scheduling notification
- [ ] Test offer acceptance/rejection notification
- [ ] Test onboarding reminder notification
- [ ] Test system access provisioning notification
- [ ] Test offboarding notification
- [ ] Check notification logs in MongoDB
- [ ] Verify emails received in inbox

---

**All notifications are now properly integrated and ready to use!** 🎉

