// Simple vite config without imports - for Render deployment
export default {
  root: process.cwd(),
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
  },
  esbuild: {
    jsx: "automatic",
  },
  server: {
    port: 3000,
    host: true,
  },
};
