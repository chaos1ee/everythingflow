import { TranslationOutlined } from '@ant-design/icons'
import { Dropdown, Typography } from 'antd'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import enUsIcon from '../assets/en_us.png'
import zhCnIcon from '../assets/zh_cn.png'

type LanguageOption = { label: string; url: string }

const LangSelector: FC = () => {
  const { i18n } = useTranslation()
  const defaultSelectedKeys = [i18n.language]

  const languages: Record<string, LanguageOption> = {
    zh_CN: { label: '简体中文', url: zhCnIcon },
    en_US: { label: 'English', url: enUsIcon },
  }

  return (
    <Dropdown
      menu={{
        selectable: true,
        defaultSelectedKeys,
        items: Object.entries(languages).map(([key, { label, url }]) => ({
          key,
          label,
          icon: <img src={url} alt={`language ${key}`} style={{ width: '14px' }} />,
          async onClick() {
            await i18n.changeLanguage(key)
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
