import type { Options } from 'tsup'
import { defineConfig } from 'tsup'
import packageJson from './package.json'

const sharedOpts: Options = {
  format: ['esm'],
  sourcemap: false,
  minify: true,
  treeshake: true,
  splitting: false,
  clean: true,
  dts: true,
  external: Object.keys(packageJson.peerDependencies),
  loader: {
    '.png': 'copy',
    '.svg': 'dataurl',
  },
  outExtension() {
    return {
      js: '.js',
      dts: '.d.ts',
    }
  },
}

const options: Options[] = [
  {
    ...sharedOpts,
    name: 'Build lib',
    entry: ['src/index.ts'],
    outDir: 'lib',
  },
  {
    ...sharedOpts,
    name: 'Build locale',
    entry: ['src/components/locale/*.{ts,tsx}'],
    outDir: 'locale',
  },
]

export default defineConfig(options)
