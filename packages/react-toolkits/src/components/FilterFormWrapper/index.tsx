/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormInstance } from 'antd'
import { Button, Form, Space, theme } from 'antd'
import type { ReactNode } from 'react'
import * as React from 'react'

export interface FilterFormWrapperProps<Values> {
  form?: FormInstance<Values>
  confirmText?: ReactNode
  afterConfirm?: () => void | Promise<void>
  afterReset?: () => void | Promise<void>
  children?: (form: FormInstance<Values>) => ReactNode
}

const FilterFormWrapper = <Values = any,>(props: FilterFormWrapperProps<Values>) => {
  const { confirmText, form, afterConfirm, afterReset, children } = props
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
    await internalForm.validateFields()
    afterConfirm?.()
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
      <div className="flex ">
        <div className="flex-1">{children(internalForm)}</div>
        <div className="ml-8">
          <Space>
            <Button type="primary" onClick={handleSubmit}>
              {confirmText || '查询'}
            </Button>
            <Button htmlType="reset" onClick={handleReset}>
              重置
            </Button>
          </Space>
        </div>
      </div>
    </div>
  )
}

export default FilterFormWrapper
