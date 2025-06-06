# ESAL Platform Email Authentication Flow Documentation

## Overview

The ESAL Platform implements a secure 6-digit email verification system for user registration. This document provides comprehensive details about the email authentication flow, implementation, configuration, and troubleshooting.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Flow Diagram](#flow-diagram)
3. [Implementation Details](#implementation-details)
4. [Configuration](#configuration)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Frontend Components](#frontend-components)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)
10. [Security Considerations](#security-considerations)

## System Architecture

The email authentication system consists of several key components:

- **Email Verification Service**: Handles code generation, email sending, and verification
- **SMTP Configuration**: Gmail SMTP for email delivery
- **Database Layer**: Supabase with email_verifications table
- **Frontend Components**: React components for verification UI
- **API Endpoints**: RESTful endpoints for registration and verification

### Technology Stack

- **Backend**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL)
- **Email Service**: Gmail SMTP
- **Frontend**: React + TypeScript
- **UI Components**: Custom UI library (@esal/ui)

## Flow Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Signup   │───▶│  Create Account │───▶│ Generate 6-Digit│
│     Form        │    │   (Unverified)  │    │      Code       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Email Delivered │◀───│   Send Email    │◀───│  Store Code in  │
│   to User       │    │   via SMTP      │    │    Database     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Enters   │───▶│  Verify Code    │───▶│ Account Verified│
│   6-Digit Code  │    │  Against DB     │    │ & JWT Generated │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Implementation Details

### 1. User Registration Flow

When a user signs up:

1. **Account Creation**: User account is created in Supabase with `email_verified: false`
2. **Code Generation**: A 6-digit numeric code is generated
3. **Database Storage**: Code is stored in `email_verifications` table with 10-minute expiry
4. **Email Sending**: Verification email is sent via Gmail SMTP
5. **Redirect**: User is redirected to email verification page

### 2. Email Verification Flow

When user verifies their email:

1. **Code Validation**: Check if code exists and hasn't expired
2. **Account Activation**: Update user metadata to set `email_verified: true`
3. **Code Cleanup**: Mark verification code as used
4. **Token Generation**: Generate JWT access token
5. **Login**: User is automatically logged in and redirected to dashboard

### 3. Code Expiry and Cleanup

- **Expiry Time**: Verification codes expire after 10 minutes
- **Automatic Cleanup**: Expired codes are cleaned up during verification attempts
- **Resend Functionality**: Users can request new codes with 60-second cooldown

## Configuration

### SMTP Settings (config.py)

```python
# Gmail SMTP Configuration - Now using environment variables
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "ESAL Platform")
SMTP_USE_TLS = True
SMTP_USE_SSL = False

# Email Verification Settings
EMAIL_VERIFICATION_ENABLED = True
VERIFICATION_CODE_EXPIRY_MINUTES = int(os.getenv("VERIFICATION_CODE_EXPIRY_MINUTES", "10"))
EMAIL_VERIFICATION_CODE_LENGTH = 6
```

### Environment Variables (.env)

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT Configuration
JWT_SECRET_KEY=your_secret_key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_TIME=3600

# Email Configuration - Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM_EMAIL=your-gmail-email@gmail.com
SMTP_FROM_NAME=Your Company Name

# Email verification settings
VERIFICATION_CODE_EXPIRY_MINUTES=10

# Site Configuration
SITE_URL=http://localhost:3001
CONFIRM_EMAIL_REDIRECT_URL=http://localhost:3001/email-confirmed
```

### Setting up Gmail App Password

1. **Enable 2FA** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. **Use the generated password** in `SMTP_PASSWORD` environment variable

## Database Schema

### email_verifications Table

```sql
CREATE TABLE IF NOT EXISTS public.email_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Add unique constraint to prevent duplicate codes for same user
    CONSTRAINT unique_user_code UNIQUE(user_id, code)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON public.email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON public.email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_code ON public.email_verifications(code);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON public.email_verifications(expires_at);
```

### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own verification codes
CREATE POLICY "Users can view own verification codes" 
ON public.email_verifications FOR SELECT 
USING (auth.uid() = user_id);

-- Allow anonymous access for signup/verification process
CREATE POLICY "Anonymous can insert verification codes for signup" 
ON public.email_verifications FOR INSERT 
WITH CHECK (auth.role() = 'anon');

CREATE POLICY "Anonymous can read verification codes for verification" 
ON public.email_verifications FOR SELECT 
USING (auth.role() = 'anon');
```

## API Endpoints

### 1. User Registration

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "full_name": "John Doe",
  "password": "securepassword123",
  "role": "innovator"
}
```

**Response:**
```json
{
  "message": "Account created successfully! Please check your email for a 6-digit verification code.",
  "requires_verification": true,
  "user_id": "uuid-here",
  "email": "user@example.com"
}
```

### 2. Email Verification

```http
POST /api/v1/auth/verify-email
Content-Type: application/json

{
  "user_id": "uuid-here",
  "code": "123456"
}
```

**Response:**
```json
{
  "message": "Email verified successfully! Welcome to ESAL Platform!",
  "access_token": "jwt-token-here",
  "token_type": "bearer",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "innovator",
    "is_active": true,
    "email_verified": true
  }
}
```

### 3. Resend Verification Code

```http
POST /api/v1/auth/resend-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Verification code sent successfully! Please check your email.",
  "user_id": "uuid-here"
}
```

### 4. Login (with verification check)

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Error Response for Unverified User:**
```json
{
  "detail": "Please verify your email address before logging in. Check your email for the verification code."
}
```

## Frontend Components

### 1. Signup Components

Located in each portal:
- `apps/innovator-portal/src/pages/Signup.tsx`
- `apps/investor-portal/src/pages/Signup.tsx`

Key features:
- Form validation
- Password confirmation
- Role-specific registration
- Automatic redirect to verification page

### 2. EmailVerification Components

Located in each portal:
- `apps/innovator-portal/src/pages/EmailVerification.tsx`
- `apps/investor-portal/src/pages/EmailVerification.tsx`

Key features:
- 6-digit code input with validation
- Auto-formatting (digits only, max 6 characters)
- Resend functionality with 60-second cooldown
- Real-time countdown timer
- Error and success message display
- Navigation state management

### 3. Login Components

Updated to handle unverified users:
- Show appropriate error messages
- Redirect to email verification page
- Support for "showResendOnly" mode

### 4. App.tsx Router Updates

Each portal includes the email verification route:

```typescript
// Public routes
<Route path="/email-verification" element={<EmailVerification />} />
```

## Testing

### 1. SMTP Test Script

```bash
cd d:\esalPlatform
python test_email_smtp.py
```

Features:
- Tests Gmail SMTP connection
- Sends test verification email
- Validates SMTP configuration
- Manual SMTP connection test

### 2. Registration Flow Test

```bash
cd d:\esalPlatform
python test_registration_flow.py
```

Features:
- Tests complete registration API
- Validates email verification trigger
- Tests resend verification endpoint
- API health checks

### 3. Debug Email Service

```bash
cd d:\esalPlatform
python debug_email_sending.py
```

Features:
- Step-by-step service debugging
- Database verification code checks
- Manual SMTP testing with detailed logging
- Service initialization validation

### 4. Frontend Testing

Manual testing checklist:
- [ ] User can sign up successfully
- [ ] Verification email is received
- [ ] Code entry works correctly
- [ ] Resend functionality works
- [ ] Invalid codes show proper errors
- [ ] Expired codes are handled
- [ ] Successful verification logs user in
- [ ] Unverified users can't log in
- [ ] Proper error messages shown

## Troubleshooting

### Common Issues

#### 1. Emails Not Being Sent

**Symptoms:**
- Registration succeeds but no email received
- SMTP connection errors in logs

**Solutions:**
```bash
# Check SMTP configuration
python test_email_smtp.py

# Verify Gmail App Password
# Ensure 2FA is enabled on Gmail account
# Check firewall/network restrictions
```

#### 2. Database Connection Issues

**Symptoms:**
- Verification codes not being saved
- Database query errors

**Solutions:**
```bash
# Check Supabase connection
python debug_email_sending.py

# Verify environment variables
# Check RLS policies
# Ensure email_verifications table exists
```

#### 3. Frontend Routing Issues

**Symptoms:**
- Verification page not loading
- Navigation state lost

**Solutions:**
- Check App.tsx routing configuration
- Verify EmailVerification component import
- Check navigation state passing

#### 4. Code Verification Failures

**Symptoms:**
- Valid codes rejected
- Expired code errors

**Solutions:**
```sql
-- Check verification codes in database
SELECT * FROM email_verifications 
WHERE email = 'user@example.com' 
ORDER BY created_at DESC;

-- Clean up expired codes
DELETE FROM email_verifications 
WHERE expires_at < NOW();
```

### Debug Commands

```bash
# Backend logs
cd EsalPlatform/apps/api
uvicorn app.main:app --reload --log-level debug

# Frontend dev server
cd EsalPlatform/apps/innovator-portal
pnpm run dev

# Database queries
psql -h your-host -U postgres -d postgres
```

## Security Considerations

### 1. Code Generation

- **Randomness**: Uses cryptographically secure random number generation
- **Length**: 6 digits provide sufficient security for short-term codes
- **Uniqueness**: Database constraints prevent duplicate codes

### 2. Expiry and Cleanup

- **Short Expiry**: 10-minute expiry window minimizes attack window
- **Automatic Cleanup**: Expired codes are automatically cleaned up
- **Single Use**: Codes can only be used once

### 3. Rate Limiting

- **Resend Cooldown**: 60-second cooldown prevents spam
- **API Rate Limiting**: Consider implementing API rate limiting
- **Login Attempts**: Monitor failed verification attempts

### 4. Email Security

- **TLS Encryption**: All SMTP communication is encrypted
- **App Passwords**: Uses Gmail App Passwords instead of main password
- **Sender Validation**: Proper FROM address configuration

### 5. Database Security

- **RLS Policies**: Row-level security ensures data isolation
- **Constraints**: Foreign key constraints maintain data integrity
- **Indexes**: Proper indexing for performance and security

## Monitoring and Analytics

### 1. Key Metrics to Track

- Email delivery success rate
- Verification completion rate
- Code expiry rate
- Resend request frequency
- Average verification time

### 2. Logging

The system logs:
- Registration attempts
- Email sending success/failure
- Verification attempts
- Code expiry cleanup
- SMTP connection issues

### 3. Health Checks

Regular health checks should monitor:
- SMTP service availability
- Database connectivity
- Email queue status
- Verification code table size

## Future Enhancements

### 1. Planned Improvements

- Email templates with better branding
- SMS verification as backup option
- Magic link authentication
- Improved error handling and user feedback
- Admin dashboard for monitoring verification status

### 2. Performance Optimizations

- Email queue for better delivery performance
- Batch cleanup of expired codes
- Caching for frequently accessed data
- Background job processing

### 3. Additional Security Features

- Device fingerprinting
- Geolocation verification
- Two-factor authentication
- Suspicious activity detection

## Conclusion

The ESAL Platform email authentication flow provides a secure, user-friendly verification system that ensures email ownership while maintaining good user experience. The system is designed to be reliable, scalable, and maintainable with comprehensive testing and debugging capabilities.

For additional support or questions about the email authentication system, refer to the troubleshooting section or contact the development team.

---

**Last Updated:** June 6, 2025  
**Version:** 1.0  
**Author:** ESAL Development Team
