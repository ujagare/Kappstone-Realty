# Leads Automation Setup

The contact function now supports:

- Professional lead email subjects
- Auto-reply emails to the user
- Basic spam protection via honeypot and minimum form-fill time
- Optional lead backup to Google Sheets or a CRM webhook

Add these environment variables in Netlify:

```env
RESEND_API_KEY=re_xxxxx
CONTACT_TO_EMAIL=sales@kappstonerealty.com
CONTACT_FROM_EMAIL=no-reply@kappstonerealty.com
CONTACT_AUTO_REPLY_FROM_EMAIL=no-reply@kappstonerealty.com
GOOGLE_SHEETS_WEBHOOK_URL=
CRM_WEBHOOK_URL=
```

## Google Sheets backup

Use a Google Apps Script web app URL in `GOOGLE_SHEETS_WEBHOOK_URL`.

Expected JSON payload:

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "phone": "9876543210",
  "budget": "75 Lakhs - 1.5 Cr",
  "propertyType": "Residential",
  "formSource": "Contact Page",
  "subject": "Free Consultation Request",
  "message": "Looking for a 2 BHK in Pune.",
  "pageUrl": "https://kappstonerealty.com/contact.html",
  "receivedAt": "2026-03-23T10:00:00.000Z"
}
```

## CRM backup

Use any webhook endpoint in `CRM_WEBHOOK_URL` that accepts a JSON POST body.
