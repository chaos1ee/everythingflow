export interface PermissionEnumItem {
  category: string
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

export interface RoleListItem {
  id: number
  name: string
  ctime: string
}

export interface Role {
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
