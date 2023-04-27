import jwtDecode from 'jwt-decode'

export function decode (token: string) {
  try {
    return jwtDecode(token)
  } catch (_) {
    return null
  }
}
