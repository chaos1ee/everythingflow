/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormInstance } from 'antd'
import { Button, Space, theme } from 'antd'
import type { Key, PropsWithChildren, ReactNode } from 'react'
import { useTranslation } from '@/locales'

export interface FilterFormWrapperProps<Values> extends PropsWithChildren {
  form: FormInstance<Values>
  confirmText?: ReactNode
  afterConfirm?: (values: Values) => void | Promise<void>
  afterReset?: (values: Values) => void
  extras?: { key: Key; render: ((form: FormInstance<Values>) => ReactNode) | ReactNode }[]
}

const FilterFormWrapper = <Values = any,>(props: FilterFormWrapperProps<Values>) => {
  const { confirmText, form, extras, afterConfirm, afterReset, children } = props
  const { token } = theme.useToken()
  const t = useTranslation()

  const formStyle = {
    maxWidth: 'none',
    background: token.colorFillAlter,
    borderWidth: token.lineWidth,
    borderStyle: token.lineType,
    borderColor: token.colorBorder,
    borderRadius: token.borderRadiusLG,
    padding: 24,
    marginBottom: 24,
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    afterConfirm?.(values)
  }

  const handleReset = () => {
    form.resetFields()
    const values = form.getFieldsValue()
    afterReset?.(values)
  }

  return (
    <div style={formStyle}>
      <div className="flex">
        <div className="flex-1">{children}</div>
        <div className="ml-8">
          <Space>
            <Button type="primary" onClick={handleSubmit}>
              {confirmText || t('FilterFormWrapper.confirmText')}
            </Button>
            <Button htmlType="reset" onClick={handleReset}>
              {t('FilterFormWrapper.resetText')}
            </Button>
            {extras?.map(({ key, render }) => (
              <span key={key}>{typeof render === 'function' ? render(form) : render}</span>
            ))}
          </Space>
        </div>
      </div>
    </div>
  )
}

export default FilterFormWrapper
