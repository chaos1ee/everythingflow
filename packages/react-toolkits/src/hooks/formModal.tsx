/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormProps, ModalProps } from 'antd'
import { Form } from 'antd'
import { useRef, type ReactNode } from 'react'
import { useModal } from './modal'

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
  const internalExtraValues = useRef()
  const [form] = Form.useForm<Values>()

  const afterClose = () => {
    form.resetFields()
  }

  const { show, hide, modal } = useModal({
    title,
    width,
    maskClosable,
    content: (
      <Form form={form} initialValues={initialValues} labelCol={labelCol} preserve={false}>
        {content}
      </Form>
    ),
    async onConfirm() {
      const values = await form.validateFields()
      await onConfirm?.(values, internalExtraValues.current)
      hide()
    },
    afterClose,
  })

  return {
    show: (
      config: {
        initialValues?: RecursivePartial<Values>
        extraValues?: any
      } = {},
    ) => {
      internalExtraValues.current = config.extraValues

      if (config.initialValues) {
        form.setFieldsValue(config.initialValues)
      }

      show()
    },
    hide,
    modal,
  }
}
