import type { ComponentType } from 'react'
import type { ContextState } from '../components/ContextProvider'
import ContextProvider from '../components/ContextProvider'
import Layout from '../components/Layout'

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
