import logo from '@/assets/512_orange_nobackground.png'
import { Layout as AntdLayout, theme } from 'antd'
import type { FC, PropsWithChildren, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { ItemType2 } from './NavBar'
import NavBar from './NavBar'

const { Header, Sider, Content } = AntdLayout

export interface LayoutProps {
  title?: ReactNode
  items: ItemType2[]
  header?: ReactNode
}

const Layout: FC<PropsWithChildren<LayoutProps>> = props => {
  const { title, items, header, children } = props
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
          <img src={logo} alt="logo" className="w-8 h-8" />
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
        <Content className="p-6 overflow-auto bg-gray-50">{children}</Content>
      </AntdLayout>
    </AntdLayout>
  )
}

export default Layout
