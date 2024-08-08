/* eslint-disable @typescript-eslint/no-explicit-any */
import { App, ConfigProvider, Spin } from 'antd'
import antdLocale from 'antd/locale/zh_CN'
import { pick } from 'lodash-es'
import type { FC, PropsWithChildren } from 'react'
import { Suspense } from 'react'
import type { RequestOptions } from 'react-toolkits'
import { ContextProvider, request, RequestError } from 'react-toolkits'
import type { BareFetcher, SWRConfiguration, SWRHook, Key as SWRKey, SWRResponse } from 'swr'
import { SWRConfig } from 'swr'
import { LocaleDropdownMenu } from './components'
import { useLocaleStore } from './components/localeDropdownMenu'
import menuItems from './menu-items'

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

const responseInterceptor = async (response: Response, opts: RequestOptions) => {
  const responseType = opts.responseType

  let data

  if (responseType === 'blob') {
    data = await response.blob()
  } else if (responseType === 'json') {
    const json = await response.json()
    if (json.code === 0 || json.status === 0) {
      data = json.data
    } else {
      throw new RequestError({
        code: json.code,
        status: response.status,
        message: json.msg,
      })
    }
  } else {
    data = await response.text()
  }

  return {
    ...pick(response, ['headers', 'status', 'statusText', 'url']),
    data,
  }
}

const appTitle = <span className="font-bold text-xl ">{import.meta.env.VITE_APP_TITLE}</span>

const signInPageTitle = <span className="text-2xl font-bold">{import.meta.env.VITE_APP_TITLE}</span>

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
          locale={locale?.toolkits}
          localeDropdownMenu={<LocaleDropdownMenu />}
          menuItems={menuItems}
          appTitle={appTitle}
          signInPageTitle={signInPageTitle}
          signInUrl="/sign_in"
          signInSuccessRedirectUrl="/"
          responseInterceptor={responseInterceptor}
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
