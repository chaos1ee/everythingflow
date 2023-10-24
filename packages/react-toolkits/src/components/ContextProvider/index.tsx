/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FC, PropsWithChildren, ReactNode } from 'react'
import { createContext, useContext } from 'react'
import type { NavMenuItem } from '../NavMenu'
import type { Locale } from '@/locales'
import type { Game } from '@/components/GameSelect'
import { merge } from 'lodash-es'

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

export let contextStore: ContextState = defaultState

const ToolkitsContext = createContext<ContextState>(defaultState)

export function useToolkitsContext() {
  return useContext(ToolkitsContext)
}

const ContextProvider: FC<PropsWithChildren<Partial<ContextState>>> = ({ children, ...props }) => {
  const parentConfig = useToolkitsContext()
  const config = merge({}, parentConfig ?? contextStore, props)
  contextStore = config
  return <ToolkitsContext.Provider value={config}>{children}</ToolkitsContext.Provider>
}

ContextProvider.displayName = 'ToolkitsContextProvider'

export default ContextProvider
