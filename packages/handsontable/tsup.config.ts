import { defineConfig } from 'tsup'
import packageJson from './package.json'

export default defineConfig({
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
  name: 'Build lib',
  entry: ['src/index.ts'],
  outDir: 'lib',
  external: Object.keys(packageJson.peerDependencies),
})
