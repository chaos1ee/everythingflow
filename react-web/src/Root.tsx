import { App } from 'antd'
import { lazy } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import {
  NotFound,
  OperationLogList,
  PermissionRoutes,
  RequestError,
  SignIn,
  useRedirectToSignIn,
  useTokenValidation,
  withLayout,
} from 'react-toolkits'
import { SWRConfig } from 'swr'

const PaginationList = lazy(() => import('./pages/list/Pagination'))
const InfiniteList = lazy(() => import('./pages/list/Infinite'))
const DiffTable = lazy(() => import('./pages//handsontable/DiffTable'))
const DiffCollapse = lazy(() => import('./pages//handsontable/DiffCollapse'))

const ConsoleRoot = () => {
  useTokenValidation()
  const { notification } = App.useApp()
  const redirectToSignIn = useRedirectToSignIn()

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
                redirectToSignIn()
                return
              case 412:
                redirectToSignIn(true)
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
      <Outlet />
    </SWRConfig>
  )
}

const Root = (
  <Routes>
    <Route index element={<Navigate to="/list" />} />
    <Route path="/sign_in" Component={SignIn} />
    <Route path="/*" Component={ConsoleRoot}>
      <Route path="list">
        <Route index element={<Navigate to="pagination" />} />
        <Route path="pagination" Component={withLayout(PaginationList)} />
        <Route path="infinite" Component={withLayout(InfiniteList)} />
      </Route>
      <Route path="handsontable">
        <Route path="diff" Component={withLayout(DiffTable)} />
        <Route path="collapse" Component={withLayout(DiffCollapse)} />
      </Route>
      <Route path="operation_log" Component={withLayout(OperationLogList, { hideGameSelect: true, isGlobal: true })} />
      <Route path="permission/*" Component={withLayout(PermissionRoutes, { hideGameSelect: true, isGlobal: true })} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
)

export default Root
