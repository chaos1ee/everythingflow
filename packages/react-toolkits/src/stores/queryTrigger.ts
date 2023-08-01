import type { QueryListKey } from '@/components/QueryList'
import type { PaginationParams } from '@/types'
import { create } from 'zustand'

type TriggerFunction = (arg?: Partial<PaginationParams>) => void

export interface QueryTriggerState {
  triggers: Map<QueryListKey, TriggerFunction>
  setTrigger: (key: QueryListKey, trigger: TriggerFunction) => void
  trigger: (key: QueryListKey, arg?: Partial<PaginationParams>) => void
}

export const useQueryTriggerStore = create<QueryTriggerState>((set, get) => ({
  triggers: new Map(),
  setTrigger: (key: QueryListKey, trigger: TriggerFunction) => {
    set({
      triggers: new Map(get().triggers).set(key, trigger),
    })
  },
  trigger: (key: QueryListKey, arg?: Partial<PaginationParams>) => {
    const trigger = get().triggers.get(key)

    if (trigger) {
      trigger(arg)
    }
  },
}))
