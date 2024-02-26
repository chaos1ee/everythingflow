import type { MenuProps } from 'antd'
import { Menu } from 'antd'
import type {
  ItemType,
  MenuDividerType,
  MenuItemGroupType,
  MenuItemType,
  SubMenuType,
} from 'antd/es/menu/hooks/useItems'
import type { ReactNode } from 'react'
import { memo, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { Merge } from 'ts-essentials'
import { usePermissions } from '../../hooks/permission'
import { useToolkitsContext } from '../ContextProvider'
import { useNavStore } from '../NavMenu/store'

// 扩展 antd Menu 的类型，使其支持一些我们想要的自定义字段。
type MenuItemType2 = Merge<
  MenuItemType,
  {
    // 权限编号
    code?: string
    // 前端路由地址
    route?: string
  }
>

type SubMenuType2 = Merge<
  SubMenuType,
  {
    children?: NavMenuItem[]
  }
>

type MenuItemGroupType2 = Merge<MenuItemGroupType, { children?: NavMenuItem[] }>

export type NavMenuItem = MenuItemType2 | SubMenuType2 | MenuItemGroupType2 | MenuDividerType | null

const withLink = (label?: ReactNode, route?: string): ReactNode => {
  if (route) {
    return <Link to={route}>{label}</Link>
  }

  return label
}

function checkChildren(children: NavMenuItem[], permissions?: Record<string, boolean>): boolean {
  return (children ?? []).some(child => {
    if (child === null) {
      return false
    } else if ((child as MenuDividerType).type === 'divider') {
      return true
    } else {
      if ((child as SubMenuType2 | MenuItemGroupType2).children) {
        return checkChildren((child as SubMenuType2 | MenuItemGroupType2).children ?? [], permissions)
      } else {
        return !permissions || !(child as MenuItemType2).code || permissions[(child as MenuItemType2).code as string]
      }
    }
  })
}

function transformItems(items: NavMenuItem[], permissions?: Record<string, boolean>) {
  const result: ItemType[] = []

  for (let i = 0; i < items.length; i++) {
    if (items[i] === null) {
      result[i] = null
    } else if ((items[i] as MenuDividerType).type === 'divider') {
      result[i] = { ...items[i] } as MenuDividerType
    } else {
      if ((items[i] as SubMenuType2 | MenuItemGroupType2).children) {
        const { children, ...restProps } = items[i] as SubMenuType2 | MenuItemGroupType2

        result[i] = checkChildren(children ?? [], permissions)
          ? ({
              ...restProps,
              children: transformItems(children ?? [], permissions),
            } as SubMenuType | MenuItemGroupType)
          : null
      } else {
        const { route, label, code, ...restProps } = items[i] as MenuItemType2
        const isPass = !code || !permissions || permissions[code]

        result[i] = isPass
          ? ({
              ...restProps,
              label: withLink(label, route),
            } as MenuItemType)
          : null
      }
    }
  }

  return result
}

// 拍平导航配置，并且注入 keypath 字段
function flatItems(
  items: NavMenuItem[],
  result: Merge<MenuItemType2, { keypath?: string[] }>[] = [],
  keypath: string[] = [],
) {
  for (const item of items) {
    const children = (item as SubMenuType2 | MenuItemGroupType2)!.children as NavMenuItem[]

    if (Array.isArray(children)) {
      const keys =
        (item as MenuItemGroupType2)!.type !== 'group' && item!.key ? [...keypath, item!.key as string] : keypath
      flatItems(children, result, keys)
    } else {
      result.push(Object.assign(item as MenuItemType2, { keypath }))
    }
  }

  return result
}

const NavMenu = memo(function NavMenu() {
  const location = useLocation()
  const { menuItems } = useToolkitsContext()
  const flattenItems = useMemo(() => flatItems(menuItems ?? []), [menuItems])
  const codes = flattenItems.map(item => item.code).filter(Boolean) as string[]
  const { data: permissions } = usePermissions(codes, true, { suspense: true })
  const internalItems = useMemo(() => transformItems(menuItems ?? [], permissions), [menuItems, permissions])
  const { openKeys, selectedKeys, setOpenKeys, setSelectedKeys } = useNavStore()

  const onOpenChange: MenuProps['onOpenChange'] = keys => {
    const latestOpenKey = keys?.find(key => openKeys?.indexOf(key) === -1)
    const match = flattenItems.find(item => latestOpenKey === item.key)
    setOpenKeys((match?.keypath ?? [latestOpenKey]) as string[])
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
