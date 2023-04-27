import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { Dropdown, Space, Typography } from 'antd'
import type { FC, PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { TOKEN_FLAG } from '../constants'

const { Link } = Typography

export interface UserBarProps {
  color?: string
}

const UserBar: FC<PropsWithChildren<UserBarProps>> = props => {
  const { color, children } = props
  const { t } = useTranslation()
  const navigate = useNavigate()

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
                  localStorage.removeItem(TOKEN_FLAG)
                  navigate('/login')
                }}
              >
                {t('logout')}
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
          <>{children}</>
          <UserOutlined style={{ fontSize: '16px' }} />
        </Space>
      </Link>
    </Dropdown>
  )
}

export default UserBar
