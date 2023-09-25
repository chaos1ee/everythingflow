/* eslint-disable camelcase */
import type { FC } from 'react'
import { Suspense } from 'react'
import { App, ConfigProvider, Spin } from 'antd'
import { ContextProvider, RequestError, useTokenStore, useValidateToken } from 'react-toolkits'
import { Outlet, useNavigate } from 'react-router-dom'
import { SWRConfig } from 'swr'
import menuItems from '@/menu-items'
import { useLocaleStore } from '@/stores'

const Root: FC = () => {
  useValidateToken()
  const { notification } = App.useApp()
  const { clearToken } = useTokenStore()
  const navigate = useNavigate()
  const locale = useLocaleStore(state => state.locale)

  return (
    <ConfigProvider
      locale={locale.antd}
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
          <ContextProvider usePermissionV2 title="React Web" menuItems={menuItems} locale={locale.toolkits}>
            <SWRConfig
              value={{
                shouldRetryOnError: false,
                revalidateOnFocus: false,
                onError: error => {
                  if (error instanceof RequestError) {
                    switch (error.status) {
                      case 200:
                        notification.error({
                          message: '请求出错',
                          description: error.message,
                        })
                        return
                      case 401:
                        clearToken()
                        navigate('/login')
                        return
                      case 412:
                        clearToken()
                        navigate('/login', { state: { notUser: true } })
                        return
                      case 403:
                        notification.error({
                          message: '未授权',
                          description: '无权限，请联系管理员进行授权',
                        })
                    }
                  }
                },
              }}
            >
              <Outlet />
            </SWRConfig>
          </ContextProvider>
        </Suspense>
      </App>
    </ConfigProvider>
  )
}

export default Root
