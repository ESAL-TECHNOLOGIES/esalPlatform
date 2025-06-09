import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { setupDebugging } from "./debug";
import { ProductionDebugger } from "./debug/ProductionDebugger";

// Initialize debugging as early as possible
setupDebugging();

// Add production-specific debugging for Render deployment
if (window.location.hostname.includes('onrender.com') || 
    window.location.search.includes('debug=true')) {
  console.log('🚀 Render deployment detected - activating production debugging');
}

// Add global error listeners for early detection
window.addEventListener('error', (event) => {
  console.error('🚨 Global Error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    timestamp: new Date().toISOString()
  });
    // Special handling for useState errors on Render
  if (event.message && event.message.includes('useState')) {
    console.group('🎯 USESTATE ERROR ON RENDER DEPLOYMENT');
    console.error('This is the error you are looking for!');
    console.error('Location:', window.location.href);
    console.error('User Agent:', navigator.userAgent);
    console.error('Build environment:', (import.meta as any).env || 'unknown');
    console.error('React version:', React.version);
    console.groupEnd();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled Promise Rejection:', {
    reason: event.reason,
    timestamp: new Date().toISOString()
  });
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <ProductionDebugger />
    </BrowserRouter>
  </React.StrictMode>
);
