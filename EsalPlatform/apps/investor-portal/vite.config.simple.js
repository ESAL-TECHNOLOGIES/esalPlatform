// Simple Vite config for Render deployment - no imports to avoid module resolution issues
export default {
  plugins: [
    {
      name: 'react',
      configResolved(config) {
        // Basic React plugin setup without importing @vitejs/plugin-react
        config.esbuild = config.esbuild || {};
        config.esbuild.jsx = 'automatic';
      }
    }
  ],
  server: {
    port: 3002,
    host: true,
    historyApiFallback: true, // ✅ Added for CSR support
  },
  base: "/", // ✅ Added for proper base path
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
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  esbuild: {
    jsx: 'automatic'
  }
};
