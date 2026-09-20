# Mailtrap Live Sending Migration and Go-Live Guide

## Implementation Status

The application-side migration is implemented:

- Nodemailer remains the delivery library, so templates and email call sites are unchanged.
- SMTP configuration now requires an explicit `SMTP_HOST`; the hidden ZeptoMail fallback has been removed.
- `SMTP_USER` and `SMTP_PASS` are the preferred credential names.
- Legacy `EMAIL_HOST`, `EMAIL_USER`, and `EMAIL_APP_PASSWORD` names remain supported during rollback.
- `.env.example` now documents Mailtrap Live Sending without containing a real token.

Production will not use Mailtrap until the domain is verified and the Mailtrap values are added to Netlify.

## Current Email Provider

The app sends email through `nodemailer` using SMTP from `lib/utils/email.ts`.

The transporter currently reads credentials in this order:

- `SMTP_USER` or `EMAIL_USER`
- `SMTP_PASS` or `EMAIL_APP_PASSWORD`
- `SMTP_HOST` or legacy `EMAIL_HOST` (an explicit host is required)
- `SMTP_PORT` or `EMAIL_PORT`, falling back to `587`
- `SMTP_SECURE`, otherwise `true` only when port is `465`

The runtime remains provider-neutral SMTP. New environments should use the `SMTP_*` names; the legacy names remain available only to make rollback possible during migration.

## Confirmed Email Templates

Package price/general enquiries already have both admin and customer templates.

- Package listing enquiry submits to `/api/contact`.
- Package detail enquiry submits to `/api/contact`.
- `/api/contact` calls `sendEnquiryNotification`.
- `sendEnquiryNotification` sends:
  - Admin email to `info@naasirtravel.com` with subject `New Enquiry: ...`.
  - Customer confirmation email with subject `Thank you for your enquiry - Naasir Travel`.

Booking quote emails cover both the customer and admin workflow:

- `sendQuoteRequestReceived`: customer receives `Quote Request Received - Naasir Travel`.
- `sendAdminQuoteRequestNotification`: admin receives the request details and a direct link to the booking quotation screen.
- `sendBookingQuoteReady`: customer receives `Your Naasir Travel Quote Is Ready`.

## Target Mailtrap Setup

Target provider: Mailtrap Live Sending.

Use SMTP through Nodemailer to avoid changing the app’s email call sites.

Mailtrap SMTP configuration:

- `SMTP_HOST=live.smtp.mailtrap.io`
- `SMTP_PORT=587`
- `SMTP_SECURE=false`
- `SMTP_USER=api`
- `SMTP_PASS=<Mailtrap API token>`
- `EMAIL_FROM="Naasir Travel <info@naasirtravel.com>"`

Before production cutover, the sending domain for `EMAIL_FROM` must be verified in Mailtrap.

## Get the Mailtrap SMTP Token

1. Sign in to Mailtrap and open **Email API/SMTP**.
2. Open **Domains**, select **Add Domain**, and add `naasirtravel.com`.
3. In the DNS manager for `naasirtravel.com`, add the exact records Mailtrap displays. Mailtrap currently provides four CNAME records (domain verification, two DKIM records, and tracking) plus one DMARC TXT record.
4. Do not edit or remove the existing Zoho MX records.
5. Return to Mailtrap and select **Re-check DNS Records**. DNS verification can take from several minutes up to 24 hours.
6. Complete Mailtrap's sender information and compliance review. Wait for the domain status to become **Verified**.
7. Open **Email API/SMTP > Sending Setup**, select `naasirtravel.com`, choose **Transactional Stream**, and switch the integration view to **SMTP**.
8. Copy the displayed password/token. The SMTP username is `api`; the password is the domain-specific API token.
9. If a separate token is preferred, open **Settings > API Tokens > Add Token**. Store it in a password manager because it must never be committed to Git.

## Netlify Go-Live Steps

1. In Netlify, open the Naasir Travel site, then **Project configuration > Environment variables**.
2. Add these variables for **Deploy Previews** first:
   - `SMTP_HOST=live.smtp.mailtrap.io`
   - `SMTP_PORT=587`
   - `SMTP_SECURE=false`
   - `SMTP_USER=api`
   - `SMTP_PASS=<Mailtrap API token>`
   - `EMAIL_FROM="Naasir Travel <info@naasirtravel.com>"`
   - `ADMIN_NOTIFICATION_EMAIL=info@naasirtravel.com`
3. Mark `SMTP_PASS` as a secret value. Restrict these values to the scopes used by builds/functions where Netlify permits it.
4. Keep the old provider variables available until preview validation passes.
5. Trigger a Deploy Preview, then test all email flows listed below.
6. Check Mailtrap **Email Logs** for accepted messages, delivery status, sender, recipient, and subject.
7. Add the same values to the **Production** deploy context and trigger a production deploy.
8. Re-test the high-value flows in production.
9. Remove the old provider credentials only after production delivery is confirmed.

## Zoho Mail Impact

Zoho remains the mailbox provider for incoming email. Mailtrap handles only application-generated outgoing email.

- Keep all Zoho MX records unchanged. They control delivery into Zoho mailboxes such as `info@naasirtravel.com`.
- Add only the DNS records Mailtrap shows for domain verification, DKIM, DMARC, and tracking.
- Do not create a second DMARC record if one already exists. Merge the required policy/reporting settings into the single existing `_dmarc` TXT record.
- Existing Zoho webmail, inboxes, aliases, and normal person-to-person sending through Zoho are unaffected by the app's SMTP change.
- Messages generated by this website will appear in Mailtrap's logs, not in Zoho's Sent folder. Replies sent to `info@naasirtravel.com` will still arrive in Zoho.

## Implemented Code Decisions

These changes keep the implementation stable while making the provider migration explicit.

- `.env.example` uses Mailtrap Live Sending example values.
- Keep support for legacy `EMAIL_USER` and `EMAIL_APP_PASSWORD` until after production cutover.
- Require an explicit SMTP host instead of silently selecting ZeptoMail.
- Keep `nodemailer`; do not switch to Mailtrap HTTP API for this migration.
- Keep existing templates and call sites unchanged.
- Keep logs masked so passwords/API tokens are never printed.

## Validation Checklist

Run:

```bash
npm run build
```

Manual email scenarios:

- Submit the contact form.
- Submit package enquiry from the package listing page.
- Submit package enquiry from a package detail page.
- Request booking confirmation/quote from the dashboard booking documents page.
- Send a quote from the admin booking detail page.
- Trigger password reset.
- Trigger any booking/payment/application status email paths that are in active use.

Acceptance criteria:

- Build passes.
- No email flow throws a server error.
- Package enquiry sends both admin and customer emails.
- Quotation request sends the customer confirmation and an admin notification with a direct booking link.
- Customer booking quote emails send successfully.
- Mailtrap Email Logs show successful SMTP acceptance and delivery progress.
- No secrets appear in application logs.

## Rollback Plan

If Mailtrap live sending fails:

1. Restore the previous SMTP environment variables in Netlify.
2. Redeploy.
3. Confirm the same email flows send through the previous provider.
4. Keep the code changes if they are provider-neutral and backward-compatible.
