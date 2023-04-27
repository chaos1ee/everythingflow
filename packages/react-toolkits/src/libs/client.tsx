import type { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import axios from 'axios'
import { merge } from 'lodash-es'
import { GAME_ID_STORAGE_KEY, TOKEN_FLAG } from '../constants'
import type { Merge } from 'ts-essentials'

// 覆盖 AxiosInstance 各种请求方法的返回值，为了方便我们在 interceptors.response 里把 AxiosResponse 直接打平成后端返回的数据，去掉了 axios 的包装。
type AxiosInstanceShim = Merge<
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

export function createHttpClient(options?: AxiosRequestConfig) {
  const defaultOptions: AxiosRequestConfig = {
    baseURL: '/api',
    withCredentials: true,
  }

  const client = axios.create(merge(defaultOptions, options))

  client.interceptors.request.use(config => {
    const headers = config.headers

    if (localStorage.getItem(TOKEN_FLAG)) {
      headers.set('Authorization', `Bearer ${localStorage.getItem(TOKEN_FLAG)}`)
    }

    if (!headers.has('app-id') && sessionStorage.getItem(GAME_ID_STORAGE_KEY)) {
      headers.set('app-id', sessionStorage.getItem(GAME_ID_STORAGE_KEY))
    }

    return config
  })

  client.interceptors.response.use(
    response => {
      if (response.data.code === 0 || response.data.status === 0 || response.data.status === 200) {
        return response.data.data
      }
      return Promise.reject(new Error(response.data.msg))
    },
    (error: AxiosError<BackendResponse<unknown>>) => {
      if (error.response) {
        // 请求成功发出且服务器也响应了状态码，但状态码超出了 2xx 的范围
        switch (error.response.status) {
          case 400:
          case 401:
            localStorage.removeItem(TOKEN_FLAG)
            window.location.replace('/login')
            break
          case 403:
            // 无权限
            return Promise.reject(new Error('未授权，请联系管理员进行授权'))
          case 404:
            return
          default:
            return Promise.reject(error.response.data?.msg)
        }
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        console.log(error.request)
      }

      return Promise.reject(error)
    },
  )

  return client as AxiosInstanceShim
}
