import type { ModalProps } from 'antd'
import { Modal } from 'antd'
import { useId, useState, type ReactNode } from 'react'
import { create } from 'zustand'

interface ModalState {
  open: Map<string, boolean>
  getOpen: (uuid: string) => boolean
  setOpen: (uuid: string, open: boolean) => void
}

export const useModalStore = create<ModalState>((set, get) => ({
  open: new Map(),
  getOpen: uuid => get().open.get(uuid) ?? false,
  setOpen: (uuid, open) => {
    set({ open: new Map(get().open).set(uuid, open) })
  },
}))

export interface UseModalProps extends Omit<ModalProps, 'open' | 'confirmLoading' | 'onOk' | 'onCancel'> {
  content?: ReactNode
  onConfirm?: () => void | Promise<void>
}

export function useModal(props: UseModalProps) {
  const { content, onConfirm, ...modalProps } = props
  const uuid = useId()
  const { getOpen, setOpen } = useModalStore()
  const open = getOpen(uuid)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const show = () => {
    setOpen(uuid, true)
  }

  const hide = () => {
    setOpen(uuid, false)
  }

  const onCancel: ModalProps['onCancel'] = () => {
    hide()
  }

  const onOk = async () => {
    try {
      setConfirmLoading(true)
      await onConfirm?.()
    } finally {
      setConfirmLoading(false)
    }
  }

  return {
    show,
    hide,
    modal: (
      <Modal {...modalProps} open={open} confirmLoading={confirmLoading} onOk={onOk} onCancel={onCancel}>
        {content}
      </Modal>
    ),
  }
}
