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
import type { FC } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { Merge } from 'ts-essentials'
import { OPEN_KEYS, SELECTED_KEYS } from '../constants'
import { json } from '../utils'
import { useGames } from './hooks'
import { Translation } from 'react-i18next'

// 扩展 antd Menu 的类型，使其支持一些我们想要的自定义字段。
type MenuItemType2 = Merge<
  Omit<MenuItemType, 'label' | 'icon'>,
  {
    code /** 权限编号 **/?: string
    route /** 前端路由地址 **/?: string
    i18nKey?: string
    icon?: string
  }
>

type SubMenuType2 = Merge<
  Omit<SubMenuType, 'label' | 'icon'>,
  {
    children?: ItemType2[]
    i18nKey?: string
    icon?: string
  }
>

type MenuItemGroupType2 = Merge<Omit<MenuItemGroupType, 'label'>, { children?: ItemType2[]; i18nKey?: string }>

export type ItemType2 = MenuItemType2 | SubMenuType2 | MenuItemGroupType2 | MenuDividerType | null

const withLink = (label?: React.ReactNode, route?: string): React.ReactNode => {
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
 * 2. 收集 code，用于权限判断（未支持）
 */
async function transformItems(items: ItemType2[]) {
  const result: ItemType[] = []

  for (let i = 0; i < items.length; i++) {
    if (items[i] === null) {
      result[i] = null
    } else if ((items[i] as MenuDividerType).type === 'divider') {
      result[i] = { ...items[i] } as MenuDividerType
    } else {
      const Label = () => (
        <Translation>
          {t => <>{t(`nav:${(items[i] as Exclude<ItemType2, MenuDividerType | null>).i18nKey}`)}</>}
        </Translation>
      )
      // 引入 icon
      const iconName = (items[i] as MenuItemType2 | SubMenuType2).icon
      const icon = iconName ? (
        <Icon component={(Icons as any)[iconName] as React.ForwardRefExoticComponent<any>} />
      ) : null

      if ((items[i] as SubMenuType2 | MenuItemGroupType2).children) {
        const { children, i18nKey, ...restProps } = items[i] as SubMenuType2 | MenuItemGroupType2
        result[i] = {
          ...restProps,
          label: <Label />,
          children: await transformItems(children ?? []),
          icon,
        } as SubMenuType | MenuItemGroupType
      } else {
        const { route, i18nKey, code, ...restProps } = items[i] as MenuItemType2
        // 屏蔽权限检查
        // const isPass = await check(code)
        const isPass = true

        result[i] = isPass
          ? ({
              ...restProps,
              label: withLink(<Label />, route),
              icon,
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

interface NavBarProps {
  items: ItemType2[]
}

const NavBar: FC<NavBarProps> = props => {
  const { items } = props
  const { game } = useGames()
  const location = useLocation()
  const flattenItems = useMemo(() => flatItems(items ?? []), [items])
  const [internalItems, setInternalItems] = useState<ItemType[]>([])
  const localOpenKeys = json.parseJsonStr(localStorage.getItem(OPEN_KEYS) as string, [])
  const localSelectedKeys = json.parseJsonStr(localStorage.getItem(SELECTED_KEYS) as string, [])
  const [openKeys, setOpenKeys] = useState<string[]>(localOpenKeys)
  const [selectedKeys, setSelectedKeys] = useState<string[]>(localSelectedKeys)

  const onOpenChange = useCallback(
    (keys: string[]) => {
      const latestOpenKey = keys?.find(key => openKeys?.indexOf(key) === -1)
      const match = flattenItems.find(item => latestOpenKey === item.key)
      const _openKeys = (match?.keypath ?? [latestOpenKey]) as string[]
      setOpenKeys(_openKeys)
      localStorage.setItem(OPEN_KEYS, JSON.stringify(_openKeys))
    },
    [openKeys, flattenItems],
  )

  useEffect(() => {
    const setItems = async () => {
      setInternalItems(await transformItems(items ?? []))
    }

    setItems().then()
  }, [items, game])

  useEffect(() => {
    const match = flattenItems.find(item => location.pathname === item.route)

    if (match) {
      const key = match.key as string
      const keypath = match.keypath as string[]
      setSelectedKeys([key])
      localStorage.setItem(SELECTED_KEYS, JSON.stringify([key]))
      setOpenKeys(keypath)
      localStorage.setItem(OPEN_KEYS, JSON.stringify(keypath))
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
}

export default NavBar
