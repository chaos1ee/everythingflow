/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FC, PropsWithChildren, ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo } from 'react'
import type { NavMenuItem } from '../NavMenu'
import { create, useStore } from 'zustand'
import type { Locale } from '@/locales'

export interface ContextState {
  title: string
  menuItems: NavMenuItem[]
  isGlobalNS: boolean // 显示游戏
  usePermissionV2: boolean // 使用 V2 版本的权限接口
  onlyDomesticGames: boolean // 仅显示国内游戏
  locale?: Locale
  localeDropdownMenu?: ReactNode
}

const defaultState: ContextState = {
  title: '',
  menuItems: [],
  isGlobalNS: false,
  usePermissionV2: false,
  onlyDomesticGames: false,
}

// 全局的上下文。因为 ContextProvider 支持嵌套，所以 toolkitContextStore 的值等同于最内层的 ContextProvider 包含的上下文。
export const contextStore = create<ContextState>(() => defaultState)

const ToolkitsContext = createContext<ContextState>(defaultState)

export function useContextStore<T>(selector: (state: ContextState) => T): T {
  return useStore(contextStore, selector)
}

// 最接近的祖先 ContextProvider 内包含的上下文。
export function useToolkitsContext() {
  return useContext(ToolkitsContext)
}

const ContextProvider: FC<PropsWithChildren<Partial<ContextState>>> = ({ children, ...props }) => {
  const parentConfig = useToolkitsContext()

  const config = useMemo(
    () => ({
      ...parentConfig,
      ...props,
    }),
    [props, parentConfig],
  )

  useEffect(() => {
    contextStore.setState(config)
  }, [config])

  return <ToolkitsContext.Provider value={config}>{children}</ToolkitsContext.Provider>
}

ContextProvider.displayName = 'ContextProvider'

export default ContextProvider
