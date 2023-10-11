/* eslint-disable @typescript-eslint/no-explicit-any */
import { pick } from 'lodash-es'
import { contextStore } from '@/components/ContextProvider'
import { useGameStore } from '@/components/GameSelect'
import { useTokenStore } from '@/stores/token'
import qs from 'query-string'

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

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: Record<string | number, any> | FormData | null
  params?: Record<string | number, any> | URLSearchParams | null
  responseType?: 'json' | 'blob'
}

export async function request<T = any>(url: string, opts?: RequestOptions, isGlobalNS?: boolean) {
  let { body, params, headers, responseType = 'json', ...rest } = opts ?? {}

  const queryString =
    params &&
    qs.stringify(params, {
      skipNull: true,
      skipEmptyString: true,
      strict: true,
      encode: true,
    })

  url = queryString ? `${url}?${queryString}` : url

  // 设置请求头
  headers = new Headers(headers)
  const token = useTokenStore.getState().token
  headers.set('Authorization', `Bearer ${token}`)

  if (contextStore.usePermissionV2) {
    const game = useGameStore.getState().game

    if (isGlobalNS) {
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
    body: body === null || body instanceof FormData ? body : JSON.stringify(body),
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
