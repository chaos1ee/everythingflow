import { defineConfig } from 'tsup'
import * as process from 'process'

const isProduction = process.env.NODE_ENV === 'production'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  sourcemap: true,
  minify: false,
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
})
