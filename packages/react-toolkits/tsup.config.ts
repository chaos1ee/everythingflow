import type { Options } from 'tsup'
import { defineConfig } from 'tsup'

export default defineConfig((options: Options) => ({
  entry: ['src/index.ts'],
  treeshake: true,
  splitting: false,
  format: ['esm'],
  sourcemap: true,
  dts: true,
  minify: false,
  clean: true,
  shims: true,
  external: ['@ant-design/icons', 'antd', 'react', 'react-dom', 'react-router-dom'],
  loader: {
    '.jpg': 'base64',
    '.png': 'copy',
    '.webp': 'file',
    '.svg': 'base64',
  },
  outExtension({ format }) {
    return {
      js: `.${format}.js`,
    }
  },
  ...options,
}))
