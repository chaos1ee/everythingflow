import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { Dropdown, Space } from 'antd'
import Link from 'antd/es/typography/Link'
import jwtDecode from 'jwt-decode'
import type { FC } from 'react'
import { createBrowserRouter, Navigate, useNavigate } from 'react-router-dom'
import { Layout, Login, permission, useTokenStore } from 'react-toolkits'
import navItems from '~/items'
import ConsoleGuard from '~/pages/ConsoleGuard'
import instanceManagementRoutes from '~/pages/instanceManagement'
import NoMatch from '~/pages/NoMatch'
import Root from '~/pages/Root'
import sqlRoutes from '~/pages/sql'
import type { UserInfo } from '~/types'

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
          <span>{(decode(token as string) as UserInfo)?.authorityId}</span>
          <UserOutlined style={{ fontSize: '16px' }} />
        </Space>
      </Link>
    </Dropdown>
  )
}

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
        children: [
          {
            element: (
              <Layout
                title={<>Mono Demo</>}
                header={
                  <div className="h-full flex justify-end items-center">
                    <UserBar />
                  </div>
                }
                items={navItems}
              />
            ),
            children: routes,
          },
        ],
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
