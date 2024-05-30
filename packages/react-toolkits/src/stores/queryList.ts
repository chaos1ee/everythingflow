/* eslint-disable @typescript-eslint/no-explicit-any */
import { mutate } from 'swr'
import type { MutatorCallback, MutatorOptions } from 'swr/_internal'
import { create } from 'zustand'
import type { QueryListDataType, QueryListProps } from '../components/QueryList'
import { genSwrKey } from '../components/QueryList/utils'

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
  removeFromStore(action: string): void
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
      mutate(prevKey, undefined, false)
    } else if (key === undefined) {
      const nextKey = genSwrKey(propsMap.get(action) as QueryListProps, payloadMap.get(action))

      if (prevKey !== nextKey) {
        set({ swrKeyMap: new Map(swrKeyMap).set(action, nextKey) })
      } else {
        mutate(prevKey, undefined, true)
      }
    } else {
      set({ swrKeyMap: new Map(swrKeyMap).set(action, key) })
    }
  },
  getPayload(action) {
    const { payloadMap } = get()
    return payloadMap.get(action)
  },
  setPayload(action, payload) {
    const { payloadMap, getPayload, propsMap } = get()
    const { defaultSize } = propsMap.get(action) ?? {}
    set({
      payloadMap: new Map(payloadMap).set(action, {
        page: 1,
        size: defaultSize,
        ...(getPayload(action) ?? {}),
        ...payload,
      }),
    })
  },
  mutate: (action, data, opts) => {
    const { swrKeyMap } = get()
    const swrKey = swrKeyMap.get(action)
    mutate(swrKey, data, opts)
  },
  refresh(action, page) {
    const { setPayload, updateSwrKey, payloadMap } = get()
    setPayload(action, { page: page ?? payloadMap.get(action)?.page })
    updateSwrKey(action)
  },
  removeFromStore(action) {
    get().mutate(action, undefined, { revalidate: false })
    get().swrKeyMap.delete(action)
    get().payloadMap.delete(action)
    get().propsMap.delete(action)
  },
}))
