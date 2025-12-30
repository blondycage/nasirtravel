# Email Debugging Guide

## Debug Output Format

All email functions now output detailed debug logs in the following format:

```
================================================================================
[EMAIL DEBUG 2025-12-30T12:00:00.000Z] EMAIL CONFIGURATION CHECK
================================================================================
{
  "configured": true,
  "hasEmailUser": true,
  "hasEmailPassword": true,
  "emailUserLength": 20,
  "emailPasswordLength": 16,
  "emailUser": "inf***"
}
================================================================================
```

## What to Check

### 1. Configuration Issues
Look for logs starting with `EMAIL CONFIGURATION CHECK`:
- `configured: false` - Email credentials not set
- `emailUserLength: 0` - EMAIL_USER env variable is empty
- `emailPasswordLength: 0` - EMAIL_APP_PASSWORD env variable is empty
- `emailUser: "NOT SET"` - EMAIL_USER not configured

### 2. Transporter Creation Issues
Look for `TRANSPORTER CREATED` or `TRANSPORTER CREATION FAILED`:
- Check `service`, `host`, `port` values
- Verify `user` matches your Gmail address
- Ensure `hasPassword: true` and `passwordLength` is 16 (Gmail App Password)

### 3. Email Sending Issues
Look for logs with `- MAIL OPTIONS`, `- SUCCESS`, or `- ERROR`:

**Success indicators:**
- `messageId` - Email was sent successfully
- `accepted` array contains recipient email
- `rejected` array is empty

**Error indicators:**
- `errorCode` - SMTP error code
- `errorMessage` - Human-readable error
- `errorCommand` - Which SMTP command failed
- `errorResponse` - Full SMTP server response

## Common Errors

### Authentication Errors
```json
{
  "errorCode": "EAUTH",
  "errorMessage": "Invalid login"
}
```
**Fix:** Generate a new Gmail App Password

### Connection Errors
```json
{
  "errorCode": "ESOCKET",
  "errorMessage": "Connection timeout"
}
```
**Fix:** Check network/firewall settings

### Invalid Recipient
```json
{
  "rejected": ["invalid@email.com"],
  "errorResponse": "550 Invalid recipient"
}
```
**Fix:** Verify recipient email address

## Testing Emails

To test email sending, trigger any of these actions:
1. **Signup** - Register a new user account
2. **Booking** - Create a new booking
3. **Contact Form** - Submit an enquiry
4. **Password Reset** - Request password reset
5. **Application** - Submit a visa application

Check your server console/logs for debug output.

## Environment Variables

Ensure these are set in your `.env` file:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-16-char-app-password
```

**Important:**
- Use Gmail App Password, NOT regular password
- App Password is 16 characters without spaces
- Enable 2FA on Gmail to generate App Passwords
