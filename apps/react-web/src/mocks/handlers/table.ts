import { mock } from '~/utils'
import { randFullName, randSentence, randUuid, randWord } from '@ngneat/falso'
import type { TableListItem, VersionListItem } from '~/features/table'

const { listRequest, plainRequest, datetime, randomArray, delay } = mock

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
]

export default handlers
