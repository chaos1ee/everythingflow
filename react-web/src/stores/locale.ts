import i18n from '@/libs/i18n'
import type { Locale as AntdLocale } from 'antd/es/locale'
import antdEn from 'antd/locale/en_GB'
import antdZh from 'antd/locale/zh_CN'
import type { Locale as ToolkitsLocale } from 'react-toolkits'
import toolkitsEn from 'react-toolkits/locales/en_GB'
import toolkitsZh from 'react-toolkits/locales/zh_CN'
import { create } from 'zustand'

export const languages = {
  zh_CN: '简体中文',
  en_GB: 'English',
}

interface LocaleValue {
  antd: AntdLocale
  toolkits: ToolkitsLocale
}

export interface LocaleState {
  locale: LocaleValue | null
  setLocale: (language: keyof typeof languages) => void
}

const localeMap: Record<keyof typeof languages, LocaleValue> = {
  en_GB: {
    antd: antdEn,
    toolkits: toolkitsEn,
  },
  zh_CN: {
    antd: antdZh,
    toolkits: toolkitsZh,
  },
}

export const useLocaleStore = create<LocaleState>(set => ({
  locale: localeMap[i18n.default.language as keyof typeof languages],
  setLocale(language) {
    set({ locale: localeMap[language] })
  },
}))
