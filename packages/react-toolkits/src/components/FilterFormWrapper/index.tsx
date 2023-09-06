import { Button, Form, Space, theme } from 'antd'
import type { PropsWithChildren, ReactNode } from 'react'
import * as React from 'react'

export interface FilterFormWrapperProps {
  confirmText?: ReactNode
  afterConfirm?: () => void | Promise<void>
  afterReset?: () => void | Promise<void>
}

const FilterFormWrapper = (props: PropsWithChildren<FilterFormWrapperProps>) => {
  const { confirmText, afterConfirm, afterReset, children } = props
  const { token } = theme.useToken()
  const form = Form.useFormInstance()

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
    await form.validateFields()
    afterConfirm?.()
  }

  const handleReset = async () => {
    form.resetFields()
    await afterReset?.()
  }

  if (!children) {
    return null
  }

  return (
    <div style={formStyle}>
      <div className="flex ">
        <div className="flex-1">{children}</div>
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
