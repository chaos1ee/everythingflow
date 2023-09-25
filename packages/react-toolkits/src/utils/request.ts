/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNil, pick } from 'lodash-es'
import { contextStore } from '@/components/ContextProvider'
import { useGameStore } from '@/components/GameSelect'
import { useTokenStore } from '@/stores/token'

export class RequestError extends Error {
  status?: number

  constructor(opts?: { message?: string; status?: number }) {
    super(opts?.message)
    this.status = opts?.status
  }
}

type JsonResponse<T> = (
  | {
      code: number
      status?: never
    }
  | {
      code?: never
      status: number
    }
) & {
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

interface InitConfig extends Omit<RequestInit, 'body'> {
  body?: Record<string | number, any> | FormData | null
  params?: Record<string | number, string | number | undefined | null> | URLSearchParams | null
  responseType?: 'json' | 'blob'
}

export async function request<T = any>(input: string | URL, init?: InitConfig, isGlobalNS?: boolean) {
  let { body, params, headers, responseType = 'json', ...rest } = init ?? {}

  const url =
    typeof input === 'string' ? new URL(input, urlPattern.test(input) ? undefined : window.location.origin) : input

  if (params) {
    const entries = params instanceof URLSearchParams ? params.entries() : Object.entries(params)

    for (const [key, value] of entries) {
      if (!isNil(value)) {
        url.searchParams.append(key, JSON.stringify(value))
      }
    }
  }

  headers = new Headers(headers)
  const token = useTokenStore.getState().token

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const context = contextStore.getState()

  if (context.usePermissionV2) {
    const game = useGameStore.getState().game

    if (isGlobalNS || (isGlobalNS === undefined && context.isGlobalNS)) {
      headers.set('App-ID', 'global')
    } else if (game) {
      headers.set('App-ID', game.id)
    }
  }

  if (responseType === 'blob') {
    headers.append('Accept', 'application/octet-stream')
  } else {
    headers.append('Accept', 'application/json')
  }

  const config = {
    ...rest,
    headers,
    body: !body || body instanceof FormData ? body : JSON.stringify(body),
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    throw new RequestError({ status: response.status })
  }

  const commonResponse = pick(response, ['headers', 'status', 'statusText', 'url'])

  if (responseType === 'blob') {
    const data = (await response.blob()) as T
    return {
      ...commonResponse,
      data,
    }
  }

  const json = (await response.json()) as JsonResponse<T>

  if (json.code === 0 || json.status === 0) {
    return { ...commonResponse, data: json.data }
  }

  throw new RequestError({ status: response.status, message: json.msg })
}
