import router from '@/router'
import { Spin } from 'antd'
import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import Providers from './Providers'

const App = () => {
  return (
    <Providers>
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
        <RouterProvider router={router} />
      </Suspense>
    </Providers>
  )
}

export default App
