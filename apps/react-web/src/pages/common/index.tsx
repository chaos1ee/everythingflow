import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Layout } from 'react-toolkits'

const TableList = lazy(() => import('./TableList'))
const VersionList = lazy(() => import('./VersionList'))

const routes: RouteObject[] = [
  {
    path: 'table',
    element: (
      <Layout>
        <TableList />
      </Layout>
    ),
  },
  {
    path: 'version',
    element: (
      <Layout>
        <VersionList />
      </Layout>
    ),
  },
]

export default routes
