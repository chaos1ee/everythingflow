export interface PermissionEnumItem {
  category: string
  is_common?: boolean
  permissions: {
    label: string
    value: string
    route: string
  }[]
}

export interface RoleEnumItem {
  id: string
  name: string
}

export type RoleListItem = RoleV1 | RoleV2

export interface RoleV1 {
  id: number
  name: string
  ctime: string
  permissions: string[]
}

export interface RoleV2 {
  id: number
  name: string
  ctime: string
  permissions: Record<string, string[]>
}

export interface UserListItem {
  id: string
  name: string
  ctime: string
  roles: string[]
}
