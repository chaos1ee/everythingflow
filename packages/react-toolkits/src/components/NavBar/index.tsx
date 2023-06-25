/* eslint-disable @typescript-eslint/no-explicit-any */
import Icon, * as Icons from '@ant-design/icons'
import { Menu } from 'antd'
import type {
  ItemType,
  MenuDividerType,
  MenuItemGroupType,
  MenuItemType,
  SubMenuType,
} from 'antd/es/menu/hooks/useItems'
import type { FC, ForwardRefExoticComponent, ReactNode } from 'react'
import { useCallback, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { Merge } from 'ts-essentials'
import { useMenuStore } from '../../stores'

// 扩展 antd Menu 的类型，使其支持一些我们想要的自定义字段。
export type MenuItemType2 = Merge<
  Omit<MenuItemType, 'icon'>,
  {
    code /** 权限编号 **/?: string
    route /** 前端路由地址 **/?: string
    icon?: string
  }
>

export type SubMenuType2 = Merge<
  Omit<SubMenuType, 'icon'>,
  {
    children?: ItemType2[]
    icon?: string
  }
>

export type MenuItemGroupType2 = Merge<MenuItemGroupType, { children?: ItemType2[] }>

export type ItemType2 = MenuItemType2 | SubMenuType2 | MenuItemGroupType2 | MenuDividerType | null

const withLink = (label?: ReactNode, route?: string): ReactNode => {
  if (!label) {
    return <></>
  }

  if (route) {
    return <Link to={route}>{label}</Link>
  }

  return label
}

/**
 * 转换导航配置，主要做了以下几件事情
 * 1. 用 Link 元素包装 route
 * 2. 收集 code，用于权限判断
 */
function transformItems(items: ItemType2[]) {
  const result: ItemType[] = []

  for (let i = 0; i < items.length; i++) {
    if (items[i] === null) {
      result[i] = null
    } else if ((items[i] as MenuDividerType).type === 'divider') {
      result[i] = { ...items[i] } as MenuDividerType
    } else {
      // 引入 icon
      const iconName = (items[i] as MenuItemType2 | SubMenuType2).icon

      if ((items[i] as SubMenuType2 | MenuItemGroupType2).children) {
        const { children, ...restProps } = items[i] as SubMenuType2 | MenuItemGroupType2
        result[i] = {
          ...restProps,
          children: transformItems(children ?? []),
          icon: iconName ? <Icon component={(Icons as any)[iconName] as ForwardRefExoticComponent<any>} /> : null,
        } as SubMenuType | MenuItemGroupType
      } else {
        const { route, label, code, ...restProps } = items[i] as MenuItemType2
        // 屏蔽权限检查
        // const isPass = await check(code)
        const isPass = true

        result[i] = isPass
          ? ({
              ...restProps,
              label: withLink(label, route),
              icon: iconName ? <Icon component={(Icons as any)[iconName] as ForwardRefExoticComponent<any>} /> : null,
            } as MenuItemType)
          : null
      }
    }
  }

  return result
}

// 拍平导航配置，并且注入 keypath 字段
function flatItems(
  items: ItemType2[],
  result: Merge<MenuItemType2, { keypath?: string[] }>[] = [],
  keypath: string[] = [],
) {
  for (const item of items) {
    const children = (item as SubMenuType2 | MenuItemGroupType2)!.children as ItemType2[]

    if (Array.isArray(children)) {
      const _keys =
        (item as MenuItemGroupType2)!.type !== 'group' && item!.key ? [...keypath, item!.key as string] : keypath
      flatItems(children, result, _keys)
    } else {
      result.push(Object.assign(item as MenuItemType2, { keypath }))
    }
  }

  return result
}

export interface NavBarProps {
  navs: ItemType2[]
}

const NavBar: FC<NavBarProps> = props => {
  const { navs } = props
  const location = useLocation()
  const flattenItems = useMemo(() => flatItems(navs ?? []), [navs])
  const internalItems = useMemo(() => transformItems(navs ?? []), [navs])

  const openKeys = useMenuStore(state => state.openKeys)
  const selectedKeys = useMenuStore(state => state.selectedKeys)
  const setOpenKeys = useMenuStore(state => state.setOpenKeys)
  const setSelectedKeys = useMenuStore(state => state.setSelectedKeys)

  const onOpenChange = useCallback(
    (keys: string[]) => {
      const latestOpenKey = keys?.find(key => openKeys?.indexOf(key) === -1)
      const match = flattenItems.find(item => latestOpenKey === item.key)
      const _openKeys = (match?.keypath ?? [latestOpenKey]) as string[]
      setOpenKeys(_openKeys)
    },
    [flattenItems, openKeys, setOpenKeys],
  )

  useEffect(() => {
    const match = flattenItems.find(item => location.pathname === item.route)

    if (match) {
      const key = match.key as string
      const keypath = match.keypath as string[]
      setSelectedKeys([key])
      setOpenKeys(keypath)
    }
  }, [flattenItems, location, setOpenKeys, setSelectedKeys])

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
}

export default NavBar
