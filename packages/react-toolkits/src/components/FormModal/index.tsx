import type { FormInstance, ModalProps } from 'antd'
import { Button, Form, Modal } from 'antd'
import type { PropsWithChildren, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import type { DeepPartial } from 'ts-essentials'

export interface FormModalProps<Values>
  extends Omit<
    ModalProps,
    'onCancel' | 'children' | 'destroyOnClose' | 'forceRender' | 'getContainer' | 'footer' | 'confirmLoading'
  > {
  footerRender?: (form: FormInstance<Values>) => ReactNode
  onCancel?: VoidFunction
  onConfirm?: (values: Values) => Promise<void>
  initialValues?: DeepPartial<Values>
}

const FormModal = <Values extends object>(props: PropsWithChildren<FormModalProps<Values>>) => {
  const { initialValues, footerRender, className, children, onCancel, onConfirm, ...restProps } = props
  const form = Form.useFormInstance<Values>()
  const [confirming, setConfirming] = useState(false)

  const handleCancel = () => {
    onCancel?.()
  }

  const handleSubmit = async () => {
    try {
      setConfirming(true)
      const values = await form.validateFields()
      await onConfirm?.(values)
      onCancel?.()
      form.resetFields()
    } finally {
      setConfirming(false)
    }
  }

  const footer = footerRender?.(form) ?? [
    <Button key="cancel" onClick={handleCancel}>
      取消
    </Button>,
    <Button key="submit" type="primary" loading={confirming} onClick={handleSubmit}>
      确定
    </Button>,
  ]

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form.setFieldsValue(initialValues as any)
  }, [initialValues, form])

  return (
    <Modal
      {...restProps}
      destroyOnClose
      forceRender
      className={className + ' text-start'}
      getContainer={false}
      footer={footer}
      onCancel={onCancel}
    >
      {children}
    </Modal>
  )
}

export default FormModal
