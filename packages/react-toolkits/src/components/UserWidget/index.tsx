import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dropdown, Space } from 'antd'
import Link from 'antd/es/typography/Link'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { useTokenStore } from '@/stores'

const UserWidget: FC = props => {
  const navigate = useNavigate()
  const clearToken = useTokenStore(state => state.clearToken)
  const user = useTokenStore(state => state.getUser())

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
          <span>{user?.authorityId}</span>
          <UserOutlined style={{ fontSize: '16px' }} />
        </Space>
      </Link>
    </Dropdown>
  )
}

export default UserWidget
