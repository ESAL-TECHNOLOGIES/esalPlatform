// Minimal vite config for Render deployment
export default {
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
  },
  esbuild: {
    jsx: "automatic",
  },
};
