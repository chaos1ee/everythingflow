import { App } from 'antd'
import { createHashRouter, useRouteError } from 'react-router-dom'
import { RedirectToSignIn, RequestError } from 'react-toolkits'
import Root from '../Root'

// 捕获 Suspense 组件中的错误
const RootErrorBoundary = () => {
  const error = useRouteError()
  const { notification } = App.useApp()

  if (error instanceof RequestError) {
    switch (error.status) {
      case 200:
        notification.error({
          message: '请求出错',
          description: error.message,
        })
        return
      case 401:
        return <RedirectToSignIn />
      case 412:
        return <RedirectToSignIn notRegistered />
      case 403:
        notification.error({
          message: '未授权',
          description: '无权限，请联系管理员进行授权',
        })
        return
      default:
        return (
          <div>
            <div>HTTP Request Error</div>
            <div>{error.status}</div>
            <div>{error.message}</div>
          </div>
        )
    }
  }

  return <h1>Unknown Error</h1>
}

const router = createHashRouter([
  {
    path: '*',
    element: Root,
    errorElement: <RootErrorBoundary />,
  },
])

export default router
