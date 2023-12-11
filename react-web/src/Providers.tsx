import { LocaleDropdownMenu } from '@/components'
import menuItems from '@/menu-items'
import { useLocaleStore } from '@/stores/locale'
import { App, ConfigProvider } from 'antd'
import type { FC, PropsWithChildren } from 'react'
import { ContextProvider } from 'react-toolkits'

const Providers: FC<PropsWithChildren> = ({ children }) => {
  const { locale } = useLocaleStore()

  return (
    <ConfigProvider
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
      <App>
        <ContextProvider
          usePermissionApiV2
          title={import.meta.env.APP_TITLE}
          menuItems={menuItems}
          locale={locale?.toolkits}
          localeDropdownMenu={<LocaleDropdownMenu />}
        >
          {children}
        </ContextProvider>
      </App>
    </ConfigProvider>
  )
}

export default Providers
