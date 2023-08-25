import { mock } from '~/utils'
import { randUuid, randWord } from '@ngneat/falso'
import { rest } from 'msw'

const { plainRequest, randomArray } = mock

const handlers = [
  plainRequest(
    '/api/instances',
    randomArray({ min: 1, max: 10 }).map(() => ({
      name: randWord(),
      id: randUuid(),
    })),
  ),
  rest.get('/api/databases', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ code: 1000, msg: '获取数据库出错' }))
  }),
]

export default handlers
