import { request } from './request'

export interface UserInfo {
  authorityId: string
  exp: number
}

export interface ServerSimpleListItem {
  Id: string
  Name: string
}

export interface PermissionCheckResult {
  [k: string]: boolean
}

export function login(ticket: string) {
  return request.get<{ token: string }>('/usystem/user/login', {
    params: { ticket },
  })
}

export function check(code?: string) {
  if (!code) {
    return Promise.resolve(true)
  }

  return request
    .post<{ has_all: true } | PermissionCheckResult>('/usystem/user/check', {
      permissions: [code],
    })
    .then((res: { has_all: boolean } | PermissionCheckResult) => {
      if (res.has_all) {
        return true
      } else {
        return !!(res as PermissionCheckResult)[code]
      }
    })
}

export function batchCheck<T extends string>(codes: Record<T, string>): Promise<Record<T, boolean>> {
  return request
    .post<{ has_all: true } | PermissionCheckResult>('/usystem/user/check', {
      permissions: Object.values(codes),
    })
    .then((res: { has_all: boolean } | PermissionCheckResult) => {
      if (res.has_all) {
        return Object.keys(codes).reduce((acc, curr) => {
          acc[curr as T] = true
          return acc
        }, {} as Record<T, boolean>)
      }

      return Object.entries(codes).reduce((acc, curr) => {
        acc[curr[0] as T] = !!(res as PermissionCheckResult)[curr[1] as string]
        return acc
      }, {} as Record<T, boolean>)
    })
}

export function getServerListSimple() {
  return request.get<ListResponse<ServerSimpleListItem>>('/server/kingdom/simple')
}
