/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Game } from '@/components/GameSelect'
import type { Locale } from '@/locales'
import type { FC, PropsWithChildren, ReactNode } from 'react'
import { createContext, useContext } from 'react'
import { create, useStore } from 'zustand'
import type { NavMenuItem } from '../NavMenu'

export interface ContextState {
  title: string
  menuItems: NavMenuItem[]
  hideGameSelect: boolean
  usePermissionApiV2: boolean // 使用 V2 版本的权限接口
  gameFilter?: (game: Game) => boolean
  locale?: Locale
  localeDropdownMenu?: ReactNode
}

const defaultState: ContextState = {
  title: '',
  menuItems: [],
  hideGameSelect: false,
  usePermissionApiV2: false,
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

  const config = {
    ...parentConfig,
    ...props,
  }

  contextStore.setState(config)

  return <ToolkitsContext.Provider value={config}>{children}</ToolkitsContext.Provider>
}

ContextProvider.displayName = 'ToolkitsContextProvider'

export default ContextProvider
