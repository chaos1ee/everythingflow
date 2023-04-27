import { Layout as AntdLayout, Spin } from 'antd'
import type { FC, ReactNode } from 'react'
import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import type { ItemType2 } from './NavBar'
import NavBar from './NavBar'

const { Header, Sider, Content } = AntdLayout

interface LayoutProps {
  navItems: ItemType2[]
  asideHeader?: ReactNode
  header?: ReactNode
}

const Layout: FC<LayoutProps> = props => {
  const { navItems, asideHeader, header } = props

  return (
    <AntdLayout hasSider className="h-screen">
      <Sider width={256} className="fixed top-0 left-0 bottom-0 overflow-auto h-screen border-r-slate-50" theme="light">
        <div className="flex items-center px-6 py-4">{asideHeader}</div>
        <NavBar items={navItems} />
      </Sider>
      <AntdLayout className="ml-64">
        <Header className="px-6 border-b-slate-50 bg-white">{header}</Header>
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
