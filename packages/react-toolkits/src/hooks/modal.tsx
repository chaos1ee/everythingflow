import type { ModalProps } from 'antd'
import { Modal } from 'antd'
import { useId, useState, type ReactNode } from 'react'
import { create } from 'zustand'

interface ModalState {
  open: Map<string, boolean>
  getOpen: (uuid: string) => boolean
  show: (uuid: string) => void
  hide: (uuid: string) => void
}

const useModalStore = create<ModalState>((set, get) => ({
  open: new Map(),
  getOpen: uuid => get().open.get(uuid) ?? false,
  show(uuid) {
    set({ open: new Map(get().open).set(uuid, true) })
  },
  hide(uuid) {
    set({ open: new Map(get().open).set(uuid, false) })
  },
}))

export interface UseModalProps extends Omit<ModalProps, 'open' | 'confirmLoading' | 'onOk' | 'onCancel'> {
  content?: ReactNode
  onConfirm?: () => void | Promise<void>
}

export function useModal(props: UseModalProps) {
  const { content, onConfirm, ...modalProps } = props
  const uuid = useId()
  const modalStore = useModalStore()
  const open = modalStore.getOpen(uuid)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const show = () => {
    modalStore.show(uuid)
  }

  const hide = () => {
    modalStore.hide(uuid)
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

  const internalModal = (
    <Modal {...modalProps} open={open} confirmLoading={confirmLoading} onOk={onOk} onCancel={onCancel}>
      {content}
    </Modal>
  )

  return {
    show,
    hide,
    modal: internalModal,
  }
}
