/* eslint-disable @typescript-eslint/no-explicit-any */
import { mutate } from 'swr'
import type { MutatorCallback, MutatorOptions } from 'swr/_internal'
import { create } from 'zustand'
import type { ListResponse } from '../types'

type QueryListMutator = <T = any>(
  key: string,
  data?: ListResponse<T> | Promise<ListResponse<T>> | MutatorCallback<ListResponse<T>>,
  opts?: MutatorOptions<ListResponse<T>>,
) => void

interface QueryListPayload {
  page: number
  size: number
  formValue?: any
}

export interface QueryListState {
  keyMap: Map<string, string | null>
  payloadMap: Map<string, QueryListPayload>
  mutate: QueryListMutator

  getPayload(key: string): QueryListPayload

  setPayload(
    key: string,
    payload: Partial<{
      page: number
      size: number
      formValue?: any
    }>,
    preventUpdate?: boolean,
  ): void
}

export const useQueryListStore = create<QueryListState>((set, get) => ({
  keyMap: new Map(),
  paginationMap: new Map(),
  valueMap: new Map(),
  payloadMap: new Map(),
  getPayload(key) {
    return get().payloadMap.get(key) ?? { page: 1, size: 10 }
  },
  setPayload(key, payload, preventUpdate = true) {
    const map = get().payloadMap

    if (preventUpdate) {
      map.set(key, {
        page: payload.page ?? map.get(key)?.page ?? 1,
        size: payload.size ?? map.get(key)?.size ?? 10,
        formValue: payload.formValue ?? map.get(key)?.formValue,
      })
    } else {
      set({
        payloadMap: new Map(map).set(key, {
          page: payload.page ?? map.get(key)?.page ?? 1,
          size: payload.size ?? map.get(key)?.size ?? 10,
          formValue: payload.formValue ?? map.get(key)?.formValue,
        }),
      })
    }
  },
  mutate: (key, data, opts) => {
    const { keyMap } = get()
    const swrKey = keyMap.get(key)
    mutate(swrKey, data, opts)
  },
}))
