/** @type {import('tailwindcss').Config} */
import baseConfig from "@esal/ui/tailwind.config"

export default {
  ...baseConfig,
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
}
