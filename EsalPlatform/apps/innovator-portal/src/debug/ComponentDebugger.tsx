import React, { ComponentType, useState, useEffect } from "react";

// HOC to wrap components with debugging
export function withDebugger<T extends Record<string, any>>(
  WrappedComponent: ComponentType<T>,
  componentName?: string
): ComponentType<T> {
  const DebuggedComponent = (props: T) => {
    const name =
      componentName ||
      WrappedComponent.displayName ||
      WrappedComponent.name ||
      "UnknownComponent";

    console.log(`🚀 Component Debug: ${name} mounting`, {
      props,
      timestamp: new Date().toISOString(),
    });

    const [debugInfo, setDebugInfo] = useState({
      renderCount: 0,
      errors: [] as Error[],
      lastRender: new Date().toISOString(),
    });

    useEffect(() => {
      setDebugInfo((prev) => ({
        ...prev,
        renderCount: prev.renderCount + 1,
        lastRender: new Date().toISOString(),
      }));

      console.log(`📊 Component Debug: ${name} rendered`, {
        renderCount: debugInfo.renderCount + 1,
        timestamp: new Date().toISOString(),
      });

      return () => {
        console.log(`🧹 Component Debug: ${name} unmounting`, {
          renderCount: debugInfo.renderCount,
          timestamp: new Date().toISOString(),
        });
      };
    }, [name, debugInfo.renderCount]);

    try {
      return <WrappedComponent {...props} />;
    } catch (error) {
      const errorObj = error as Error;
      console.error(`❌ Component Debug: ${name} threw error`, {
        error: errorObj.message,
        stack: errorObj.stack,
        props,
        timestamp: new Date().toISOString(),
      });

      setDebugInfo((prev) => ({
        ...prev,
        errors: [...prev.errors, errorObj],
      }));

      throw error;
    }
  };

  DebuggedComponent.displayName = `DebuggedComponent(${componentName || WrappedComponent.displayName || WrappedComponent.name})`;

  return DebuggedComponent;
}

// Hook usage tracker
export const useHookDebugger = (hookName: string, componentName?: string) => {
  const name = componentName || "UnknownComponent";

  console.log(`🎣 Hook Debug: ${hookName} called in ${name}`, {
    timestamp: new Date().toISOString(),
    stackTrace: new Error().stack,
  });

  return {
    logUsage: (data?: any) => {
      console.log(`📝 Hook Debug: ${hookName} used in ${name}`, {
        data,
        timestamp: new Date().toISOString(),
      });
    },
    logError: (error: Error) => {
      console.error(`❌ Hook Debug: ${hookName} error in ${name}`, {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    },
  };
};

// Global error tracker
export class GlobalErrorTracker {
  private static instance: GlobalErrorTracker;
  private errors: Array<{
    timestamp: string;
    error: Error;
    component?: string;
    type: "render" | "hook" | "global";
  }> = [];

  static getInstance(): GlobalErrorTracker {
    if (!GlobalErrorTracker.instance) {
      GlobalErrorTracker.instance = new GlobalErrorTracker();
    }
    return GlobalErrorTracker.instance;
  }

  addError(
    error: Error,
    component?: string,
    type: "render" | "hook" | "global" = "global"
  ) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      error,
      component,
      type,
    };

    this.errors.push(errorEntry);

    console.error(`🚨 Global Error Tracker: ${type} error`, errorEntry);

    // Specific handling for useState errors
    if (
      error.message.includes("useState") ||
      error.message.includes("reading 'useState'")
    ) {
      console.error(
        "🎯 USESTATE ERROR DETECTED - This is the error you're looking for!",
        {
          component,
          errorMessage: error.message,
          stack: error.stack,
          timestamp: errorEntry.timestamp,
        }
      );

      // Log additional debugging info
      this.logUseStateDebugInfo();
    }
  }

  private logUseStateDebugInfo() {
    console.group("🔍 USESTATE ERROR DEBUG INFO");
    console.log(
      "React object:",
      typeof React !== "undefined" ? React : "UNDEFINED"
    );
    console.log(
      "useState function:",
      typeof useState !== "undefined" ? useState : "UNDEFINED"
    );
    console.log("Current location:", window.location.href);
    console.log("Document ready state:", document.readyState);
    console.log("React version:", React?.version || "UNKNOWN");
    console.groupEnd();
  }

  getErrors() {
    return this.errors;
  }

  clearErrors() {
    this.errors = [];
    console.log("🧹 Global Error Tracker: Errors cleared");
  }
}

// Initialize global error tracking
export const initializeGlobalErrorTracking = () => {
  const tracker = GlobalErrorTracker.getInstance();

  // Track unhandled errors
  window.addEventListener("error", (event) => {
    tracker.addError(new Error(event.message), undefined, "global");
  });

  // Track unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    tracker.addError(new Error(event.reason), undefined, "global");
  });

  console.log("🔧 Global error tracking initialized");
};
