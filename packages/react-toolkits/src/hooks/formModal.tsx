/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormInstance, ModalFuncProps } from 'antd'
import { Form, Modal } from 'antd'
import type { ReactNode } from 'react'

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
  extends Omit<ModalFuncProps, 'icon' | 'className' | 'content' | 'type' | 'onOk' | 'onCancel'> {
  content?: (form: FormInstance<Values>) => ReactNode
  onConfirm?: (values: Values, form: FormInstance<Values>, extraValues: any) => Promise<void>
  onCancel?: (form: FormInstance<Values>) => void
}

export function useFormModal<Values>(props: UseFormModalProps<Values>) {
  const { onConfirm, content, onCancel, ...restProps } = props
  const [modal, contextHolder] = Modal.useModal()
  const [form] = Form.useForm<Values>()

  const defaultProps: ModalFuncProps = {
    ...restProps,
    icon: null,
    className: 'toolkits-modal',
    content: content?.(form),
  }

  const show = (
    scopedProps?: Partial<
      Pick<UseFormModalProps<Values>, 'title'> & {
        initialValues?: RecursivePartial<Values>
        extraValues?: any
      }
    >,
  ) => {
    const { initialValues, extraValues, ...restScopedProps } = scopedProps ?? {}

    if (initialValues) {
      form.setFieldsValue(initialValues)
    }

    const onOk = async () => {
      const values = await form.validateFields()
      await onConfirm?.(values, form, extraValues)
    }

    return modal.confirm({
      ...defaultProps,
      ...restScopedProps,
      className: 'toolkits-modal',
      onOk,
      onCancel() {
        form.resetFields()
        onCancel?.(form)
      },
    })
  }

  return {
    show,
    form,
    contextHolder: <div>{contextHolder}</div>,
  }
}
