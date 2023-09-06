/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand'
import type { MutatorOptions } from 'swr'
import { useSWRConfig } from 'swr'
import type { ListResponse } from '@/types'

export interface QueryListStoreValue {
  page: number
  size: number
  formValues?: any
}

export interface QueryListState {
  data: Map<string, QueryListStoreValue>
  getData: (key: string) => QueryListStoreValue
  setData: (key: string, value?: Partial<QueryListStoreValue>) => void
}

export const useQueryListStore = create<QueryListState>((set, get) => ({
  data: new Map(),
  getData(key) {
    const value = get().data.get(key)
    return {
      page: value?.page ?? 1,
      size: value?.size ?? 10,
      formValues: value?.formValues,
    }
  },
  setData(key, value) {
    set({
      data: new Map(get().data).set(key, {
        ...get().getData(key),
        ...value,
      }),
    })
  },
}))

export function useQueryListMutate() {
  const { getData } = useQueryListStore(state => state)
  const { mutate } = useSWRConfig()

  return <T>(key: string, data?: ListResponse<T>, opts?: boolean | MutatorOptions<ListResponse<T>>) => {
    return mutate([key, getData(key)], data, opts)
  }
}

export function useQueryListJump() {
  const { getData, setData } = useQueryListStore(state => state)
  const mutate = useQueryListMutate()

  // 跳转到对应页，不传 page 参数时刷新当前页面
  return (key: string, page?: number) => {
    if (!page || page === getData(key).page) {
      mutate(key, undefined, { revalidate: true })
    } else {
      setData(key, { page: page ?? getData(key).page })
    }
  }
}
