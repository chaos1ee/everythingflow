import logo from '@/assets/512_orange_nobackground.png'
import { Layout as AntdLayout, Spin, theme } from 'antd'
import type { FC, ReactNode } from 'react'
import { Suspense } from 'react'
import { Link, Outlet } from 'react-router-dom'
import type { ItemType2 } from './NavBar'
import NavBar from './NavBar'

const { Header, Sider, Content } = AntdLayout

export interface LayoutProps {
  title?: ReactNode
  items: ItemType2[]
  header?: ReactNode
}

const Layout: FC<LayoutProps> = props => {
  const { title, items, header } = props
  const {
    token: { colorBgContainer, colorBorder },
  } = theme.useToken()

  return (
    <AntdLayout hasSider className="h-screen">
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
          <img src={logo} alt="logo" className="w-8" />
          <Link className="font-bold text-lg ml-2" to="/">
            {title}
          </Link>
        </div>
        <NavBar items={items} />
      </Sider>
      <AntdLayout className="ml-64">
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderBottomColor: colorBorder,
          }}
        >
          {header}
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
            <Outlet />
          </Suspense>
        </Content>
      </AntdLayout>
    </AntdLayout>
  )
}

export default Layout
