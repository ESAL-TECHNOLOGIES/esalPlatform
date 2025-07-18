/** @type {import('tailwindcss').Config} */
import baseConfig from "../../packages/ui/tailwind.config.js";

export default {
  ...baseConfig,
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
};
