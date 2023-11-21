import ContextProvider from '@/components/ContextProvider'
import Layout from '@/components/Layout'
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
        element: (
          <ContextProvider hideGameSelect>
            <Layout>
              <UserList />
            </Layout>
          </ContextProvider>
        ),
      },
      {
        path: 'role',
        element: (
          <ContextProvider hideGameSelect>
            <Layout>
              <RoleList />
            </Layout>
          </ContextProvider>
        ),
      },
      {
        path: 'role/:name',
        element: (
          <ContextProvider hideGameSelect>
            <Layout>
              <RoleDetail />
            </Layout>
          </ContextProvider>
        ),
      },
    ],
  },
]

export default routes
