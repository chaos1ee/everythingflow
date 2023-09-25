import type { Options } from 'tsup'
import { defineConfig } from 'tsup'
import * as process from 'process'
import packageJson from './package.json'

const isProduction = process.env.NODE_ENV === 'production'

const commonOpts: Options = {
  format: ['esm'],
  sourcemap: true,
  minify: isProduction,
  treeshake: true,
  splitting: false,
  clean: true,
  shims: true,
  dts: true,
  outExtension() {
    return {
      js: '.js',
    }
  },
}

const options: Options[] = [
  {
    ...commonOpts,
    name: 'lib',
    entry: ['src/index.ts'],
    outDir: 'lib',
    external: Object.keys(packageJson.peerDependencies),
    loader: {
      '.jpg': 'base64',
      '.png': 'copy',
      '.webp': 'file',
    },
  },
  {
    ...commonOpts,
    name: 'locales',
    entry: ['src/locales/*.ts', '!src/locales/index.ts'],
    outDir: 'locales',
  },
]

export default defineConfig(options)
