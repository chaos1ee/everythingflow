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
  mutate: QueryListMutator
  setPayload(action: string, payload: QueryListPayload, forceUpdate?: boolean): void
  remove(action: string): void
}

export const useQueryListStore = create<QueryListState>((set, get) => ({
  swrKeyMap: new Map(),
  paginationMap: new Map(),
  valueMap: new Map(),
  payloadMap: new Map(),
  propsMap: new Map(),
  setPayload(action, payload, forceUpdate = true) {
    const payloadMap = get().payloadMap

    const newPayload = {
      page: payload.page ?? payloadMap.get(action)?.page,
      size: payload.size ?? payloadMap.get(action)?.size,
      formValues: {
        ...payloadMap.get(action)?.formValues,
        ...payload.formValues,
      },
    }

    if (forceUpdate) {
      if (get().swrKeyMap.get(action)) {
        const prevSwrKey = get().swrKeyMap.get(action) as string
        const nextSwrKey = genSwrKey(get().propsMap.get(action) as QueryListProps, newPayload)

        if (prevSwrKey === nextSwrKey) {
          payloadMap.set(action, newPayload)
          // 因为 SWR key 没有变化时会使用缓存数据，所以需要调用 mutate 强行更新缓存。
          mutate(prevSwrKey, undefined, true)
        } else {
          set({ payloadMap: new Map(payloadMap).set(action, newPayload) })
        }
      } else {
        set({ payloadMap: new Map(payloadMap).set(action, newPayload) })
      }
    } else {
      payloadMap.set(action, newPayload)
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
