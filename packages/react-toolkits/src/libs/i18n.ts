import * as i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import enUs from '../locales/en_US.yaml'
import zhCn from '../locales/zh_CN.yaml'

// TODO: support typescript https://react.i18next.com/latest/typescript

const resources = {
  en_US: {
    common: enUs,
  },
  zh_CN: {
    common: zhCn,
  },
} as const

await i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    load: 'currentOnly',
    interpolation: {
      escapeValue: false,
    },
    fallbackLng: 'zh_CN',
    lng: 'zh_CN',
    ns: Object.keys(resources.en_US),
    defaultNS: 'common',
    resources,
    detection: {
      lookupLocalStorage: 'i18n',
    },
  })

export default i18n
