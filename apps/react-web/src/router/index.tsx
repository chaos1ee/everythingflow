import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { baseRoutes, ContextProvider, Layout, permissionRoutes } from 'react-toolkits'
import tableRoutes from '@/pages/table'
import Root from '@/Root'
import ErrorElement from '@/ErrorElement'
import { LangSelect } from '@/components'

const routes = [tableRoutes]

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
        element: <Navigate to="/console/table" />,
      },
      {
        path: 'console',
        element: (
          <Layout
            extras={[
              {
                key: '1',
                children: <LangSelect />,
              },
            ]}
          >
            <Outlet />
          </Layout>
        ),
        children: routes,
      },
      {
        element: (
          <ContextProvider isGlobalNS>
            <Layout
              extras={[
                {
                  key: '1',
                  children: <LangSelect />,
                },
              ]}
            >
              <Outlet />
            </Layout>
          </ContextProvider>
        ),
        children: [permissionRoutes],
      },
      // 放在最后，否则会覆盖其他的路由
      baseRoutes,
    ],
  },
])

export default router
