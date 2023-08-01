import type { ItemType2 } from '@/layouts/NavBar'

export interface UserInfo {
  authorityId: string
  exp: number
}

export interface LoaderData {
  navs: ItemType2[] // 导航栏数据
}

export interface BackendResponse<T> {
  code: number
  msg: string
  data: T
}

export interface ListResponse<T> {
  List: T[]
  Page: number
  Total: number
}

export type PaginationParams = {
  page: number
  perPage: number
}
