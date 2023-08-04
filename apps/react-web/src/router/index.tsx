import { createBrowserRouter, Navigate, Outlet, useNavigate, useRouteError } from 'react-router-dom'
import { HttpClientError, Layout, Login, NoMatch, permission, useTokenStore } from 'react-toolkits'
import instanceManagementRoutes from '~/pages/instanceManagement'
import sqlRoutes from '~/pages/sql'
import navItems from '~/items'
import jwtDecode from 'jwt-decode'
import type { FC } from 'react'
import { Alert, App, Dropdown, Space } from 'antd'
import Link from 'antd/es/typography/Link'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import type { UserInfo } from '~/types'
import Root from '~/pages/Root'

const { ErrorBoundary } = Alert

const routes = [instanceManagementRoutes, sqlRoutes, permission]

function decode(token: string) {
  try {
    return jwtDecode(token)
  } catch (_) {
    return null
  }
}

const UserBar: FC = props => {
  const navigate = useNavigate()
  const token = useTokenStore(state => state.token)
  const clearToken = useTokenStore(state => state.clearToken)
  const user = (decode(token as string) as UserInfo)?.authorityId

  return (
    <Dropdown
      menu={{
        selectable: true,
        items: [
          {
            key: '1',
            label: (
              <Link
                onClick={() => {
                  clearToken()
                  navigate('/login')
                }}
              >
                登出
              </Link>
            ),
            icon: <LogoutOutlined />,
          },
        ],
      }}
      placement="bottomRight"
    >
      <Link>
        <Space align="center">
          <span>{user}</span>
          <UserOutlined style={{ fontSize: '16px' }} />
        </Space>
      </Link>
    </Dropdown>
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
        path: 'login',
        element: <Login />,
      },
      {
        element: (
          <Layout
            title="React Web"
            header={
              <div className="h-full flex justify-end items-center">
                <UserBar />
              </div>
            }
            items={navItems}
          >
            <Outlet />
          </Layout>
        ),
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
