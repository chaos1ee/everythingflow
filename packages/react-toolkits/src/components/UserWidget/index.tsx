import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Dropdown, Space } from 'antd'
import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../hooks/i18n'
import { useTokenStore } from '../../stores/token'
import { useToolkitsContext } from '../ContextProvider'

const UserWidget: FC = () => {
  const navigate = useNavigate()
  const { clearToken, getUser } = useTokenStore()
  const user = getUser()
  const t = useTranslation()
  const { signInUrl } = useToolkitsContext()

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions,jsx-a11y/anchor-is-valid
        <a
          data-cy="user-widget-logout"
          onClick={() => {
            clearToken()
            if (signInUrl) {
              navigate(signInUrl)
            }
          }}
        >
          {t('UserWidget.signOutText')}
        </a>
      ),
      icon: <LogoutOutlined />,
    },
  ]

  return (
    <div data-cy="user-widget">
      <Dropdown
        menu={{
          selectable: true,
          items,
        }}
        placement="bottomRight"
      >
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions,jsx-a11y/anchor-is-valid */}
        <a
          onClick={e => {
            e.preventDefault()
          }}
        >
          <Space align="center">
            <span>{user?.authorityId}</span>
            <UserOutlined style={{ fontSize: '16px' }} />
          </Space>
        </a>
      </Dropdown>
    </div>
  )
}

export default UserWidget
