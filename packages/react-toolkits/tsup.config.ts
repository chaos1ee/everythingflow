import type { Options } from 'tsup'
import { defineConfig } from 'tsup'
import * as process from 'process'

export default defineConfig((options: Options) => ({
  entry: ['src/index.ts'],
  format: ['esm'],
  sourcemap: process.env.NODE_ENV !== 'production',
  minify: process.env.NODE_ENV === 'production',
  treeshake: true,
  splitting: false,
  dts: true,
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
