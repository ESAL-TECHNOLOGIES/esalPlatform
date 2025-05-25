import type { Config } from "tailwindcss";
import { tailwindConfig as uiTailwindConfig } from "@repo/ui/tailwind-config";

// Merge the UI tailwind config with the web app config
const config: Config = {
  // Use the content from UI package plus the web app content
  content: [
    ...uiTailwindConfig.content,
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  // Use the theme from the UI package
  theme: uiTailwindConfig.theme,
  // Use the plugins from the UI package
  plugins: uiTailwindConfig.plugins,
};

export default config;
