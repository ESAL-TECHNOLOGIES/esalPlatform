#!/usr/bin/env powershell

# Debug-Enhanced Render Deployment Script for Innovator Portal

Write-Host "🚀 Starting debug-enhanced deployment for Render..." -ForegroundColor Green

# Navigate to innovator portal
Set-Location "d:\esalPlatform\EsalPlatform\apps\innovator-portal"

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "🔧 Building with debug features enabled..." -ForegroundColor Yellow
$env:NODE_ENV = "production"
$env:VITE_ENVIRONMENT = "production"
$env:BUILD_TIME = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"

# Build for Render using the Render-specific command
try {
    npm run build:render
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Build failed. Attempting fallback build..." -ForegroundColor Red
    npm run build:simple
}

Write-Host "📊 Build analysis:" -ForegroundColor Cyan
Write-Host "- Dist folder size:" -ForegroundColor White
Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum | Select-Object @{Name = "Size(MB)"; Expression = { [math]::Round($_.Sum / 1MB, 2) } }

Write-Host "- Main files in dist:" -ForegroundColor White
Get-ChildItem -Path "dist" -Name

Write-Host ""
Write-Host "🎯 Debug Features Included:" -ForegroundColor Green
Write-Host "✅ Production debugger in main.tsx" -ForegroundColor White
Write-Host "✅ Error boundary with useState detection" -ForegroundColor White
Write-Host "✅ Early error detection in index.html" -ForegroundColor White
Write-Host "✅ Console debug script available" -ForegroundColor White
Write-Host "✅ Global error tracking" -ForegroundColor White

Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Push these changes to your Git repository" -ForegroundColor White
Write-Host "2. Trigger a deployment on Render" -ForegroundColor White
Write-Host "3. Once deployed, open the Render URL" -ForegroundColor White
Write-Host "4. Open browser console (F12)" -ForegroundColor White
Write-Host "5. Look for debug messages and reproduce the error" -ForegroundColor White

Write-Host ""
Write-Host "🔍 Debug Tools Available:" -ForegroundColor Cyan
Write-Host "- Browser Console: Automatic error detection" -ForegroundColor White
Write-Host "- Visual Debug Panel: Top-right corner widget" -ForegroundColor White
Write-Host "- Console Commands: window.productionDebug" -ForegroundColor White
Write-Host "- Manual Debug Script: See render-debug-console.js" -ForegroundColor White

Write-Host ""
Write-Host "🚨 When you see the useState error:" -ForegroundColor Red
Write-Host "1. Check console for '🎯 USESTATE ERROR' messages" -ForegroundColor White
Write-Host "2. Run: window.productionDebug?.exportDebugData()" -ForegroundColor White
Write-Host "3. Save the output for analysis" -ForegroundColor White

Write-Host ""
Write-Host "✅ Debug-enhanced build ready for deployment!" -ForegroundColor Green
