import type { FormModalProps, RecursivePartial } from './FormModal'
import FormModal from './FormModal'
import { useCallback, useMemo, useState } from 'react'

export function useFormModal<T extends object>({
  children,
  ...restProps
}: Omit<FormModalProps<T>, 'open' | 'onCancel' | 'closeFn' | 'initialValues'>) {
  const [open, setOpen] = useState(false)
  const [initialValues, setInitialValues] = useState<RecursivePartial<T>>()

  const showModal = (options?: { initialValues?: RecursivePartial<T> }) => {
    setInitialValues(options?.initialValues)
    setOpen(true)
  }

  const closeModal = useCallback(() => {
    setOpen(false)
  }, [])

  const Modal = useMemo(() => {
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
