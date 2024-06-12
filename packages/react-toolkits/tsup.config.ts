import type { Options } from 'tsup'
import { defineConfig } from 'tsup'
import packageJson from './package.json'

const commonOpts: Options = {
  format: ['esm'],
  sourcemap: false,
  minify: true,
  treeshake: true,
  splitting: false,
  clean: true,
  dts: true,
  outExtension() {
    return {
      js: '.js',
      dts: '.d.ts',
    }
  },
}

const options: Options[] = [
  {
    ...commonOpts,
    name: 'Build lib',
    entry: ['src/index.tsx'],
    outDir: 'lib',
    external: Object.keys(packageJson.peerDependencies),
    loader: {
      '.jpg': 'base64',
      '.png': 'copy',
      '.webp': 'file',
      '.svg': 'dataurl',
    },
  },
  {
    ...commonOpts,
    name: 'Build locales',
    entry: ['src/locales/*.ts', '!src/locales/index.ts'],
    outDir: 'locales',
    dts: false,
  },
  {
    ...commonOpts,
    name: 'Build locale type',
    entry: ['src/locales/index.ts'],
    outDir: 'locales',
    dts: {
      only: true,
    },
  },
]

export default defineConfig(options)
