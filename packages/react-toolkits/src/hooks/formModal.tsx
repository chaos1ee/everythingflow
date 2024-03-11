/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormProps, ModalProps } from 'antd'
import { Form, Modal } from 'antd'
import { useId, useRef, type ReactNode } from 'react'
import { create } from 'zustand'

interface ModalState {
  open: Map<string, boolean>
  getOpen: (id: string) => boolean
  setOpen: (id: string, open: boolean) => void
}

export const useModalStore = create<ModalState>((set, get) => ({
  open: new Map(),
  getOpen: id => get().open.get(id) ?? false,
  setOpen: (id, open) => {
    set({ open: new Map(get().open).set(id, open) })
  },
}))

type RecursivePartial<T> = NonNullable<T> extends object
  ? {
      [P in keyof T]?: NonNullable<T[P]> extends (infer U)[]
        ? RecursivePartial<U>[]
        : NonNullable<T[P]> extends object
          ? RecursivePartial<T[P]>
          : T[P]
    }
  : T

export interface UseFormModalProps<Values>
  extends Pick<ModalProps, 'title' | 'width' | 'maskClosable'>,
    Pick<FormProps, 'labelCol' | 'layout' | 'initialValues'> {
  content?: ReactNode
  onConfirm?: (values: Values, extraValues: any) => Promise<void>
}

export function useFormModal<Values>(props: UseFormModalProps<Values>) {
  const { title, width, labelCol, content, initialValues, maskClosable, onConfirm } = props
  const id = useId()
  const [form] = Form.useForm<Values>()
  const { getOpen, setOpen } = useModalStore()
  const open = getOpen(id)
  const internalExtraValues = useRef()

  const show = (
    config: {
      initialValues?: RecursivePartial<Values>
      extraValues?: any
    } = {},
  ) => {
    internalExtraValues.current = config.extraValues

    if (config.initialValues) {
      form.setFieldsValue(config.initialValues)
    }

    setOpen(id, true)
  }

  const hide = () => {
    setOpen(id, false)
  }

  const onOk = async () => {
    const values = await form.validateFields()
    await onConfirm?.(values, internalExtraValues.current)
    hide()
  }

  const onCancel: ModalProps['onCancel'] = () => {
    hide()
  }

  const afterClose = () => {
    form.resetFields()
  }

  const internalModal = (
    <Modal
      destroyOnClose
      width={width}
      title={title}
      open={open}
      afterClose={afterClose}
      maskClosable={maskClosable}
      onCancel={onCancel}
      onOk={onOk}
    >
      <Form form={form} initialValues={initialValues} labelCol={labelCol} preserve={false}>
        {content}
      </Form>
    </Modal>
  )

  return {
    show,
    hide,
    modal: internalModal,
  }
}
