import { tokenResolver } from '@/utils/mock'
import { http, HttpResponse } from 'msw'
import { setupWorker } from 'msw/browser'

const modules = import.meta.glob('./handlers/*.ts')

async function loadModules() {
  const importPromises = Object.values(modules).map(func => func())
  const importedModules = await Promise.all(importPromises)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return importedModules.flatMap((mod: any) => mod.default)
}

const handlers = await loadModules()

handlers.unshift(http.all('/api/*', tokenResolver))

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
