import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const TableList = lazy(() => import('./TableList'))
const VersionList = lazy(() => import('./VersionList'))

const routes: RouteObject = {
  path: 'table',
  children: [
    {
      index: true,
      element: <TableList />,
    },
    {
      path: 'version',
      element: <VersionList />,
    },
  ],
}

export default routes
