import { App } from 'antd'
import type { ComponentType } from 'react'
import { lazy } from 'react'
import { Navigate, Route, useNavigate } from 'react-router-dom'
import { Layout, RequestError, useTokenStore, useTokenValidation, withBaseRoutes } from 'react-toolkits'
import { SWRConfig } from 'swr'

const PaginationList = lazy(() => import('./pages/list/Pagination'))
const InfiniteList = lazy(() => import('./pages/list/Infinite'))
const DiffTable = lazy(() => import('./pages//handsontable/DiffTable'))
const DiffCollapse = lazy(() => import('./pages//handsontable/DiffCollapse'))

export const withLayout = (WrappedComponent: ComponentType) => {
  const ComponentWithLayout = () => {
    return (
      <Layout>
        <WrappedComponent />
      </Layout>
    )
  }

  return ComponentWithLayout
}

const AllRoutes = withBaseRoutes(
  <>
    <Route index element={<Navigate to="/list" />} />
    <Route path="/list">
      <Route index element={<Navigate to="pagination" />} />
      <Route path="pagination" Component={withLayout(PaginationList)} />
      <Route path="infinite" Component={withLayout(InfiniteList)} />
    </Route>
    <Route path="/handsontable">
      <Route path="diff" Component={withLayout(DiffTable)} />
      <Route path="collapse" Component={withLayout(DiffCollapse)} />
    </Route>
  </>,
)

const Root = () => {
  useTokenValidation()
  const { notification } = App.useApp()
  const clearToken = useTokenStore(state => state.clearToken)
  const navigate = useNavigate()

  return (
    <SWRConfig
      value={{
        onError(error) {
          if (error instanceof RequestError) {
            switch (error.status) {
              case 200:
                notification.error({
                  message: '请求出错',
                  description: error.message,
                })
                return
              case 401:
                clearToken()
                navigate('/sign_in')
                return
              case 412:
                clearToken()
                navigate('/sign_in', { state: { notUser: true } })
                return
              case 403:
                notification.error({
                  message: '未授权',
                  description: '无权限，请联系管理员进行授权',
                })
                return
              default:
                throw new Error(error.message)
            }
          }
        },
      }}
    >
      <AllRoutes />
    </SWRConfig>
  )
}

export default Root
