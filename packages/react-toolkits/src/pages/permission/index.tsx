import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Navigate, Outlet } from 'react-router-dom'
import { Layout } from '@/components'
import { SWRConfig } from 'swr'
import { request } from '@/utils'

const UserList = lazy(() => import('./UserList'))
const RoleList = lazy(() => import('./RoleList'))
const RoleDetail = lazy(() => import('./RoleDetail'))

const PermissionRoot = () => {
  return (
    <SWRConfig
      value={{
        fetcher: (args: Parameters<typeof request>) => request(...args),
        shouldRetryOnError: false,
      }}
    >
      <Layout isGlobalNS>
        <Outlet />
      </Layout>
    </SWRConfig>
  )
}

const routes: RouteObject = {
  path: 'permission',
  element: <PermissionRoot />,
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
