import { mock } from '~/utils'
import { randUuid, randWord } from '@ngneat/falso'

const { plainRequest, randomArray } = mock

const handlers = [
  plainRequest(
    '/api/instances',
    randomArray({ min: 1, max: 10 }).map(() => ({
      name: randWord(),
      id: randUuid(),
    })),
  ),
  plainRequest(
    '/api/databases',
    randomArray({ min: 1, max: 10 }).map(() => ({
      name: randWord(),
      id: randUuid(),
    })),
  ),
]

export default handlers
