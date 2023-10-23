/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand'
import { mutate } from 'swr'
import type { ListResponse } from '@/types'
import type { MutatorCallback, MutatorOptions } from 'swr/_internal'

export interface QueryListState {
  keyMap: Map<string, string | null>
  paginationMap: Map<string, { page: number; size: number }>
  mutate: <T = any>(
    key: string,
    payload?: Partial<{ page: number; size: number }>,
    data?: ListResponse<T> | Promise<ListResponse<T>> | MutatorCallback<ListResponse<T>>,
    opts?: MutatorOptions<ListResponse<T>>,
  ) => void
}

export const useQueryListStore = create<QueryListState>((set, get) => ({
  keyMap: new Map(),
  paginationMap: new Map(),
  mutate: <T = any>(
    key: string,
    payload?: Partial<{ page: number; size: number }>,
    data?: ListResponse<T> | Promise<ListResponse<T>> | MutatorCallback<ListResponse<T>>,
    opts?: MutatorOptions<ListResponse<T>>,
  ) => {
    const { keyMap, paginationMap } = get()
    const swrKey = keyMap.get(key)
    const { page = 1, size = 10 } = paginationMap.get(key) ?? {}

    if (payload) {
      if ((!payload.page || payload.page === page) && (!payload.size || payload.size === size)) {
        mutate(swrKey, data, opts)
      } else {
        set({
          paginationMap: new Map(paginationMap).set(key, {
            page: payload.page ?? page,
            size: payload.size ?? size,
          }),
        })
      }
    } else {
      mutate(swrKey, data, opts)
    }
  },
}))
