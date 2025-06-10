import React, { useEffect, useState } from "react";

// Production-specific debug component
export const ProductionDebugger: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    // Enable debug in production or with debug flag
    const shouldEnable =
      window.location.hostname.includes("onrender.com") ||
      window.location.search.includes("debug=true") ||
      localStorage.getItem("enableDebug") === "true";

    setIsEnabled(shouldEnable);

    if (!shouldEnable) return;

    console.log("🔧 Production Debugger activated");

    // Collect debug information
    const collectDebugInfo = () => {
      const info = {
        timestamp: new Date().toISOString(),
        location: window.location.href,
        userAgent: navigator.userAgent,
        reactVersion: React.version,
        reactExists: typeof React !== "undefined",
        useStateExists: typeof React.useState === "function",
        useEffectExists: typeof React.useEffect === "function",
        nodeEnv:
          (typeof process !== "undefined"
            ? process?.env?.NODE_ENV
            : undefined) || "unknown",
        viteEnv: (import.meta as any)?.env || {},
        buildTime: document
          .querySelector('meta[name="build-time"]')
          ?.getAttribute("content"),
        scripts: Array.from(document.querySelectorAll("script[src]")).map(
          (s) => (s as HTMLScriptElement).src
        ),
        devTools: !!(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__,
      };

      setDebugInfo(info);
      console.log("📊 Debug Info Collected:", info);
    };

    // Error tracking
    const trackError = (error: any, source: string) => {
      const errorEntry = {
        timestamp: new Date().toISOString(),
        source,
        message: error.message || error.toString(),
        stack: error.stack,
        isUseStateError:
          (error.message || "").includes("useState") ||
          (error.message || "").includes("Cannot read properties of null"),
      };

      setErrors((prev) => [...prev, errorEntry]);

      if (errorEntry.isUseStateError) {
        console.group("🎯 PRODUCTION USESTATE ERROR DETECTED");
        console.error("Error entry:", errorEntry);
        console.error("Debug info:", debugInfo);
        console.groupEnd();
      }
    };

    // Global error listeners
    const errorHandler = (event: ErrorEvent) => {
      trackError(event.error || { message: event.message }, "window.error");
    };

    const rejectionHandler = (event: PromiseRejectionEvent) => {
      trackError(event.reason, "unhandledrejection");
    };

    window.addEventListener("error", errorHandler);
    window.addEventListener("unhandledrejection", rejectionHandler);

    // Collect initial debug info
    collectDebugInfo();

    // Re-collect debug info periodically
    const interval = setInterval(collectDebugInfo, 5000);

    // Make debug functions globally available
    (window as any).productionDebug = {
      errors,
      debugInfo,
      getUseStateErrors: () => errors.filter((e) => e.isUseStateError),
      collectInfo: collectDebugInfo,
      exportDebugData: () => ({
        errors,
        debugInfo,
        timestamp: new Date().toISOString(),
      }),
    };

    return () => {
      window.removeEventListener("error", errorHandler);
      window.removeEventListener("unhandledrejection", rejectionHandler);
      clearInterval(interval);
    };
  }, [debugInfo, errors]);

  // Don't render anything if not enabled
  if (!isEnabled) return null;

  return (
    <div
      id="production-debugger"
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        fontSize: "12px",
        zIndex: 10000,
        maxWidth: "300px",
        maxHeight: "200px",
        overflow: "auto",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
        🐛 Production Debug
      </div>
      <div>Errors: {errors.length}</div>
      <div>
        useState Errors: {errors.filter((e) => e.isUseStateError).length}
      </div>
      <div>React: {React.version || "Unknown"}</div>
      <div>Location: {window.location.hostname}</div>

      {errors
        .filter((e) => e.isUseStateError)
        .slice(-3)
        .map((error, index) => (
          <div
            key={index}
            style={{
              background: "rgba(255, 0, 0, 0.2)",
              margin: "2px 0",
              padding: "2px",
              fontSize: "10px",
            }}
          >
            🚨 {error.message.substring(0, 50)}...
          </div>
        ))}

      <button
        onClick={() => {
          console.log(
            "📊 Production Debug Export:",
            (window as any).productionDebug?.exportDebugData()
          );
        }}
        style={{
          background: "#007acc",
          color: "white",
          border: "none",
          padding: "2px 5px",
          fontSize: "10px",
          marginTop: "5px",
          cursor: "pointer",
        }}
      >
        Export Debug Data
      </button>
    </div>
  );
};

// Hook to enable production debugging
export const useProductionDebug = () => {
  useEffect(() => {
    if (window.location.hostname.includes("onrender.com")) {
      console.log("🔧 Production debug hook activated for Render deployment");

      // Load the full production debug script
      import("./production-debug.js").catch((err) => {
        console.warn("Could not load production debug script:", err);
      });
    }
  }, []);
};
