import { Button, Space, theme } from 'antd'
import type { Key, PropsWithChildren, ReactNode } from 'react'
import { useTranslation } from '../../hooks/i18n'

export interface FilterFormWrapperProps extends PropsWithChildren {
  onConfirm?: () => void | Promise<void>
  onReset?: () => void
  extras?: { key: Key; children: ReactNode }[]
  isConfirming?: boolean
  buttonsAlign?: 'left' | 'right'
}

const FilterFormWrapper = (props: FilterFormWrapperProps) => {
  const { extras, isConfirming, onConfirm, onReset, children, buttonsAlign = 'left' } = props
  const t = useTranslation()
  const {
    token: { colorFillAlter, lineWidth, lineType, colorBorder, borderRadiusLG },
  } = theme.useToken()

  const style = {
    maxWidth: 'none',
    background: colorFillAlter,
    borderWidth: lineWidth,
    borderStyle: lineType,
    borderColor: colorBorder,
    borderRadius: borderRadiusLG,
    padding: 24,
    marginBottom: 24,
  }

  return (
    <div style={style}>
      <div className="flex">
        <div className={`${buttonsAlign === 'right' ? 'flex-1' : 'flex-grow-0'}`}>{children}</div>
        <div className="ml-4">
          <Space>
            <Button type="primary" loading={isConfirming} onClick={onConfirm}>
              {t('FilterFormWrapper.confirmText')}
            </Button>
            <Button onClick={onReset}>{t('FilterFormWrapper.resetText')}</Button>
            {extras?.map(item => <span key={item.key}>{item.children}</span>)}
          </Space>
        </div>
      </div>
    </div>
  )
}

export default FilterFormWrapper
