import { App, ConfigProvider, Spin } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import 'react-toolkits/dist/index.css'
import router from '~/router'
import '~/styles/index.css'
import { ToolkitsContextProvider } from 'react-toolkits'
import menuItems from '~/menu-items'

dayjs.locale('zh-cn')

const { worker } = await import('./mocks/setup')
await worker.start({
  onUnhandledRequest: 'bypass',
  waitUntilReady: true,
})

const container = document.getElementById('root') as HTMLElement
const root = createRoot(container)

root.render(
  <ToolkitsContextProvider usePermissionV2 title="React Web" menuItems={menuItems}>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#ff5a00',
          colorLink: '#ff5a00',
          colorLinkHover: '#ff927b',
          colorLinkActive: '#ff927b',
          colorBorder: 'rgba(5, 5, 5, 0.06)',
        },
      }}
    >
      <App>
        <RouterProvider
          router={router}
          fallbackElement={
            <Spin
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100vw',
                height: '100vh',
              }}
            />
          }
        />
      </App>
    </ConfigProvider>
  </ToolkitsContextProvider>,
)
