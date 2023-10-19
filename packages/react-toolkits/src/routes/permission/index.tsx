import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'

const UserList = lazy(() => import('./UserList'))
const RoleList = lazy(() => import('./RoleList'))
const RoleDetail = lazy(() => import('./RoleDetail'))

const routes: RouteObject[] = [
  {
    path: 'permission',
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
  },
]

export default routes
