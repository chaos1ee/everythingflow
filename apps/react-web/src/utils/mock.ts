/* eslint-disable @typescript-eslint/no-explicit-any */
import { randPastDate, toCollection } from '@ngneat/falso'
import dayjs from 'dayjs'
import { HttpResponse } from 'msw'

export function datetime() {
  return dayjs(randPastDate()).format('YYYY-MM-DD HH:mm:ss')
}

export function timestamp() {
  return dayjs(randPastDate()).valueOf()
}

export function unixTimestamp() {
  return dayjs(randPastDate()).unix()
}

export function jsonResolver<T = any>(data: T | (() => T) | (() => Promise<T>)) {
  return async () =>
    HttpResponse.json({
      code: 0,
      msg: 'ok',
      data: typeof data === 'function' ? await (data as (() => T) | (() => Promise<T>))() : data,
    })
}

export function listResolver<T = any>(generateCollection: () => T) {
  return () =>
    HttpResponse.json({
      code: 0,
      msg: 'ok',
      data: {
        List: toCollection(generateCollection, { length: 10 }) as T[],
        Total: 24,
      },
    })
}

export function listResolver2<T = any>(generateCollection: () => T) {
  return () =>
    HttpResponse.json({
      code: 0,
      msg: 'ok',
      data: {
        list: toCollection(generateCollection, { length: 10 }) as T[],
        total: 24,
      },
    })
}
