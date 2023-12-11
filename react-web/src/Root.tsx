/* eslint-disable @typescript-eslint/no-explicit-any, react/function-component-definition */
import { App } from 'antd'
import type { ComponentType } from 'react'
import { lazy } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Layout, RequestError, useTokenStore, useValidateToken, withBaseRoutes } from 'react-toolkits'
import type { BareFetcher, Key, SWRConfiguration, SWRHook, SWRResponse } from 'swr'
import { SWRConfig } from 'swr'

const List = lazy(() => import('@/pages/list/List'))
const InfiniteList = lazy(() => import('@/pages/list/Infinite'))

export const withLayout = (WrappedComponent: ComponentType) => {
  return function ComponentWithLayout() {
    return (
      <Layout>
        <WrappedComponent />
      </Layout>
    )
  }
}

const logger =
  (useSWRNext: SWRHook) =>
  <Data = any, Error = any>(
    key: Key,
    fetcher: BareFetcher<Data> | null,
    config: SWRConfiguration<Data, Error, BareFetcher<Data>>,
  ): SWRResponse<Data, Error> => {
    // 将日志记录器添加到原始 fetcher。
    const extendedFetcher = (...args: any[]) => {
      console.log('SWR Request:', key)
      if (fetcher === null) throw new Error('fetcher is null')
      return fetcher(...args)
    }

    return useSWRNext(key, import.meta.env.DEV ? extendedFetcher : fetcher, config)
  }

export const withSWRConfig = (WrappedComponent: ComponentType) => {
  return function ComponentWithSWRConfig() {
    const { notification } = App.useApp()
    const { clearToken } = useTokenStore()
    const navigate = useNavigate()

    return (
      <SWRConfig
        value={{
          use: [logger],
          shouldRetryOnError: false,
          revalidateOnFocus: false,
          onError(error) {
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
                  navigate('/sign_in')
                  return
                case 412:
                  clearToken()
                  navigate('/sign_in', { state: { notUser: true } })
                  return
                case 403:
                  notification.error({
                    message: '未授权',
                    description: '无权限，请联系管理员进行授权',
                  })
                  return
                default:
                  throw new Error(error.message)
              }
            }
          },
        }}
      >
        <WrappedComponent />
      </SWRConfig>
    )
  }
}

const ListRoutes = () => {
  return (
    <Routes>
      <Route index element={<List />} />
      <Route path="infinite" element={<InfiniteList />} />
    </Routes>
  )
}

const Root = () => {
  const location = useLocation()
  useValidateToken(location.pathname === '/sign_in')

  return withSWRConfig(
    withBaseRoutes(
      <Routes>
        <Route index element={<Navigate to="/list" />} />
        <Route path="list/*" Component={withLayout(ListRoutes)} />
      </Routes>,
    ),
  )()
}

export default Root
