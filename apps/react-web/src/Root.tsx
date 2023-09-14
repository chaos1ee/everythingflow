import type { FC } from 'react'
import { Suspense } from 'react'
import { App, ConfigProvider, Spin } from 'antd'
import { RequestError, ToolkitsContextProvider, useTokenStore, useValidateToken } from 'react-toolkits'
import { Navigate, Outlet } from 'react-router-dom'
import { SWRConfig } from 'swr'
import menuItems from '~/menu-items'
import zhCN from 'antd/locale/zh_CN'

const Root: FC = () => {
  useValidateToken()
  const { notification } = App.useApp()
  const { clearToken } = useTokenStore()

  const handleError = (error: any) => {
    if (error instanceof RequestError) {
      switch (error.code) {
        case 401:
        case 412:
          clearToken()
          return <Navigate to={error.code === 401 ? '/login' : '/login?not_registered=1'} />
        default:
          if (!error.skip) {
            notification.error({
              message: '请求出错',
              description: error.message,
            })
          }
      }
    }
  }

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
          <ToolkitsContextProvider usePermissionV2 title="React Web" menuItems={menuItems}>
            <SWRConfig
              value={{
                shouldRetryOnError: false,
                onError: handleError,
              }}
            >
              <Outlet />
            </SWRConfig>
          </ToolkitsContextProvider>
        </Suspense>
      </App>
    </ConfigProvider>
  )
}

export default Root
