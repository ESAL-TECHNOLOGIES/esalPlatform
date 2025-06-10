import React, { useState, useEffect } from "react";

/**
 * Simple component to verify React is working correctly
 * This will help identify if useState errors still occur
 */
export const ReactCheck: React.FC = () => {
  const [isWorking, setIsWorking] = useState(false);
  const [reactInfo, setReactInfo] = useState({
    version: React.version,
    timestamp: new Date().toISOString(),
  });

  useEffect(() => {
    // Simple test to verify useState and useEffect work
    const timer = setTimeout(() => {
      setIsWorking(true);
      setReactInfo((prev) => ({
        ...prev,
        timestamp: new Date().toISOString(),
      }));
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Only render in development or when debug flag is present
  if (
    process.env.NODE_ENV === "production" &&
    !window.location.search.includes("debug=true")
  ) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        left: "10px",
        background: isWorking ? "#10b981" : "#ef4444",
        color: "white",
        padding: "8px 12px",
        borderRadius: "6px",
        fontSize: "12px",
        fontFamily: "monospace",
        zIndex: 9999,
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}
    >
      <div>React {reactInfo.version}</div>
      <div>Hooks: {isWorking ? "OK" : "LOADING..."}</div>
      <div>Time: {new Date(reactInfo.timestamp).toLocaleTimeString()}</div>
    </div>
  );
};

export default ReactCheck;
