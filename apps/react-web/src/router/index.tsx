import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Login, permission } from 'react-toolkits'
import ConsoleGuard from '~/pages/ConsoleGuard'
import instanceManagementRoutes from '~/pages/instanceManagement'
import NoMatch from '~/pages/NoMatch'
import Root from '~/pages/Root'
import sqlRoutes from '~/pages/sql'

const routes = [instanceManagementRoutes, sqlRoutes, permission]

// PNPM 的符号链接方式导致 Typescript 报错："The inferred type of 'router' cannot be named without a reference to 'xxx'. This is likely not portable. A type annotation is necessary"）
// 解决方案可以参照 https://github.com/microsoft/TypeScript/issues/42873#issuecomment-1372144595。
// node-linker 说明 https://pnpm.io/zh/npmrc#node-linker。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const router: any = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        element: <ConsoleGuard />,
        children: routes,
      },
      {
        index: true,
        element: <Navigate to="/instance" />,
      },
    ],
  },
  {
    path: '*',
    element: <NoMatch />,
  },
])

export default router
