import { Spin } from 'antd'
import type { FC } from 'react'
import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { SWRConfig } from 'swr'
import { useHttpClient } from 'react-toolkits'

const Root: FC = () => {
  const httpClient = useHttpClient()

  return (
    <SWRConfig
      value={{
        fetcher: httpClient.request,
        shouldRetryOnError: false,
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
