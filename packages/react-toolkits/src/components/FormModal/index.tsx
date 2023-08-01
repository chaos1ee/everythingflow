/* eslint-disable react/jsx-indent */
import type { FormInstance, FormProps, ModalProps } from 'antd'
import { Button, Form, Modal } from 'antd'
import type { ForwardedRef } from 'react'
import { forwardRef, useId, useImperativeHandle, useRef, useState } from 'react'

type RenderChildren<T> = (props: {
  form: FormInstance<T>
  open?: boolean
  closeFn?: VoidFunction
}) => JSX.Element | JSX.Element[]

type ChildrenType<T> = RenderChildren<T> | JSX.Element | JSX.Element[]

export type RecursivePartial<T> = T extends object
  ? {
      [P in keyof T]?: T[P] extends (infer U)[]
        ? RecursivePartial<U>[]
        : T[P] extends object
        ? RecursivePartial<T[P]>
        : T[P]
    }
  : any

export interface FormModalProps<T>
  extends Pick<ModalProps, 'width' | 'title' | 'open' | 'afterClose' | 'bodyStyle' | 'maskClosable'>,
    Pick<FormProps, 'labelCol' | 'layout' | 'colon'> {
  children?: ChildrenType<T>
  footer?: ModalProps['footer']
  closeFn?: VoidFunction
  initialValues?: RecursivePartial<T>
  onConfirm?: (values: T) => void
}

export interface FormModalRef<T = object> {
  setFieldsValue: (values: RecursivePartial<T>) => void
}

const InternalFormModal = <T extends object>(props: FormModalProps<T>, ref: ForwardedRef<FormModalRef<T>>) => {
  const {
    width,
    children,
    title,
    open,
    footer,
    layout,
    labelCol,
    bodyStyle,
    initialValues,
    maskClosable,
    closeFn,
    afterClose,
    onConfirm,
  } = props
  const id = useId()
  const [form] = Form.useForm<T>()
  const formRef = useRef<FormInstance<T>>(null)
  const isRenderProps = typeof children === 'function'
  const [confirmLoading, setConfirmLoading] = useState(false)

  useImperativeHandle(ref, () => {
    return {
      setFieldsValue(values) {
        formRef.current?.setFieldsValue(values)
      },
    }
  })

  return (
    <Modal
      destroyOnClose
      bodyStyle={bodyStyle}
      style={{ textAlign: 'start' }}
      width={width}
      open={open}
      title={title}
      forceRender={true}
      getContainer={false}
      maskClosable={maskClosable}
      footer={
        typeof footer === 'object'
          ? footer
          : [
              <Button
                key="cancel"
                onClick={() => {
                  closeFn?.()
                }}
              >
                取消
              </Button>,
              <Button form={id} key="submit" type="primary" htmlType="submit" loading={confirmLoading}>
                确定
              </Button>,
            ]
      }
      afterClose={() => {
        afterClose?.()
        form.resetFields()
      }}
      onCancel={closeFn}
    >
      <Form
        form={form}
        ref={formRef}
        id={id}
        autoComplete="off"
        labelAlign="right"
        labelWrap={true}
        layout={layout}
        initialValues={initialValues}
        labelCol={
          labelCol || {
            flex: !layout || layout === 'horizontal' ? '120px' : '0',
          }
        }
        onFinish={async values => {
          try {
            setConfirmLoading(true)
            await onConfirm?.(values)
            closeFn?.()
            form.resetFields()
          } finally {
            setConfirmLoading(false)
          }
        }}
      >
        {isRenderProps ? children({ form, open, closeFn }) : children}
      </Form>
    </Modal>
  )
}

const FormModal = forwardRef(InternalFormModal) as <T extends object>(
  props: FormModalProps<T> & { ref?: ForwardedRef<FormModalRef<T>> },
) => React.ReactElement

export default FormModal
