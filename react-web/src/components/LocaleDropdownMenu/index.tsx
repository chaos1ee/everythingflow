import { TranslationOutlined } from '@ant-design/icons'
import { Dropdown, Typography } from 'antd'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { languages, useLocaleStore } from './store'

export { useLocaleStore }

const LocaleDropdownMenu: FC = () => {
  const { i18n } = useTranslation()
  const setLocale = useLocaleStore(state => state.setLocale)

  return (
    <Dropdown
      menu={{
        selectable: true,
        defaultSelectedKeys: [i18n.language ?? 'zh_CN'],
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
        <TranslationOutlined style={{ fontSize: '16px' }} />
      </Typography.Link>
    </Dropdown>
  )
}

export default LocaleDropdownMenu
