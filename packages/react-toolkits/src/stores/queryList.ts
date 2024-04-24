import type { QueryListDataType, QueryListProps } from '../components/QueryList'
import { genSwrKey } from '../components/QueryList/utils'
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
  propsMap: Map<string, QueryListProps>
  getSwrkKey(action: string): string | null
  updateSwrKey(action: string, key?: string | null): void
  getPayload: (action: string) => QueryListPayload | undefined
  setPayload(action: string, payload: Partial<QueryListPayload>): void
  mutate: QueryListMutator
  refresh(action: string, page?: number): void
}

export const useQueryListStore = create<QueryListState>((set, get) => ({
  swrKeyMap: new Map(),
  payloadMap: new Map(),
  propsMap: new Map(),
  getSwrkKey(action) {
    const { swrKeyMap } = get()
    return swrKeyMap.get(action) ?? null
  },
  updateSwrKey(action, key) {
    const { propsMap, payloadMap, swrKeyMap, getSwrkKey } = get()
    const prevKey = getSwrkKey(action)

    if (!propsMap.has(action)) {
      throw new Error(`The action "${action}" is not registered in QueryList`)
    }

    if (key === null) {
      swrKeyMap.set(action, null)
      mutate(undefined, false)
    } else if (key === undefined) {
      const nextKey = genSwrKey(propsMap.get(action) as QueryListProps, payloadMap.get(action))

      if (prevKey !== nextKey) {
        swrKeyMap.set(action, nextKey)
      } else {
        mutate(undefined, true)
      }
    } else {
      swrKeyMap.set(action, key)
    }
  },
  getPayload(action) {
    const { payloadMap } = get()
    return payloadMap.get(action)
  },
  setPayload(action, payload) {
    const { payloadMap, getPayload } = get()
    set({ payloadMap: new Map(payloadMap).set(action, { ...getPayload(action), ...payload }) })
  },
  mutate: (action, data, opts) => {
    const { swrKeyMap } = get()
    const swrKey = swrKeyMap.get(action)
    mutate(swrKey, data, opts)
  },
  refresh(action, page = 1) {
    const { getPayload, setPayload } = get()
    setPayload(action, { ...getPayload(action), page })
  },
}))
