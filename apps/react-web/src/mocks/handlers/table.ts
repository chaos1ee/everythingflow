import { datetime, listRequest, plainRequest, randomArray } from '@/utils/mock'
import { randDatabase, randFullName, randSentence, randUuid, randWord } from '@ngneat/falso'
import type { TableListItem, VersionListItem } from '@/features/table'

const handlers = [
  listRequest<TableListItem>('/api/tables', () => ({
    id: randUuid(),
    name: randWord(),
    ctime: datetime(),
  })),
  listRequest<VersionListItem>('/api/version/list', () => ({
    id: randUuid(),
    name: randWord(),
    comment: randSentence(),
    ctime: datetime(),
    auth: randFullName(),
  })),
  plainRequest(
    '/api/databases',
    randomArray({ min: 1, max: 10 }).map(() => ({
      name: randDatabase(),
      id: randUuid(),
    })),
  ),
]

export default handlers
