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
    switch (error.code) {
      case 401:
        clearToken()
        return <Navigate to="/login" />
      case 412:
        clearToken()
        return <Navigate to="/login" state={{ notUser: true }} />
      default:
        if (!error.skip) {
          notification.error({
            message: '请求出错',
            description: error.message,
          })
        }
    }
  }

  return <ErrorBoundary />
}

export default ErrorElement
