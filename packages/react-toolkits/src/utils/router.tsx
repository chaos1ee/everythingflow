/* eslint-disable react/function-component-definition */
import ContextProvider from '@/components/ContextProvider'
import Layout from '@/components/Layout'
import type { ComponentType, ReactElement } from 'react'
import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const NotFound = lazy(() => import('@/Pages/NotFound'))
const OperationLogList = lazy(() => import('@/Pages/OperationLogList'))
const RoleDetail = lazy(() => import('@/Pages/RoleDetail'))
const RoleList = lazy(() => import('@/Pages/RoleList'))
const SignIn = lazy(() => import('@/Pages/SignIn'))
const UserList = lazy(() => import('@/Pages/UserList'))

export const withoutGameSelect = (WrappedComponent: ComponentType) => {
  return function ComponentWithLayout() {
    return (
      <ContextProvider hideGameSelect>
        <Layout>
          <WrappedComponent />
        </Layout>
      </ContextProvider>
    )
  }
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

export function withBaseRoutes(element: ReactElement) {
  return function MixedRoutes() {
    return (
      <Routes>
        <Route path="/*" element={element} />
        <Route path="/operation_log" Component={withoutGameSelect(OperationLogList)} />
        <Route path="/permission/*" Component={withoutGameSelect(PermissionRoutes)} />
        <Route path="/sign_in" element={<SignIn />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    )
  }
}
