/* eslint-disable @typescript-eslint/no-explicit-any */
export const defaultProps = {
  method: 'GET',
  defaultSize: 10,
  refreshInterval: 0,
  getTotal: (response: any) => response.total,
  getDataSource: (response: any) => response.list,
}
