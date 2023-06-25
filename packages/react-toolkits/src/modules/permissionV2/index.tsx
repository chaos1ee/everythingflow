import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { Layout } from '../../components'

const UserList = lazy(() => import('./pages/UserList'))
const RoleList = lazy(() => import('./pages/RoleList'))
const RoleDetail = lazy(() => import('./pages/RoleDetail'))

const routes: RouteObject = {
  path: 'permission',
  element: <Layout />,
  children: [
    {
      index: true,
      element: <Navigate relative="path" to="user" />,
    },
    {
      path: 'user',
      element: <UserList />,
    },
    {
      path: 'role',
      element: <RoleList />,
    },
    {
      path: 'role/:name',
      element: <RoleDetail />,
    },
  ],
}

export default routes
