import * as Antd from 'antd'
import { Divider, Space } from 'antd'
import type { FC, Key, PropsWithChildren, ReactNode } from 'react'
import { cloneElement, Suspense } from 'react'
import { Link } from 'react-router-dom'
import logo from './logo.png'
import { useToolkitsContext } from '@/components/ContextProvider'
import GameSelect from '@/components/GameSelect'
import NavMenu from '@/components/NavMenu'
import UserWidget from '@/components/UserWidget'
import RequireGame from '@/components/RequireGame'

const { Spin, theme } = Antd
const { Header, Sider, Content } = Antd.Layout

export interface LayoutProps extends PropsWithChildren {
  extras?: { key: Key; children: ReactNode }[]
}

const Layout: FC<LayoutProps> = props => {
  const { children, extras } = props
  const {
    token: { colorBgContainer, colorBorder },
  } = theme.useToken()
  const { title, usePermissionApiV2, hideGameSelect, localeDropdownMenu } = useToolkitsContext()

  return (
    <Antd.Layout hasSider className="h-screen">
      <Sider
        width={256}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          borderRightWidth: 1,
          borderRightStyle: 'solid',
          borderRightColor: colorBorder,
        }}
        theme="light"
      >
        <div className="flex items-end px-6 py-4">
          <img src={logo} alt="logo" className="w-8 h-8" />
          <Link className="font-bold text-lg ml-2" to="/">
            {title}
          </Link>
        </div>
        <NavMenu />
      </Sider>
      <Antd.Layout className="ml-64">
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderBottomColor: colorBorder,
          }}
        >
          <div className="flex justify-between items-center h-full">
            <div>{usePermissionApiV2 && !hideGameSelect && <GameSelect />}</div>
            <Space size="small" split={<Divider type="vertical" />}>
              {extras?.map(extra => <span key={extra.key}>{extra.children}</span>)}
              {localeDropdownMenu}
              <UserWidget />
            </Space>
          </div>
        </Header>
        <Content className="p-6 bg-gray-50" style={{ overflow: 'overlay' }}>
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
            {cloneElement(usePermissionApiV2 && !hideGameSelect ? <RequireGame /> : <></>, undefined, children)}
          </Suspense>
        </Content>
      </Antd.Layout>
    </Antd.Layout>
  )
}

export default Layout
