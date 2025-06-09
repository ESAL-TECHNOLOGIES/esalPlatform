# React useState Error Debug Guide for Render Deployment

## Error Description
```
TypeError: Cannot read properties of null (reading 'useState')
    at Ve.useState (index-nkhFDmO7.js:75:6499)
    at m5 (index-nkhFDmO7.js:83:37136)
    ...
```

This error occurs specifically on the Render deployment, not in local development.

## Debug Setup Instructions

### Option 1: Browser Console Debug Script (Recommended)

1. **Open the Render deployment**:
   - Go to: `https://esal-innovator-portal.onrender.com`

2. **Open Browser Developer Tools**:
   - Press `F12` or right-click → "Inspect"
   - Go to the "Console" tab

3. **Load the debug script**:
   - Copy the entire contents of `render-debug-console.js`
   - Paste into the console and press Enter

4. **Reproduce the error**:
   - Navigate through the app to trigger the useState error
   - The script will automatically catch and log detailed information

5. **Collect debug data**:
   ```javascript
   // Get useState-specific errors
   window.renderDebug.getUseStateErrors()
   
   // Get all collected data
   window.renderDebug.exportData()
   
   // Analyze React state
   window.renderDebug.analyzeReact()
   ```

### Option 2: Built-in Production Debugger

The production debugger is automatically enabled on Render deployments:

1. **Visual Debug Panel**: Look for a small debug widget in the top-right corner
2. **Console Logging**: All errors are automatically logged with enhanced details
3. **Global Access**: Use `window.productionDebug` in the console

### Option 3: Manual Debug Activation

Add `?debug=true` to any URL on the Render deployment:
```
https://esal-innovator-portal.onrender.com?debug=true
```

Or enable in localStorage:
```javascript
localStorage.setItem('enableDebug', 'true')
```

## What to Look For

### 1. useState Error Patterns
- `Cannot read properties of null (reading 'useState')`
- `TypeError: Cannot read properties of undefined (reading 'useState')`
- React hook call order violations

### 2. Environment Differences
- React version mismatches
- Build configuration differences
- Module loading issues
- Vite vs local environment differences

### 3. Timing Issues
- Components rendering before React is fully loaded
- Race conditions in module imports
- Early hook calls before React context is established

## Expected Debug Output

When the error occurs, you should see:

```
🎯 USESTATE ERROR CAUGHT!
🚨 This is exactly what we're looking for!
Error details: {
  timestamp: "2025-01-XX...",
  source: "window.error",
  message: "Cannot read properties of null (reading 'useState')",
  stack: "...",
  url: "https://esal-innovator-portal.onrender.com",
  reactVersion: "18.3.1"
}
```

## Troubleshooting Steps

### If No Errors Are Caught
1. Clear browser cache and hard refresh (`Ctrl+F5`)
2. Try in incognito/private browsing mode
3. Check if error occurs in different browsers
4. Verify the debug script loaded: `typeof window.renderDebug`

### If Debug Script Fails to Load
1. Check console for JavaScript errors
2. Verify network connectivity
3. Try copying smaller portions of the script

### If React Seems Missing
```javascript
// Check React availability
console.log('React:', typeof window.React)
console.log('React version:', window.React?.version)
console.log('Scripts loaded:', Array.from(document.querySelectorAll('script[src]')).map(s => s.src))
```

## Data Collection

When you find the error, collect:

1. **Error details** from `window.renderDebug.getUseStateErrors()`
2. **React state analysis** from `window.renderDebug.analyzeReact()`
3. **Full debug export** from `window.renderDebug.exportData()`
4. **Browser information**: User agent, version, extensions
5. **Network information**: Check if all assets loaded correctly

## Common Causes & Solutions

### 1. React Version Conflicts
- **Check**: Multiple React instances loaded
- **Solution**: Ensure only one React version in build

### 2. Build Configuration Issues
- **Check**: Vite configuration differences between dev/prod
- **Solution**: Review `vite.config.simple.js` settings

### 3. Module Loading Race Conditions
- **Check**: Hook calls before React is ready
- **Solution**: Add proper loading guards

### 4. SSR/Hydration Issues
- **Check**: Server-side rendering conflicts
- **Solution**: Ensure client-side only hook usage

## Files Modified for Debug

1. `src/debug/ReactDebugger.tsx` - Enhanced hook debugging
2. `src/debug/ProductionDebugger.tsx` - Production-specific debugger
3. `src/debug/production-debug.js` - Standalone debug script
4. `src/main.tsx` - Early error detection
5. `index.html` - Inline debug script for immediate error catching
6. `render-debug-console.js` - Browser console debug script

## Next Steps

1. Run the debug script on the Render deployment
2. Reproduce the useState error
3. Collect the debug data
4. Analyze the React environment state when error occurs
5. Compare with local development environment
6. Identify the root cause and implement fix

## Support Commands

```javascript
// Quick debug check
window.renderDebug?.analyzeReact()

// Clear error log
window.renderDebug?.clearErrors()

// Export all data for analysis
JSON.stringify(window.renderDebug?.exportData(), null, 2)
```
