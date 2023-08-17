import { RESTMethods } from 'msw'
import { mock } from '~/utils'
import type { InstanceTreeNode } from '~/features/instance'
import { rand, randDirectoryPath, randUuid, randWord } from '@ngneat/falso'

const { plainRequest, delay } = mock

const handlers = [
  plainRequest<InstanceTreeNode>(
    '/api/instance/tree',
    () => {
      return {
        id: randUuid(),
        name: randWord(),
        path: '/',
        children: [
          {
            id: randUuid(),
            name: randWord(),
            path: randDirectoryPath(),
            db_type: rand(['mysql', 'redis']),
            children: [
              {
                id: randUuid(),
                name: randWord(),
                path: randDirectoryPath(),
                db_type: rand(['mysql', 'redis']),
                children: [
                  {
                    id: randUuid(),
                    name: randWord(),
                    path: randDirectoryPath(),
                    db_type: rand(['mysql', 'redis']),
                  },
                ],
              },
              {
                id: randUuid(),
                name: randWord(),
                path: randDirectoryPath(),
                db_type: rand(['mysql', 'redis']),
              },
            ],
          },
          {
            id: randUuid(),
            name: randWord(),
            path: randDirectoryPath(),
            db_type: rand(['mysql', 'redis']),
            children: [
              {
                id: randUuid(),
                name: randWord(),
                path: randDirectoryPath(),
                db_type: rand(['mysql', 'redis']),
              },
              {
                id: randUuid(),
                name: randWord(),
                path: randDirectoryPath(),
                db_type: rand(['mysql', 'redis']),
              },
            ],
          },
          {
            id: randUuid(),
            name: randWord(),
            path: randDirectoryPath(),
            db_type: rand(['mysql', 'redis']),
          },
        ],
      }
    },
    RESTMethods.GET,
    delay(1000),
  ),
]

export default handlers
