import type { TableListItem, VersionListItem } from '@/features/common'
import { datetime, jsonResolver, listResolver } from '@/utils/mock'
import { randDatabase, randFullName, randSentence, randUuid, randWord, toCollection } from '@ngneat/falso'
import { http } from 'msw'

const handlers = [
  http.get(
    '/api/tables',
    listResolver<TableListItem>(() => ({
      id: randUuid(),
      name: randWord(),
      ctime: datetime(),
    })),
  ),
  http.get(
    '/api/version/list',
    listResolver<VersionListItem>(() => ({
      id: randUuid(),
      name: randWord(),
      comment: randSentence(),
      ctime: datetime(),
      auth: randFullName(),
    })),
  ),
  http.get(
    '/api/databases',
    jsonResolver(
      toCollection(
        () => ({
          name: randDatabase(),
          id: randUuid(),
        }),
        { length: 10 },
      ),
    ),
  ),
]

export default handlers
