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
  page?: number
  size?: number
  arg?: object
}

export interface QueryListState {
  keyMap: Map<string, string | null>
  payloadMap: Map<string, QueryListPayload>
  mutate: QueryListMutator

  setPayload(key: string, payload: QueryListPayload, onlyUpdateStore?: boolean): void
}

export const useQueryListStore = create<QueryListState>((set, get) => ({
  keyMap: new Map(),
  paginationMap: new Map(),
  valueMap: new Map(),
  payloadMap: new Map(),
  setPayload(key, payload, onlyUpdateStore = false) {
    const map = get().payloadMap

    const newValue = {
      page: payload.page ?? map.get(key)?.page,
      size: payload.size ?? map.get(key)?.size,
      arg: {
        ...map.get(key)?.arg,
        ...payload.arg,
      },
    }

    if (onlyUpdateStore) {
      map.set(key, newValue)
    } else {
      set({ payloadMap: new Map(map).set(key, newValue) })
    }
  },
  mutate: (key, data, opts) => {
    const { keyMap } = get()
    const swrKey = keyMap.get(key)
    mutate(swrKey, data, opts)
  },
}))
