import React from 'react';
import { debugUtils } from './ReactDebugger';
import { initializeGlobalErrorTracking, GlobalErrorTracker } from './ComponentDebugger';

export * from './ReactDebugger';
export * from './ComponentDebugger';

// Main debug setup function
export const setupDebugging = () => {
  console.log('🔧 Setting up React debugging for innovator portal...');
  
  // Initialize global error tracking
  initializeGlobalErrorTracking();
  
  // Run initial React integrity checks
  debugUtils.checkReactIntegrity();
  debugUtils.logReactState();
  
  // Add global debugging to window for manual access
  (window as any).reactDebug = {
    checkIntegrity: debugUtils.checkReactIntegrity,
    logState: debugUtils.logReactState,
    getErrors: () => GlobalErrorTracker.getInstance().getErrors(),
    clearErrors: () => GlobalErrorTracker.getInstance().clearErrors(),
    tracker: GlobalErrorTracker.getInstance()
  };
  
  console.log('✅ React debugging setup complete. Access via window.reactDebug');
  console.log('🎯 Watching for useState errors specifically...');
  
  // Set up a more aggressive useState error detector
  setupUseStateErrorDetector();
};

// Aggressive useState error detection
const setupUseStateErrorDetector = () => {
  // Override console.error to catch useState errors immediately
  const originalError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    if (message.includes('useState') || message.includes('Cannot read properties of null')) {
      console.group('🚨 USESTATE ERROR INTERCEPTED');
      console.log('Args:', args);
      console.log('Stack trace:', new Error().stack);
      console.log('Timestamp:', new Date().toISOString());
      console.log('Location:', window.location.href);
      console.groupEnd();
      
      // Add to error tracker
      GlobalErrorTracker.getInstance().addError(
        new Error(message), 
        'Console Error', 
        'hook'
      );
    }
    originalError.apply(console, args);
  };
  
  // Patch React hooks to detect issues early
  try {
    patchReactHooks();
  } catch (error) {
    console.error('Failed to patch React hooks:', error);
  }
};

// Patch React hooks for better debugging
const patchReactHooks = () => {
  if (typeof React === 'undefined') {
    console.error('❌ Cannot patch React hooks: React is undefined');
    return;
  }
  
  const originalUseState = React.useState;
  const originalUseEffect = React.useEffect;
    // Patch useState
  if (originalUseState) {
    React.useState = function<S>(initialState?: S | (() => S)): [S, React.Dispatch<React.SetStateAction<S>>] {
      console.log('🎣 useState called with:', initialState);
      try {
        return originalUseState(initialState as any);
      } catch (error) {
        console.error('🚨 useState failed:', error);
        GlobalErrorTracker.getInstance().addError(error as Error, 'useState patch', 'hook');
        throw error;
      }
    } as any;
  }
  
  // Patch useEffect
  if (originalUseEffect) {
    React.useEffect = function(effect: React.EffectCallback, deps?: React.DependencyList) {
      console.log('🎣 useEffect called with deps:', deps);
      try {
        return originalUseEffect(effect, deps);
      } catch (error) {
        console.error('🚨 useEffect failed:', error);
        GlobalErrorTracker.getInstance().addError(error as Error, 'useEffect patch', 'hook');
        throw error;
      }
    };
  }
  
  console.log('✅ React hooks patched for debugging');
};

// Debug component wrapper for easy application
export const debugComponent = <T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  name?: string
) => {
  return (props: T) => {
    const componentName = name || Component.displayName || Component.name || 'Unknown';
    
    console.log(`🚀 Rendering ${componentName}`, props);
    
    try {
      return React.createElement(Component, props);
    } catch (error) {
      console.error(`❌ ${componentName} failed to render:`, error);
      GlobalErrorTracker.getInstance().addError(error as Error, componentName, 'render');
      throw error;
    }
  };
};

// Quick debug info display
export const showDebugInfo = () => {
  const tracker = GlobalErrorTracker.getInstance();
  const errors = tracker.getErrors();
  
  console.group('📊 CURRENT DEBUG STATUS');
  console.log('Total errors:', errors.length);
  console.log('React integrity:', debugUtils.checkReactIntegrity());
  console.log('useState errors:', errors.filter(e => e.error.message.includes('useState')));
  console.log('All errors:', errors);
  console.groupEnd();
  
  return {
    totalErrors: errors.length,
    useStateErrors: errors.filter(e => e.error.message.includes('useState')),
    allErrors: errors
  };
};
