import type { ModalProps } from 'antd'
import { Modal } from 'antd'
import { useMemo, useState, type ReactNode } from 'react'
import { create } from 'zustand'

interface ModalState {
  open: Map<number, boolean>
  getOpen: (uuid: number) => boolean
  show: (uuid: number) => void
  hide: (uuid: number) => void
}

export const useModalStore = create<ModalState>((set, get) => ({
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

let id = 0

export function useModal(props: UseModalProps) {
  const { content, onConfirm, ...modalProps } = props
  const uuid = useMemo(() => ++id, [])
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
    uuid,
    show,
    hide,
    modal: internalModal,
  }
}
