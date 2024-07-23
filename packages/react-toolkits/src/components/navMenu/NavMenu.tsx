import type { MenuProps } from 'antd'
import { Menu } from 'antd'
import { memo, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { usePermissions } from '../../hooks/permission'
import { useToolkitsContext } from '../contextProvider'
import { useNavStore } from './store'
import { flatItems, transformItems } from './utils'

const NavMenu = memo(function NavMenu() {
  const location = useLocation()
  const { menuItems } = useToolkitsContext()
  const flattenItems = useMemo(() => flatItems(menuItems ?? []), [menuItems])
  const codes = flattenItems.map(item => item.code).filter(Boolean) as string[]
  const { data: permissions } = usePermissions(codes, true, { suspense: true })
  const internalItems = useMemo(() => transformItems(menuItems ?? [], permissions), [menuItems, permissions])
  const { openKeys, selectedKeys, setOpenKeys, setSelectedKeys } = useNavStore()

  const onOpenChange: MenuProps['onOpenChange'] = keys => {
    const lastOpenKey = keys?.find(key => openKeys?.indexOf(key) === -1)
    const match = flattenItems.find(item => lastOpenKey === item.key)
    setOpenKeys((match?.keypath ?? [lastOpenKey]) as string[])
  }

  useEffect(() => {
    const match = flattenItems.find(item => location.pathname === item.route)

    if (match) {
      const key = match.key as string
      const keypath = match.keypath as string[]
      setSelectedKeys([key])
      setOpenKeys(keypath)
    }
  }, [flattenItems, location])

  return (
    <Menu
      style={{ borderRight: 'none' }}
      items={internalItems}
      mode="inline"
      openKeys={openKeys}
      selectedKeys={selectedKeys}
      onOpenChange={onOpenChange}
    />
  )
})

if (process.env.NODE_ENV === 'development') {
  NavMenu.displayName = 'NavMenu'
}

export default NavMenu
