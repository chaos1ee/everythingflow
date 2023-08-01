import { Spin } from 'antd'
import type { FC } from 'react'
import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { useFetcher } from 'react-toolkits'
import { SWRConfig } from 'swr'

const Root: FC = () => {
  const fetcher = useFetcher()

  return (
    <SWRConfig
      value={{
        fetcher,
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
