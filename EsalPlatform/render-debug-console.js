/*
 * RENDER DEPLOYMENT DEBUG SCRIPT
 *
 * Instructions:
 * 1. Open the innovator portal on Render: https://esal-innovator-portal.onrender.com
 * 2. Open browser console (F12 -> Console)
 * 3. Paste this entire script and press Enter
 * 4. Reproduce the error
 * 5. The script will catch and log detailed information about useState errors
 */

(function () {
  "use strict";

  console.log("🚀 RENDER DEPLOYMENT DEBUG SCRIPT ACTIVATED");
  console.log("🎯 Specifically hunting for useState errors...");

  // Error collection
  const errorCollection = {
    useState: [],
    general: [],
    react: [],
  };

  // Enhanced error tracking
  function logError(error, source, additional = {}) {
    const errorData = {
      timestamp: new Date().toISOString(),
      source: source,
      message: error.message || error.toString(),
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      reactVersion: window.React?.version || "unknown",
      additional: additional,
    };

    // Categorize error
    if (
      errorData.message.includes("useState") ||
      errorData.message.includes("Cannot read properties of null")
    ) {
      errorCollection.useState.push(errorData);
      console.group("🎯 USESTATE ERROR CAUGHT!");
      console.error("🚨 This is exactly what we're looking for!");
      console.error("Error details:", errorData);
      console.error("Stack trace:", error.stack);
      console.groupEnd();

      // Try to get more context
      analyzeReactState();
    } else if (
      errorData.message.includes("React") ||
      errorData.message.includes("react")
    ) {
      errorCollection.react.push(errorData);
      console.warn("⚠️ React-related error:", errorData);
    } else {
      errorCollection.general.push(errorData);
    }

    return errorData;
  }

  // Analyze React state when error occurs
  function analyzeReactState() {
    console.group("🔍 REACT STATE ANALYSIS");

    try {
      console.log("Window.React:", typeof window.React);
      console.log("React version:", window.React?.version);
      console.log("React.useState:", typeof window.React?.useState);
      console.log("React.useEffect:", typeof window.React?.useEffect);
      console.log("React.createElement:", typeof window.React?.createElement);

      // Check for multiple React instances
      const reactInstances = [];
      if (window.React) reactInstances.push("window.React");
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__)
        reactInstances.push("DevTools Hook");

      console.log("React instances found:", reactInstances);

      // Check loaded scripts
      const scripts = Array.from(document.querySelectorAll("script[src]"));
      const reactScripts = scripts.filter(
        (s) =>
          s.src.includes("react") ||
          s.src.includes("vendor") ||
          s.src.includes("index") ||
          s.src.includes("chunk")
      );

      console.log(
        "React-related scripts:",
        reactScripts.map((s) => s.src)
      );

      // Check modules
      if (window.__vitePreload) {
        console.log("Vite preload available");
      }

      // Check document state
      console.log("Document ready state:", document.readyState);
      console.log(
        "DOM elements with id root:",
        document.getElementById("root")
      );
    } catch (analysisError) {
      console.error("Error during React state analysis:", analysisError);
    }

    console.groupEnd();
  }

  // Override console.error to catch React errors
  const originalConsoleError = console.error;
  console.error = function (...args) {
    const message = args.join(" ");

    if (
      message.includes("useState") ||
      message.includes("Cannot read properties of null")
    ) {
      logError(new Error(message), "console.error", { consoleArgs: args });
    }

    return originalConsoleError.apply(console, args);
  };

  // Global error handlers
  window.addEventListener("error", function (event) {
    logError(event.error || new Error(event.message), "window.error", {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener("unhandledrejection", function (event) {
    logError(event.reason, "unhandledrejection");
  });

  // React DevTools integration
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log("✅ React DevTools detected");

    const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    const originalOnCommitFiberRoot = hook.onCommitFiberRoot;

    if (originalOnCommitFiberRoot) {
      hook.onCommitFiberRoot = function (id, root, priorityLevel) {
        try {
          return originalOnCommitFiberRoot.call(this, id, root, priorityLevel);
        } catch (error) {
          logError(error, "react-devtools-hook");
          throw error;
        }
      };
    }
  } else {
    console.warn("⚠️ React DevTools not detected");
  }

  // Monitor React hooks if possible
  function monitorReactHooks() {
    if (window.React && window.React.useState) {
      const originalUseState = window.React.useState;

      window.React.useState = function (initialState) {
        console.log("🎣 useState called with:", initialState);
        try {
          return originalUseState.call(this, initialState);
        } catch (error) {
          logError(error, "react-usestate-override");
          throw error;
        }
      };

      console.log("🔧 React.useState monitoring enabled");
    } else {
      console.warn(
        "⚠️ Cannot monitor React hooks - React.useState not available"
      );
    }
  }

  // Component error boundary simulation
  const originalCreateElement = window.React?.createElement;
  if (originalCreateElement) {
    window.React.createElement = function (type, props, ...children) {
      try {
        return originalCreateElement.call(this, type, props, ...children);
      } catch (error) {
        logError(error, "react-createelement", { type, props });
        throw error;
      }
    };
    console.log("🔧 React.createElement monitoring enabled");
  }

  // Initial analysis
  analyzeReactState();

  // Try to monitor hooks (might fail if React isn't loaded yet)
  try {
    monitorReactHooks();
  } catch (error) {
    console.warn("Could not monitor React hooks immediately:", error);

    // Try again after a delay
    setTimeout(() => {
      try {
        monitorReactHooks();
      } catch (retryError) {
        console.warn("Could not monitor React hooks after delay:", retryError);
      }
    }, 1000);
  }

  // Make debug functions globally available
  window.renderDebug = {
    getErrors: () => errorCollection,
    getUseStateErrors: () => errorCollection.useState,
    analyzeReact: analyzeReactState,
    exportData: () => ({
      ...errorCollection,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      reactVersion: window.React?.version || "unknown",
    }),
    clearErrors: () => {
      errorCollection.useState = [];
      errorCollection.general = [];
      errorCollection.react = [];
      console.log("🧹 Error collection cleared");
    },
  };

  console.log("✅ Render debug script ready!");
  console.log("📊 Available commands:");
  console.log(
    "  - window.renderDebug.getUseStateErrors() - Get useState errors"
  );
  console.log("  - window.renderDebug.getErrors() - Get all errors");
  console.log("  - window.renderDebug.analyzeReact() - Analyze React state");
  console.log("  - window.renderDebug.exportData() - Export all debug data");
  console.log("");
  console.log("🎯 Now reproduce the error and watch the console...");
})();
