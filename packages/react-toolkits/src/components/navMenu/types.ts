import type { MenuDividerType, MenuItemGroupType, MenuItemType, SubMenuType } from 'antd/es/menu/interface'
import type { Merge } from 'ts-essentials'

// 扩展 antd Menu 的类型，使其支持一些我们想要的自定义字段。
export type MenuItemType2 = Merge<
  MenuItemType,
  {
    // 权限编号
    code?: string
    // 前端路由地址
    route?: string
  }
>

export type SubMenuType2 = Merge<
  SubMenuType,
  {
    children?: NavMenuItem[]
  }
>

export type MenuItemGroupType2 = Merge<MenuItemGroupType, { children?: NavMenuItem[] }>

export type NavMenuItem = MenuItemType2 | SubMenuType2 | MenuItemGroupType2 | MenuDividerType | null
