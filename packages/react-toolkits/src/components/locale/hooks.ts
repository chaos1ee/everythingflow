import { get, has, template } from 'lodash-es'
import { useContext, useMemo } from 'react'
import type { Locale } from '.'
import type { LocaleContextProps } from './context'
import LocaleContext from './context'
import defaultLocale from './zh_CN'

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
  const localeFromContext = useContext<LocaleContextProps | undefined>(LocaleContext)

  const locale = {
    ...defaultLocale,
    ...localeFromContext,
  }

  const t = useMemo(
    () => (key: Paths<Locale>, data?: Record<string, unknown>) =>
      has(locale, key) ? template(get(locale, key as string))(data) : key,
    [locale],
  )

  return { t }
}
