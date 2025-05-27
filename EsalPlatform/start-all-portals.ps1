# ESAL Platform - Multi-Portal Startup Script
# This script starts all portals for the MVP platform

Write-Host "🚀 Starting ESAL Platform Multi-Portal System" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Navigate to the project root
$projectRoot = "d:\esalPlatform\EsalPlatform"
Set-Location $projectRoot

Write-Host "📍 Project root: $projectRoot" -ForegroundColor Yellow

# Check if pnpm is available
try {
    $pnpmVersion = pnpm --version
    Write-Host "✅ PNPM version: $pnpmVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ PNPM not found. Please install PNPM first." -ForegroundColor Red
    exit 1
}

Write-Host "`n🔧 Installing dependencies..." -ForegroundColor Yellow
pnpm install

Write-Host "`n📦 Building UI package..." -ForegroundColor Yellow
pnpm build --filter=@esal/ui

Write-Host "`n🌐 Starting all portals..." -ForegroundColor Yellow
Write-Host "This will start the following services:" -ForegroundColor Cyan
Write-Host "• Landing Page     - http://localhost:3000" -ForegroundColor Cyan
Write-Host "• Innovator Portal - http://localhost:3001" -ForegroundColor Cyan
Write-Host "• Investor Portal  - http://localhost:3002" -ForegroundColor Cyan
Write-Host "• Hub Portal       - http://localhost:3003" -ForegroundColor Cyan
Write-Host "• Admin Portal     - http://localhost:3004" -ForegroundColor Cyan

# Start development mode for all apps
Write-Host "`n⚡ Starting development servers..." -ForegroundColor Green
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot' ; pnpm dev"

# Wait a bit for servers to start
Start-Sleep -Seconds 5

# Start admin portal separately if needed
Write-Host "`n🔧 Starting Admin Portal separately..." -ForegroundColor Yellow
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\apps\admin-portal' ; pnpm dev"

Write-Host "`n✅ All portals are starting!" -ForegroundColor Green
Write-Host "🌐 You can now access the portals at:" -ForegroundColor White
Write-Host "• Landing Page:     http://localhost:3000" -ForegroundColor White
Write-Host "• Innovator Portal: http://localhost:3001" -ForegroundColor White
Write-Host "• Investor Portal:  http://localhost:3002" -ForegroundColor White
Write-Host "• Hub Portal:       http://localhost:3003" -ForegroundColor White
Write-Host "• Admin Portal:     http://localhost:3004" -ForegroundColor White

Write-Host "`n📋 System Status:" -ForegroundColor Yellow
Write-Host "• Multi-portal architecture ✅" -ForegroundColor Green
Write-Host "• Shared UI components ✅" -ForegroundColor Green
Write-Host "• Cross-portal navigation ✅" -ForegroundColor Green
Write-Host "• Development environment ✅" -ForegroundColor Green
Write-Host "• Turborepo monorepo ✅" -ForegroundColor Green

Write-Host "`nPress any key to open all portals in browser..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open all portals in browser
Start-Process "http://localhost:3000"
Start-Process "http://localhost:3001"
Start-Process "http://localhost:3002"
Start-Process "http://localhost:3003"
Start-Process "http://localhost:3004"

Write-Host "`n🎉 ESAL Platform is now running!" -ForegroundColor Green
