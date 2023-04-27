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

  interface PaginationParams<T> extends T {
    page: number
    size: number
  }
}
