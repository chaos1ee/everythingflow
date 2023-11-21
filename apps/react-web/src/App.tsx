/* eslint-disable camelcase */
import { LocaleDropdownMenu } from '@/components'
import menuItems from '@/menu-items'
import router from '@/router'
import { useLocaleStore } from '@/stores/locale'
import * as Antd from 'antd'
import type { FC } from 'react'
import * as React from 'react'
import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { ContextProvider } from 'react-toolkits'

const App: FC = () => {
  const { locale } = useLocaleStore()

  return (
    <Antd.ConfigProvider
      locale={locale?.antd}
      theme={{
        token: {
          colorPrimary: '#ff5a00',
          colorLink: '#ff5a00',
          colorLinkHover: '#ff927b',
          colorLinkActive: '#ff927b',
          colorBorder: 'rgba(5, 5, 5, 0.06)',
        },
      }}
    >
      <Antd.App>
        <ContextProvider
          usePermissionApiV2
          title="React Web"
          menuItems={menuItems}
          locale={locale?.toolkits}
          localeDropdownMenu={<LocaleDropdownMenu />}
        >
          <Suspense
            fallback={
              <Antd.Spin
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100vw',
                  height: '100vh',
                }}
              />
            }
          >
            <RouterProvider router={router} />
          </Suspense>
        </ContextProvider>
      </Antd.App>
    </Antd.ConfigProvider>
  )
}

export default App
