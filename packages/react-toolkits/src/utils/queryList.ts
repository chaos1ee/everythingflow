/* eslint-disable @typescript-eslint/no-explicit-any */
import qs from 'query-string'
import type { QueryListProps } from '../components/QueryList'
import type { QueryListPayload } from '../stores/queryList'

export interface QueryListSwrKeyObject {
  url: string
  params?: Record<string, any>
  body?: Record<string, any>
}

// 因为键的顺序会影响序列化结果，所以需要先排序。
// 暂时不处理嵌套的情况。
export const serialize = (object: QueryListSwrKeyObject) => {
  return JSON.stringify(object, Object.keys(object).sort())
}

export const deserialize = (key: string) => JSON.parse(key) as QueryListSwrKeyObject

// 生成 SWR 的 key，用于缓存请求结果。
export function genSwrKey(props: QueryListProps, payload: QueryListPayload | undefined) {
  const { action, defaultSize, getParams, getBody, method } = props
  const { url, query } = qs.parseUrl(action)
  const { page = 1, size = defaultSize, formValues = {} } = payload ?? {}

  const params = Object.assign(
    query,
    typeof getParams === 'function'
      ? getParams?.({
          page,
          size,
          formValues,
        })
      : method === 'GET'
        ? {
            ...formValues,
            page,
            size,
          }
        : {},
  )

  const body =
    typeof getBody === 'function' ? getBody?.({ page, size, formValues }) : method === 'POST' ? formValues : undefined

  return serialize({
    url,
    body,
    params,
  })
}
