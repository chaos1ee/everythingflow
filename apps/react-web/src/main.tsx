import { createRoot } from 'react-dom/client'
import 'react-toolkits/style.css'
import '@/styles/index.css'
import '@/libs/i18n'
import * as React from 'react'
import App from '@/App'

const { worker } = await import('./mocks/setup')

await worker.start({
  onUnhandledRequest: 'bypass',
  waitUntilReady: true,
})

const container = document.getElementById('root') as HTMLElement
const root = createRoot(container)

root.render(<App />)
