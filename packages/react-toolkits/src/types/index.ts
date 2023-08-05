export interface ListResponse<T> {
  List: T[]
  Page?: number
  Total: number
}

export type PaginationParams = {
  page: number
  size: number
}
