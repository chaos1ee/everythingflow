import { createQueryKeys } from '@lukemorales/query-key-factory'
import type { RoleListItem, UserListItem } from '../types'
import { createHttpClient } from '../../../httpClient'

const httpClient = createHttpClient({ headers: { 'app-id': 'global' } })

const queries = createQueryKeys('permission', {
  '/usystem/user/list': (filters: PaginationParams) => ({
    queryKey: [filters],
    queryFn: () => {
      return httpClient.get<ListResponse<UserListItem>>('/usystem/user/list', {
        params: filters,
        headers: {
          'app-id': 'global',
        },
      })
    },
  }),
  '/usystem/role/list': (filters: PaginationParams) => ({
    queryKey: [filters],
    queryFn: () => {
      return httpClient.get<ListResponse<RoleListItem>>('/usystem/role/list', {
        params: filters,
        headers: {
          'app-id': 'global',
        },
      })
    },
  }),
})

export default queries
