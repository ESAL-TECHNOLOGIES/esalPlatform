# Email Configuration Guide for ESAL Platform

## Email Confirmation Setup

The ESAL Platform now supports email confirmation for user registration. There are two ways to configure email delivery:

### Option 1: Configure Supabase Email (Recommended)

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Navigate to your project: https://supabase.com/dashboard/project/ppvkucdspgoeqsxxydxg

2. **Configure Email Settings**
   - Go to Authentication > Settings
   - Scroll down to "SMTP Settings"
   - Configure your email provider:

   **For Gmail:**
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: your-email@gmail.com
   SMTP Password: your-app-password (not your regular password)
   ```

   **For SendGrid:**
   ```
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   SMTP User: apikey
   SMTP Password: your-sendgrid-api-key
   ```

3. **Set Email Templates (Optional)**
   - Go to Authentication > Email Templates
   - Customize the "Confirm signup" template
   - Make sure the redirect URL is set to: `http://localhost:3001/email-confirmed`

### Option 2: Custom SMTP Configuration (Backup)

If Supabase email is not working, you can configure custom SMTP in the `.env` file:

```env
# Email Configuration (for custom SMTP - optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@esalplatform.com
SMTP_FROM_NAME=ESAL Platform
```

**To get Gmail App Password:**
1. Enable 2-factor authentication on your Google account
2. Go to Google Account Settings > Security > 2-Step Verification
3. Click "App passwords" at the bottom
4. Select "Mail" and generate a password
5. Use this generated password (not your regular password)

### Current Configuration Status

✅ **Completed:**
- Email confirmation flow implemented
- Supabase authentication with email redirect URLs configured
- Email confirmation page (`/email-confirmed`) created
- Resend confirmation functionality added
- Custom SMTP service created as backup

⚠️ **Needs Configuration:**
- Supabase SMTP settings in dashboard (Option 1)
- OR Gmail/SMTP credentials in `.env` file (Option 2)

### Testing Email Configuration

1. **Start the backend:**
   ```powershell
   cd d:\esalPlatform\EsalPlatform\apps\api
   python start_supabase.py
   ```

2. **Start the frontend:**
   ```powershell
   cd d:\esalPlatform\EsalPlatform\apps\innovator-portal
   npm run dev
   ```

3. **Test signup flow:**
   - Go to http://localhost:3001/signup
   - Register with a real email address
   - Check your email for confirmation link
   - Click the link to confirm your account

### Email Flow

1. **User signs up** → Account created in Supabase (unconfirmed)
2. **Confirmation email sent** → Via Supabase or custom SMTP
3. **User clicks email link** → Redirects to `/email-confirmed` page
4. **Email confirmed** → User can now log in

### Troubleshooting

**No emails received:**
- Check Supabase dashboard email settings
- Verify SMTP credentials in `.env` file
- Check spam/junk folder
- Try with different email provider

**Confirmation link not working:**
- Ensure redirect URL is set correctly in Supabase
- Check that frontend route `/email-confirmed` is accessible
- Verify API endpoint `/api/v1/auth/confirm` is working

**Backend errors:**
- Check console logs for detailed error messages
- Verify Supabase credentials are correct
- Ensure all environment variables are set

### Production Deployment

For production, make sure to:
1. Use a professional email service (SendGrid, Mailgun, etc.)
2. Configure proper domain for email links
3. Update redirect URLs to production frontend URL
4. Set up proper email templates with branding

## Current Email Configuration Status

The platform is ready for email confirmation. You just need to:
1. Configure Supabase SMTP settings in your dashboard, OR
2. Add Gmail/SMTP credentials to the `.env` file

Once configured, users will receive confirmation emails and the full authentication flow will work seamlessly.
