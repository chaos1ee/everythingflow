import type { FormInstance, ModalProps } from 'antd'
import { Button, Form, Modal } from 'antd'
import type { PropsWithChildren, ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { merge } from 'lodash-es'
import { useTranslation } from '@/utils/i18n'
import type { DeepPartial } from 'ts-essentials'

export type UseFormModalOptions<Values extends object> = Omit<
  FormModalProps<Values>,
  'open' | 'onCancel' | 'children' | 'form'
> & {
  content?: (form: FormInstance<Values>) => ReactNode
}

export function useFormModal<Values extends object>(opts: UseFormModalOptions<Values>) {
  const { content, ...restOpts } = opts
  const [form] = Form.useForm<Values>()
  const [open, setOpen] = useState(false)
  const [modalProps, setModalProps] = useState<Omit<UseFormModalOptions<Values>, 'content'>>(restOpts)

  const showModal = (
    scopedOpts?: Omit<UseFormModalOptions<Values>, 'footerRender' | 'onConfirm' | 'onCancel' | 'content' | 'form'>,
  ) => {
    setModalProps(scopedOpts ? merge(restOpts, scopedOpts) : restOpts)
    setOpen(true)
  }

  const closeModal = useCallback(() => {
    setOpen(false)
    form.resetFields()
  }, [form])

  const InternalModal = useMemo(
    () =>
      createPortal(
        <FormModal {...modalProps} form={form} open={open} onCancel={closeModal}>
          {content?.(form)}
        </FormModal>,
        document.body,
      ),
    [closeModal, content, form, modalProps, open],
  )

  return {
    Modal: InternalModal,
    showModal,
    closeModal,
    form,
  }
}

export interface FormModalProps<Values extends object>
  extends PropsWithChildren,
    Omit<
      ModalProps,
      'onCancel' | 'children' | 'destroyOnClose' | 'forceRender' | 'getContainer' | 'footer' | 'confirmLoading' | 'onOk'
    > {
  form: FormInstance<Values>
  renderFooter?: (form: FormInstance<Values>) => ReactNode
  onCancel?: VoidFunction
  onConfirm?: (values: Values, form: FormInstance<Values>) => Promise<void>
  initialValues?: DeepPartial<Values>
}

const FormModal = <Values extends object>(props: FormModalProps<Values>) => {
  const { form, initialValues, renderFooter, className, children, onCancel, onConfirm, ...restProps } = props
  const [confirming, setConfirming] = useState(false)
  const t = useTranslation()

  const handleCancel = () => {
    onCancel?.()
  }

  const handleSubmit = async () => {
    try {
      setConfirming(true)
      const values = await form.validateFields()
      await onConfirm?.(values, form)
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
