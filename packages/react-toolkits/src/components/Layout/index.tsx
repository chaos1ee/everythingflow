import logo from '@/assets/512_orange_nobackground.png'
import * as Antd from 'antd'
import { Divider, Space } from 'antd'
import type { FC, PropsWithChildren } from 'react'
import * as React from 'react'
import { Suspense } from 'react'
import { Link } from 'react-router-dom'
import { GameSelect, NavMenu, useReactToolkitsContext, UserWidget } from '@/components'
import { SWRConfig } from 'swr'

const { Spin, theme } = Antd
const { Header, Sider, Content } = Antd.Layout

export interface LayoutProps extends PropsWithChildren {
  extra?: React.ReactNode[]
}

const Layout: FC<LayoutProps> = props => {
  const { children, extra } = props
  const {
    token: { colorBgContainer, colorBorder },
  } = theme.useToken()
  const { title, game } = useReactToolkitsContext(state => state)

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
            <div>
              <GameSelect />
            </div>
            <Space size="small" split={<Divider type="vertical" />}>
              {extra}
              <UserWidget />
            </Space>
          </div>
        </Header>
        <Content className="p-6 overflow-auto bg-gray-50">
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
            <SWRConfig
              value={{
                // GameSelect 组件内的 game 变化时，会触发 children 的重新渲染
                // 为了避免 SWR 使用缓存导致数据不更新，需要设置 revalidateOnMount 为 true
                revalidateOnMount: true,
              }}
            >
              {React.createElement('div', { key: game?.id }, children)}
            </SWRConfig>
          </Suspense>
        </Content>
      </Antd.Layout>
    </Antd.Layout>
  )
}

export default Layout
