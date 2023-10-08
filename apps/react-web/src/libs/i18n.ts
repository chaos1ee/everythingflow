/* eslint-disable camelcase */
import * as i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en_GB from '@/locales/en_GB'
import ja_JP from '@/locales/ja_JP'
import ko_KR from '@/locales/ko_KR'
import zh_CN from '@/locales/zh_CN'

export const defaultNS = 'default'

const resources = {
  en_GB: {
    default: en_GB,
  },
  zh_CN: {
    default: zh_CN,
  },
  ja_JP: {
    default: ja_JP,
  },
  ko_KR: {
    default: ko_KR,
  },
} as const

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS
    resources: (typeof resources)['en_GB']
  }
}

await i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    load: 'currentOnly',
    interpolation: {
      escapeValue: false,
    },
    fallbackLng: 'en_GB',
    ns: Object.keys(resources.en_GB),
    defaultNS,
    resources,
    detection: {
      lookupLocalStorage: 'i18n',
    },
  })

export default i18n
