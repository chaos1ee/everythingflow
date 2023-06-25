import { App, ConfigProvider, Spin } from 'antd'
import type { FC } from 'react'
import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import zhCN from 'antd/locale/zh_CN'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

const Root: FC = () => {
  return (
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
        <QueryClientProvider client={queryClient}>
          <Suspense
            fallback={
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
          >
            <Outlet />
          </Suspense>
        </QueryClientProvider>
      </App>
    </ConfigProvider>
  )
}

export default Root
