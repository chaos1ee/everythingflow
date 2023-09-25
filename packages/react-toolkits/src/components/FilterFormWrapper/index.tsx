/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormInstance } from 'antd'
import { Button, Form, Space, theme } from 'antd'
import type { Key, ReactNode } from 'react'
import * as React from 'react'

export interface FilterFormWrapperProps<Values> {
  form?: FormInstance<Values>
  confirmText?: ReactNode
  afterConfirm?: (values: Values) => void | Promise<void>
  afterReset?: () => void | Promise<void>
  children?: (form: FormInstance<Values>) => ReactNode
  extras?: { key: Key; render: ((form: FormInstance<Values>) => ReactNode) | ReactNode }[]
}

const FilterFormWrapper = <Values = any,>(props: FilterFormWrapperProps<Values>) => {
  const { confirmText, form, extras, afterConfirm, afterReset, children } = props
  const { token } = theme.useToken()
  const [internalForm] = Form.useForm(form)

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
    const values = await internalForm.validateFields()
    afterConfirm?.(values)
  }

  const handleReset = async () => {
    internalForm.resetFields()
    await afterReset?.()
  }

  if (!children) {
    return null
  }

  return (
    <div style={formStyle}>
      <div className="flex">
        <div className="flex-1">{children(internalForm)}</div>
        <div className="ml-8">
          <Space>
            <Button type="primary" onClick={handleSubmit}>
              {confirmText || '查询'}
            </Button>
            <Button htmlType="reset" onClick={handleReset}>
              重置
            </Button>
            {extras?.map(({ key, render }) => (
              <span key={key}>{typeof render === 'function' ? render(internalForm) : render}</span>
            ))}
          </Space>
        </div>
      </div>
    </div>
  )
}

export default FilterFormWrapper
