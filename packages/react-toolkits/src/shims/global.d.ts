import type { Merge } from 'ts-essentials'

export {}

declare global {
  interface BackendResponse<T> {
    code: number
    msg: string
    data: T
  }

  interface ListResponse<T> {
    List: T[]
    Page?: number
    PerPage?: number
    Total?: number
  }

  type PaginationParams = Merge<
    { page: number },
    | {
        size: number
        per?: never
      }
    | {
        size?: never
        per: number
      }
  >
}
