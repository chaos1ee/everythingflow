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

  type PaginationParams<T extends object = object> = T & { page: number; size: number }
}
