import type { ModalProps } from 'antd'
import { Modal } from 'antd'
import { useId, useState, type ReactNode } from 'react'
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

export interface UseModalProps extends Pick<ModalProps, 'title' | 'width' | 'maskClosable' | 'afterClose'> {
  content?: ReactNode
  onConfirm?: () => void | Promise<void>
}

export function useModal(props: UseModalProps) {
  const { title, width, content, maskClosable, onConfirm, afterClose } = props
  const id = useId()
  const { getOpen, setOpen } = useModalStore()
  const open = getOpen(id)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const show = () => {
    setOpen(id, true)
  }

  const hide = () => {
    setOpen(id, false)
  }

  const onCancel: ModalProps['onCancel'] = () => {
    hide()
  }

  const onOk = async () => {
    setConfirmLoading(true)
    await onConfirm?.()
    setConfirmLoading(false)
  }

  const internalModal = (
    <Modal
      destroyOnClose
      width={width}
      title={title}
      open={open}
      afterClose={afterClose}
      maskClosable={maskClosable}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onOk={onOk}
    >
      {content}
    </Modal>
  )

  return {
    show,
    hide,
    modal: internalModal,
  }
}
