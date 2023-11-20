import { datetime, listRequest } from '@/utils/mock'
import { rand, randJSON, randNumber, randText } from '@ngneat/falso'

const handlers = [
  listRequest('/api/usystem/log/list', () => ({
    id: randNumber(),
    uname: randText(),
    route: randText(),
    method: rand(['GET', 'POST']),
    label: randText(),
    request: JSON.stringify(randJSON()),
    response: JSON.stringify(randJSON()),
    ctime: datetime(),
  })),
]

export default handlers
