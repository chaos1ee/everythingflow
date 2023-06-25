import { createQueryKeys } from '@lukemorales/query-key-factory'
import type { RoleListItem } from '../types'
import { createHttpClient } from '../../../httpClient'

const httpClient = createHttpClient({ headers: { 'app-id': 'global' } })

const queries = createQueryKeys('/usystem', {
  '/usystem/user/list': (filters: PaginationParams) => ({
    queryKey: [filters],
    queryFn: () => {
      return httpClient.get('/usystem/user/list', { params: filters })
    },
  }),
  '/usystem/role/list': (filters: PaginationParams) => ({
    queryKey: [filters],
    queryFn: () => {
      return httpClient.get<ListResponse<RoleListItem>>('/usystem/role/list', {
        params: filters,
      })
    },
  }),
})

export default queries
