import { create, useStore } from 'zustand'
import { createContext, useContext } from 'react'
import type { StateStorage } from 'zustand/middleware'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { GameType } from '../GameSelect'
import type { ItemType2 } from '../NavMenu'

// SessionStorage 在同一域下的不同页面间是隔离的，用于防止多开页面时的数据冲突
const mixedStorage: StateStorage = {
  getItem: (name: string): string | null => {
    return sessionStorage.getItem(name) || localStorage.getItem(name)
  },
  setItem: (name: string, value: string) => {
    localStorage.setItem(name, value)
    sessionStorage.setItem(name, value)
  },
  removeItem: async (name: string) => {
    localStorage.removeItem(name)
    sessionStorage.removeItem(name)
  },
}

export interface ReactToolkitsState {
  title: string
  isPermissionV2: boolean
  isGlobalNS: boolean
  game: GameType | null
  setGame: (game: GameType | null) => void
  openKeys: string[]
  selectedKeys: string[]
  setOpenKeys: (keys: string[]) => void
  setSelectedKeys: (keys: string[]) => void
  menuItems: ItemType2[]
}

export type ReactToolkitsStore = ReturnType<typeof createReactToolkitsStore>

export const createReactToolkitsStore = () => {
  return create<ReactToolkitsState>()(
    persist(
      set => ({
        title: '',
        isPermissionV2: false,
        isGlobalNS: false,
        game: null,
        setGame: game => set({ game }),
        openKeys: [],
        setOpenKeys: keys => set({ openKeys: keys }),
        selectedKeys: [],
        setSelectedKeys: keys => set({ selectedKeys: keys }),
        menuItems: [],
      }),
      {
        name: 'ReactToolkits',
        storage: createJSONStorage(() => mixedStorage),
        partialize: state => ({
          title: state.title,
          game: state.game,
          openKeys: state.openKeys,
          selectedKeys: state.selectedKeys,
        }),
      },
    ),
  )
}

export const ReactToolkitsContext = createContext<ReactToolkitsStore | null>(null)

export function useReactToolkitsContext<T>(
  selector: (state: ReactToolkitsState) => T,
  equalityFn?: (left: T, right: T) => boolean,
): T {
  const store = useContext(ReactToolkitsContext)
  if (!store) throw new Error('Missing ReactToolkitsContext.Provider in the tree')
  return useStore(store, selector, equalityFn)
}
