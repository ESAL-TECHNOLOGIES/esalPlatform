// React useState Error Debug Script
// Copy and paste this into the browser console to get immediate useState error detection

console.log('🔧 Loading React useState Error Debugger...');

// Enhanced useState error detection
(function() {
  'use strict';
  
  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;
  
  // Error tracking
  let errorCount = 0;
  let useStateErrors = [];
  
  // Enhanced error logging
  console.error = function(...args) {
    errorCount++;
    const message = args.join(' ');
    
    // Check for useState specific errors
    if (message.includes('useState') || 
        message.includes('Cannot read properties of null') ||
        message.includes('reading \'useState\'')) {
      
      const error = {
        id: errorCount,
        timestamp: new Date().toISOString(),
        message: message,
        args: args,
        stack: new Error().stack,
        location: window.location.href
      };
      
      useStateErrors.push(error);
      
      console.group('🚨 USESTATE ERROR DETECTED #' + errorCount);
      originalError.apply(console, ['🎯 useState Error Details:', error]);
      originalError.apply(console, ['📍 Call Stack:', error.stack]);
      originalError.apply(console, ['🌐 Current Page:', window.location.href]);
      originalError.apply(console, ['⏰ Timestamp:', error.timestamp]);
      
      // Try to determine which component is failing
      if (error.stack) {
        const stackLines = error.stack.split('\n');
        const relevantLines = stackLines.filter(line => 
          line.includes('.tsx') || 
          line.includes('.jsx') || 
          line.includes('Component')
        );
        if (relevantLines.length > 0) {
          originalError.apply(console, ['🧩 Likely Component:', relevantLines[0]]);
        }
      }
      
      console.groupEnd();
      
      // Alert for immediate visibility
      setTimeout(() => {
        alert(`🚨 useState Error Detected!\n\nError #${errorCount}\nMessage: ${message.substring(0, 100)}...\n\nCheck console for details.`);
      }, 100);
    }
    
    // Call original error function
    originalError.apply(console, args);
  };
  
  // React state monitoring
  if (typeof React !== 'undefined' && React.useState) {
    const originalUseState = React.useState;
    
    React.useState = function(initialState) {
      console.log('🎣 useState called with initial state:', initialState);
      
      try {
        const result = originalUseState(initialState);
        console.log('✅ useState successful:', result);
        return result;
      } catch (error) {
        console.error('❌ useState failed:', error);
        throw error;
      }
    };
    
    console.log('✅ React.useState patched for monitoring');
  } else {
    console.warn('⚠️ React.useState not available for patching');
  }
  
  // Component render monitoring
  if (typeof React !== 'undefined' && React.createElement) {
    const originalCreateElement = React.createElement;
    
    React.createElement = function(type, props, ...children) {
      if (typeof type === 'function') {
        console.log('🧩 Creating component:', type.name || 'Anonymous', props);
      }
      
      try {
        return originalCreateElement.apply(this, arguments);
      } catch (error) {
        console.error('❌ Component creation failed:', type.name || 'Anonymous', error);
        throw error;
      }
    };
    
    console.log('✅ React.createElement patched for monitoring');
  }
  
  // Global utilities
  window.debugReact = {
    getErrorCount: () => errorCount,
    getUseStateErrors: () => useStateErrors,
    clearErrors: () => {
      errorCount = 0;
      useStateErrors = [];
      console.log('🧹 Errors cleared');
    },
    checkReactState: () => {
      console.group('🔍 React State Check');
      console.log('React available:', typeof React !== 'undefined');
      console.log('React version:', React?.version || 'Unknown');
      console.log('useState available:', typeof React?.useState === 'function');
      console.log('useEffect available:', typeof React?.useEffect === 'function');
      console.log('Total errors detected:', errorCount);
      console.log('useState errors:', useStateErrors.length);
      console.groupEnd();
    },
    simulateError: () => {
      console.error('Test useState error: Cannot read properties of null (reading \'useState\')');
    }
  };
  
  console.log('🎯 React useState Error Debugger loaded!');
  console.log('📋 Available commands:');
  console.log('  - debugReact.getErrorCount()');
  console.log('  - debugReact.getUseStateErrors()');
  console.log('  - debugReact.clearErrors()');
  console.log('  - debugReact.checkReactState()');
  console.log('  - debugReact.simulateError()');
  
})();
