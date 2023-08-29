import { useTokenStore } from '@/stores'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import axios from 'axios'
import type { Merge } from 'ts-essentials'
import { useReactToolkitsContext } from '@/components' // 覆盖 AxiosInstance 各种请求方法的返回值，为了方便我们在 interceptors.response 里把 AxiosResponse 直接打平成后端返回的数据，去掉了 axios 的封装。

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

export class HttpClientError extends Error {
  code?: number
  // 跳过错误提示
  skip: boolean

  constructor(message: string, code?: number, skip = false) {
    super(message)
    this.code = code
    this.skip = skip
  }
}

export function useHttpClient() {
  const token = useTokenStore(state => state.token)
  const { game, isGlobalNS, isPermissionV2 } = useReactToolkitsContext(state => state)

  const defaultOptions: AxiosRequestConfig = {
    withCredentials: true,
  }

  const instance = axios.create(defaultOptions) as ShimmedAxiosInstance

  instance.interceptors.request.use(config => {
    const headers = config.headers
    headers.set('Authorization', `Bearer ${token}`)

    if (isPermissionV2) {
      if (!headers.has('App-ID')) {
        headers.set('App-ID', isGlobalNS ? 'global' : game?.id)
      }
    }

    return config
  })

  instance.interceptors.response.use(
    response => {
      const contentType = response.headers['content-type']
      if (contentType.includes('application/octet-stream')) {
        return response
      } else {
        if (response.data.code === 0 || response.data.status === 0) {
          return response.data.data
        }

        throw new HttpClientError(response.data.msg, 0)
      }
    },
    error => {
      if (error.response) {
        // 请求成功发出且服务器也响应了状态码，但状态码超出了 2xx 的范围
        if (error.response.status === 401) {
          throw new HttpClientError('未登录或登录已过期', error.response.status)
        } else if (error.response.status === 403) {
          throw new HttpClientError('无权限，请联系管理员进行授权', error.response.status)
        } else if ([404, 405].includes(error.response.status)) {
          throw new HttpClientError('Not Found or Method not Allowed', error.response.status, true)
        } else if (error.response.status === 412) {
          throw new HttpClientError('未注册用户', error.response.status)
        } else if (error.response.status === 504) {
          throw new HttpClientError('请求超时', error.response.status)
        } else {
          throw new HttpClientError(error.response.message, error.response.status)
        }
      }

      throw new HttpClientError('无响应')
    },
  )

  return instance
}
