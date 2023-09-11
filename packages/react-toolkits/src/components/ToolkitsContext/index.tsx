import type { FC, PropsWithChildren } from 'react'
import { createContext, useEffect, useMemo } from 'react'
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

export const toolkitContextStore = createStore<ToolkitsContextState>(() => ({
  title: '',
  menuItems: [],
  isGlobalNS: false,
  usePermissionV2: false,
  onlyDomesticGames: false,
}))

type ToolkitsContextStore = typeof toolkitContextStore

const ToolkitsContext = createContext<ToolkitsContextStore | null>(null)

export function useToolkitContextStore<T>(selector: (state: ToolkitsContextState) => T): T {
  return useStore(toolkitContextStore, selector)
}

export const ToolkitsContextProvider: FC<PropsWithChildren<Partial<ToolkitsContextState>>> = ({
  children,
  ...props
}) => {
  const { title = '', menuItems = [], isGlobalNS = false, usePermissionV2 = false, onlyDomesticGames = false } = props
  const config = useMemo(
    () => ({
      title: title || toolkitContextStore.getState().title,
      menuItems: menuItems.length === 0 ? toolkitContextStore.getState().menuItems : menuItems,
      isGlobalNS,
      usePermissionV2,
      onlyDomesticGames,
    }),
    [isGlobalNS, menuItems, onlyDomesticGames, title, usePermissionV2],
  )

  useEffect(() => {
    toolkitContextStore.setState(config)
  }, [config])

  return <ToolkitsContext.Provider value={toolkitContextStore}>{children}</ToolkitsContext.Provider>
}
