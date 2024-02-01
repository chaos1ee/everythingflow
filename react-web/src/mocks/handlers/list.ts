import { randFullName, randNumber, toCollection } from '@ngneat/falso'
import { http } from 'msw'
import type { InfiniteListItem, ListItem } from '../../features/list'
import type { InfiniteListResponse } from '../../types'
import { jsonResolver, listResolver } from '../../utils/mock'

const handlers = [
  http.get(
    '/api/list',
    listResolver<ListItem>(() => ({
      id: randNumber(),
      name: randFullName(),
    })),
  ),
  http.get(
    '/api/infinite',
    jsonResolver<InfiniteListResponse<InfiniteListItem>>(() => ({
      hasMore: true,
      list: toCollection(
        () => ({
          id: randNumber(),
          name: randFullName(),
        }),
        { length: 2 },
      ) as InfiniteListItem[],
    })),
  ),
]

export default handlers
