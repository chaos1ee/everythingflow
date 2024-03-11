import type { FormProps } from 'antd'
import { Form } from 'antd'
import { useRef } from 'react'
import type { UseModalProps } from './modal'
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

export interface UseFormModalProps<Values, ExtraValues> extends Omit<UseModalProps, 'afterClose' | 'onConfirm'> {
  formProps?: Omit<FormProps, 'form'>
  onConfirm?: (values: Values, extraValues?: ExtraValues) => void | Promise<void>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useFormModal<Values, ExtraValues = any>(props: UseFormModalProps<Values, ExtraValues>) {
  const { content, formProps, onConfirm, ...modalProps } = props
  const [form] = Form.useForm<Values>()
  const internalExtraValues = useRef<ExtraValues>()

  const { show, hide, modal } = useModal({
    ...modalProps,
    content: (
      <Form {...formProps} form={form}>
        {content}
      </Form>
    ),
    async onConfirm() {
      const values = await form.validateFields()
      await onConfirm?.(values, internalExtraValues.current)
      hide()
    },
    afterClose() {
      form.resetFields()
    },
  })

  return {
    show: (
      config: {
        initialValues?: RecursivePartial<Values>
        extraValues?: ExtraValues
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
