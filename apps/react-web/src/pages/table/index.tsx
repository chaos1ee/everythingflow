import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const TableList = lazy(() => import('./TableList'))

const routes: RouteObject = {
  path: 'table',
  children: [
    {
      index: true,
      element: <TableList />,
    },
  ],
}

export default routes
