import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Navigate, Outlet } from 'react-router-dom'
import { SWRConfig } from 'swr'
import { request } from '@/utils'
import { ToolkitsContextProvider } from '@/components'

const UserList = lazy(() => import('./UserList'))
const RoleList = lazy(() => import('./RoleList'))
const RoleDetail = lazy(() => import('./RoleDetail'))

const PermissionRoot = () => {
  return (
    <ToolkitsContextProvider isGlobalNS>
      <SWRConfig
        value={{
          fetcher: (args: Parameters<typeof request>) => request(...args),
          shouldRetryOnError: false,
        }}
      >
        <Outlet />
      </SWRConfig>
    </ToolkitsContextProvider>
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
