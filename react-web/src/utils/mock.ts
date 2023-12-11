/* eslint-disable @typescript-eslint/no-explicit-any */
import { SECRET } from '@/constants'
import type { ListResponse } from '@/types'
import { randPastDate, toCollection } from '@ngneat/falso'
import * as dayjs from 'dayjs'
import { jwtVerify } from 'jose'
import type { ResponseResolver } from 'msw'
import { HttpResponse, passthrough } from 'msw'

export function datetime() {
  return dayjs(randPastDate()).format('YYYY-MM-DD HH:mm:ss')
}

export function timestamp() {
  return dayjs(randPastDate()).valueOf()
}

export function unixTimestamp() {
  return dayjs(randPastDate()).unix()
}

interface BackendResponse<T = any> {
  code: number
  msg: string
  data: T
}

export function jsonResolver<T = any>(data: T | (() => T) | (() => Promise<T>)) {
  return async () =>
    HttpResponse.json<BackendResponse<T>>({
      code: 0,
      msg: 'ok',
      data: typeof data === 'function' ? await (data as (() => T) | (() => Promise<T>))() : data,
    })
}

export function listResolver<T>(generateCollection: () => T) {
  return () =>
    HttpResponse.json<BackendResponse<ListResponse<T>>>({
      code: 0,
      msg: 'ok',
      data: {
        List: toCollection(generateCollection, { length: 10 }) as T[],
        Total: 24,
      },
    })
}

export function listResolver2<T>(generateCollection: () => T) {
  return () =>
    HttpResponse.json<BackendResponse>({
      code: 0,
      msg: 'ok',
      data: {
        list: toCollection(generateCollection, { length: 10 }) as T[],
        total: 24,
      },
    })
}

export const tokenResolver: ResponseResolver = async ({ request }) => {
  const url = new URL(request.url)

  const ignoredPaths = ['/api/usystem/user/login', '/api/server/game/develop/token', '/api/server/game/develop/signup']

  if (ignoredPaths.some(item => item.startsWith(url.pathname))) {
    passthrough()
  } else {
    try {
      await jwtVerify(request.headers.get('Authorization')?.replace('Bearer ', '') ?? '', SECRET)
      passthrough()
    } catch (_) {
      return new HttpResponse('Unauthorized', { status: 401 })
    }
  }
}
