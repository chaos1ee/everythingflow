/* eslint-disable camelcase */
import { App } from 'antd'
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FC } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { RequestError, useTokenStore, useValidateToken } from 'react-toolkits'
import type { BareFetcher, Key, Middleware, SWRConfiguration } from 'swr'
import { SWRConfig } from 'swr'
import type { defaultConfig } from 'swr/_internal'

const logger: Middleware =
  useSWRNext =>
  <Data = any, Error = any>(
    key: Key,
    fetcher: BareFetcher<Data> | null,
    config: typeof defaultConfig & SWRConfiguration<Data, Error, BareFetcher<Data>>,
  ) => {
    // 将日志记录器添加到原始 fetcher。
    const extendedFetcher = (...args: any[]) => {
      console.log('SWR Request:', key)
      return fetcher?.(...args)
    }

    return useSWRNext(key, process.env.NODE_ENV === 'development' ? extendedFetcher : fetcher, config)
  }

const Root: FC = () => {
  useValidateToken()

  const { notification } = App.useApp()
  const { clearToken } = useTokenStore()
  const navigate = useNavigate()

  return (
    <SWRConfig
      value={{
        use: [logger],
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
