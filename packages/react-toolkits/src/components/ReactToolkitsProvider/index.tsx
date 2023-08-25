import type { FC, PropsWithChildren } from 'react'
import { useEffect, useRef } from 'react'
import type { ReactToolkitsState, ReactToolkitsStore } from './context'
import { createReactToolkitsStore, ReactToolkitsContext } from './context'

const ReactToolkitsProvider: FC<
  PropsWithChildren<Partial<Pick<ReactToolkitsState, 'isPermissionV2' | 'isGlobalNS' | 'menuItems' | 'title'>>>
> = props => {
  const { children, ...restProps } = props
  const storeRef = useRef<ReactToolkitsStore>()

  if (!storeRef.current) {
    storeRef.current = createReactToolkitsStore()
  }

  useEffect(() => {
    storeRef.current?.setState(restProps)
  }, [restProps])

  return <ReactToolkitsContext.Provider value={storeRef.current}>{children}</ReactToolkitsContext.Provider>
}

export default ReactToolkitsProvider