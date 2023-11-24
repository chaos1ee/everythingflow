import { SECRET } from '@/constants'
import * as jose from 'jose'
import type { ResponseResolver } from 'msw'
import { HttpResponse, passthrough } from 'msw'
import type { Head } from 'ts-essentials'

const ignoredPaths = ['/api/usystem/user/login', '/api/server/game/develop/token', '/api/server/game/develop/signup']

export function withAuth() {
  return async (input: Head<Parameters<ResponseResolver>>) => {
    const { request } = input
    const url = new URL(request.url)

    if (ignoredPaths.some(item => item.startsWith(url.pathname))) {
      passthrough()
    } else {
      try {
        await jose.jwtVerify(request.headers.get('Authorization')?.replace('Bearer ', '') ?? '', SECRET)
        passthrough()
      } catch (_) {
        return new HttpResponse(null, { status: 401 })
      }
    }
  }
}
