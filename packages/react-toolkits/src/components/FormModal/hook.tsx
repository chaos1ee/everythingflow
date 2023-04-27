import type { FormModalProps, RecursivePartial } from './FormModal'
import FormModal from './FormModal'
import React from 'react'

export function useFormModal<T extends object>({
  children,
  ...restProps
}: Omit<FormModalProps<T>, 'open' | 'onCancel' | 'closeFn' | 'initialValues'>) {
  const [open, setOpen] = React.useState(false)
  const [initialValues, setInitialValues] = React.useState<RecursivePartial<T>>()

  const showModal = (options?: { initialValues?: RecursivePartial<T> }) => {
    setInitialValues(options?.initialValues)
    setOpen(true)
  }

  const closeModal = React.useCallback(() => {
    setOpen(false)
  }, [])

  const Modal = React.useMemo(() => {
    return (
      <FormModal open={open} closeFn={closeModal} {...restProps} initialValues={initialValues}>
        {children}
      </FormModal>
    )
  }, [children, restProps, initialValues, open, closeModal])

  return {
    Modal,
    showModal,
    closeModal,
  }
}
