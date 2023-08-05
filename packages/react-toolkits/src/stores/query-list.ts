import type { QueryListKey } from '@/components/QueryList'
import type { PaginationParams } from '@/types'
import { create } from 'zustand'

type RefreshFunction = (arg?: Partial<PaginationParams>) => void

export interface QueryListState {
  data: Map<
    QueryListKey,
    {
      pagination?: PaginationParams
      refresh?: RefreshFunction
    }
  >
  getPaginationData: (key: QueryListKey) => PaginationParams
  setPaginationData: (key: QueryListKey, pagination?: Partial<PaginationParams>) => void
  refresh: (key: QueryListKey, arg?: Partial<PaginationParams>) => void
  setRefresh: (key: QueryListKey, trigger: RefreshFunction) => void
}

export const useQueryListStore = create<QueryListState>((set, get) => ({
  data: new Map(),
  getPaginationData: (key: QueryListKey) => {
    const pagination = get().data.get(key)?.pagination
    return {
      page: pagination?.page ?? 1,
      size: pagination?.size ?? 10,
    }
  },
  setPaginationData: (key: QueryListKey, pagination?: Partial<PaginationParams>) => {
    set({
      data: new Map(get().data).set(key, {
        ...get().data.get(key),
        pagination: {
          page: pagination?.page ?? get().getPaginationData(key).page,
          size: pagination?.size ?? get().getPaginationData(key).size,
        },
      }),
    })
  },
  refresh: (key: QueryListKey, pagination?: Partial<PaginationParams>) => {
    const refresh = get().data.get(key)?.refresh

    if (refresh) {
      refresh({
        page: pagination?.page ?? get().getPaginationData(key).page,
        size: pagination?.size ?? get().getPaginationData(key).size,
      })
    }
  },
  setRefresh: (key: QueryListKey, refresh: RefreshFunction) => {
    const data = get().data

    set({
      data: new Map(data).set(key, {
        ...data.get(key),
        refresh,
      }),
    })
  },
}))
