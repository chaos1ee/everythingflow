/* eslint-disable @typescript-eslint/no-explicit-any */
import qs from 'query-string'
import type { QueryListProps } from '../components/QueryList'
import type { QueryListPayload } from '../stores/queryList'

interface SwrKeyObject {
  url: string
  params?: Record<string, any>
  body?: Record<string, any>
}

const deepSortObject = (obj: unknown): unknown => {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(deepSortObject)
  }

  const sortedKeys = Object.keys(obj).sort()
  const result: Record<string, unknown> = {}

  sortedKeys.forEach(key => {
    result[key] = deepSortObject((obj as Record<string, unknown>)[key])
  })

  return result
}

export const serialize = (obj: SwrKeyObject) => {
  // 因为键的顺序会影响序列化结果，所以需要先排序。
  const sortedObj = deepSortObject(obj)
  return JSON.stringify(sortedObj)
}

export const deserialize = (key: string) => JSON.parse(key) as SwrKeyObject

// 生成 SWR 的 key，用于缓存请求结果。
export function genSwrKey(props: QueryListProps, payload?: QueryListPayload) {
  const { action, defaultSize, getParams, getBody, method, onePage } = props
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
        ? onePage
          ? formValues
          : {
              ...formValues,
              page,
              size,
            }
        : {},
  )

  const body =
    typeof getBody === 'function'
      ? getBody?.({ page, size, formValues })
      : method === 'POST'
        ? onePage
          ? formValues
          : {
              ...formValues,
              page,
              size,
            }
        : undefined

  return serialize({
    url,
    body,
    params,
  })
}
