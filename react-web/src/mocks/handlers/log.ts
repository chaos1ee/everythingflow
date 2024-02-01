import { rand, randJSON, randNumber, randText } from '@ngneat/falso'
import { http } from 'msw'
import { datetime, listResolver } from '../../utils/mock'

const handlers = [
  http.get(
    '/api/usystem/log/list',
    listResolver(() => ({
      id: randNumber(),
      uname: randText(),
      route: randText(),
      method: rand(['GET', 'POST']),
      label: randText(),
      request: JSON.stringify(randJSON()),
      response: JSON.stringify(randJSON()),
      ctime: datetime(),
    })),
  ),
]

export default handlers
