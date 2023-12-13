import type { ContextState } from '@/components/ContextProvider'
import ContextProvider from '@/components/ContextProvider'
import Layout from '@/components/Layout'
import type { ComponentType } from 'react'
import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const NotFound = lazy(() => import('@/pages/NotFound'))
const OperationLogList = lazy(() => import('@/pages/OperationLogList'))
const SignIn = lazy(() => import('@/pages/SignIn'))
const RoleDetail = lazy(() => import('@/pages/RoleDetail'))
const RoleList = lazy(() => import('@/pages/RoleList'))
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

const Permission = () => {
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
    const sharedProps = Object.assign({}, props, { hideGameSelect: true })

    return (
      <Routes>
        <Route path="/*" element={<WrappedComponent />} />
        <Route path="/operation_log" Component={withLayout(OperationLogList, sharedProps)} />
        <Route path="/permission/*" Component={withLayout(Permission, sharedProps)} />
        <Route path="/sign_in" element={<SignIn />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    )
  }

  return ComponentWithBaseRoutes
}
