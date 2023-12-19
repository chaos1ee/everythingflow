/* eslint-disable @typescript-eslint/no-explicit-any */
import { pick } from 'lodash-es'
import type { StringifyOptions } from 'query-string'
import qs from 'query-string'
import { contextStore } from '../components/ContextProvider'
import { useGameStore } from '../components/GameSelect'
import { useTokenStore } from '../stores/token'

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
  isGlobalNS?: boolean
}

type RequestResponse<T> = Pick<Response, 'headers' | 'status' | 'statusText' | 'url'> & { data: T }

export async function request<T = any>(url: string, opts?: RequestOptions): Promise<RequestResponse<T>> {
  let { body, params, headers, responseType = 'json', isGlobalNS, ...rest } = opts ?? {}

  const parsed = qs.parseUrl(url)
  const queryParams = Object.assign({}, parsed.query, params)
  const options: StringifyOptions = {
    skipNull: true,
    skipEmptyString: true,
    strict: true,
    encode: true,
  }
  const queryString = qs.stringify(queryParams, options)
  url = queryString ? `${parsed.url}?${queryString}` : url

  headers = new Headers(headers)

  const token = useTokenStore?.getState()?.token

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (contextStore.getState().usePermissionApiV2) {
    if (isGlobalNS) {
      headers.set('App-ID', 'global')
    } else if (!contextStore.getState().hideGameSelect) {
      const game = useGameStore.getState().game
      if (game) {
        headers.set('App-ID', game.id)
      }
    }
  }

  if (responseType === 'blob') {
    headers.append('Accept', 'application/octet-stream')
  } else {
    headers.append('Accept', 'application/json')
  }

  const isJsonBody = !!(body && typeof body === 'object' && !(body instanceof FormData))

  if (isJsonBody) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(
    url,
    Object.assign(rest, {
      headers,
      body: isJsonBody ? JSON.stringify(body) : body,
    }) as RequestInit,
  )

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
