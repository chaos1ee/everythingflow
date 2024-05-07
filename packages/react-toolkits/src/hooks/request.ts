/* eslint-disable @typescript-eslint/no-explicit-any */
import { pick } from 'lodash-es'
import type { StringifyOptions } from 'query-string'
import qs from 'query-string'
import { contextStore, useToolkitsContext } from '../components/ContextProvider'
import { useGameStore } from '../components/GameSelect'
import { useTokenStore } from '../stores/token'

export class RequestError extends Error {
  status!: number
  code?: number

  constructor(opts: { message?: string; status: number; code?: number }) {
    super(opts?.message)
    this.status = opts.status
    this.code = opts.code
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

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: Record<string | number, any> | FormData | null
  params?: Record<string | number, any> | URLSearchParams | null
  responseType?: 'json' | 'blob' | 'text'
  isGlobal?: boolean
}

export type RequestResponse<T> = Pick<Response, 'headers' | 'status' | 'statusText' | 'url'> & { data: T }

export function useRequest() {
  const { token } = useTokenStore()
  const toolkitsContext = useToolkitsContext()
  const { game } = useGameStore()

  return async <T = any>(url: string, opts: RequestOptions = {}): Promise<RequestResponse<T>> => {
    opts = Object.assign(opts, { responseType: opts.responseType ?? 'json' })
    let { body, params, headers, responseType, isGlobal, ...rest } = opts

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

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    if (toolkitsContext.usePermissionApiV2) {
      if (isGlobal || toolkitsContext.isGlobal) {
        headers.set('App-ID', 'global')
      } else if (game) {
        headers.set('App-ID', game.id)
      }
    }

    if (responseType === 'blob') {
      headers.append('Accept', 'application/octet-stream')
    } else if (responseType === 'json') {
      headers.append('Accept', 'application/json')
    }

    const isJsonBody = !!(body && typeof body === 'object' && !(body instanceof FormData))

    if (isJsonBody) {
      headers.set('Content-Type', 'application/json')
    }

    const requestOpts = Object.assign(rest, {
      headers,
      body: isJsonBody ? JSON.stringify(body) : body,
    }) as RequestInit

    const response = await fetch(url, requestOpts)

    if (!response.ok) {
      throw new RequestError({ status: response.status })
    }

    const responseInterceptor = contextStore.getState().responseInterceptor

    if (typeof responseInterceptor === 'function') {
      return await responseInterceptor(response, opts)
    } else {
      let data: T

      if (responseType === 'blob') {
        data = (await response.blob()) as T
      } else if (responseType === 'json') {
        const json = (await response.json()) as JsonResponse<T>
        if (json.code === 0 || json.status === 0) {
          data = json.data
        } else {
          throw new RequestError({
            code: json.code,
            status: response.status,
            message: json.msg,
          })
        }
      } else {
        data = (await response.text()) as T
      }

      return {
        ...pick(response, ['headers', 'status', 'statusText', 'url']),
        data,
      }
    }
  }
}
