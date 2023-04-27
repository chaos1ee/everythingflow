import type { FormInstance, FormProps, ModalProps } from 'antd'
import { Button, Form, Modal } from 'antd'
import type { ForwardedRef } from 'react'
import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

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
  extends Pick<ModalProps, 'width' | 'title' | 'open' | 'afterClose'>,
    Pick<FormProps, 'labelCol' | 'layout' | 'colon'> {
  children?: ChildrenType<T>
  footer?: ModalProps['footer']
  closeFn?: VoidFunction
  initialValues?: RecursivePartial<T>
  onConfirm?: (values: T) => void
}

export interface FormModalRefType<T = object> {
  setFieldsValue: (values: RecursivePartial<T>) => void
}

const InternalFormModal = <T extends object>(props: FormModalProps<T>, ref: ForwardedRef<FormModalRefType<T>>) => {
  const { width, children, title, open, footer, layout, labelCol, initialValues, closeFn, afterClose, onConfirm } =
    props
  const { t } = useTranslation()
  const id = useId()
  const [form] = Form.useForm<T>()
  const formRef = useRef<FormInstance<T>>(null)
  const isRenderProps = typeof children === 'function'
  const [confirmLoading, setConfirmLoading] = useState(false)

  useEffect(() => {
    if (initialValues && open) {
      // Reset form values everytime opening the modal.
      form.setFieldsValue(initialValues)
    }
  }, [form, initialValues, open])

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
      style={{ textAlign: 'start' }}
      width={width}
      open={open}
      title={title}
      forceRender={true}
      getContainer={false}
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
              {t('cancel')}
            </Button>,
            <Button form={id} key="submit" type="primary" htmlType="submit" loading={confirmLoading}>
              {t('confirm')}
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
        preserve={false}
        autoComplete="off"
        labelAlign="right"
        labelWrap={true}
        layout={layout}
        labelCol={
          labelCol || {
            flex: !layout || layout === 'horizontal' ? '120px' : '0',
          }
        }
        onFinish={async values => {
          try {
            setConfirmLoading(true)
            await onConfirm?.(values)
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
  props: FormModalProps<T> & { ref?: ForwardedRef<FormModalRefType<T>> },
) => React.ReactElement

export default FormModal
