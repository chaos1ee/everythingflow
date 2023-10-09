/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FC, PropsWithChildren, ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo } from 'react'
import type { NavMenuItem } from '../NavMenu'
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

export let contextStore: ContextState = defaultState

const ToolkitsContext = createContext<ContextState>(defaultState)

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
    contextStore = config
  })

  return <ToolkitsContext.Provider value={config}>{children}</ToolkitsContext.Provider>
}

ContextProvider.displayName = 'ToolkitsContextProvider'

export default ContextProvider
