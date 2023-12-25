import type { FormRule } from 'antd'

import i18n from '@/libs/i18n'

export const PURE_NUMBER: FormRule = {
  pattern: /^[0-9]*$/,
  message: i18n.t('pure_number'),
}
