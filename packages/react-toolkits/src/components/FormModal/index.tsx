/* eslint-disable react/jsx-indent */
import type { FormInstance, FormProps, ModalProps } from 'antd'
import { Button, Form, Modal } from 'antd'
import type { ForwardedRef, ReactElement } from 'react'
import { forwardRef, useId, useImperativeHandle, useMemo, useRef, useState } from 'react'

export type RecursivePartial<T> = T extends object
  ? {
      [P in keyof T]?: T[P] extends (infer U)[]
        ? RecursivePartial<U>[]
        : T[P] extends object
        ? RecursivePartial<T[P]>
        : T[P]
    }
  : unknown

export interface FormModalProps<T>
  extends Pick<ModalProps, 'width' | 'title' | 'open' | 'afterClose' | 'bodyStyle' | 'maskClosable'>,
    Pick<FormProps, 'labelCol' | 'layout' | 'colon'> {
  form?: FormInstance<T>
  children?: ReactElement | ReactElement[]
  footer?: ModalProps['footer']
  closeFn?: VoidFunction
  initialValues?: RecursivePartial<T>
  onConfirm?: (values: T) => Promise<void>
}

export interface FormModalRef<T = object> {
  setFieldsValue: (values: RecursivePartial<T>) => void
}

const InternalFormModal = <T extends object>(props: FormModalProps<T>, ref: ForwardedRef<FormModalRef<T>>) => {
  const {
    form,
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
    onConfirm,
  } = props
  const [internalForm] = Form.useForm(form)
  const id = useId()
  const formRef = useRef<FormInstance<T>>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const footerProp =
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
          <Button key="submit" form={id} type="primary" htmlType="submit" loading={confirmLoading}>
            确定
          </Button>,
        ]

  const labelColProp = labelCol || {
    flex: !layout || layout === 'horizontal' ? '120px' : '0',
  }

  const onFinish = async (values: T) => {
    try {
      setConfirmLoading(true)
      await onConfirm?.(values)
      closeFn?.()
      internalForm.resetFields()
    } finally {
      setConfirmLoading(false)
    }
  }

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
      footer={footerProp}
      onCancel={closeFn}
    >
      <Form
        form={internalForm}
        ref={formRef}
        id={id}
        autoComplete="off"
        labelAlign="right"
        labelWrap={true}
        layout={layout}
        initialValues={initialValues}
        labelCol={labelColProp}
        onFinish={onFinish}
      >
        {children}
      </Form>
    </Modal>
  )
}

const FormModal = forwardRef(InternalFormModal) as <T extends object>(
  props: FormModalProps<T> & { ref?: ForwardedRef<FormModalRef<T>> },
) => ReactElement

export default FormModal
