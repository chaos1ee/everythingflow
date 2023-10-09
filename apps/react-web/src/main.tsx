import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import 'react-toolkits/style.css'
import router from '@/router'
import '@/styles/index.css'
import '@/libs/i18n'
import * as React from 'react'

const { worker } = await import('./mocks/setup')

await worker.start({
  onUnhandledRequest: 'bypass',
  waitUntilReady: true,
})

const container = document.getElementById('root') as HTMLElement
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
