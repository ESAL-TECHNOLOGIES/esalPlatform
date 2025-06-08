# Admin User Creation - Quick Reference

## Script Location
```
d:\esalPlatform\EsalPlatform\apps\api\create_admin_user.py
```

## Quick Start Commands

### Run the Script
```bash
cd d:\esalPlatform\EsalPlatform\apps\api
python create_admin_user.py
```

### Menu Options
1. **Create Single Admin** - Interactive mode with custom details
2. **Create Multiple Admins** - Batch creation for development
3. **View Documentation** - Open detailed guide
4. **Exit** - Close the script

## Input Requirements

### Email
- Valid email format (e.g., admin@esal.platform)
- Must be unique

### Username  
- 3-20 characters
- Letters, numbers, hyphens, underscores only
- Cannot start/end with hyphens or underscores

### Password
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter  
- At least one number
- At least one special character (!@#$%^&* etc.)

### Full Name
- Minimum 2 characters
- Any characters allowed

## Common Commands

### Check Environment
```bash
# Verify .env file exists
ls .env

# Check required variables
cat .env | grep SUPABASE
```

### Test Admin Login
After creation, test at: `http://localhost:3004/login`

## Predefined Admin Users (Development)

| Email | Username | Role | Password |
|-------|----------|------|----------|
| admin@esal.platform | sysadmin | System Admin | AdminSecure123! |
| manager@esal.platform | manager | Platform Manager | ManagerSecure123! |
| super@esal.platform | superadmin | Super Admin | SuperSecure123! |

## Troubleshooting

### Missing .env File
```bash
# Copy from example
cp .env.example .env
# Edit with your Supabase credentials
```

### Dependencies Missing
```bash
pip install -r requirements.txt
```

### Supabase Connection Issues
- Check SUPABASE_URL in .env
- Verify SUPABASE_SERVICE_ROLE_KEY
- Test Supabase connectivity

## Success Indicators
- ✅ User created with ID
- ✅ Profile created in database
- ✅ Login test successful
- ✅ Admin role assigned

## Documentation
- **Detailed Guide**: ADMIN_USER_CREATION_GUIDE.md
- **Platform Setup**: PLATFORM_STARTUP.md
- **Admin Portal**: ../admin-portal/README.md

---
*Quick reference for ESAL Platform admin user creation*
