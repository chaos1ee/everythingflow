import type { FC, PropsWithChildren } from 'react'
import { createContext, useContext, useMemo } from 'react'
import type { ItemType2 } from '../NavMenu'
import { create, useStore } from 'zustand'

export interface ToolkitsContextState {
  title: string
  menuItems: ItemType2[]
  isGlobalNS: boolean // 显示游戏
  usePermissionV2: boolean // 使用 V2 版本的权限接口
  onlyDomesticGames: boolean // 仅显示国内游戏
}

const defaultState: ToolkitsContextState = {
  title: '',
  menuItems: [],
  isGlobalNS: false,
  usePermissionV2: false,
  onlyDomesticGames: false,
}

// 全局的上下文。因为 ToolkitsContextProvider 支持嵌套，所以 toolkitContextStore 的值等同于最内层的 ToolkitsContextProvider 包含的上下文。
export const toolkitContextStore = create<ToolkitsContextState>(() => defaultState)

const ToolkitsContext = createContext<ToolkitsContextState>(defaultState)

export function useToolkitContextStore<T>(selector: (state: ToolkitsContextState) => T): T {
  return useStore(toolkitContextStore, selector)
}

// 最接近的祖先 ToolkitsContextProvider 内包含的上下文。
export function useToolkitContext() {
  return useContext(ToolkitsContext)
}

export const ToolkitsContextProvider: FC<PropsWithChildren<Partial<ToolkitsContextState>>> = ({
  children,
  ...props
}) => {
  const { title, menuItems, isGlobalNS, usePermissionV2, onlyDomesticGames } = props
  const parentConfig = useToolkitContext()

  const config = useMemo(
    () => ({
      title: title ?? parentConfig.title,
      menuItems: menuItems ?? parentConfig.menuItems,
      isGlobalNS: isGlobalNS ?? parentConfig.isGlobalNS,
      usePermissionV2: usePermissionV2 ?? parentConfig.usePermissionV2,
      onlyDomesticGames: onlyDomesticGames ?? parentConfig.onlyDomesticGames,
    }),
    [isGlobalNS, menuItems, onlyDomesticGames, title, usePermissionV2, parentConfig],
  )

  toolkitContextStore.setState(config)

  return <ToolkitsContext.Provider value={config}>{children}</ToolkitsContext.Provider>
}

ToolkitsContextProvider.displayName = 'ToolkitsContextProvider'
