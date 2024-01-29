import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import packageJson from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
  appType: 'custom',
  plugins: [
    react(),
    dts({
      outDir: 'lib',
      rollupTypes: true,
    }),
  ],
  build: {
    target: 'esnext',
    sourcemap: false,
    lib: {
      entry: 'src/index.tsx',
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
})
