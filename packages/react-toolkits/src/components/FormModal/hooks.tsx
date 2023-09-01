import type { FormModalProps, FormModalRef, RecursivePartial } from './index'
import FormModal from './index'
import { useCallback, useMemo, useRef, useState } from 'react'
import type { Merge } from 'ts-essentials'
import { createPortal } from 'react-dom'
import { Form } from 'antd'

export type UseFormModalProps<T> = Merge<
  Omit<FormModalProps<T>, 'open' | 'onCancel' | 'closeFn' | 'children' | 'form'>,
  {
    content: FormModalProps<T>['children']
  }
>

export function useFormModal<T extends object>(props: UseFormModalProps<T>) {
  const { content, onConfirm, ...restProps } = props
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState<FormModalProps<T>['title']>()
  const formRef = useRef<FormModalRef>(null)
  const [form] = Form.useForm<T>()

  const showModal = (options?: { initialValues?: RecursivePartial<T>; title?: FormModalProps<T>['title'] }) => {
    setTitle(options?.title ?? restProps.title)

    if (options?.initialValues) {
      formRef.current?.setFieldsValue(options?.initialValues)
    }

    setOpen(true)
  }

  const closeModal = useCallback(() => {
    setOpen(false)
  }, [])

  const Modal = useMemo(
    () =>
      createPortal(
        <FormModal
          {...restProps}
          ref={formRef}
          form={form}
          open={open}
          closeFn={closeModal}
          title={title}
          onConfirm={onConfirm}
        >
          {content}
        </FormModal>,
        document.body,
      ),
    [title, content, restProps, form, open, closeModal, onConfirm],
  )

  return {
    Modal,
    showModal,
    closeModal,
    form,
  }
}
