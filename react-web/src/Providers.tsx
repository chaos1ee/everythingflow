/* eslint-disable @typescript-eslint/no-explicit-any */
import { App, ConfigProvider, Spin } from 'antd'
import antdLocale from 'antd/locale/zh_CN'
import type { FC, PropsWithChildren } from 'react'
import { Suspense } from 'react'
import { Link } from 'react-router-dom'
import { ContextProvider, request } from 'react-toolkits'
import type { BareFetcher, SWRConfiguration, SWRHook, Key as SWRKey, SWRResponse } from 'swr'
import { SWRConfig } from 'swr'
import { LocaleDropdownMenu } from './components'
import menuItems from './menu-items'
import { useLocaleStore } from './stores/locale'

const logger =
  (useSWRNext: SWRHook) =>
  <Data = any, Error = any>(
    key: SWRKey,
    fetcher: BareFetcher<Data> | null,
    config: SWRConfiguration<Data, Error, BareFetcher<Data>>,
  ): SWRResponse<Data, Error> => {
    const extendedFetcher = (...args: any[]) => {
      console.log('SWR Request:', key)
      if (fetcher === null) throw new Error('fetcher is null')
      return fetcher(...args)
    }

    return useSWRNext(key, import.meta.env.DEV ? extendedFetcher : fetcher, config)
  }

const Providers: FC<PropsWithChildren> = ({ children }) => {
  const { locale } = useLocaleStore()

  return (
    <ConfigProvider
      locale={antdLocale}
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
          appTitle={
            <Link to="/">
              <span className="font-bold text-xl ">{import.meta.env.VITE_APP_TITLE}</span>
            </Link>
          }
          signInPageTitle={<span className="text-2xl font-bold">{import.meta.env.VITE_APP_TITLE}</span>}
          locale={locale?.toolkits}
          localeDropdownMenu={<LocaleDropdownMenu />}
          menuItems={menuItems}
        >
          <SWRConfig
            value={{
              use: [logger],
              fetcher: (args: Parameters<typeof request>) => request(...args).then(response => response.data),
              shouldRetryOnError: false,
              revalidateOnFocus: false,
            }}
          >
            <Suspense
              fallback={
                <Spin
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
              {children}
            </Suspense>
          </SWRConfig>
        </ContextProvider>
      </App>
    </ConfigProvider>
  )
}

export default Providers
