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
  renderForm?: (form: FormInstance<Values>) => ReactNode
}

const FilterFormWrapper = <Values = any,>(props: FilterFormWrapperProps<Values>) => {
  const { confirmText, form, afterConfirm, afterReset, renderForm } = props
  const { token } = theme.useToken()
  const [formInstance] = Form.useForm(form)

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
    await formInstance.validateFields()
    afterConfirm?.()
  }

  const handleReset = async () => {
    formInstance.resetFields()
    await afterReset?.()
  }

  if (!renderForm) {
    return null
  }

  return (
    <div style={formStyle}>
      <div className="flex ">
        <div className="flex-1">{renderForm(formInstance)}</div>
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
