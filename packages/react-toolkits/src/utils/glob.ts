export function importAll<T> (r: __WebpackModuleApi.RequireContext): T[] {
  const ret: T[] = []

  r.keys().forEach(key => {
    ret.push(...r(key).default)
  })

  return ret
}
