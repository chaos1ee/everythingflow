import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dropdown, Space } from 'antd'
import Link from 'antd/es/typography/Link'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { useTranslation } from '@/utils/i18n'
import { useTokenStore } from '@/stores/token'

const UserWidget: FC = () => {
  const navigate = useNavigate()
  const { clearToken, getUser } = useTokenStore()
  const user = getUser()
  const t = useTranslation()

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
                {t('UserWidget.logoutText')}
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
