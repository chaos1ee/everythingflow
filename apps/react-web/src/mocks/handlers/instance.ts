import { randUuid } from '@ngneat/falso'
import { RESTMethods } from 'msw'
import { mock } from '~/utils'

const { plainRequest, delay } = mock

const handlers = [
  plainRequest(
    '/api/instance/list',
    req => {
      const key = req.url.searchParams.get('key')

      console.log(key)

      return [
        {
          title: 'Child Node',
          key: randUuid(),
        },
        {
          title: 'Child Node',
          key: randUuid(),
        },
      ]
    },
    RESTMethods.GET,
    delay(1000),
  ),
]

export default handlers
