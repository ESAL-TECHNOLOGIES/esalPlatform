import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Create the root and render the app
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
