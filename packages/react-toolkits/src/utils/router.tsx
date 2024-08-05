import type { ComponentType } from 'react'
import type { ContextState } from '../components/contextProvider'
import ContextProvider from '../components/contextProvider'
import { Layout } from '../components/layout'

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
