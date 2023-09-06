import { mock } from '~/utils'
import { randUuid, randWord } from '@ngneat/falso'
import type { TableListItem } from '~/features/table'

const { listRequest, datetime } = mock

const handlers = [
  listRequest<TableListItem>('/api/tables', () => ({
    id: randUuid(),
    name: randWord(),
    ctime: datetime(),
  })),
]

export default handlers
