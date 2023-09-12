/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTokenStore } from '@/stores'
import { toolkitContextStore, useGameStore } from '@/components'
import { isNil } from 'lodash-es'

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

const urlPattern = new RegExp(
  '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name and extension
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?' + // port
    '(\\/[-a-z\\d%_.~+]*)*' + // path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$',
  'i',
)

type RequestBody = Record<string | number, any> | FormData | null
type RequestParams = Record<string | number, string> | URLSearchParams | null

interface InitConfig extends Omit<RequestInit, 'body'> {
  body?: RequestBody
  params?: RequestParams
}

function getInput(input: RequestInfo | URL, params?: RequestParams) {
  let url

  if (input instanceof URL) {
    url = input
  } else if (input instanceof Request) {
    url = new URL(input.url)
  } else {
    url = new URL(input, urlPattern.test(input) ? undefined : window.location.origin)
  }

  if (params) {
    if (params instanceof URLSearchParams) {
      for (const [key, value] of params.entries()) {
        if (!isNil(value)) {
          url.searchParams.append(key, value)
        }
      }
    } else {
      for (const key in params) {
        if (!isNil(params[key])) {
          url.searchParams.append(key, params[key])
        }
      }
    }
  }

  return input instanceof Request
    ? new Request({
        ...input,
        url: url.toString(),
      })
    : url
}

function getBody(data?: RequestBody) {
  if (data instanceof FormData) {
    return data
  } else if (data !== null && typeof data === 'object') {
    return JSON.stringify(data)
  } else {
    return null
  }
}

function getHeaders(data?: HeadersInit, isGlobalNS?: boolean) {
  const headers = new Headers(data)

  if (headers.get('Accept') !== 'application/json') {
    headers.set('Accept', 'application/json')
  }

  const token = useTokenStore.getState().token

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const toolkitsContext = toolkitContextStore.getState()

  if (toolkitsContext.usePermissionV2) {
    const game = useGameStore.getState().game

    if (isGlobalNS || (isGlobalNS === undefined && toolkitsContext.isGlobalNS)) {
      headers.set('App-ID', 'global')
    } else if (game) {
      headers.set('App-ID', game.id)
    }
  }

  return headers
}

async function responseJson<T>(response: Response) {
  const json = (await response.json()) as JsonResponse<T>

  if (json.code === 0 || json.status === 0) {
    return json.data
  }

  throw new FetcherError(json.msg, response.status)
}

function throwError(response: Response) {
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

export async function request<T = any>(input: RequestInfo | URL, init: InitConfig = {}, isGlobalNS?: boolean) {
  input = getInput(input, init.params)
  delete init.params

  const body = getBody(init.body)
  const headers = getHeaders(init.headers, isGlobalNS)

  const response = await fetch(input, {
    ...init,
    headers,
    body,
  })

  if (!response.ok) {
    throwError(response)
  }

  // 若希望返回二进制流，需要在请求头内设置头部 "Accept": "application/octet-stream"。
  if (headers.get('Accept') === 'application/octet-stream') {
    return (await response.blob()) as T
  }

  return await responseJson<T>(response)
}
