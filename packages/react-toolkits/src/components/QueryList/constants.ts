import type { ListResponse } from './types'

export const defaultProps = {
  method: 'GET',
  defaultSize: 10,
  refreshInterval: 0,
  getTotal: (response: ListResponse) => response.total,
  getDataSource: (response: ListResponse) => response.list,
}
