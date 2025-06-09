// Production Debug Script for Render Deployment
// This script should be injected into the browser console or added to the production build

(function() {
  'use strict';
  
  console.log('🚀 Initializing Production React Debug for Render Deployment...');
  
  // Global error tracking
  const errorLog = [];
  
  // Track all errors globally
  window.addEventListener('error', function(event) {
    const error = {
      timestamp: new Date().toISOString(),
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error ? event.error.stack : null,
      type: 'global_error'
    };
    
    errorLog.push(error);
    
    // Check for useState specific error
    if (event.message && event.message.includes('useState')) {
      console.group('🚨 USESTATE ERROR DETECTED IN PRODUCTION');
      console.error('Error details:', error);
      console.error('Environment:', {
        userAgent: navigator.userAgent,
        location: window.location.href,
        buildTime: document.querySelector('meta[name="build-time"]')?.content || 'unknown',
        viteEnv: window.__VITE_ENV__ || 'unknown'
      });
      console.groupEnd();
      
      // Send error to console with specific formatting for easy identification
      console.error('🎯 RENDER DEPLOYMENT USESTATE ERROR:', {
        message: event.message,
        file: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error ? event.error.stack : null,
        timestamp: error.timestamp
      });
    }
  });
  
  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    const error = {
      timestamp: new Date().toISOString(),
      reason: event.reason,
      type: 'unhandled_rejection'
    };
    
    errorLog.push(error);
    
    if (event.reason && event.reason.toString().includes('useState')) {
      console.error('🚨 UNHANDLED PROMISE REJECTION - USESTATE:', error);
    }
  });
  
  // Override console.error to catch React errors
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    
    if (message.includes('useState') || message.includes('Cannot read properties of null')) {
      console.group('🚨 CONSOLE ERROR INTERCEPTED - USESTATE');
      console.log('Arguments:', args);
      console.log('Stack trace:', new Error().stack);
      console.log('Timestamp:', new Date().toISOString());
      console.log('Page URL:', window.location.href);
      console.groupEnd();
      
      // Store in error log
      errorLog.push({
        timestamp: new Date().toISOString(),
        type: 'console_error',
        message: message,
        args: args,
        stack: new Error().stack
      });
    }
    
    // Call original console.error
    originalConsoleError.apply(console, args);
  };
  
  // React DevTools detection
  function checkReactDevTools() {
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      console.log('✅ React DevTools detected');
      
      // Hook into React DevTools for component tracking
      const devTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (devTools.onCommitFiberRoot) {
        const originalOnCommitFiberRoot = devTools.onCommitFiberRoot;
        devTools.onCommitFiberRoot = function(id, root, priorityLevel) {
          try {
            return originalOnCommitFiberRoot.call(this, id, root, priorityLevel);
          } catch (error) {
            console.error('🚨 React DevTools Hook Error:', error);
            if (error.message.includes('useState')) {
              console.error('🎯 USESTATE ERROR IN REACT DEVTOOLS HOOK');
            }
          }
        };
      }
    } else {
      console.log('⚠️ React DevTools not detected');
    }
  }
  
  // Check React environment
  function checkReactEnvironment() {
    console.group('🔍 React Environment Check');
    
    // Check if React is loaded
    const reactExists = typeof window.React !== 'undefined';
    console.log('React global:', reactExists ? '✅' : '❌');
    
    if (reactExists) {
      console.log('React version:', window.React.version);
      console.log('React.useState:', typeof window.React.useState);
      console.log('React.useEffect:', typeof window.React.useEffect);
    }
    
    // Check for multiple React instances
    const reactInstances = [];
    if (window.React) reactInstances.push('window.React');
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      console.log('React DevTools Hook exists');
    }
    
    console.log('React instances found:', reactInstances);
    
    // Check build environment
    console.log('Environment variables:', {
      NODE_ENV: process?.env?.NODE_ENV || 'unknown',
      MODE: import.meta?.env?.MODE || 'unknown',
      VITE_ENVIRONMENT: import.meta?.env?.VITE_ENVIRONMENT || 'unknown'
    });
    
    console.groupEnd();
  }
  
  // Bundle analysis
  function analyzeBundles() {
    console.group('📦 Bundle Analysis');
    
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    console.log('Script tags:', scripts.map(s => s.src));
    
    // Look for React in script names
    const reactScripts = scripts.filter(s => 
      s.src.includes('react') || 
      s.src.includes('vendor') || 
      s.src.includes('index')
    );
    
    console.log('Potential React scripts:', reactScripts.map(s => s.src));
    
    console.groupEnd();
  }
  
  // Component error boundary simulation
  function setupComponentErrorTracking() {
    // Override React.createElement to track component creation
    if (window.React && window.React.createElement) {
      const originalCreateElement = window.React.createElement;
      window.React.createElement = function(type, props, ...children) {
        try {
          return originalCreateElement.call(this, type, props, ...children);
        } catch (error) {
          console.error('🚨 React.createElement error:', {
            type: type,
            props: props,
            error: error.message,
            stack: error.stack
          });
          
          if (error.message.includes('useState')) {
            console.error('🎯 USESTATE ERROR IN CREATEELEMENT');
          }
          
          throw error;
        }
      };
    }
  }
  
  // Main initialization
  function initialize() {
    console.log('🔧 Initializing production debug...');
    
    checkReactEnvironment();
    checkReactDevTools();
    analyzeBundles();
    setupComponentErrorTracking();
    
    // Make debug functions available globally
    window.debugReact = {
      getErrors: () => errorLog,
      clearErrors: () => errorLog.length = 0,
      checkEnvironment: checkReactEnvironment,
      analyzeBundles: analyzeBundles,
      errorCount: () => errorLog.length,
      useStateErrors: () => errorLog.filter(e => 
        e.message && e.message.includes('useState')
      )
    };
    
    console.log('✅ Production debug initialized. Use window.debugReact to access debug functions.');
    console.log('📊 Commands available:');
    console.log('  - window.debugReact.getErrors() - Get all errors');
    console.log('  - window.debugReact.useStateErrors() - Get useState specific errors');
    console.log('  - window.debugReact.checkEnvironment() - Check React environment');
    console.log('  - window.debugReact.analyzeBundles() - Analyze loaded bundles');
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  // Also initialize after a short delay to catch late-loading React
  setTimeout(initialize, 1000);
  
})();
