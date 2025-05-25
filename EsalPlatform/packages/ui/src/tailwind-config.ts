/**
 * Tailwind CSS configuration for ESAL Platform UI
 */
import type { Config } from "tailwindcss";
import { themeConfig } from "./theme";

export const tailwindConfig = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: themeConfig.colors,
      fontFamily: themeConfig.fontFamily,
      borderRadius: themeConfig.borderRadius,
      boxShadow: themeConfig.boxShadow,
      animation: themeConfig.animation,
      keyframes: {
        spin: {
          to: { transform: "rotate(360deg)" },
        },
        ping: {
          "75%, 100%": { transform: "scale(2)", opacity: "0" },
        },
        pulse: {
          "50%": { opacity: ".5" },
        },
        bounce: {
          "0%, 100%": {
            transform: "translateY(-25%)",
            animationTimingFunction: "cubic-bezier(0.8,0,1,1)",
          },
          "50%": {
            transform: "none",
            animationTimingFunction: "cubic-bezier(0,0,0.2,1)",
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default tailwindConfig;
