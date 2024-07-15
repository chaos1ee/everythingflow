/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ListResponse<T = any> {
  list: T[]
  total: number
}
