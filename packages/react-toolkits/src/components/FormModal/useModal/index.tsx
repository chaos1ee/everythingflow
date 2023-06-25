import type { FormModalProps, RecursivePartial } from '../FormModal'
import FormModal from '../index'
import { useCallback, useMemo, useState } from 'react'
import type { Merge } from 'ts-essentials'
import { createPortal } from 'react-dom'

export type UseFormModalProps<T> = Merge<
  Omit<FormModalProps<T>, 'open' | 'onCancel' | 'closeFn' | 'initialValues' | 'children' | 'onConfirm'>,
  {
    content: FormModalProps<T>['children']
    onConfirm: (values: T, { close }: { close: () => void }) => void
  }
>

function useModal<T extends object>(props: UseFormModalProps<T>): any {
  const { content, onConfirm, ...restProps } = props
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState<FormModalProps<T>['title']>()
  const [initialValues, setInitialValues] = useState<RecursivePartial<T>>()

  const showModal = (options?: {
    /** TODO: 支持 title、initialValues 等 FormModal 的 props，合并到一个 state 里，然后传给 FormModal **/
    initialValues?: RecursivePartial<T>
    title?: FormModalProps<T>['title']
  }) => {
    setTitle(options?.title ?? restProps.title)
    setInitialValues(options?.initialValues)
    setOpen(true)
  }

  const closeModal = useCallback(() => {
    setOpen(false)
  }, [])

  const handleConfirm = useCallback(
    async (values: T) => {
      await onConfirm(values, { close: closeModal })
    },
    [closeModal, onConfirm],
  )

  const Modal = useMemo(() => {
    return (
      <>
        <FormModal
          open={open}
          closeFn={closeModal}
          {...restProps}
          title={title}
          initialValues={initialValues}
          onConfirm={values => handleConfirm(values)}
        >
          {content}
        </FormModal>
      </>
    )
  }, [content, restProps, initialValues, open, closeModal, handleConfirm])

  return {
    Modal: createPortal(Modal, document.body),
    showModal,
    closeModal,
  }
}

export default useModal
