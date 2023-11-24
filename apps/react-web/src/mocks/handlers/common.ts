import type { VersionListItem, VersionRecordListItem } from '@/features/common'
import { datetime, listResolver2 } from '@/utils/mock'
import { rand, randFullName, randNumber, randSentence, randUuid, randWord } from '@ngneat/falso'
import { http } from 'msw'

const handlers = [
  http.get(
    '/api/version/list',
    listResolver2<VersionListItem>(() => ({
      id: randUuid(),
      name: randWord(),
      comment: randSentence(),
      ctime: datetime(),
      auth: randFullName(),
    })),
  ),
  http.get(
    '/api/version/operate',
    listResolver2<VersionRecordListItem>(() => ({
      id: randNumber(),
      version_id: randNumber(),
      auth: randFullName(),
      type: randNumber(),
      comment: randSentence(),
      ctime: datetime(),
      type_name: rand(['更新', '创建']),
    })),
  ),
]

export default handlers
