import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import 'react-toolkits/dist/index.css'
import router from '~/router'
import '~/styles/index.css'

dayjs.locale('zh-cn')

const { worker } = await import('./mocks/setup')
await worker.start({
  onUnhandledRequest: 'bypass',
  waitUntilReady: true,
})

const container = document.getElementById('root') as HTMLElement
const root = createRoot(container)

root.render(<RouterProvider router={router} />)
