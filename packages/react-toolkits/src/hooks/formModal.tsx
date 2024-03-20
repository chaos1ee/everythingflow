import type { FormInstance, FormProps } from 'antd'
import { Form } from 'antd'
import type { ReactNode } from 'react'
import { useState } from 'react'
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

export function useFormModal<Values, ExtraValues extends NonNullable<unknown> = NonNullable<unknown>>(
  props: UseFormModalProps<Values, ExtraValues>,
) {
  const { content, form, formProps, onConfirm, ...modalProps } = props
  const [internalExtraValues, setInternalExtraValues] = useState<ExtraValues>({} as ExtraValues)
  let [internalForm] = Form.useForm<Values>()
  internalForm = form || internalForm

  const isRenderFunction = typeof content === 'function'

  const hanldeConfirm = async () => {
    const values = await internalForm.validateFields()
    await onConfirm?.(values, internalExtraValues as ExtraValues)
    hide()
  }

  const renderContent = (
    <Form {...formProps} form={internalForm}>
      {isRenderFunction ? content(internalExtraValues as ExtraValues) : content}
    </Form>
  )

  const afterClose = () => {
    internalForm.resetFields()
  }

  const { show, hide, modal } = useModal({
    ...modalProps,
    content: renderContent,
    onConfirm: hanldeConfirm,
    afterClose,
  })

  const onShow = ({
    initialValues,
    extraValues,
  }: {
    initialValues?: RecursivePartial<Values>
    extraValues?: ExtraValues
  } = {}) => {
    if (extraValues) {
      setInternalExtraValues(extraValues)
    }

    if (initialValues) {
      internalForm.setFieldsValue(initialValues)
    }

    show()
  }

  return {
    show: onShow,
    hide,
    modal,
  }
}
