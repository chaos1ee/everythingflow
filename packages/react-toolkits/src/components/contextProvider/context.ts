/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Key, ReactNode } from 'react'
import { createContext } from 'react'
import type { RequestOptions } from '../../utils/request'
import type { Game } from '../gameSelect'
import type { Locale } from '../locale'
import type { NavMenuItem } from '../navMenu'
import { defaultState } from './constants'

export interface ContextState {
  appTitle: ReactNode
  signInPageTitle?: ReactNode
  menuItems: NavMenuItem[]
  hideGameSelect: boolean
  usePermissionApiV2: boolean // 使用 V2 版本的权限接口
  locale?: Locale
  localeDropdownMenu?: ReactNode
  signInUrl: string // 登录地址
  signInSuccessRedirectUrl: string // 登录成功后的重定向地址
  notFoundRedirectUrl?: string // 404 重定向地址
  layoutHeaderExtras?: { key: Key; children: ReactNode }[]
  gameFilter?: (game: Game) => boolean
  responseInterceptor?: (response: Response, opts: RequestOptions) => Promise<any>
}

const ToolkitsContext = createContext<ContextState>(defaultState)

export default ToolkitsContext
