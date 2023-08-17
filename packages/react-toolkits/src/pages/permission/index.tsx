import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Navigate, Outlet } from 'react-router-dom'
import { Layout, ReactToolkitsProvider, useReactToolkitsContext } from '@/components'
import { SWRConfig } from 'swr'
import { useHttpClient } from '@/hooks'

const UserList = lazy(() => import('./UserList'))
const RoleList = lazy(() => import('./RoleList'))
const RoleDetail = lazy(() => import('./RoleDetail'))

const PermissionRoot = () => {
  const httpClient = useHttpClient()
  const configs = useReactToolkitsContext(state => state)

  return (
    // NOTE: 目前嵌套的 ReactToolkitsProvider 只能手动注入父级 ReactToolkitsProvider 的配置
    <ReactToolkitsProvider {...configs} isGlobalNS>
      <SWRConfig
        value={{
          fetcher: httpClient.request,
          shouldRetryOnError: false,
        }}
      >
        <Layout>
          <Outlet />
        </Layout>
      </SWRConfig>
    </ReactToolkitsProvider>
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
