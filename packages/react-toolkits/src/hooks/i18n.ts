import { get, has, template } from 'lodash-es'
import { useToolkitsContext } from '../components/ContextProvider'
import zh_CN from '../locales/zh_CN'
import type { Locale } from '../types'

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${'' extends P ? '' : '.'}${P}`
    : never
  : never

type Paths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
    ? {
        [K in keyof T]-?: K extends string | number ? `${K}` | Join<K, Paths<T[K]>> : never
      }[keyof T]
    : ''

export function useTranslation() {
  const { locale = zh_CN } = useToolkitsContext()

  return (key: Paths<Locale>, data?: Record<string, unknown>) =>
    has(locale, key) ? template(get(locale, key as string))(data) : key
}
