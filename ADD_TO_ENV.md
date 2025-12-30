# Add This to Your .env File

Add this line to your `.env` file:

```env
EMAIL_FROM=info@naasirtravel.com
```

## Complete Email Configuration

Your `.env` should have these email variables:

```env
# Email Configuration
EMAIL_USER=lotuzman667@gmail.com
EMAIL_APP_PASSWORD=your16charapppassword
EMAIL_FROM=info@naasirtravel.com
```

## How It Works

- `EMAIL_USER` = Your Gmail account (for SMTP authentication)
- `EMAIL_APP_PASSWORD` = Your Gmail App Password (for authentication)
- `EMAIL_FROM` = The email address shown to recipients in the "From" field

This way, emails will appear to come from `info@naasirtravel.com` instead of `lotuzman667@gmail.com`, giving a more professional appearance.

## After Adding

1. Add `EMAIL_FROM=info@naasirtravel.com` to your `.env` file
2. Restart your dev server: `npm run dev`
3. Test an email - it will now show "From: info@naasirtravel.com"

**Note:** The actual sending still happens through `lotuzman667@gmail.com`, but the "From" header will display `info@naasirtravel.com`.
