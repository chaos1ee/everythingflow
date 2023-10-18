/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand'
import { useSWRConfig } from 'swr'
import type { ListResponse } from '@/types'
import type { MutatorCallback, MutatorOptions } from 'swr/_internal'
import type { Dispatch, SetStateAction } from 'react'
import { useCallback } from 'react'
import qs from 'query-string'

interface QueryListCacheValue {
  swrKey: string | null
  setPage: Dispatch<SetStateAction<number>>
  setSize: Dispatch<SetStateAction<number>>
}

export interface QueryListState {
  cacheMap: Map<string, QueryListCacheValue>
}

export const useQueryListStore = create<QueryListState>(() => ({
  keyMap: new Map(),
  callbackMap: new Map(),
  cacheMap: new Map(),
}))

export function useQueryListMutate() {
  const { mutate } = useSWRConfig()
  const { cacheMap } = useQueryListStore()

  return useCallback(
    <T = any>(
      key: string,
      payload?: Partial<{ page: number; size: number }>,
      data?: ListResponse<T> | Promise<ListResponse<T>> | MutatorCallback<ListResponse<T>>,
      opts?: MutatorOptions<ListResponse<T>>,
    ) => {
      if (!cacheMap.has(key)) return

      const { swrKey, setSize, setPage } = cacheMap.get(key) as QueryListCacheValue

      if (swrKey === null) return

      const parsed = qs.parseUrl(swrKey)
      const query = parsed.query as { size: string; page: string }
      const page = +query.page
      const size = +query.size

      if (payload) {
        let shouldMutate = false

        if (payload?.page) {
          if (page === payload.page) {
            shouldMutate = true
          } else {
            setPage(payload.page)
          }
        }

        if (payload?.size) {
          if (size === payload.size) {
            shouldMutate = true
          } else {
            setSize(payload.size)
          }
        }

        if (shouldMutate) {
          mutate(swrKey, data, opts)
        }
      } else {
        mutate(swrKey, data, opts)
      }
    },
    [cacheMap, mutate],
  )
}
