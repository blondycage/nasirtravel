# Quick Email Testing Guide

## Setup

1. **Make sure your `.env` is configured:**
```env
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your16charapppassword
```

2. **Restart your dev server** to load the new environment variables:
```bash
npm run dev
```

## Test Methods

### Method 1: Test Endpoint (Quickest)
```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_TEST_EMAIL@gmail.com","userName":"Test User"}'
```

### Method 2: Forgot Password (Tests the issue you reported)
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"EXISTING_USER_EMAIL@example.com"}'
```

### Method 3: Register New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "password123",
    "phone": "1234567890"
  }'
```

## What to Check in Console

After running any test, check your **server console** (terminal where `npm run dev` is running) for logs like:

### 1. Email Configuration Check
```
================================================================================
[EMAIL DEBUG 2025-12-30T...] EMAIL CONFIGURATION CHECK
================================================================================
{
  "configured": true,  ← Should be TRUE
  "hasEmailUser": true,  ← Should be TRUE
  "hasEmailPassword": true,  ← Should be TRUE
  "emailUserLength": 20,  ← Should match your email length
  "emailPasswordLength": 16,  ← Should be 16 for Gmail App Password
  "emailUser": "inf***"  ← Should show first 3 chars of your email
}
```

### 2. For Forgot Password
Look for these logs in order:
```
🔐 FORGOT PASSWORD API - Request received
📧 Email from request: user@example.com
🔍 Searching for user with email: user@example.com
✅ User found: { email, name, id }
🔑 Reset token generated: { tokenLength, expiresAt }
💾 Reset token saved to database
📨 Attempting to send password reset email...
```

Then you should see the email debug logs from `email.ts`:
```
================================================================================
[EMAIL DEBUG ...] SEND PASSWORD RESET - START
================================================================================
```

### 3. Success Indicators
```
✅ Password reset email sent successfully
```

Or:
```
================================================================================
[EMAIL DEBUG ...] SEND PASSWORD RESET - SUCCESS
================================================================================
{
  "messageId": "<id@gmail.com>",  ← Email was sent
  "accepted": ["recipient@example.com"],  ← Recipient accepted
  "rejected": []  ← No rejections
}
```

### 4. Error Indicators
```
❌ Failed to send password reset email:
```

Or:
```
================================================================================
[EMAIL DEBUG ...] SEND PASSWORD RESET - ERROR
================================================================================
{
  "errorCode": "EAUTH",  ← Authentication failed
  "errorMessage": "Invalid login...",
  "errorResponse": "535-5.7.8 Username and Password not accepted"
}
```

## Common Issues

### Issue: "configured: false"
**Fix:** Email credentials not in `.env` file
- Add `EMAIL_USER` and `EMAIL_APP_PASSWORD`
- Restart dev server

### Issue: "emailPasswordLength: 0"
**Fix:** App password not set
- Generate Gmail App Password
- Add to `.env` as `EMAIL_APP_PASSWORD`

### Issue: "EAUTH: Invalid login"
**Fix:** Wrong credentials
- Verify you're using App Password (16 chars), NOT regular password
- Generate new App Password from https://myaccount.google.com/apppasswords
- Make sure 2FA is enabled on Gmail

### Issue: "User not found"
**Fix:** Email doesn't exist in database
- Try with an email that exists in your database
- Or register a new user first

### Issue: No debug logs appearing
**Fix:** Old server still running
- Stop dev server (Ctrl+C)
- Restart with `npm run dev`
- Try test again

## Expected Flow for Forgot Password

1. User submits email
2. API receives request ✅
3. User found in database ✅
4. Reset token generated ✅
5. Token saved to database ✅
6. Email configuration checked ✅
7. Email transporter created ✅
8. Email sent to Gmail ✅
9. Gmail accepts email ✅
10. User receives email ✅

**Look for ❌ symbols in your console to find where it's failing!**
