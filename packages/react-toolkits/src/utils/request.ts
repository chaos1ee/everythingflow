/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTokenStore } from '@/stores'
import { toolkitContextStore, useGameStore } from '@/components'
import { isNil, pick } from 'lodash-es'

export class RequestError extends Error {
  code?: number
  // 跳过错误提示
  skip: boolean

  constructor(message: string, code?: number, skip = false) {
    super(message)
    this.code = code
    this.skip = skip
  }
}

export interface RequestResponse<T = any> extends Pick<Response, 'headers' | 'ok' | 'status' | 'statusText' | 'url'> {
  data: T
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
type RequestParams = Record<string | number, string | undefined | null> | URLSearchParams | null
type RequestResponseType = 'json' | 'blob'

interface InitConfig extends Omit<RequestInit, 'body'> {
  body?: RequestBody
  params?: RequestParams
  responseType?: RequestResponseType
}

function getInput(input: RequestInfo | URL, init?: InitConfig) {
  let url
  const params = init?.params

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
          url.searchParams.append(key, params[key] as string)
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

function getBody(init?: InitConfig) {
  const body = init?.body
  if (body instanceof FormData) {
    return body
  } else if (body !== null && typeof body === 'object') {
    return JSON.stringify(body)
  } else {
    return null
  }
}

function getHeaders(init?: InitConfig, isGlobalNS?: boolean) {
  const headers = new Headers(init?.headers)

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

  const responseType = init?.responseType ?? 'json'

  if (responseType === 'blob') {
    headers.append('Accept', 'application/octet-stream')
  } else {
    headers.append('Accept', 'application/json')
  }

  return headers
}

async function responseBlob(response: Response): Promise<RequestResponse<Blob>> {
  const data = await response.blob()
  return Object.assign(pick(response, ['headers', 'ok', 'status', 'statusText', 'url']), { data })
}

async function responseJson<T>(response: Response): Promise<RequestResponse<T>> {
  const json = (await response.json()) as JsonResponse<T>

  if (json.code === 0 || json.status === 0) {
    return Object.assign(pick(response, ['headers', 'ok', 'status', 'statusText', 'url']), { data: json.data })
  }

  throw new RequestError(json.msg, response.status)
}

function throwError(response: Response) {
  switch (response.status) {
    case 401:
      throw new RequestError('未登录或登录已过期', response.status)
    case 403:
      throw new RequestError('无权限，请联系管理员进行授权', response.status)
    case 404:
    case 405:
      throw new RequestError('Not Found or Method not Allowed', response.status, true)
    case 412:
      throw new RequestError('未注册用户', response.status)
    case 504:
      throw new RequestError('请求超时', response.status)
    default:
      throw new RequestError('出现错误', response.status)
  }
}

export async function request<T = any>(
  input: RequestInfo | URL,
  init?: InitConfig,
  isGlobalNS?: boolean,
): Promise<RequestResponse<T>> {
  input = getInput(input, init)
  delete init?.params

  const body = getBody(init)

  const responseType = init?.responseType ?? 'json'
  delete init?.responseType

  const headers = getHeaders(init, isGlobalNS)

  const response = await fetch(input, {
    ...init,
    headers,
    body,
  })

  if (!response.ok) {
    throwError(response)
  }

  if (responseType === 'blob') {
    return (await responseBlob(response)) as RequestResponse<T>
  }

  return await responseJson<T>(response)
}
