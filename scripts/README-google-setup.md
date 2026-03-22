# Google Setup

1. Open `.env`
2. Fill these values:

```env
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
GOOGLE_TAG_MANAGER_ID=GTM-XXXXXXX
GOOGLE_SEARCH_CONSOLE_VERIFICATION=your-verification-code
```

3. Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\apply-google-integrations.ps1
```

This script updates all root HTML pages and injects:
- Google Analytics
- Google Tag Manager
- Google Search Console verification meta tag

It is safe to run multiple times because it replaces the previous generated blocks.

For Vercel contact form support also add:

```env
RESEND_API_KEY=re_xxxxxxxxx
CONTACT_TO_EMAIL=your@email.com
CONTACT_FROM_EMAIL=no-reply@yourdomain.com
```
