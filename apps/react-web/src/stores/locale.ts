import type { Locale as AntdLocale } from 'antd/es/locale'
import { create } from 'zustand'
import antdEn from 'antd/locale/en_GB'
import toolkitsEn from 'react-toolkits/locales/en_GB'
import antdJa from 'antd/locale/ja_JP'
import toolkitsJa from 'react-toolkits/locales/ja_JP'
import antdKo from 'antd/locale/ko_KR'
import toolkitsKo from 'react-toolkits/locales/ko_KR'
import antdZh from 'antd/locale/zh_CN'
import toolkitsZh from 'react-toolkits/locales/zh_CN'
import type { languages } from '@/components/LangSelector'
import type { Locale as ToolkitsLocale } from 'react-toolkits'

export interface LocaleState {
  locale: {
    antd: AntdLocale
    toolkits: ToolkitsLocale
  }
  setLocale: (language: keyof typeof languages) => void
}

const localeMap = {
  en_GB: {
    antd: antdEn,
    toolkits: toolkitsEn,
  },
  ja_JP: {
    antd: antdJa,
    toolkits: toolkitsJa,
  },
  ko_KR: {
    antd: antdKo,
    toolkits: toolkitsKo,
  },
  zh_CN: {
    antd: antdZh,
    toolkits: toolkitsZh,
  },
}

export const useLocaleStore = create<LocaleState>(set => ({
  locale: {
    antd: antdEn,
    toolkits: toolkitsEn,
  },
  setLocale(language) {
    set({ locale: localeMap[language] })
  },
}))
