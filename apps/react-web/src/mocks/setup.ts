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

const ignoredPaths = ['/api/usystem/user/login', '/api/server/game/develop/token', '/api/server/game/develop/signup']

async function tokenResolver(req: RestRequest, res: ResponseComposition, ctx: RestContext) {
  if (ignoredPaths.includes(req.url.pathname)) {
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

// 所有发送到 /api/* 且未被匹配的请求返回 200 OK
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
