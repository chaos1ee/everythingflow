import ErrorElement from '@/ErrorElement'
import commonRoutes from '@/pages/common'
import Root from '@/Root'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { baseRoutes, logRoutes, permissionRoutes } from 'react-toolkits'

const routes = [
  ...commonRoutes,
  ...logRoutes,
  ...permissionRoutes,
  // 放在最后，否则会覆盖其他的路由
  ...baseRoutes,
]

// PNPM 的符号链接方式导致 Typescript 报错："The inferred type of 'router' cannot be named without a reference to 'xxx'. This is likely not portable. A type annotation is necessary"）
// 解决方案可以参照 https://github.com/microsoft/TypeScript/issues/42873#issuecomment-1372144595。
// node-linker 说明 https://pnpm.io/zh/npmrc#node-linker。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const router: any = createBrowserRouter(
  [
    {
      path: '/',
      element: <Root />,
      errorElement: <ErrorElement />,
      children: [
        {
          index: true,
          element: <Navigate to="/table" />,
        },
        ...routes,
      ],
    },
  ],
  { basename: process.env.BASE_URL },
)

export default router
