import type { FC, PropsWithChildren } from 'react'
import { createContext, useEffect } from 'react'
import { createStore } from 'zustand/vanilla'
import type { ItemType2 } from '../NavMenu'
import { useStore } from 'zustand'
import { merge } from 'lodash-es'

export interface ToolkitsContextState {
  title: string
  menuItems: ItemType2[]
  usePermissionV2: boolean // 使用 V2 版本的权限接口
  onlyDomesticGames: boolean // 仅显示国内游戏
}

export const toolkitContextStore = createStore<ToolkitsContextState>(() => ({
  title: '',
  menuItems: [],
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
  const config = merge(toolkitContextStore.getState(), props)

  useEffect(() => {
    toolkitContextStore.setState(config)
  }, [config])

  return <ToolkitsContext.Provider value={toolkitContextStore}>{children}</ToolkitsContext.Provider>
}
