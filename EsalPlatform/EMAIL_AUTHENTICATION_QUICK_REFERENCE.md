# Email Authentication Quick Reference

## 🚀 Quick Start

### Testing Email System
```bash
# Test SMTP configuration
python test_email_smtp.py

# Test registration flow
python test_registration_flow.py

# Debug email service
python debug_email_sending.py
```

### Key Files

```
Backend:
├── apps/api/app/config.py                 # SMTP configuration
├── apps/api/app/services/email_verification.py    # Email service
├── apps/api/app/services/auth_supabase.py # Auth service
├── apps/api/app/routers/auth.py           # API endpoints
└── apps/api/app/schemas/__init__.py       # Data schemas

Frontend:
├── apps/innovator-portal/src/pages/Signup.tsx          # Signup page
├── apps/innovator-portal/src/pages/EmailVerification.tsx # Verification page
├── apps/innovator-portal/src/pages/Login.tsx           # Login page
└── apps/innovator-portal/src/App.tsx                   # Router config

Database:
└── apps/api/email_verifications_table.sql # Database schema
```

## 📧 Email Templates

### Verification Email Structure
- **Subject**: "Verify your email - ESAL Platform"
- **6-digit code**: Prominently displayed
- **Expiry**: 10 minutes
- **Branding**: ESAL Ventures styling

## 🔧 Configuration

### SMTP Settings (Gmail)
```python
# Configuration now uses environment variables
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "ESAL Platform")
```

### Key Environment Variables
```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET_KEY=your_jwt_secret
JWT_ALGORITHM=HS256
JWT_EXPIRATION_TIME=3600

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM_EMAIL=your-gmail-email@gmail.com
SMTP_FROM_NAME=Your Company Name
```

## 🔄 API Endpoints

### Registration
```http
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "full_name": "John Doe", 
  "password": "password123",
  "role": "innovator"
}
```

### Verification
```http
POST /api/v1/auth/verify-email
{
  "user_id": "uuid",
  "code": "123456"
}
```

### Resend Code
```http
POST /api/v1/auth/resend-verification
{
  "email": "user@example.com"
}
```

## 🗄️ Database Queries

### Check recent verification codes
```sql
SELECT * FROM email_verifications 
WHERE email = 'user@example.com' 
ORDER BY created_at DESC 
LIMIT 5;
```

### Clean expired codes
```sql
DELETE FROM email_verifications 
WHERE expires_at < NOW();
```

### Check user verification status
```sql
SELECT email, user_metadata->>'email_verified' as verified 
FROM auth.users 
WHERE email = 'user@example.com';
```

## 🐛 Common Issues & Fixes

### Email not sent
```bash
# Check SMTP connection
python test_email_smtp.py

# Verify Gmail App Password
# Check firewall settings
```

### Registration fails
```bash
# Check backend logs
# Verify Supabase connection
# Check database table exists
```

### Frontend routing issues
```typescript
// Ensure route exists in App.tsx
<Route path="/email-verification" element={<EmailVerification />} />

// Check component import
import EmailVerification from "./pages/EmailVerification";
```

## 📱 User Flow

1. **Signup** → User creates account
2. **Email Sent** → 6-digit code via Gmail
3. **Verification** → User enters code
4. **Success** → Account verified & logged in

## 🔒 Security Features

- ✅ 6-digit secure random codes
- ✅ 10-minute expiry window
- ✅ Single-use codes
- ✅ 60-second resend cooldown
- ✅ TLS encrypted email delivery
- ✅ Database RLS policies

## 📊 Monitoring

### Key Metrics
- Email delivery rate
- Verification completion rate
- Code expiry rate
- Average verification time

### Health Checks
- SMTP connectivity
- Database connection
- Email queue status

---
*Last updated: June 6, 2025*
