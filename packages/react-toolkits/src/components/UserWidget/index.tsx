import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { Dropdown, Space } from 'antd'
import Link from 'antd/es/typography/Link'
import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../hooks/i18n'
import { useTokenStore } from '../../stores/token'

const UserWidget: FC = () => {
  const navigate = useNavigate()
  const { clearToken, getUser } = useTokenStore()
  const user = getUser()
  const t = useTranslation()

  return (
    <div data-cy="user-widget">
      <Dropdown
        menu={{
          selectable: true,
          items: [
            {
              key: '1',
              label: (
                <Link
                  data-cy="user-widget-logout"
                  onClick={() => {
                    clearToken()
                    navigate('/sign_in')
                  }}
                >
                  {t('UserWidget.signOutText')}
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
    </div>
  )
}

export default UserWidget
