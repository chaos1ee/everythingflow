/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTokenStore } from '@/stores'
import { toolkitContextStore, useGameStore } from '@/components'

export class FetcherError extends Error {
  code?: number
  // 跳过错误提示
  skip: boolean

  constructor(message: string, code?: number, skip = false) {
    super(message)
    this.code = code
    this.skip = skip
  }
}

type JsonResponse<T> = ({ code: number; status?: never } | { code?: never; status: number }) & {
  data: T
  msg: string
}

interface InitConfig extends Omit<RequestInit, 'body'> {
  body?: Record<string | number, any> | null
}

export async function request<T = any>(input: RequestInfo | URL, init: InitConfig = {}, isGlobalNS = false) {
  const requestHeaders = new Headers(init.headers)

  if (!requestHeaders.has('Accept')) {
    requestHeaders.set('Accept', 'application/json')
  }

  const token = useTokenStore.getState().token

  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`)
  }

  const { usePermissionV2 } = toolkitContextStore.getState()

  if (usePermissionV2) {
    const game = useGameStore.getState().game
    requestHeaders.set('App-ID', isGlobalNS ? 'global' : game?.id ?? '')
  }

  let body

  if (init.body) {
    body = JSON.stringify(init.body)
  }

  const response = await fetch(input, {
    ...init,
    headers: requestHeaders,
    body,
  })

  if (!response.ok) {
    switch (response.status) {
      case 401:
        throw new FetcherError('未登录或登录已过期', response.status)
      case 403:
        throw new FetcherError('无权限，请联系管理员进行授权', response.status)
      case 404:
      case 405:
        throw new FetcherError('Not Found or Method not Allowed', response.status, true)
      case 412:
        throw new FetcherError('未注册用户', response.status)
      case 504:
        throw new FetcherError('请求超时', response.status)
      default:
        throw new FetcherError('出现错误', response.status)
    }
  }

  // 若希望返回二进制流，需要在请求头内设置此头部
  if (requestHeaders.get('Accept') === 'application/octet-stream') {
    return (await response.blob()) as T
  }

  const data = (await response.json()) as JsonResponse<T>

  if (data.code === 0 || data.status === 0) {
    return data.data
  }

  throw new FetcherError(data.msg, response.status)
}
