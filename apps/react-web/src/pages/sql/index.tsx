import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const QueryOnline = lazy(() => import('./QueryOnline'))

const routes: RouteObject = {
  path: 'sql',
  children: [
    {
      path: 'query_online',
      element: <QueryOnline />,
    },
  ],
}

export default routes
