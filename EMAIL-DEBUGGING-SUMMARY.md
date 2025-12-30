# Email Debugging Implementation Summary

## What Was Done

### 1. Switched from Zoho to Gmail SMTP
- Updated `lib/utils/email.ts` to use Gmail SMTP instead of Zoho
- Changed host to `smtp.gmail.com`
- Added `service: 'gmail'` for better compatibility
- Updated `.env.example` with Gmail instructions

### 2. Added Comprehensive Debug Logging
All email functions now have detailed debug logging that shows:

**Configuration Check:**
- Whether email is configured
- Email user length
- Password length
- Masked email address

**Transporter Creation:**
- SMTP service and host
- Port and security settings
- Authentication status

**Email Sending:**
- Recipient email
- Subject line
- HTML length
- Success/failure status
- Message ID
- Accepted/rejected recipients
- Detailed error information

### 3. Debug Helper Function
Created `sendEmailWithDebug()` helper that:
- Logs mail options before sending
- Captures success details (messageId, accepted, rejected)
- Logs comprehensive error information (code, message, stack trace, SMTP response)

### 4. Updated All Email Functions
✅ `sendBookingConfirmation`
✅ `sendSignupConfirmation`
✅ `sendPasswordResetEmail`
✅ `sendAdminApplicationNotification`
✅ `sendApplicationStatusUpdate`
✅ `sendEnquiryNotification` (sends 2 emails with debug for both)
✅ `sendPaymentConfirmation`

### 5. Test Endpoint
Created `/api/test-email` for easy testing:
```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test@email.com","userName":"Test User"}'
```

## How to Use

### Step 1: Configure Gmail App Password

1. Enable 2FA on your Gmail account
2. Generate App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Click "Generate"
   - Copy the 16-character password

3. Update `.env`:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your16charapppassword
```

### Step 2: Test Email Sending

**Option A: Use Test Endpoint**
```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","userName":"Test User"}'
```

**Option B: Trigger Real Actions**
- Register a new user account
- Create a booking
- Submit contact form
- Request password reset

### Step 3: Check Debug Logs

Look in your server console for output like:

```
================================================================================
[EMAIL DEBUG 2025-12-30T...] EMAIL CONFIGURATION CHECK
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

## Troubleshooting

### Problem: "Email not configured"
**Solution:** Check that `EMAIL_USER` and `EMAIL_APP_PASSWORD` are set in `.env`

### Problem: "EAUTH: Invalid login"
**Solution:**
- Verify you're using App Password, NOT regular password
- App Password should be 16 characters
- Ensure 2FA is enabled on Gmail account
- Generate a new App Password

### Problem: "ESOCKET: Connection timeout"
**Solution:**
- Check network/firewall settings
- Verify port 587 is not blocked
- Try port 465 with `secure: true`

### Problem: Emails not being received
**Check:**
1. Look for success in debug logs (`messageId` present)
2. Check `accepted` array contains recipient email
3. Check spam/junk folder
4. Verify recipient email is valid
5. Check Gmail's sent folder

### Problem: "550 Invalid recipient"
**Solution:** Verify the recipient email address is valid and correctly formatted

## Debug Log Format

### Success Example:
```json
{
  "messageId": "<unique-id@gmail.com>",
  "response": "250 2.0.0 OK",
  "accepted": ["recipient@example.com"],
  "rejected": [],
  "envelope": {
    "from": "your-email@gmail.com",
    "to": ["recipient@example.com"]
  }
}
```

### Error Example:
```json
{
  "errorMessage": "Invalid login: 535-5.7.8 Username and Password not accepted",
  "errorCode": "EAUTH",
  "errorCommand": "AUTH PLAIN",
  "errorResponse": "535-5.7.8 Username and Password not accepted...",
  "errorResponseCode": 535
}
```

## Email Functions Available

| Function | Purpose | Debug Name |
|----------|---------|------------|
| `sendBookingConfirmation` | Confirm booking | SEND BOOKING CONFIRMATION |
| `sendSignupConfirmation` | Welcome new user | SEND SIGNUP CONFIRMATION |
| `sendPasswordResetEmail` | Password reset link | SEND PASSWORD RESET |
| `sendAdminApplicationNotification` | Notify admin of application | SEND ADMIN APPLICATION NOTIFICATION |
| `sendApplicationStatusUpdate` | Status change notification | SEND APPLICATION STATUS UPDATE |
| `sendEnquiryNotification` | Contact form submission | SEND ENQUIRY NOTIFICATION |
| `sendPaymentConfirmation` | Payment received | SEND PAYMENT CONFIRMATION |

## Important Notes

1. **Remove test endpoint in production:** Delete `/app/api/test-email/route.ts`
2. **Gmail limits:** Free accounts have 500 emails/day limit
3. **App Password security:** Keep it secret, never commit to git
4. **Debug logs:** Contain sensitive info, ensure logs are secure
5. **Production:** Consider using a dedicated email service (SendGrid, AWS SES, etc.) for production

## Next Steps

1. Test email sending with the test endpoint
2. Check debug logs in console
3. Fix any configuration issues
4. Test all email types (signup, booking, password reset, etc.)
5. Verify emails are received correctly
6. Remove test endpoint before deploying to production
