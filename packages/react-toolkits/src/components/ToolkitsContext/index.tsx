import type { FC, PropsWithChildren } from 'react'
import { createContext, useContext, useEffect, useMemo } from 'react'
import { createStore } from 'zustand/vanilla'
import type { ItemType2 } from '../NavMenu'
import { useStore } from 'zustand'

export interface ToolkitsContextState {
  title: string
  menuItems: ItemType2[]
  isGlobalNS: boolean // 显示游戏
  usePermissionV2: boolean // 使用 V2 版本的权限接口
  onlyDomesticGames: boolean // 仅显示国内游戏
}

const defaultState = {
  title: '',
  menuItems: [],
  isGlobalNS: false,
  usePermissionV2: false,
  onlyDomesticGames: false,
}

export const toolkitContextStore = createStore<ToolkitsContextState>(() => defaultState)

type ToolkitsContextStore = typeof toolkitContextStore

const ToolkitsContext = createContext<{ store: ToolkitsContextStore; _cache: ToolkitsContextState } | null>(null)

export function useToolkitContextStore<T>(selector: (state: ToolkitsContextState) => T): T {
  return useStore(toolkitContextStore, selector)
}

export function useToolkitContext() {
  return useContext(ToolkitsContext)?._cache ?? defaultState
}

export const ToolkitsContextProvider: FC<PropsWithChildren<Partial<ToolkitsContextState>>> = ({
  children,
  ...props
}) => {
  const { title, menuItems, isGlobalNS, usePermissionV2, onlyDomesticGames } = props
  const parentCache = useToolkitContext()

  const cache = useMemo(
    () => ({
      title: title ?? parentCache.title,
      menuItems: menuItems ?? parentCache.menuItems,
      isGlobalNS: isGlobalNS ?? parentCache.isGlobalNS,
      usePermissionV2: usePermissionV2 ?? parentCache.usePermissionV2,
      onlyDomesticGames: onlyDomesticGames ?? parentCache.onlyDomesticGames,
    }),
    [isGlobalNS, menuItems, onlyDomesticGames, title, usePermissionV2, parentCache],
  )

  const value = useMemo(() => ({ store: toolkitContextStore, _cache: cache }), [cache])

  useEffect(() => {
    toolkitContextStore.setState(cache)
  }, [cache])

  return <ToolkitsContext.Provider value={value}>{children}</ToolkitsContext.Provider>
}
