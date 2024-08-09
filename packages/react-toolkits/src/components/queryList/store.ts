/* eslint-disable @typescript-eslint/no-explicit-any */
import { isEqual } from 'lodash-es'
import type { MutatorCallback, MutatorOptions } from 'swr'
import { mutate } from 'swr'
import { create } from 'zustand'
import type { QueryListPayload } from './QueryList'

interface QueryListState {
  keyMap: Map<string, string | null>
  payloadMap: Map<string, QueryListPayload>
  getPayload(url: string): QueryListPayload
  setPayload(url: string, payload: QueryListPayload): void
  refetch(url: string, payload: QueryListPayload): void
  mutate<Data = any, T = Data>(
    url: string,
    data?: T | Promise<T> | MutatorCallback<T>,
    opts?: boolean | MutatorOptions<Data, T>,
  ): Promise<T | undefined>
  jump(url: string, page: number): void
}

export const useQueryListStore = create<QueryListState>((set, get) => ({
  keyMap: new Map(),
  payloadMap: new Map(),
  getPayload(url) {
    return get().payloadMap.get(url) ?? { page: 1 }
  },
  setPayload(url, payload) {
    set(state => ({
      payloadMap: new Map(state.payloadMap).set(url, payload),
    }))
  },
  refetch(url, payload) {
    const prevPayload = get().getPayload(url)
    const nextPayload = { ...prevPayload, ...payload }

    if (isEqual(prevPayload, nextPayload)) {
      get().mutate(url)
    } else {
      get().setPayload(url, nextPayload)
    }
  },
  mutate(url, data, opts) {
    const key = get().keyMap.get(url)
    return mutate(key, data, opts)
  },
  jump(url, page) {
    const currentPage = get().getPayload(url).page

    if (currentPage !== page) {
      get().setPayload(url, { page })
    } else {
      get().mutate(url)
    }
  },
}))
