import type { QueryListDataType, QueryListProps } from '../components/QueryList'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { mutate } from 'swr'
import type { MutatorCallback, MutatorOptions } from 'swr/_internal'
import { create } from 'zustand'
import { genSwrKey } from '../utils/queryList'

type QueryListMutator = <T = any>(
  action: string,
  data?: QueryListDataType<T> | Promise<QueryListDataType<T>> | MutatorCallback<QueryListDataType<T>>,
  opts?: MutatorOptions<QueryListDataType<T>>,
) => void

export interface QueryListPayload<FormValues = any> {
  page?: number
  size?: number
  formValues?: FormValues
}

export interface QueryListState {
  swrKeyMap: Map<string, string | null>
  payloadMap: Map<string, QueryListPayload>
  propsMap: Map<string, QueryListProps>
  setPayload(action: string, payload: QueryListPayload): void
  setSwrKey(action: string, key?: string | null): void
  mutate: QueryListMutator
  remove(action: string): void
}

export const useQueryListStore = create<QueryListState>((set, get) => ({
  swrKeyMap: new Map(),
  payloadMap: new Map(),
  propsMap: new Map(),
  setPayload(action, payload) {
    const { payloadMap } = get()
    set({ payloadMap: new Map(payloadMap).set(action, payload) })

    const prevSwrKey = get().swrKeyMap.get(action)
    const nextSwrKey = genSwrKey(get().propsMap.get(action) as QueryListProps, payload)

    if (prevSwrKey === nextSwrKey) {
      // 因为 SWR key 没有变化时会使用缓存数据，所以需要调用 mutate 强行更新缓存。
      mutate(prevSwrKey, undefined, true)
    }
  },
  setSwrKey(action, key) {
    const { swrKeyMap, propsMap, payloadMap } = get()
    if (key === undefined) {
      const newKey = genSwrKey(propsMap.get(action) as QueryListProps, payloadMap.get(action) as QueryListPayload)
      set({ swrKeyMap: new Map(swrKeyMap).set(action, newKey) })
    } else {
      set({ swrKeyMap: new Map(swrKeyMap).set(action, key) })
    }
  },
  mutate: (action, data, opts) => {
    const { swrKeyMap } = get()
    const swrKey = swrKeyMap.get(action)
    mutate(swrKey, data, opts)
  },
  remove(action) {
    const { swrKeyMap, payloadMap, propsMap } = get()
    swrKeyMap.delete(action)
    payloadMap.delete(action)
    propsMap.delete(action)
  },
}))
