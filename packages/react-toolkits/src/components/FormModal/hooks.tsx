import type { FormModalProps, FormModalRef, RecursivePartial } from './index'
import FormModal from './index'
import { useCallback, useMemo, useRef, useState } from 'react'
import type { Merge } from 'ts-essentials'
import { createPortal } from 'react-dom'

export type UseFormModalProps<T> = Merge<
  Omit<FormModalProps<T>, 'open' | 'onCancel' | 'closeFn' | 'children'>,
  {
    content: FormModalProps<T>['children']
  }
>

export function useFormModal<T extends object>(props: UseFormModalProps<T>) {
  const { content, onConfirm, ...restProps } = props
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState<FormModalProps<T>['title']>()
  const formRef = useRef<FormModalRef>(null)

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

  const Modal = useMemo(() => {
    return (
      <FormModal ref={formRef} {...restProps} open={open} closeFn={closeModal} title={title} onConfirm={onConfirm}>
        {content}
      </FormModal>
    )
  }, [title, content, restProps, open, closeModal, onConfirm])

  return {
    Modal: createPortal(Modal, document.body),
    showModal,
    closeModal,
  }
}
