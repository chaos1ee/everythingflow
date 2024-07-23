import type { FC, PropsWithChildren } from 'react'
import { useContext, useEffect } from 'react'
import { createStore } from 'zustand'
import LocaleProvider from '../locale'
import { defaultState } from './constants'
import type { ContextState } from './context'
import ToolkitsContext from './context'

// 全局的上下文，等同于最内层的 ContextProvider 包含的上下文。

export type { ContextState }

export const contextStore = createStore<ContextState>(() => defaultState)

// 最接近的祖先 ContextProvider 内包含的上下文。
export function useToolkitsContext() {
  return useContext(ToolkitsContext)
}

const ContextProvider: FC<PropsWithChildren<Partial<ContextState>>> = props => {
  const { children, locale, ...rest } = props
  const parentConfig = useToolkitsContext()

  const config = {
    ...parentConfig,
    ...rest,
  }

  const childNode = locale ? <LocaleProvider locale={locale}>{children}</LocaleProvider> : children

  useEffect(() => {
    contextStore.setState(config)
  }, [config])

  return <ToolkitsContext.Provider value={config}>{childNode}</ToolkitsContext.Provider>
}

if (process.env.NODE_ENV !== 'production') {
  ContextProvider.displayName = 'ContextProvider'
}

export default ContextProvider
