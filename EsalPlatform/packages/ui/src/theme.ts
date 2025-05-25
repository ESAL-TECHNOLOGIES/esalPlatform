/**
 * Theme configuration for ESAL Platform UI
 */

export const themeConfig = {
  colors: {
    primary: {
      DEFAULT: "hsl(224, 76%, 48%)", // Blue
      50: "hsl(224, 100%, 98%)",
      100: "hsl(226, 100%, 94%)",
      200: "hsl(223, 100%, 88%)",
      300: "hsl(223, 100%, 80%)",
      400: "hsl(224, 95%, 65%)",
      500: "hsl(224, 76%, 48%)",
      600: "hsl(224, 81%, 42%)",
      700: "hsl(225, 77%, 36%)",
      800: "hsl(226, 67%, 29%)",
      900: "hsl(224, 62%, 25%)",
      950: "hsl(225, 69%, 15%)",
    },
    gray: {
      DEFAULT: "hsl(0, 0%, 45%)",
      50: "hsl(210, 20%, 98%)",
      100: "hsl(220, 14%, 96%)",
      200: "hsl(220, 13%, 91%)",
      300: "hsl(216, 12%, 84%)",
      400: "hsl(218, 11%, 65%)",
      500: "hsl(220, 9%, 46%)",
      600: "hsl(215, 14%, 34%)",
      700: "hsl(217, 19%, 27%)",
      800: "hsl(215, 28%, 17%)",
      900: "hsl(221, 39%, 11%)",
      950: "hsl(224, 71%, 4%)",
    },
    success: {
      DEFAULT: "hsl(142, 72%, 29%)",
      50: "hsl(138, 76%, 97%)",
      100: "hsl(141, 84%, 93%)",
      200: "hsl(141, 79%, 85%)",
      300: "hsl(142, 77%, 73%)",
      400: "hsl(142, 69%, 58%)",
      500: "hsl(142, 71%, 45%)",
      600: "hsl(142, 72%, 29%)",
      700: "hsl(142, 64%, 24%)",
      800: "hsl(144, 62%, 20%)",
      900: "hsl(145, 60%, 17%)",
      950: "hsl(150, 80%, 9%)",
    },
    warning: {
      DEFAULT: "hsl(38, 92%, 50%)",
      50: "hsl(49, 100%, 97%)",
      100: "hsl(48, 100%, 92%)",
      200: "hsl(48, 96%, 80%)",
      300: "hsl(43, 96%, 69%)",
      400: "hsl(38, 96%, 62%)",
      500: "hsl(38, 92%, 50%)",
      600: "hsl(31, 81%, 44%)",
      700: "hsl(26, 77%, 37%)",
      800: "hsl(25, 71%, 31%)",
      900: "hsl(22, 74%, 27%)",
      950: "hsl(20, 79%, 16%)",
    },
    danger: {
      DEFAULT: "hsl(0, 84%, 60%)",
      50: "hsl(0, 86%, 97%)",
      100: "hsl(0, 93%, 94%)",
      200: "hsl(0, 96%, 89%)",
      300: "hsl(0, 94%, 82%)",
      400: "hsl(0, 91%, 71%)",
      500: "hsl(0, 84%, 60%)",
      600: "hsl(0, 72%, 51%)",
      700: "hsl(0, 74%, 42%)",
      800: "hsl(0, 70%, 35%)",
      900: "hsl(0, 63%, 31%)",
      950: "hsl(0, 75%, 15%)",
    },
  },
  fontFamily: {
    sans: ["var(--font-geist-sans)", "sans-serif"],
    mono: ["var(--font-geist-mono)", "monospace"],
  },
  borderRadius: {
    none: "0",
    sm: "0.125rem",
    DEFAULT: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
    full: "9999px",
  },
  boxShadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  },
  animation: {
    none: "none",
    spin: "spin 1s linear infinite",
    ping: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
    pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    bounce: "bounce 1s infinite",
  },
};

export type ThemeConfig = typeof themeConfig;

/**
 * Theme variants for components
 */
export const variants = {
  button: {
    sizes: {
      xs: "py-1 px-2 text-xs",
      sm: "py-1.5 px-3 text-sm",
      md: "py-2 px-4 text-base",
      lg: "py-2.5 px-5 text-lg",
      xl: "py-3 px-6 text-xl",
    },
    variants: {
      primary:
        "bg-primary text-white hover:bg-primary-600 focus:ring-primary-500",
      secondary:
        "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-300",
      outline:
        "border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-50",
      ghost:
        "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
      danger: "bg-danger text-white hover:bg-danger-600 focus:ring-danger-500",
    },
  },
};
