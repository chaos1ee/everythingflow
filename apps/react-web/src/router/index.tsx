import { createBrowserRouter, Navigate, Outlet, useRouteError } from 'react-router-dom'
import { baseRoutes, HttpClientError, Layout, permissionRoutes, useTokenStore } from 'react-toolkits'
import instanceManagementRoutes from '~/pages/instanceManagement'
import sqlRoutes from '~/pages/sql'
import type { FC } from 'react'
import { Suspense } from 'react'
import { Alert, App, Spin } from 'antd'
import { SWRConfig } from 'swr'

const { ErrorBoundary } = Alert
const routes = [instanceManagementRoutes, sqlRoutes]

/**
 * SWRConfig 的 onError 会捕获所有的请求错误，但是无法捕获 React 组件的错误（比如开启了 suspense 的 SWR 请求），所以需要使用 ErrorElement 来捕获。
 */

const Root: FC = () => {
  const { notification } = App.useApp()
  const clearToken = useTokenStore(state => state.clearToken)

  return (
    <SWRConfig
      value={{
        shouldRetryOnError: false,
        onError(error) {
          if (error instanceof HttpClientError) {
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
        },
      }}
    >
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
    </SWRConfig>
  )
}

const ErrorElement: FC = () => {
  const error = useRouteError()
  const { notification } = App.useApp()
  const clearToken = useTokenStore(state => state.clearToken)

  if (error instanceof HttpClientError) {
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

  return <ErrorBoundary />
}

// PNPM 的符号链接方式导致 Typescript 报错："The inferred type of 'router' cannot be named without a reference to 'xxx'. This is likely not portable. A type annotation is necessary"）
// 解决方案可以参照 https://github.com/microsoft/TypeScript/issues/42873#issuecomment-1372144595。
// node-linker 说明 https://pnpm.io/zh/npmrc#node-linker。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const router: any = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorElement />,
    children: [
      {
        index: true,
        element: <Navigate to="/instance" />,
      },
      {
        element: (
          <Layout>
            <Outlet />
          </Layout>
        ),
        children: routes,
      },
      permissionRoutes,
      // 放在最后，否则会覆盖其他的路由
      baseRoutes,
    ],
  },
])

export default router
