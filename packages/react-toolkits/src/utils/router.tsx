import type { ComponentType, ReactNode } from 'react'
import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import type { ContextState } from '../components/ContextProvider'
import ContextProvider from '../components/ContextProvider'
import Layout from '../components/Layout'

const NotFound = lazy(() => import('../pages/NotFound'))
const OperationLogList = lazy(() => import('../pages/OperationLogList'))
const SignIn = lazy(() => import('../pages/SignIn'))
const Permission = lazy(() => import('../pages/permission'))

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

export function withBaseRoutes(routes: ReactNode, props?: Partial<Omit<ContextState, 'hideGameSelect'>>) {
  const ComponentWithBaseRoutes = () => {
    const sharedProps = Object.assign({}, props, { hideGameSelect: true })

    return (
      <Routes>
        {routes}
        <Route path="/operation_log" Component={withLayout(OperationLogList, sharedProps)} />
        <Route path="/permission/*" Component={withLayout(Permission, sharedProps)} />
        <Route path="/sign_in" element={<SignIn />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    )
  }

  return ComponentWithBaseRoutes
}
