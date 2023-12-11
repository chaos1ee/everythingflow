import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: env.BASE_URL,
    define: {
      'import.meta.env.APP_TITLE': JSON.stringify(env.APP_TITLE),
      'import.meta.env.BASE_URL': JSON.stringify(env.BASE_URL),
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    server: {
      port: 8000,
    },
  }
})
