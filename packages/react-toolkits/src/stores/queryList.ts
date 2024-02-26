/* eslint-disable @typescript-eslint/no-explicit-any */
import { mutate } from 'swr'
import type { MutatorCallback, MutatorOptions } from 'swr/_internal'
import { create } from 'zustand'
import type { QueryListDataType } from '../components/QueryList'

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
  mutate: QueryListMutator

  setPayload(key: string, payload: QueryListPayload, triggerUpdate?: boolean): void
}

export const useQueryListStore = create<QueryListState>((set, get) => ({
  keyMap: new Map(),
  paginationMap: new Map(),
  valueMap: new Map(),
  payloadMap: new Map(),
  setPayload(key, payload, triggerUpdate = true) {
    const map = get().payloadMap

    const newValue = {
      page: payload.page ?? map.get(key)?.page,
      size: payload.size ?? map.get(key)?.size,
      arg: {
        ...map.get(key)?.arg,
        ...payload.arg,
      },
    }

    if (triggerUpdate) {
      set({ payloadMap: new Map(map).set(key, newValue) })
    } else {
      map.set(key, newValue)
    }
  },
  mutate: (key, data, opts) => {
    const { keyMap } = get()
    const swrKey = keyMap.get(key)
    mutate(swrKey, data, opts)
  },
}))
