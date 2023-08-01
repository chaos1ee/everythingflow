import { randNumber, randPastDate } from '@ngneat/falso'
import dayjs from 'dayjs'
import type { Path, ResponseTransformer, RestRequest } from 'msw'
import { context, rest, RESTMethods } from 'msw'

function randomArray({ min, max }: { min: number; max: number }) {
  return Array.from({ length: randNumber({ min, max, precision: 1 }) })
}

function getRequestMethod(method: RESTMethods = RESTMethods.GET) {
  switch (method) {
    case RESTMethods.POST:
      return rest.post
    case RESTMethods.PUT:
      return rest.put
    case RESTMethods.HEAD:
      return rest.head
    case RESTMethods.OPTIONS:
      return rest.options
    case RESTMethods.DELETE:
      return rest.delete
    case RESTMethods.PATCH:
      return rest.patch
    default:
      return rest.get
  }
}

function isFunctionType<T>(
  type: T | ((req: RestRequest) => T | Promise<T>),
): type is (req: RestRequest) => T | Promise<T> {
  return typeof type === 'function'
}

function plainRequest<T>(
  path: Path,
  data: T | ((req: RestRequest) => Promise<T> | T),
  method: RESTMethods = RESTMethods.GET,
  ...transformers: ResponseTransformer[]
) {
  const request = getRequestMethod(method)

  return request(path, async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        msg: 'ok',
        data: isFunctionType(data) ? await data(req) : data,
      }),
      ...transformers,
    )
  })
}

function listRequest<T>(
  path: Path,
  mockFn: (req: RestRequest) => T,
  method: RESTMethods = RESTMethods.GET,
  ...transformers: ResponseTransformer[]
) {
  const request = getRequestMethod(method)

  return request(path, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        msg: 'ok',
        data: {
          List: randomArray({ min: 1, max: 10 }).map(mockFn.bind(null, req)),
          Page: 1,
          Total: 24,
        },
      }),
      ...transformers,
    )
  })
}

function datetime() {
  return dayjs(randPastDate()).format('YYYY-MM-DD HH:mm:ss')
}

function timeStamp() {
  return dayjs(randPastDate()).valueOf()
}

function unixTimestamp() {
  return dayjs(randPastDate()).unix()
}

const delay = context.delay

export const mock = {
  listRequest,
  plainRequest,
  randomArray,
  datetime,
  timeStamp,
  unixTimestamp,
  delay,
}
