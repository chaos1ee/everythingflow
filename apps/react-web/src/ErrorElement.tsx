import type { FC } from 'react'
import { Navigate, useRouteError } from 'react-router-dom'
import { Alert, App } from 'antd'
import { RequestError, useTokenStore } from 'react-toolkits'

const { ErrorBoundary } = Alert

const ErrorElement: FC = () => {
  const error = useRouteError()
  const { notification } = App.useApp()
  const clearToken = useTokenStore(state => state.clearToken)

  if (error instanceof RequestError) {
    switch (error.status) {
      case 200:
        notification.error({
          message: '请求出错',
          description: error.message,
        })
        break
      case 401:
        clearToken()
        return <Navigate to="/login" />
      case 412:
        clearToken()
        return <Navigate to="/login" state={{ notUser: true }} />
      case 403:
        notification.error({
          message: '未授权',
          description: '无权限，请联系管理员进行授权',
        })
        return
    }
  }

  return <ErrorBoundary />
}

export default ErrorElement
