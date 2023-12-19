import { App } from 'antd'
import type { ComponentType } from 'react'
import { lazy } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Layout, RequestError, useTokenStore, useValidateToken, withBaseRoutes } from 'react-toolkits'
import { SWRConfig } from 'swr'

const PaginationList = lazy(() => import('@/pages/list/Pagination'))
const InfiniteList = lazy(() => import('@/pages/list/Infinite'))

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

const List = () => {
  return (
    <Routes>
      <Route index element={<PaginationList />} />
      <Route path="infinite" element={<InfiniteList />} />
    </Routes>
  )
}

const AllRoutes = withBaseRoutes(
  <>
    <Route index element={<Navigate to="/list" />} />
    <Route path="/list/*" Component={withLayout(List)} />
  </>,
)

const Root = () => {
  const location = useLocation()
  useValidateToken(location.pathname === '/sign_in')
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
