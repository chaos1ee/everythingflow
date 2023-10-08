import { TranslationOutlined } from '@ant-design/icons'
import { Dropdown, Typography } from 'antd'
import type { FC } from 'react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
import type { Locale as ToolkitsLocale } from 'react-toolkits'

interface LocaleValue {
  antd: AntdLocale
  toolkits: ToolkitsLocale
}

export interface LocaleState {
  locale: LocaleValue | null
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
  locale: null,
  setLocale(language) {
    set({ locale: localeMap[language] })
  },
}))

export function useInitLocale() {
  const { i18n } = useTranslation()
  const { setLocale } = useLocaleStore()

  useEffect(() => {
    setLocale(i18n.language as keyof typeof languages)
  }, [])
}

export const languages = {
  zh_CN: '简体中文',
  en_GB: 'English',
  ja_JP: '日本語',
  ko_KR: '한국어',
}

const LangSelect: FC = () => {
  const { i18n } = useTranslation()
  const setLocale = useLocaleStore(state => state.setLocale)

  return (
    <Dropdown
      menu={{
        selectable: true,
        defaultSelectedKeys: [i18n.language],
        items: Object.entries(languages).map(([lang, label]) => ({
          key: lang,
          label,
          async onClick() {
            await i18n.changeLanguage(lang)
            setLocale(i18n.language as keyof typeof languages)
          },
        })),
      }}
      placement="bottomRight"
    >
      <Typography.Link>
        <TranslationOutlined style={{ fontSize: '18px' }} />
      </Typography.Link>
    </Dropdown>
  )
}

export default LangSelect
