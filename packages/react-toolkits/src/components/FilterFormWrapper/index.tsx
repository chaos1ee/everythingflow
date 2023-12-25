/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Space, theme } from 'antd'
import type { Key, PropsWithChildren, ReactNode } from 'react'
import { useTranslation } from '../../hooks/i18n'

export interface FilterFormWrapperProps extends PropsWithChildren {
  confirmText?: ReactNode
  onConfirm?: () => void | Promise<void>
  onReset?: () => void
  extras?: { key: Key; children: ReactNode }[]
}

const FilterFormWrapper = (props: FilterFormWrapperProps) => {
  const { confirmText, extras, onConfirm, onReset, children } = props
  const { token } = theme.useToken()
  const t = useTranslation()

  const style = {
    maxWidth: 'none',
    background: token.colorFillAlter,
    borderWidth: token.lineWidth,
    borderStyle: token.lineType,
    borderColor: token.colorBorder,
    borderRadius: token.borderRadiusLG,
    padding: 24,
    marginBottom: 24,
  }

  return (
    <div style={style}>
      <div className="flex">
        <div className="flex-1">{children}</div>
        <div className="ml-8">
          <Space>
            <Button type="primary" onClick={onConfirm}>
              {confirmText || t('FilterFormWrapper.confirmText')}
            </Button>
            <Button htmlType="reset" onClick={onReset}>
              {t('FilterFormWrapper.resetText')}
            </Button>
            {extras?.map(item => <span key={item.key}>{item.children}</span>)}
          </Space>
        </div>
      </div>
    </div>
  )
}

export default FilterFormWrapper
