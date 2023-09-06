import type { FormModalProps } from './index'
import FormModal from './index'
import type { ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { merge } from 'lodash-es'
import type { FormProps } from 'antd'
import { Form } from 'antd'

type FormModalFormProps<Values> = Pick<
  FormProps<Values>,
  'labelAlign' | 'labelWrap' | 'labelCol' | 'wrapperCol' | 'layout'
>

export type UseFormModalProps<Values> = Omit<FormModalProps<Values>, 'open' | 'onCancel'> &
  FormModalFormProps<Values> & {
    content?: ReactNode
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

  const Modal = useMemo(
    () =>
      createPortal(
        <Form {...formProps}>
          <FormModal {...modalProps} open={open} onCancel={closeModal}>
            {content}
          </FormModal>
        </Form>,
        document.body,
      ),
    [closeModal, content, formProps, modalProps, open],
  )

  return {
    Modal,
    showModal,
    closeModal,
    form,
  }
}
