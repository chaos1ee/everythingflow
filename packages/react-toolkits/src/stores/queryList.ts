/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand'
import { useSWRConfig } from 'swr'
import type { ListResponse } from '@/types'
import type { MutatorCallback, MutatorOptions } from 'swr/_internal'

export interface QueryListStoreValue {
  page: number
  size: number
  formValues?: any
}

export interface QueryListState {
  params: Map<string, QueryListStoreValue>
  getParams: (key: string) => QueryListStoreValue
  setParams: (key: string, value?: Partial<QueryListStoreValue>) => void
}

export const useQueryListStore = create<QueryListState>((set, get) => ({
  params: new Map(),
  getParams(key) {
    const value = get().params.get(key)
    return {
      page: value?.page ?? 1,
      size: value?.size ?? 10,
      formValues: value?.formValues,
    }
  },
  setParams(key, value) {
    set({
      params: new Map(get().params).set(key, {
        ...get().getParams(key),
        ...value,
      }),
    })
  },
}))

export function useQueryListMutate() {
  const { getParams } = useQueryListStore()
  const { mutate } = useSWRConfig()

  return <T = any>(
    key: string,
    data?: ListResponse<T> | Promise<ListResponse<T>> | MutatorCallback<ListResponse<T>>,
    opts?: boolean | MutatorOptions<ListResponse<T>>,
  ) => {
    return mutate([key, getParams(key)], data, opts)
  }
}

export function useQueryListJump() {
  const { getParams, setParams } = useQueryListStore()
  const mutate = useQueryListMutate()

  // 跳转到对应页，不传 page 参数时刷新当前页面
  return (key: string, page?: number) => {
    if (!page || page === getParams(key).page) {
      mutate(key, undefined, { revalidate: true })
    } else {
      setParams(key, { page: page ?? getParams(key).page })
    }
  }
}
