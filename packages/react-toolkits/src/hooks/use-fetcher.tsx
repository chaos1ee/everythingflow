import { useTokenStore } from '@/stores'
import type { BackendResponse } from '@/types'
import { App } from 'antd'
import type { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import type { Merge } from 'ts-essentials'

// 覆盖 AxiosInstance 各种请求方法的返回值，为了方便我们在 interceptors.response 里把 AxiosResponse 直接打平成后端返回的数据，去掉了 axios 的封装。
type ShimmedAxiosInstance = Merge<
  AxiosInstance,
  {
    request<T = unknown, D = unknown>(config: AxiosRequestConfig<D>): Promise<T>
    get<T = unknown, D = unknown>(url: string, config?: AxiosRequestConfig<D>): Promise<T>
    delete<T = unknown, D = unknown>(url: string, config?: AxiosRequestConfig<D>): Promise<T>
    head<T = unknown, D = unknown>(url: string, config?: AxiosRequestConfig<D>): Promise<T>
    post<T = unknown, D = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig<D>): Promise<T>
    put<T = unknown, D = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig<D>): Promise<T>
    patch<T = unknown, D = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig<D>): Promise<T>
  }
>

export class FetcherError extends Error {
  code: number
  // 跳过错误提示
  skip: boolean

  constructor(message: string, code: number, skip = false) {
    super(message)
    this.code = code
    this.skip = skip
  }
}

export function useFetcher() {
  const { notification } = App.useApp()
  const clearToken = useTokenStore(state => state.clearToken)
  const navigate = useNavigate()
  const token = useTokenStore(state => state.token)

  const defaultOptions: AxiosRequestConfig = {
    withCredentials: true,
  }

  const instance = axios.create(defaultOptions) as ShimmedAxiosInstance

  instance.interceptors.request.use(config => {
    const headers = config.headers
    headers.set('Authorization', `Bearer ${token}`)
    return config
  })

  instance.interceptors.response.use(
    response => {
      if (response.data.code === 0 || response.data.status === 0) {
        return response.data.data
      }

      throw new FetcherError(response.data.msg, 0)
    },
    (error: AxiosError<BackendResponse<unknown>>) => {
      if (error.response) {
        // 请求成功发出且服务器也响应了状态码，但状态码超出了 2xx 的范围
        if (error.response.status === 401) {
          throw new FetcherError('未登录或登录已过期', error.response.status)
        } else if (error.response.status === 403) {
          throw new FetcherError('无权限，请联系管理员进行授权', error.response.status)
        } else if ([404, 405].includes(error.response.status)) {
          throw new FetcherError('Not Found or Method not Allowed', error.response.status, true)
        } else if (error.response.status === 412) {
          throw new FetcherError('未注册用户', error.response.status)
        } else {
          throw new FetcherError(error.response.data?.msg, error.response.status)
        }
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        console.log(error.request)
      }

      return Promise.reject(error)
    },
  )

  return <T = unknown,>(config: AxiosRequestConfig) =>
    instance.request<T>(config).catch((err: FetcherError) => {
      switch (err.code) {
        case 401:
        case 412:
          clearToken()
          navigate(err.code === 401 ? '/login' : '/login?not_registered=1', { replace: true })
          break
        default:
          if (!err.skip) {
            notification.error({
              message: '请求出错',
              description: err.message,
            })
          }
      }
      throw err
    })
}
