import type { Locale as AntdLocale } from 'antd/es/locale'
import type { Locale as ToolkitsLocale } from 'react-toolkits'
import antdEn from 'antd/locale/en_GB'
import toolkitsEn from 'react-toolkits/locales/en_GB'
import antdJa from 'antd/locale/ja_JP'
import toolkitsJa from 'react-toolkits/locales/ja_JP'
import antdKo from 'antd/locale/ko_KR'
import toolkitsKo from 'react-toolkits/locales/ko_KR'
import antdZh from 'antd/locale/zh_CN'
import toolkitsZh from 'react-toolkits/locales/zh_CN'
import { create } from 'zustand'
import i18n from '@/libs/i18n.ts'

export const languages = {
  zh_CN: '简体中文',
  en_GB: 'English',
  ja_JP: '日本語',
  ko_KR: '한국어',
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
  locale: localeMap[i18n.default.language as keyof typeof languages],
  setLocale(language) {
    set({ locale: localeMap[language] })
  },
}))
