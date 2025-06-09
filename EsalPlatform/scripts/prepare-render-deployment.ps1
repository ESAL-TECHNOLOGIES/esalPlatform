# PowerShell script to help set up Render deployment
# Run this script to validate your deployment configuration

Write-Host "🚀 ESAL Platform - Render Deployment Helper" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "turbo.json")) {
    Write-Host "❌ Error: This script must be run from the EsalPlatform root directory" -ForegroundColor Red
    exit 1
}

Write-Host "`n📋 Checking deployment requirements..." -ForegroundColor Yellow

# Check for required files
$requiredFiles = @(
    "render.yaml",
    "render.env.template",
    "apps/api/render.yaml",
    "apps/landing/render.yaml",
    "apps/hub-portal/render.yaml",
    "apps/innovator-portal/render.yaml",
    "apps/investor-portal/render.yaml",
    "apps/admin-portal/render.yaml"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file (missing)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host "`n❌ Some required files are missing. Please run the render.yaml generation first." -ForegroundColor Red
    exit 1
}

# Check for pnpm
Write-Host "`n🔧 Checking dependencies..." -ForegroundColor Yellow
try {
    $pnpmVersion = pnpm --version
    Write-Host "✅ pnpm version: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ pnpm not found. Please install pnpm first." -ForegroundColor Red
    exit 1
}

# Check if packages are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    pnpm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Test build commands
Write-Host "`n🔨 Testing build commands..." -ForegroundColor Yellow

$buildTests = @(
    "landing",
    "hub-portal", 
    "innovator-portal",
    "investor-portal",
    "admin-portal"
)

foreach ($app in $buildTests) {
    Write-Host "Building $app..." -ForegroundColor Cyan
    $result = pnpm turbo build --filter=$app
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $app build successful" -ForegroundColor Green
    } else {
        Write-Host "❌ $app build failed" -ForegroundColor Red
    }
}

# Check environment template
Write-Host "`n🔐 Checking environment configuration..." -ForegroundColor Yellow

if (Test-Path "render.env.local") {
    Write-Host "✅ render.env.local exists (don't commit this file!)" -ForegroundColor Green
} else {
    Write-Host "⚠️  render.env.local not found" -ForegroundColor Yellow
    Write-Host "   Create it by copying render.env.template and filling in your values" -ForegroundColor Gray
}

# Generate deployment summary
Write-Host "`n📊 Deployment Summary" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green

Write-Host "`nServices to deploy:" -ForegroundColor White
Write-Host "🔧 API Service: esal-platform-api" -ForegroundColor Cyan
Write-Host "🌐 Landing: esal-landing" -ForegroundColor Cyan
Write-Host "🏢 Hub Portal: esal-hub-portal" -ForegroundColor Cyan
Write-Host "💡 Innovator Portal: esal-innovator-portal" -ForegroundColor Cyan
Write-Host "💰 Investor Portal: esal-investor-portal" -ForegroundColor Cyan
Write-Host "⚙️  Admin Portal: esal-admin-portal" -ForegroundColor Cyan

Write-Host "`n📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Push your code to GitHub" -ForegroundColor White
Write-Host "2. Set up Supabase project" -ForegroundColor White
Write-Host "3. Create render.env.local with your secrets" -ForegroundColor White
Write-Host "4. Deploy API service first on Render" -ForegroundColor White
Write-Host "5. Deploy frontend services" -ForegroundColor White
Write-Host "6. Update CORS configuration" -ForegroundColor White

Write-Host "`n🔗 Useful Links:" -ForegroundColor Yellow
Write-Host "Render Dashboard: https://dashboard.render.com" -ForegroundColor Blue
Write-Host "Supabase Dashboard: https://supabase.com/dashboard" -ForegroundColor Blue
Write-Host "Deployment Guide: ./RENDER_DEPLOYMENT_GUIDE.md" -ForegroundColor Blue

Write-Host "`n✨ Ready for deployment! 🚀" -ForegroundColor Green
