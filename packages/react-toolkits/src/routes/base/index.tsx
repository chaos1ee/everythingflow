import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const Login = lazy(() => import('./Login'))
const NotFound = lazy(() => import('./NotFound'))

const routes: RouteObject[] = [
  {
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]

export default routes
