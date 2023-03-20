import { WarningOutlined } from '@ant-design/icons'
import { message, notification } from 'antd'
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'
import type { Merge } from 'ts-essentials'
import { TOKEN_FLAG } from './constants'
import i18n from './libs/i18n'

const instance = axios.create({ baseURL: '/api' })

instance.interceptors.request.use(config => {
  const token = localStorage.getItem(TOKEN_FLAG)

  if (token) {
    config.headers = Object.assign({}, config.headers, {
      Authorization: `Bearer ${token}`,
    })
  }

  return config
})

instance.interceptors.response.use(
  response => {
    if (response.data.code === 0 || response.data.status === 0) {
      return response.data.data
    }
    message.error(response.data.msg)
    return Promise.reject(new Error(response.data.msg))
  },
  (error: AxiosError) => {
    if (error.response) {
      // 请求成功发出且服务器也响应了状态码，但状态码超出了 2xx 的范围
      switch (error.response.status) {
        case 400:
        case 401:
          localStorage.removeItem(TOKEN_FLAG)
          // router.navigate('/login')
          break
        case 403:
          // 无权限
          notification.error({
            icon: <WarningOutlined type="primary" />,
            message: error.response.status,
            description: i18n.t('not_authorized_msg') as string,
          })
          break
        case 404:
          break
        default:
          notification.error({
            message: error.response.status,
            description: (error.response as AxiosResponse<{ code: number; msg: string }>).data.msg,
          })
      }
    } else if (error.request) {
      // 请求已经成功发起，但没有收到响应
      console.log(error.request)
    } else {
      // 发送请求时出了点问题
      if (error.message?.includes('timeout')) {
        notification.error({
          message: 'Request timeout',
        })
      }
    }

    return Promise.reject(error)
  },
)

export const request = instance as Merge<
  AxiosInstance,
  {
    // 覆盖 AxiosInstance 发起请求时的返回值，因为在上方的 interceptors.request 里我们对返回数据做了特殊处理。
    request<T = unknown, D = unknown>(config: AxiosRequestConfig<D>): Promise<T>
    get<T = unknown, D = unknown>(url: string, config?: AxiosRequestConfig<D>): Promise<T>
    delete<T = unknown, D = unknown>(url: string, config?: AxiosRequestConfig<D>): Promise<T>
    head<T = unknown, D = unknown>(url: string, config?: AxiosRequestConfig<D>): Promise<T>
    post<T = unknown, D = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig<D>): Promise<T>
    put<T = unknown, D = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig<D>): Promise<T>
    patch<T = unknown, D = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig<D>): Promise<T>
  }
>
