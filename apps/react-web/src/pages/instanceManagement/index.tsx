import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const Instance = lazy(() => import('./Instance'))

const routes: RouteObject = {
  path: 'instance',
  children: [
    {
      index: true,
      element: <Instance />,
    },
  ],
}

export default routes
