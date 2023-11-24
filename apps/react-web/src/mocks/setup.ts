import { withAuth } from '@/mocks/middleware'
import type { HttpHandler } from 'msw'
import { http, HttpResponse } from 'msw'
import { setupWorker } from 'msw/browser'

const handlers = glob<HttpHandler>(require.context('./handlers', false, /\.ts$/))

handlers.unshift(http.all('/api/*', withAuth()))

// 所有发送到 /api/* 但未被匹配的请求返回 200 OK
handlers.push(
  http.all('/api/*', () => {
    return HttpResponse.json({
      code: 0,
      msg: 'ok',
    })
  }),
)

export const worker = setupWorker(...handlers)

function glob<T>(r: __WebpackModuleApi.RequireContext): T[] {
  const ret: T[] = []

  r.keys().forEach(key => {
    ret.push(...r(key).default)
  })

  return ret
}
