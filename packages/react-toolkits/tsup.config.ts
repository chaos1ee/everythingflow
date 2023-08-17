import { defineConfig } from 'tsup'
import * as process from 'process'
import packageJson from './package.json'

const isProduction = process.env.NODE_ENV === 'production'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  sourcemap: true,
  minify: isProduction,
  treeshake: true,
  splitting: false,
  dts: true,
  clean: true,
  shims: true,
  external: Object.keys(packageJson.peerDependencies),
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
