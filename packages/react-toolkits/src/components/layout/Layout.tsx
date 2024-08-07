import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import * as Antd from 'antd'
import { Button, Divider, Space } from 'antd'
import type { CSSProperties, FC, PropsWithChildren } from 'react'
import { Suspense, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { TransitionStatus } from 'react-transition-group'
import { Transition } from 'react-transition-group'
import { useToolkitsContext } from '../contextProvider'
import { GameSelect } from '../gameSelect'
import { Logo } from '../logo'
import { NavMenu } from '../navMenu'
import UserWidget from '../userWidget'
import ContentWrapper from './ContentWrapper'
import { useLayoutStore } from './store'

const { Spin, theme } = Antd
const { Header, Sider, Content } = Antd.Layout

const Layout: FC<PropsWithChildren> = props => {
  const { children } = props
  const {
    token: { colorBgContainer, colorBorder },
  } = theme.useToken()
  const {
    appTitle,
    usePermissionApiV2,
    hideGameSelect,
    localeDropdownMenu,
    layoutHeaderExtras,
    signInSuccessRedirectUrl,
  } = useToolkitsContext()
  const { collapsed, setCollapsed } = useLayoutStore()
  const nodeRef = useRef(null)
  const duration = 250

  const defaultStyle = {
    transition: `opacity ${duration}ms ease-in-out`,
    opacity: 0,
    display: 'flex',
    alignItems: 'center',
  }

  const transitionStyles: Record<TransitionStatus, CSSProperties> = {
    entering: { opacity: 0, width: 0 },
    entered: { opacity: 1 },
    exiting: { opacity: 0 },
    exited: { opacity: 0 },
    unmounted: { opacity: 0 },
  }

  const onCollapse = async () => {
    setCollapsed(!collapsed)
  }

  return (
    <Antd.Layout>
      <Sider
        collapsible
        theme="light"
        trigger={null}
        collapsed={collapsed}
        width={256}
        style={{
          height: '100vh',
          overflow: 'auto',
          borderRightWidth: 1,
          borderRightStyle: 'solid',
          borderRightColor: colorBorder,
        }}
      >
        <Link to={signInSuccessRedirectUrl} className="flex gap-2 px-6 py-4">
          <Logo width={32} height={32} />
          <Transition nodeRef={nodeRef} in={!collapsed} timeout={duration}>
            {state => (
              <div
                ref={nodeRef}
                style={{
                  ...defaultStyle,
                  ...transitionStyles[state],
                }}
              >
                {!collapsed && appTitle}
              </div>
            )}
          </Transition>
        </Link>
        <NavMenu />
      </Sider>
      <Antd.Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
          }}
        >
          <div className="flex justify-between items-center h-full">
            <Space size="small" split={<Divider type="vertical" />} className="mr-6">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                style={{ fontSize: '16px' }}
                onClick={onCollapse}
              />
              {usePermissionApiV2 && !hideGameSelect && <GameSelect />}
              {layoutHeaderExtras?.map(extra => <span key={extra.key}>{extra.children}</span>)}
            </Space>
            <Space size="small" split={<Divider type="vertical" />}>
              {localeDropdownMenu}
              <UserWidget />
            </Space>
          </div>
        </Header>
        <Content
          style={{
            overflow: 'auto',
            padding: '24px 16px',
            maxHeight: 'calc(100vh - 64px)',
          }}
        >
          <Suspense
            fallback={
              <Spin
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '200px',
                }}
              />
            }
          >
            <ContentWrapper>{children}</ContentWrapper>
          </Suspense>
        </Content>
      </Antd.Layout>
    </Antd.Layout>
  )
}

export default Layout
