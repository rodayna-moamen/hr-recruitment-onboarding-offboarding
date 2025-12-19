# SMTP Email Configuration Guide

## Overview

The notification system requires SMTP configuration to send emails. In development mode (without SMTP configured), emails are logged to the console instead of being sent.

## Environment Variables

Add these variables to your `backend/.env` file:

```env
# SMTP Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@hr-system.com
```

## Gmail Setup

1. **Enable 2-Step Verification**
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - In the "App name" input field, type: **HR System**
   - Click the **"Create"** button (bottom right of the white box)
   - Google will generate a 16-character password (format: `xxxx xxxx xxxx xxxx`)
   - **Copy the entire password immediately** (you won't be able to see it again!)
   - Use this password as `SMTP_PASSWORD` in your `.env` file
   - **Important**: Remove spaces when pasting into `.env` (e.g., `xxxxxxxxxxxxxxxx` or keep spaces: `xxxx xxxx xxxx xxxx`)

3. **Configuration**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # The 16-character app password
   SMTP_FROM=your-email@gmail.com
   ```

## Other Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
SMTP_FROM=your-email@outlook.com
```

### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@yahoo.com
```

### Custom SMTP Server
```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587  # or 465 for SSL
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@yourdomain.com
```

## Development Mode

If SMTP credentials are not configured:
- Emails are logged to the console instead of being sent
- Notification logs are still created
- System continues to function normally
- Useful for testing without actual email sending

## Testing

1. Configure SMTP in `.env`
2. Restart the backend server
3. Trigger a notification (e.g., reject an application)
4. Check the notification logs in MongoDB: `notification_logs` collection
5. Verify email was sent (check recipient's inbox)

## Troubleshooting

### Emails Not Sending

1. **Check SMTP credentials** - Verify all environment variables are set correctly
2. **Check SMTP host/port** - Ensure they match your email provider
3. **Check firewall** - Port 587 must be open
4. **Check logs** - Look for error messages in backend console
5. **Check notification logs** - Query MongoDB `notification_logs` collection for error messages

### Common Errors

- **"Invalid login"** - Wrong username/password or app password not generated
- **"Connection timeout"** - Firewall blocking port 587
- **"Authentication failed"** - 2FA not enabled or wrong app password
- **"Relay access denied"** - SMTP server requires authentication

## Security Notes

- Never commit `.env` file to version control
- Use app passwords, not your main account password
- Rotate app passwords regularly
- Use environment-specific configurations (dev/staging/prod)

