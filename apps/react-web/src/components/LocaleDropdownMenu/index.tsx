import { TranslationOutlined } from '@ant-design/icons'
import { Dropdown, Typography } from 'antd'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { languages, useLocaleStore } from '@/stores/locale'

const LocaleDropdownMenu: FC = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
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

export default LocaleDropdownMenu
