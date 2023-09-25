import { TranslationOutlined } from '@ant-design/icons'
import { Dropdown, Typography } from 'antd'
import type { FC } from 'react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocaleStore } from '@/stores'

export const languages = {
  zh_CN: '简体中文',
  en_GB: 'English',
  ja_JP: '日本語',
  ko_KR: '한국어',
}

const LangSelector: FC = () => {
  const { i18n } = useTranslation()
  const setLocale = useLocaleStore(state => state.setLocale)

  useEffect(() => {
    setLocale(i18n.language as keyof typeof languages)
  }, [i18n.language, setLocale])

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

export default LangSelector
