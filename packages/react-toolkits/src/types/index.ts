export interface UserInfo {
  authorityId: string
  exp: number
}

export interface PermissionCheckResult {
  [k: string]: boolean
}
