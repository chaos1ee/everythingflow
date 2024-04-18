import type { QueryListDataType } from '../components/QueryList'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { mutate } from 'swr'
import type { MutatorCallback, MutatorOptions } from 'swr/_internal'
import { create } from 'zustand'

type QueryListMutator = <Item = any>(
  action: string,
  data?: QueryListDataType<Item> | Promise<QueryListDataType<Item>> | MutatorCallback<QueryListDataType<Item>>,
  opts?: MutatorOptions<QueryListDataType<Item>>,
) => void

export interface QueryListPayload<FormValues = any> {
  page?: number
  size?: number
  formValues?: FormValues
}

export interface QueryListState {
  swrKeyMap: Map<string, string | null>
  payloadMap: Map<string, QueryListPayload>
  setPayload(action: string, payload: QueryListPayload): void
  setSwrKey(action: string, key: string | null): void
  mutate: QueryListMutator
  remove(action: string): void
}

export const useQueryListStore = create<QueryListState>((set, get) => ({
  swrKeyMap: new Map(),
  payloadMap: new Map(),
  setPayload(action, payload) {
    const { payloadMap } = get()
    set({ payloadMap: new Map(payloadMap).set(action, payload) })
  },
  setSwrKey(action, key) {
    const { swrKeyMap } = get()
    set({ swrKeyMap: new Map(swrKeyMap).set(action, key) })

    if (key === null) {
      mutate(key, undefined, false)
    }
  },
  mutate: (action, data, opts) => {
    const { swrKeyMap } = get()
    const swrKey = swrKeyMap.get(action)
    mutate(swrKey, data, opts)
  },
  remove(action) {
    const { swrKeyMap, payloadMap } = get()
    swrKeyMap.delete(action)
    payloadMap.delete(action)
  },
}))
