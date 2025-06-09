export default {
  plugins: [],
  server: {
    port: 3001,
    host: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
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
    jsx: "automatic",
  },
  define: {
    // Define process.env for browser compatibility
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process': JSON.stringify({
      env: {
        NODE_ENV: 'production'
      }
    }),
    // Ensure global is defined
    'global': 'globalThis',
  },
};
