import type { Options } from 'tsup'
import { defineConfig } from 'tsup'

export default defineConfig((options: Options) => ({
  entry: ['src/index.ts'],
  treeshake: true,
  splitting: false,
  format: ['esm'],
  sourcemap: false,
  dts: true,
  minify: true,
  clean: true,
  shims: true,
  external: ['react', 'react-dom'],
  loader: {
    '.jpg': 'base64',
    '.png': 'copy',
    '.webp': 'file',
  },
  outExtension({ format }) {
    return {
      js: `.${format}.js`,
    }
  },
  ...options,
}))
