/* eslint-disable @typescript-eslint/no-explicit-any */
import { mutate } from 'swr'
import type { MutatorCallback, MutatorOptions } from 'swr/_internal'
import { create } from 'zustand'
import type { QueryListDataType, QueryListProps } from '../components/QueryList'
import { getSwrKey } from '../components/QueryList'

type QueryListMutator = <T = any>(
  key: string,
  data?: QueryListDataType<T> | Promise<QueryListDataType<T>> | MutatorCallback<QueryListDataType<T>>,
  opts?: MutatorOptions<QueryListDataType<T>>,
) => void

export interface QueryListPayload<Arg = any> {
  page?: number
  size?: number
  arg?: Arg
}

export interface QueryListState {
  keyMap: Map<string, string | null>
  payloadMap: Map<string, QueryListPayload>
  propsMap: Map<string, QueryListProps<any>>
  mutate: QueryListMutator

  setPayload(key: string, payload: QueryListPayload, forceUpdate?: boolean): void
}

export const useQueryListStore = create<QueryListState>((set, get) => ({
  keyMap: new Map(),
  paginationMap: new Map(),
  valueMap: new Map(),
  payloadMap: new Map(),
  propsMap: new Map(),
  setPayload(key, payload, forceUpdate = true) {
    const map = get().payloadMap

    const newPayload = {
      page: payload.page ?? map.get(key)?.page,
      size: payload.size ?? map.get(key)?.size,
      arg: {
        ...map.get(key)?.arg,
        ...payload.arg,
      },
    }

    if (forceUpdate) {
      if (get().keyMap.get(key)) {
        const prevSwrKey = get().keyMap.get(key) as string
        const nextSwrKey = getSwrKey(key, newPayload, get().propsMap.get(key)?.params, get().propsMap.get(key)?.onePage)

        if (prevSwrKey === nextSwrKey) {
          map.set(key, newPayload)
          // 因为 SWR key 没有变化时会使用缓存数据，所以需要调用 mutate 强行更新缓存。
          mutate(prevSwrKey, undefined, true)
        } else {
          set({ payloadMap: new Map(map).set(key, newPayload) })
        }
      } else {
        set({ payloadMap: new Map(map).set(key, newPayload) })
      }
    } else {
      map.set(key, newPayload)
    }
  },
  mutate: (key, data, opts) => {
    const { keyMap } = get()
    const swrKey = keyMap.get(key)
    mutate(swrKey, data, opts)
  },
}))
