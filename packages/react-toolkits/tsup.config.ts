import type { Options } from 'tsup'
import { defineConfig } from 'tsup'
import * as process from 'process'
import packageJson from './package.json'

const isProduction = process.env.NODE_ENV === 'production'

const baseOptions: Options = {
  external: Object.keys(packageJson.peerDependencies),
  sourcemap: true,
  minify: isProduction,
  treeshake: true,
  splitting: false,
  dts: true,
  clean: true,
  shims: true,
  publicDir: 'public',
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
}

const options: Options[] = [
  {
    ...baseOptions,
    entry: ['src/index.ts'],
    format: ['esm'],
    outDir: 'dist',
  },
  {
    ...baseOptions,
    entry: ['src/components/index.ts'],
    format: ['esm'],
    outDir: 'dist/components',
  },
  {
    ...baseOptions,
    entry: ['src/hooks/index.ts'],
    format: ['esm'],
    outDir: 'dist/hooks',
  },
]

export default defineConfig(options)
