export default {
  plugins: [],
  server: {
    port: 3001,
    host: true,
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
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  esbuild: {
    jsx: "automatic",
  },
};
