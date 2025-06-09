import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  external: ['react', 'react-dom'],
  noExternal: ['clsx', 'tailwind-merge', 'lucide-react'],
  clean: true,
  treeshake: true,
  outDir: 'dist',
})
