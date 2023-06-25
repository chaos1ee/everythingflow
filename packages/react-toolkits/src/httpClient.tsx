import type { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import axios from 'axios'
import { merge } from 'lodash-es'
import type { Merge } from 'ts-essentials'
import { notification } from 'antd'
import type { TokenState } from './stores'
import { useTokenStore } from './stores'
import type { StorageValue } from 'zustand/middleware/persist'

// 覆盖 AxiosInstance 各种请求方法的返回值，为了方便我们在 interceptors.response 里把 AxiosResponse 直接打平成后端返回的数据，去掉了 axios 的包装。
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

export function createHttpClient(options?: AxiosRequestConfig) {
  const defaultOptions: AxiosRequestConfig = {
    baseURL: '/api',
    withCredentials: true,
  }

  const client = axios.create(merge(defaultOptions, options))

  client.interceptors.request.use(config => {
    const headers = config.headers

    try {
      const tokenStorage = JSON.parse(localStorage.getItem('token') ?? '{}') as Partial<StorageValue<TokenState>>

      if (tokenStorage.state?.token) {
        headers.set('Authorization', `Bearer ${tokenStorage.state.token}`)
      }
    } catch (_) {}

    return config
  })

  client.interceptors.response.use(
    response => {
      if (response.data.code === 0 || response.data.status === 0 || response.data.status === 200) {
        return response.data.data
      }

      notification.error({
        message: '错误请求',
        description: response.data.msg,
      })

      return Promise.reject(new Error(response.data.msg))
    },
    (error: AxiosError<BackendResponse<unknown>>) => {
      if (error.response) {
        // 请求成功发出且服务器也响应了状态码，但状态码超出了 2xx 的范围
        switch (error.response.status) {
          case 401:
            useTokenStore.setState({ token: '' })
            useTokenStore.persist.clearStorage()
            location.replace('/login')
            return
          case 403:
            notification.error({
              message: '错误请求',
              description: '无权限，请联系管理员进行授权',
            })
            return Promise.reject(new Error('无权限，请联系管理员进行授权'))
          // 不是平台注册用户
          case 412:
            useTokenStore.setState({ token: '' })
            useTokenStore.persist.clearStorage()
            location.replace('/login?not_registered=true')
            return
          case 404:
            return Promise.reject(new Error('404'))
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

  return client as ShimmedAxiosInstance
}
