/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ListResponse<T = any> {
  List: T[]
  Total: number
}

export interface InfiniteListResponse<T = any> {
  list: T[]
  hasMore: boolean
}
