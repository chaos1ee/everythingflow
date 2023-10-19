/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand'
import { mutate } from 'swr'
import type { ListResponse } from '@/types'
import type { MutatorCallback, MutatorOptions } from 'swr/_internal'
import type { Dispatch, SetStateAction } from 'react'
import qs from 'query-string'

interface QueryListCacheValue {
  swrKey: string | null
  setPage: Dispatch<SetStateAction<number>>
  setSize: Dispatch<SetStateAction<number>>
}

export interface QueryListState {
  cacheMap: Map<string, QueryListCacheValue>
  mutate: <T = any>(
    key: string,
    payload?: Partial<{ page: number; size: number }>,
    data?: ListResponse<T> | Promise<ListResponse<T>> | MutatorCallback<ListResponse<T>>,
    opts?: MutatorOptions<ListResponse<T>>,
  ) => void
}

export const useQueryListStore = create<QueryListState>((_set, get) => ({
  cacheMap: new Map(),
  mutate: <T = any>(
    key: string,
    payload?: Partial<{ page: number; size: number }>,
    data?: ListResponse<T> | Promise<ListResponse<T>> | MutatorCallback<ListResponse<T>>,
    opts?: MutatorOptions<ListResponse<T>>,
  ) => {
    const cacheMap = get().cacheMap

    if (!cacheMap.has(key)) return

    const { swrKey, setSize, setPage } = cacheMap.get(key) as QueryListCacheValue

    if (swrKey === null) return

    const parsed = qs.parseUrl(swrKey)
    const query = parsed.query as { size?: string; page?: string }

    if (payload) {
      if (
        (!payload.page || payload.page === Number(query.page)) &&
        (!payload.size || payload.size === Number(query.size))
      ) {
        mutate(swrKey, data, opts)
      } else {
        setPage(payload.page ?? (query.page ? Number(query.page) : 1))
        setSize(payload.size ?? (query.size ? Number(query.size) : 10))
      }
    } else {
      mutate(swrKey, data, opts)
    }
  },
}))
