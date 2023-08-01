import type { FormInstance, FormProps } from 'antd'
import { Button, Col, Form, Row, Space, theme } from 'antd'
import type { PropsWithChildren } from 'react'

export interface FilterFormProps<Values>
  extends Pick<
    FormProps<Values>,
    | 'initialValues'
    | 'requiredMark'
    | 'onError'
    | 'onChange'
    | 'onValuesChange'
    | 'onFinish'
    | 'onFinishFailed'
    | 'layout'
    | 'labelCol'
  > {
  form?: FormInstance<Values>
  onReset?: () => void
  confirmText?: React.ReactNode
}

const FilterForm = <Values = unknown,>(props: PropsWithChildren<FilterFormProps<Values>>) => {
  const { children, confirmText, form, onReset, ...restProps } = props
  const { token } = theme.useToken()

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

  return (
    <Form {...restProps} form={form} autoComplete="off">
      {children && (
        <div style={formStyle}>
          <Row gutter={18}>
            {children}
            <Col flex="auto" />
            <Col flex="auto" span={24} style={{ textAlign: 'right' }}>
              <Space>
                <Button type="primary" htmlType="submit">
                  {confirmText || '查询'}
                </Button>
                <Button htmlType="reset" onClick={onReset}>
                  重置
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      )}
    </Form>
  )
}

export default FilterForm
