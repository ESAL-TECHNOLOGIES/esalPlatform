import react from "@vitejs/plugin-react";

export default {
  plugins: [react()],  server: {
    port: 3001,
    host: true,
    historyApiFallback: true, // Enable CSR routing support
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  // Enable SPA mode for client-side routing
  preview: {
    port: 3001,
    host: true,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  esbuild: {
    jsx: "automatic",
  },
  define: {
    // Define process.env for browser compatibility
    "process.env.NODE_ENV": JSON.stringify("production"),
    process: JSON.stringify({
      env: {
        NODE_ENV: "production",
      },
    }),
    // Ensure global is defined
    global: "globalThis",
  },
};
