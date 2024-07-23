import type { ItemType, MenuDividerType, MenuItemGroupType, MenuItemType, SubMenuType } from 'antd/es/menu/interface'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Merge } from 'ts-essentials'
import type { MenuItemGroupType2, MenuItemType2, NavMenuItem, SubMenuType2 } from './types'

const withLink = (label?: ReactNode, route?: string): ReactNode => {
  if (route) {
    return <Link to={route}>{label}</Link>
  }

  return label
}

export function checkChildren(children: NavMenuItem[], permissions?: Record<string, boolean>): boolean {
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

export function transformItems(items: NavMenuItem[], permissions?: Record<string, boolean>) {
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
export function flatItems(
  items: NavMenuItem[],
  result: Merge<MenuItemType2, { keypath?: string[] }>[] = [],
  keypath: string[] = [],
) {
  for (const item of items) {
    const children = (item as SubMenuType2 | MenuItemGroupType2)?.children as NavMenuItem[]

    if (Array.isArray(children)) {
      const keys =
        (item as MenuItemGroupType2)!.type !== 'group' && item!.key ? [...keypath, item!.key as string] : keypath
      flatItems(children, result, keys)
    } else if (item) {
      result.push(Object.assign(item as MenuItemType2, { keypath }))
    }
  }

  return result
}
