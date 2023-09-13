import type { FC} from 'react';
import { Suspense } from 'react'
import { App, Spin } from 'antd'
import { FetcherError, useTokenStore } from 'react-toolkits'
import { Navigate, Outlet } from 'react-router-dom'
import { SWRConfig } from 'swr'

const Root: FC = () => {
  const { notification } = App.useApp()
  const clearToken = useTokenStore(state => state.clearToken)

  const handleError = (error: any) => {
    if (error instanceof FetcherError) {
      switch (error.code) {
        case 401:
        case 412:
          clearToken()
          return <Navigate to={error.code === 401 ? '/login' : '/login?not_registered=1'} />
        default:
          if (!error.skip) {
            notification.error({
              message: '请求出错',
              description: error.message,
            })
          }
      }
    }
  }

  return (
    <SWRConfig
      value={{
        shouldRetryOnError: false,
        onError: handleError,
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
        <Outlet />
      </Suspense>
    </SWRConfig>
  )
}

export default Root
