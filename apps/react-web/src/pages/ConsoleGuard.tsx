import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { Dropdown, Space, Spin } from 'antd'
import Link from 'antd/es/typography/Link'
import jwtDecode from 'jwt-decode'
import type { FC } from 'react'
import { Suspense } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Layout, usePermission, useTokenStore } from 'react-toolkits'
import navItems from '~/items'
import type { UserInfo } from '~/types'

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

const ConsoleGuard = () => {
  const { isValidating } = usePermission('100001')

  if (isValidating) return null

  return (
    <Layout
      title="React Web"
      header={
        <div className="h-full flex justify-end items-center">
          <UserBar />
        </div>
      }
      items={navItems}
    >
      <Suspense
        fallback={
          <Spin
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '50vh',
            }}
          />
        }
      >
        <Outlet />
      </Suspense>
    </Layout>
  )
}

export default ConsoleGuard
