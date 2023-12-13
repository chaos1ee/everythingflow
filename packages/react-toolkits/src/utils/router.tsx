import type { ContextState } from '@/components/ContextProvider'
import ContextProvider from '@/components/ContextProvider'
import Layout from '@/components/Layout'
import type { ComponentType } from 'react'
import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const NotFound = lazy(() => import('@/pages/NotFound'))
const OperationLogList = lazy(() => import('@/pages/OperationLogList'))
const RoleDetail = lazy(() => import('@/pages/RoleDetail'))
const RoleList = lazy(() => import('@/pages/RoleList'))
const SignIn = lazy(() => import('@/pages/SignIn'))
const UserList = lazy(() => import('@/pages/UserList'))

export const withLayout = (WrappedComponent: ComponentType, props?: Partial<ContextState>) => {
  const ComponentWithLayout = () => {
    return (
      <ContextProvider {...props}>
        <Layout>
          <WrappedComponent />
        </Layout>
      </ContextProvider>
    )
  }

  return ComponentWithLayout
}

const PermissionRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="user" />} />
      <Route path="user" element={<UserList />} />
      <Route path="role" element={<RoleList />} />
      <Route path="role/:name" element={<RoleDetail />} />
    </Routes>
  )
}

export function withBaseRoutes(WrappedComponent: ComponentType, props?: Partial<Omit<ContextState, 'hideGameSelect'>>) {
  const ComponentWithBaseRoutes = () => {
    const _props = Object.assign({}, props, { hideGameSelect: false })

    return (
      <Routes>
        <Route path="/*" element={<WrappedComponent />} />
        <Route path="/operation_log" Component={withLayout(OperationLogList, _props)} />
        <Route path="/permission/*" Component={withLayout(PermissionRoutes, _props)} />
        <Route path="/sign_in" element={<SignIn />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    )
  }

  return ComponentWithBaseRoutes
}
