import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { Dropdown, Space, Typography } from 'antd'
import type { FC, PropsWithChildren } from 'react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTokenStore } from '../../stores'
import jwtDecode from 'jwt-decode'

const { Link } = Typography

export interface UserInfo {
  authorityId: string
  exp: number
}

export interface UserBarProps {
  color?: string
}

const UserBar: FC<PropsWithChildren<UserBarProps>> = props => {
  const { color } = props
  const navigate = useNavigate()
  const token = useTokenStore(state => state.token)
  const clearToken = useTokenStore(state => state.clearToken)

  const username = useMemo(() => {
    try {
      return (jwtDecode(token) as UserInfo)?.authorityId
    } catch (_) {
      return ''
    }
  }, [token])

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
      <Link style={{ color }}>
        <Space align="center">
          <span>{username}</span>
          <UserOutlined style={{ fontSize: '16px' }} />
        </Space>
      </Link>
    </Dropdown>
  )
}

export default UserBar
