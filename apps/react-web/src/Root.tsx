/* eslint-disable camelcase */
import type { FC } from 'react'
import { App } from 'antd'
import { RequestError, useTokenStore, useValidateToken } from 'react-toolkits'
import { Outlet, useNavigate } from 'react-router-dom'
import { SWRConfig } from 'swr'

const Root: FC = () => {
  useValidateToken()

  const { notification } = App.useApp()
  const { clearToken } = useTokenStore()
  const navigate = useNavigate()

  return (
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
  )
}

export default Root
