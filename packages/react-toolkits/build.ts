#!/usr/bin/env ts-node
import react from '@vitejs/plugin-react'
import type { UserConfig } from 'vite'
import { build } from 'vite'
import dts from 'vite-plugin-dts'
import packageJson from './package.json'

const configs: UserConfig[] = [
  {
    plugins: [
      react(),
      dts({
        outDir: 'lib',
        rollupTypes: true,
      }),
    ],
    build: {
      lib: {
        entry: 'src/index.ts',
        formats: ['es'],
        fileName: () => '[name].js',
      },
      rollupOptions: {
        external: Object.keys(packageJson.peerDependencies),
        output: {
          dir: 'lib',
          chunkFileNames: '[name]-[hash].chunk.js',
          assetFileNames: '[name].[ext]',
        },
      },
    },
  },
  {
    plugins: [
      dts({
        outDir: 'locales',
        rollupTypes: true,
      }),
    ],
    build: {
      lib: {
        entry: ['src/locales/en_GB.ts', 'src/locales/ja_JP.ts', 'src/locales/ko_KR.ts', 'src/locales/zh_CN.ts'],
        formats: ['es'],
        fileName: () => '[name].js',
      },
      rollupOptions: {
        output: {
          dir: 'locales',
        },
      },
    },
  },
]

configs.forEach(async config => {
  await build(config)
})

export default configs
