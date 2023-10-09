// eslint-disable-next-line camelcase
import en_GB from '@/locales/en_GB'
import { useToolkitsContext } from '@/components/ContextProvider'
import { get, has, template } from 'lodash-es'
import type { Locale } from '@/locales'

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
  const { locale = en_GB } = useToolkitsContext()

  return (key: Paths<Locale>, data?: Record<string, unknown>) =>
    has(locale, key) ? template(get(locale, key as string))(data) : key
}
