/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand'
import { useSWRConfig } from 'swr'
import type { ListResponse } from '@/types'
import type { MutatorCallback, MutatorOptions } from 'swr/_internal'
import { isEqual } from 'lodash-es'

export interface QueryListPayload {
  page?: number
  size?: number
  values?: any
}

export interface QueryListState {
  payloadMap: Map<string, QueryListPayload>
  setPayload: (key: string, payload: Partial<QueryListPayload>, revalidate?: boolean) => void
}

export const useQueryListStore = create<QueryListState>((set, get) => ({
  payloadMap: new Map(),
  // revalidate 为 true 时，会触发重新请求。为 false 时仅改变 map 内的值，不触发请求。
  setPayload(key, payload, revalidate = true) {
    const map = get().payloadMap
    if (revalidate) {
      set({
        payloadMap: new Map(map).set(key, {
          ...get().payloadMap.get(key),
          ...payload,
        }),
      })
    } else {
      // 使用 Object.assign 是为了保持原型链，避免对象的引用发生变化，从而导致 QueryList 内 useSWR hook 检测到 key 变化。
      map.set(key, Object.assign(map.get(key) ?? {}, payload))
    }
  },
}))

export function useQueryListTrigger() {
  const { mutate } = useSWRConfig()
  const { payloadMap, setPayload } = useQueryListStore()

  return <T = any>(
    key: string,
    payload?: Partial<QueryListPayload>,
    data?: ListResponse<T> | Promise<ListResponse<T>> | MutatorCallback<ListResponse<T>>,
    opts?: MutatorOptions<ListResponse<T>>,
  ) => {
    const swrKey = { url: key, payload: payloadMap.get(key) }
    if (!payload || isEqual(payloadMap.get(key), { ...payloadMap.get(key), ...payload })) {
      mutate(swrKey, data, opts)
    } else {
      mutate(swrKey, data, { ...opts, revalidate: false })
      setPayload(key, payload, opts?.revalidate)
    }
  }
}
