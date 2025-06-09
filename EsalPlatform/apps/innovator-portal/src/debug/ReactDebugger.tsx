import React, { Component, useState, useEffect, createContext, useContext } from 'react';

// Debug context to track React state
interface DebugContextType {
  errors: Array<{
    timestamp: string;
    error: Error;
    component: string;
    stack: string;
  }>;
  addError: (error: Error, component: string) => void;
  clearErrors: () => void;
}

const DebugContext = createContext<DebugContextType | null>(null);

// Enhanced useState hook with debugging
export const useStateDebug = function<T>(initialState: T, componentName?: string) {
  const debugContext = useContext(DebugContext);
  
  // Safety check: if called outside provider, fall back to regular useState
  if (!debugContext) {
    console.warn('⚠️ useStateDebug called outside ReactDebugProvider, falling back to regular useState');
    return useState(initialState);
  }
  
  try {
    // Check if React is properly loaded
    if (typeof React === 'undefined') {
      const error = new Error('React is undefined');
      console.error('🚨 React Debug: React is undefined', {
        componentName,
        timestamp: new Date().toISOString(),
        stack: error.stack
      });
      throw error;
    }

    // Check if useState is available
    if (typeof useState !== 'function') {
      const error = new Error('useState is not a function');
      console.error('🚨 React Debug: useState is not a function', {
        componentName,
        timestamp: new Date().toISOString(),
        stack: error.stack
      });
      throw error;
    }

    // Log successful useState call
    console.log('✅ React Debug: useState called successfully', {
      componentName,
      initialState,
      timestamp: new Date().toISOString()
    });

    return useState(initialState);
  } catch (error) {
    const errorObj = error as Error;
    console.error('❌ React Debug: useState failed', {
      componentName,
      error: errorObj.message,
      stack: errorObj.stack,
      timestamp: new Date().toISOString()
    });
    
    if (debugContext) {
      debugContext.addError(errorObj, componentName || 'Unknown Component');
    }
    
    throw error;
  }
};

// Enhanced useEffect hook with debugging
export const useEffectDebug = function(effect: React.EffectCallback, deps?: React.DependencyList, componentName?: string) {
  const debugContext = useContext(DebugContext);
  
  // Safety check: if called outside provider, fall back to regular useEffect
  if (!debugContext) {
    console.warn('⚠️ useEffectDebug called outside ReactDebugProvider, falling back to regular useEffect');
    return useEffect(effect, deps);
  }
  
  try {
    console.log('✅ React Debug: useEffect called', {
      componentName,
      depsLength: deps?.length,
      timestamp: new Date().toISOString()
    });

    return useEffect(effect, deps);
  } catch (error) {
    const errorObj = error as Error;
    console.error('❌ React Debug: useEffect failed', {
      componentName,
      error: errorObj.message,
      stack: errorObj.stack,
      timestamp: new Date().toISOString()
    });
    
    if (debugContext) {
      debugContext.addError(errorObj, componentName || 'Unknown Component');
    }
    
    throw error;
  }
};

// Debug provider component
export const ReactDebugProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [errors, setErrors] = useState<DebugContextType['errors']>([]);

  const addError = (error: Error, component: string) => {
    const newError = {
      timestamp: new Date().toISOString(),
      error,
      component,
      stack: error.stack || 'No stack trace'
    };
    setErrors(prev => [...prev, newError]);
    
    // Also log to console for immediate visibility
    console.error('🚨 React Debug Error Added:', newError);
  };

  const clearErrors = () => {
    setErrors([]);
    console.log('🧹 React Debug: Errors cleared');
  };

  return (
    <DebugContext.Provider value={{ errors, addError, clearErrors }}>
      {children}
    </DebugContext.Provider>
  );
};

// Error boundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ReactErrorBoundary extends Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('🚨 Error Boundary: Error caught', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Error Boundary: Component did catch', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });

    this.setState({
      error,
      errorInfo
    });

    // Send error details to console for debugging
    this.logDetailedError(error, errorInfo);
  }

  logDetailedError(error: Error, errorInfo: React.ErrorInfo) {
    console.group('🚨 DETAILED ERROR ANALYSIS');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
    console.error('Error name:', error.name);
    console.error('Timestamp:', new Date().toISOString());
    
    // Check for specific useState errors
    if (error.message.includes('useState') || error.message.includes('Cannot read properties of null')) {
      console.error('🎯 USESTATE ERROR DETECTED:');
      console.error('- This is likely a React hook usage issue');
      console.error('- Check if hooks are called inside React components');
      console.error('- Verify React import statements');
      console.error('- Check for React version conflicts');
    }
    
    console.groupEnd();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              🚨 React Error Detected
            </h1>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Error Message:</h3>
                <p className="text-red-600 font-mono text-sm bg-red-50 p-2 rounded">
                  {this.state.error?.message}
                </p>
              </div>
              
              {this.state.error?.stack && (
                <div>
                  <h3 className="font-semibold text-gray-900">Stack Trace:</h3>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                    {this.state.error.stack}
                  </pre>
                </div>
              )}
              
              {this.state.errorInfo?.componentStack && (
                <div>
                  <h3 className="font-semibold text-gray-900">Component Stack:</h3>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
              
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  window.location.reload();
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Debug panel component
export const DebugPanel: React.FC = () => {
  const debugContext = useContext(DebugContext);
  const [isVisible, setIsVisible] = useState(false);

  if (!debugContext) {
    return null;
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 z-50"
        title="Toggle Debug Panel"
      >
        🐛
      </button>

      {/* Debug panel */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 bg-white border border-red-200 rounded-lg shadow-lg p-4 max-w-md w-full max-h-96 overflow-auto z-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-red-600">React Debug Panel</h3>
            <button
              onClick={debugContext.clearErrors}
              className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
            >
              Clear
            </button>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Errors: {debugContext.errors.length}
            </p>
            
            {debugContext.errors.length === 0 ? (
              <p className="text-green-600 text-sm">No errors detected ✅</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-auto">
                {debugContext.errors.map((error, index) => (
                  <div key={index} className="bg-red-50 p-2 rounded text-xs">
                    <div className="font-semibold text-red-700">
                      {error.component}
                    </div>
                    <div className="text-red-600">{error.error.message}</div>
                    <div className="text-gray-500">{error.timestamp}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Hook to access debug context
export const useDebugContext = () => {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error('useDebugContext must be used within ReactDebugProvider');
  }
  return context;
};

// Console debugging utilities
export const debugUtils = {
  logReactState: () => {
    console.group('🔍 React State Debug');
    console.log('React version:', React.version);
    console.log('React object:', React);
    console.log('useState function:', useState);
    console.log('useEffect function:', useEffect);
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();
  },
  
  checkReactIntegrity: () => {
    const checks = {
      reactExists: typeof React !== 'undefined',
      reactHasVersion: React && 'version' in React,
      useStateExists: typeof useState === 'function',
      useEffectExists: typeof useEffect === 'function',
      createElementExists: typeof React.createElement === 'function'
    };
    
    console.group('🔧 React Integrity Check');
    Object.entries(checks).forEach(([key, value]) => {
      console.log(`${value ? '✅' : '❌'} ${key}:`, value);
    });
    console.groupEnd();
    
    return checks;
  }
};
