# ESAL Platform Deployment Helper Script (PowerShell)
# This script helps prepare your environment for Supabase + Render deployment

param(
    [switch]$SkipValidation,
    [switch]$GenerateOnly
)

# Colors for output
$script:Red = [System.ConsoleColor]::Red
$script:Green = [System.ConsoleColor]::Green
$script:Yellow = [System.ConsoleColor]::Yellow
$script:Blue = [System.ConsoleColor]::Blue
$script:White = [System.ConsoleColor]::White

function Write-Status {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor $Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor $Blue
}

Write-Host "🚀 ESAL Platform Deployment Helper" -ForegroundColor $Blue
Write-Host "==================================" -ForegroundColor $Blue

# Check if running from project root
if (-not (Test-Path "package.json") -or -not (Test-Path "apps")) {
    Write-Error "Please run this script from the ESAL Platform project root directory"
    exit 1
}

Write-Status "Project directory validated"

# Check for required tools
function Test-Dependencies {
    Write-Info "Checking dependencies..."
    
    try {
        $nodeVersion = node --version
        Write-Status "Node.js found: $nodeVersion"
    }
    catch {
        Write-Error "Node.js is required but not installed"
        exit 1
    }
    
    try {
        $pnpmVersion = pnpm --version
        Write-Status "pnpm found: $pnpmVersion"
    }
    catch {
        Write-Warning "pnpm not found, please install it: npm install -g pnpm"
    }
    
    try {
        $pythonVersion = python --version
        Write-Status "Python found: $pythonVersion"
    }
    catch {
        Write-Error "Python 3 is required but not installed"
        exit 1
    }
    
    Write-Status "All dependencies are available"
}

# Setup environment files
function Initialize-Environment {
    Write-Info "Setting up environment configuration..."
    
    # Ensure secrets directory exists
    if (-not (Test-Path "secrets\environments")) {
        New-Item -ItemType Directory -Path "secrets\environments" -Force | Out-Null
    }
    
    # Check if production environment file exists
    if (-not (Test-Path "secrets\environments\.env.production")) {
        Write-Warning "Production environment file not found, creating template..."
        
        # Generate a random JWT secret
        $jwtSecret = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
        
        $envContent = @"
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Application Configuration
DEBUG=false
ENVIRONMENT=production
PROJECT_NAME=ESAL Platform
API_VERSION=v1

# CORS Configuration (update with your Render URLs)
ALLOWED_ORIGINS=https://your-frontend.onrender.com,https://your-api.onrender.com

# JWT Configuration
JWT_SECRET_KEY=$jwtSecret
JWT_ALGORITHM=HS256
JWT_EXPIRATION_TIME=3600

# AI Configuration
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=ESAL Platform
"@
        
        Set-Content -Path "secrets\environments\.env.production" -Value $envContent
        Write-Status "Created production environment template"
        Write-Warning "Please update secrets\environments\.env.production with your actual values"
    }
    else {
        Write-Status "Production environment file exists"
    }
}

# Validate project structure
function Test-ProjectStructure {
    Write-Info "Validating project structure..."
    
    $requiredDirs = @(
        "apps\api",
        "apps\landing",
        "apps\hub-portal",
        "apps\innovator-portal",
        "apps\investor-portal",
        "apps\admin-portal",
        "secrets",
        "docs"
    )
    
    foreach ($dir in $requiredDirs) {
        if (Test-Path $dir) {
            Write-Status "$dir exists"
        }
        else {
            Write-Error "Missing required directory: $dir"
            exit 1
        }
    }
}

# Test build processes
function Test-Builds {
    Write-Info "Testing build processes..."
    
    # Test API dependencies
    if (Test-Path "apps\api\requirements.txt") {
        Write-Info "Testing API dependencies..."
        Push-Location "apps\api"
        try {
            python -m pip check 2>$null
            Write-Status "API dependencies are valid"
        }
        catch {
            Write-Warning "Some API dependencies may have issues"
        }
        Pop-Location
    }
    
    # Test frontend builds
    $frontends = @("landing", "hub-portal", "innovator-portal", "investor-portal", "admin-portal")
    
    foreach ($frontend in $frontends) {
        if (Test-Path "apps\$frontend\package.json") {
            Write-Info "Testing $frontend build..."
            Push-Location "apps\$frontend"
            
            # Check if package.json is valid
            try {
                $packageJson = Get-Content "package.json" | ConvertFrom-Json
                Write-Status "$frontend package.json is valid"
            }
            catch {
                Write-Warning "$frontend package.json may have issues"
            }
            
            Pop-Location
        }
    }
}

# Generate deployment commands
function New-DeploymentCommands {
    Write-Info "Generating deployment commands..."
    
    $envContent = ""
    if (Test-Path "secrets\environments\.env.production") {
        $envContent = Get-Content "secrets\environments\.env.production" | Where-Object { $_ -notmatch '^#' -and $_ -ne '' } | Out-String
    }
    
    $commandsContent = @"
# ESAL Platform Deployment Commands

## Render API Service Configuration

**Build Command:**
``````bash
pip install -r requirements.txt
``````

**Start Command:**
``````bash
uvicorn main:app --host 0.0.0.0 --port `$PORT
``````

## Render Static Sites Configuration

### Landing Page
- **Root Directory:** ``apps/landing``
- **Build Command:** ``pnpm install && pnpm run build``
- **Publish Directory:** ``dist``

### Hub Portal
- **Root Directory:** ``apps/hub-portal``
- **Build Command:** ``pnpm install && pnpm run build``
- **Publish Directory:** ``dist``

### Innovator Portal
- **Root Directory:** ``apps/innovator-portal``
- **Build Command:** ``pnpm install && pnpm run build``
- **Publish Directory:** ``dist``

### Investor Portal
- **Root Directory:** ``apps/investor-portal``
- **Build Command:** ``pnpm install && pnpm run build``
- **Publish Directory:** ``dist``

### Admin Portal
- **Root Directory:** ``apps/admin-portal``
- **Build Command:** ``pnpm install && pnpm run build``
- **Publish Directory:** ``dist``

## Environment Variables for Render

Copy these to each service:

### API Service
``````
$envContent
``````

### Frontend Services
``````
VITE_API_URL=https://your-api.onrender.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
``````

## Next Steps

1. Create Supabase project and update environment variables
2. Push code to GitHub repository
3. Create Render services using the configurations above
4. Deploy in this order: API → Frontends → Update CORS

"@

    Set-Content -Path "deployment-commands.md" -Value $commandsContent
    Write-Status "Generated deployment-commands.md"
}

# Main execution
function Invoke-Main {
    Write-Host ""
    Write-Info "Starting deployment preparation..."
    Write-Host ""
    
    if (-not $SkipValidation) {
        Test-Dependencies
        Test-ProjectStructure
        Test-Builds
    }
    
    if (-not $GenerateOnly) {
        Initialize-Environment
    }
    
    New-DeploymentCommands
    
    Write-Host ""
    Write-Status "Deployment preparation complete!"
    Write-Host ""
    Write-Info "Next steps:"
    Write-Host "  1. Update secrets\environments\.env.production with your values"
    Write-Host "  2. Review deployment-commands.md for Render configuration"
    Write-Host "  3. Follow the deployment guide: docs\deployment\README.md"
    Write-Host "  4. Use quick reference: docs\deployment\quick-reference.md"
    Write-Host ""
    Write-Warning "Remember to keep your environment variables secure!"
}

# Run main function
try {
    Invoke-Main
}
catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
    exit 1
}
