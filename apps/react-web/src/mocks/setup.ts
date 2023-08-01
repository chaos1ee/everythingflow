import * as jose from 'jose'
import type { ResponseComposition, RestContext, RestHandler, RestRequest } from 'msw'
import { rest, setupWorker } from 'msw'
import { SECRET } from '~/constants'

function glob<T>(r: __WebpackModuleApi.RequireContext): T[] {
  const ret: T[] = []

  r.keys().forEach(key => {
    ret.push(...r(key).default)
  })

  return ret
}

const handlers = glob<RestHandler>(require.context('./handlers', false, /\.ts$/))

async function tokenResolver(req: RestRequest, res: ResponseComposition, ctx: RestContext) {
  const ignoredPaths = ['/usystem/user/login', '/server/game/develop/token', '/server/game/develop/signup']

  if (ignoredPaths.includes(req.url.pathname.replace('/api', ''))) {
    req.passthrough()
  } else {
    try {
      await jose.jwtVerify(req.headers.get('authorization')?.replace('Bearer ', '') ?? '', SECRET)
      req.passthrough()
    } catch (_) {
      return res(ctx.status(401), ctx.body('Unauthorized'))
    }
  }
}

handlers.unshift(rest.all('/api/*', tokenResolver))
handlers.unshift(rest.all('/proxy/*', tokenResolver))

// Mock all requests to /api/* with 200 OK
handlers.push(
  ...['/api/*'].map(path =>
    rest.all(path, (_, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          code: 0,
          msg: 'ok',
        }),
      ),
    ),
  ),
)

export const worker = setupWorker(...handlers)
