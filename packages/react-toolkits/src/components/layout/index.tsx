import * as Antd from 'antd'
import { Card, Divider, Empty, Space } from 'antd'
import type { FC, PropsWithChildren } from 'react'
import { Suspense } from 'react'
import { useToolkitsContext } from '../contextProvider'
import { GameSelect, useGameStore } from '../gameSelect'
import { useTranslation } from '../locale'
import Logo from '../logo'
import { NavMenu } from '../navMenu'
import UserWidget from '../userWidget'

const { Spin, theme } = Antd
const { Header, Sider, Content } = Antd.Layout

const ContentGuard: FC<PropsWithChildren> = props => {
  const { children } = props
  const { usePermissionApiV2, hideGameSelect } = useToolkitsContext()
  const { game, isLoading } = useGameStore()
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <Spin
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 200,
        }}
      />
    )
  }

  if (usePermissionApiV2 && !hideGameSelect && !game) {
    return (
      <Card>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('RequireGame.description')} />
      </Card>
    )
  }

  return children
}

const Layout: FC<PropsWithChildren> = props => {
  const { children } = props
  const {
    token: { colorBgContainer, colorBorder },
  } = theme.useToken()
  const { appTitle, usePermissionApiV2, hideGameSelect, localeDropdownMenu, layoutHeaderExtras } = useToolkitsContext()

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
        <div className="flex items-center px-6 py-4">
          <Logo width={32} />
          <div className="ml-2">{appTitle}</div>
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
              {layoutHeaderExtras?.map(extra => <span key={extra.key}>{extra.children}</span>)}
              {localeDropdownMenu}
              <UserWidget />
            </Space>
          </div>
        </Header>
        <Content className="p-6 bg-gray-50 over">
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
            <ContentGuard>{children}</ContentGuard>
          </Suspense>
        </Content>
      </Antd.Layout>
    </Antd.Layout>
  )
}

export default Layout
