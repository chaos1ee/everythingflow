import type { FormInstance, FormProps, ModalProps } from 'antd'
import { Button, Form, Modal } from 'antd'
import type { PropsWithChildren, ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { merge } from 'lodash-es'
import { useTranslation } from '@/utils/i18n'
import type { Object } from 'ts-toolbelt'

type FormModalFormProps<Values> = Pick<
  FormProps<Values>,
  'labelAlign' | 'labelWrap' | 'labelCol' | 'wrapperCol' | 'layout'
>

export type UseFormModalProps<Values extends object> = Omit<FormModalProps<Values>, 'open' | 'onCancel'> &
  FormModalFormProps<Values> & {
    content?: ReactNode | ((form: FormInstance<Values>) => ReactNode)
  }

export function useFormModal<Values extends object>(props: UseFormModalProps<Values>) {
  const { content, labelAlign, labelWrap, labelCol, wrapperCol, layout, ...restProps } = props
  const [form] = Form.useForm<Values>()
  const [open, setOpen] = useState(false)
  const [modalProps, setModalProps] = useState<Omit<UseFormModalProps<Values>, 'content'>>(restProps)

  const showModal = (
    opts?: Omit<
      UseFormModalProps<Values>,
      'footerRender' | 'onConfirm' | 'onCancel' | 'content' | keyof FormModalFormProps<Values>
    >,
  ) => {
    setModalProps(opts ? merge(restProps, opts) : restProps)
    setOpen(true)
  }

  const closeModal = useCallback(() => {
    setOpen(false)
    form.resetFields()
  }, [form])

  const formProps = useMemo(
    () => ({
      form,
      labelAlign,
      labelWrap,
      labelCol,
      wrapperCol,
      layout,
    }),
    [form, labelAlign, labelCol, labelWrap, layout, wrapperCol],
  )

  const InternalModal = useMemo(
    () =>
      createPortal(
        <Form {...formProps}>
          <FormModal {...modalProps} open={open} onCancel={closeModal}>
            {typeof content === 'function' ? content(form) : content}
          </FormModal>
        </Form>,
        document.body,
      ),
    [closeModal, content, form, formProps, modalProps, open],
  )

  return {
    Modal: InternalModal,
    showModal,
    closeModal,
    form,
  }
}

export interface FormModalProps<Values extends object>
  extends Omit<
    ModalProps,
    'onCancel' | 'children' | 'destroyOnClose' | 'forceRender' | 'getContainer' | 'footer' | 'confirmLoading'
  > {
  renderFooter?: (form: FormInstance<Values>) => ReactNode
  onCancel?: VoidFunction
  onConfirm?: (values: Values) => Promise<void>
  initialValues?: Object.Partial<Values, 'deep'>
}

const FormModal = <Values extends object>(props: PropsWithChildren<FormModalProps<Values>>) => {
  const { initialValues, renderFooter, className, children, onCancel, onConfirm, ...restProps } = props
  const form = Form.useFormInstance<Values>()
  const [confirming, setConfirming] = useState(false)
  const t = useTranslation()

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

  const footer = renderFooter
    ? renderFooter(form)
    : [
      <Button key="cancel" onClick={handleCancel}>
        {t('FormModal.cancelText')}
      </Button>,
      <Button key="submit" type="primary" loading={confirming} onClick={handleSubmit}>
        {t('FormModal.confirmText')}
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
