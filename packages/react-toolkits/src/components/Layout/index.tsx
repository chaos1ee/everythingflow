import * as Antd from 'antd'
import type { FC, PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/512_orange_nobackground.png'

export interface LayoutProps {
  title?: string
  header?: React.ReactNode
  aside?: React.ReactNode
}

const Layout: FC<PropsWithChildren<LayoutProps>> = props => {
  const { title, header, aside, children } = props
  const {
    token: { colorBgContainer, colorBorder },
  } = Antd.theme.useToken()

  return (
    <Antd.Layout hasSider className="h-screen">
      <Antd.Layout.Sider
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
          <Link className="font-bold text-lg ml-2" to="/home">
            {title}
          </Link>
        </div>
        {aside}
      </Antd.Layout.Sider>
      <Antd.Layout className="ml-64">
        <Antd.Layout.Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderBottomColor: colorBorder,
          }}
        >
          {header}
        </Antd.Layout.Header>
        <Antd.Layout.Content className="p-6 overflow-auto bg-gray-50">{children}</Antd.Layout.Content>
      </Antd.Layout>
    </Antd.Layout>
  )
}

export default Layout
