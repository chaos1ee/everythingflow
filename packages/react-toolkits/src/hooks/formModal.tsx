import type { FormInstance, FormProps } from 'antd'
import { Form } from 'antd'
import type { ReactNode } from 'react'
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

export interface UseFormModalProps<Values, ExtraValues>
  extends Omit<UseModalProps, 'afterClose' | 'onConfirm' | 'content'> {
  formProps?: Omit<FormProps, 'form'>
  form?: FormInstance<Values>
  content?: ReactNode | ((extraValues: ExtraValues) => ReactNode)
  onConfirm?: (values: Values, extraValues: ExtraValues) => void | Promise<void>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useFormModal<Values, ExtraValues = any>(props: UseFormModalProps<Values, ExtraValues>) {
  const { content, form, formProps, onConfirm, ...modalProps } = props
  const internalExtraValues = useRef<ExtraValues>()
  let [internalForm] = Form.useForm<Values>()
  internalForm = form || internalForm

  const isRenderFunction = typeof content === 'function'

  const { show, hide, modal } = useModal({
    ...modalProps,
    content: (
      <Form {...formProps} form={internalForm}>
        {isRenderFunction ? content(internalExtraValues.current as ExtraValues) : content}
      </Form>
    ),
    async onConfirm() {
      const values = await internalForm.validateFields()
      await onConfirm?.(values, internalExtraValues.current as ExtraValues)
      hide()
    },
    afterClose() {
      internalForm.resetFields()
    },
  })

  const onShow = (
    config: {
      initialValues?: RecursivePartial<Values>
      extraValues?: ExtraValues
    } = {},
  ) => {
    internalExtraValues.current = config.extraValues

    if (config.initialValues) {
      internalForm.setFieldsValue(config.initialValues)
    }

    show()
  }

  return {
    show: onShow,
    hide,
    modal,
  }
}
