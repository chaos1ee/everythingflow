/* eslint-disable camelcase */
import en_GB from '@/locales/en_GB'
import zh_CN from '@/locales/zh_CN'
import * as i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

export const defaultNS = 'default'

const resources = {
  zh_CN: {
    default: zh_CN,
  },
  en_GB: {
    default: en_GB,
  },
} as const

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS
    resources: (typeof resources)['zh_CN']
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'zh_CN',
    debug: false,
    load: 'languageOnly',
    interpolation: {
      escapeValue: false,
    },
    ns: Object.keys(resources.zh_CN),
    defaultNS,
    resources,
    detection: {
      lookupLocalStorage: 'locale',
    },
  })

export default i18n
