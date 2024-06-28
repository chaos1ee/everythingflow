/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FC, Key, PropsWithChildren, ReactNode } from 'react'
import { createContext, useContext } from 'react'
import { createStore } from 'zustand'
import type { Locale } from '../../locales'
import type { RequestOptions } from '../../utils/request'
import type { Game } from '../GameSelect'
import type { NavMenuItem } from '../NavMenu'

export interface ContextState {
  appTitle: ReactNode
  signInPageTitle?: ReactNode
  menuItems: NavMenuItem[]
  hideGameSelect: boolean
  usePermissionApiV2: boolean // 使用 V2 版本的权限接口
  gameFilter?: (game: Game) => boolean
  locale?: Locale
  localeDropdownMenu?: ReactNode
  signInUrl: string // 登录地址
  signInSuccessRedirectUrl?: string // 登录成功后的重定向地址
  notFoundRedirectUrl?: string // 404 重定向地址
  layoutHeaderExtras?: { key: Key; children: ReactNode }[]
  responseInterceptor?: (response: Response, opts: RequestOptions) => Promise<any>
}

const defaultState: ContextState = {
  appTitle: '',
  menuItems: [],
  hideGameSelect: false,
  usePermissionApiV2: false,
  signInUrl: '',
}

// 全局的上下文。因为 ContextProvider 支持嵌套，所以 toolkitContextStore 的值等同于最内层的 ContextProvider 包含的上下文。
export const contextStore = createStore<ContextState>(() => defaultState)

const ToolkitsContext = createContext<ContextState>(defaultState)

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
