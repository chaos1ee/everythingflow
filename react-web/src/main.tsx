import '@love1t/handsontable/style.css'
import { createRoot } from 'react-dom/client'
import 'react-toolkits/style.css'
import App from './App'
import './libs/i18n'
import './styles/index.css'

async function enableMocking() {
  const { worker } = await import('./mocks/setup')
  return worker.start({
    onUnhandledRequest: 'bypass',
    waitUntilReady: true,
  })
}

enableMocking().then(() => {
  const container = document.getElementById('root') as HTMLElement
  const root = createRoot(container)
  root.render(<App />)
})
