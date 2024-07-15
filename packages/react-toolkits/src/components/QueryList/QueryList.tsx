/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormInstance } from 'antd'
import { Form, Result, Spin, Table } from 'antd'
import type { AnyObject } from 'antd/es/_util/type'
import type { TableProps } from 'antd/es/table'
import type { ReactElement, ReactNode, Ref } from 'react'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import useSWR from 'swr'
import { useTranslation } from '../../hooks/i18n'
import { usePermission } from '../../hooks/permission'
import type { RequestOptions } from '../../utils/request'
import { request } from '../../utils/request'
import FilterFormWrapper from '../FilterFormWrapper'
import { defaultProps } from './constants'
import { useQueryListStore } from './store'
import type { ListResponse } from './types'
import { deserialize } from './utils'

export interface QueryListPayload<FormValues = any> {
  page?: number
  size?: number
  formValues?: FormValues
}

export enum QueryListAction {
  Confirm = 'confirm',
  Reset = 'reset',
  Jump = 'jump',
  Init = 'init',
}

export interface QueryListDataType<Item> {
  dataSource: Item[]
  total: number
}

export interface QueryListRef<Item, Values, Response> {
  data: QueryListDataType<Item>
  internalForm: FormInstance<Values>
  originalData: Response | undefined
}

export interface QueryListProps<Item extends AnyObject = AnyObject, Values = any, Response = any>
  extends Omit<TableProps<Item>, 'pagination' | 'dataSource' | 'loading'> {
  code?: string
  isGlobal?: boolean
  action: string
  method?: string
  refreshInterval?: number
  // 无分页
  onePage?: boolean
  defaultSize?: number
  headers?: RequestOptions['headers'] | ((payload: QueryListPayload<Values> | undefined) => RequestOptions['headers'])
  form?: FormInstance<Values>
  buttonsAlign?: 'left' | 'right'
  getBody?: (payload: QueryListPayload<Values>) => RequestOptions['body']
  getParams?: (payload: QueryListPayload<Values>) => RequestOptions['params']
  renderForm?: (form: FormInstance<Values>) => ReactNode
  extra?: (opts: { form: FormInstance<Values>; data: Response | undefined }) => ReactNode
  afterSuccess?: (action: QueryListAction, data: QueryListDataType<Item>) => void
  getTotal?: (response: Response) => number
  getDataSource?: (response: Response, form: FormInstance<Values>) => Item[]
}

const InternalQueryList = <
  Item extends AnyObject = AnyObject,
  Values = any,
  // 默认接口返回值类型为 ListResponse<Item>，当符合时无需设置 getTotal、getDataSource 就可以让组件正确获取 total 与 dataSource。
  Response = ListResponse<Item>,
>(
  props: QueryListProps<Item, Values, Response>,
  ref: Ref<QueryListRef<Item, Values, Response>>,
) => {
  const internalProps = { ...defaultProps, ...props }

  const {
    action,
    code,
    headers,
    isGlobal,
    onePage,
    method,
    form,
    buttonsAlign,
    defaultSize,
    refreshInterval,
    extra,
    renderForm,
    afterSuccess,
    getBody,
    getParams,
    getTotal,
    getDataSource,
    ...tableProps
  } = internalProps

  const t = useTranslation()
  // 可以从外部传入 FormInstance，不传时会使用内部生成的实例
  let [internalForm] = Form.useForm<Values>()
  internalForm = form || internalForm

  const { accessible, isLoading } = usePermission(code, isGlobal)
  const listAction = useRef<QueryListAction>(QueryListAction.Init)
  const { setProps, getPayload, setPayload, getSwrKey, updateSwrKey, removeFromStore } = useQueryListStore()
  const shouldPoll = useRef(false)
  const originalData = useRef<Response>()

  const { data, isValidating } = useSWR(
    getSwrKey(action),
    async key => {
      const { url, params, body } = deserialize(key)
      const payload = getPayload(action)
      const response = await request<Response>(url, {
        method,
        body,
        params,
        isGlobal,
        headers: typeof headers === 'function' ? headers(payload) : headers,
      })

      originalData.current = response.data

      return {
        dataSource: getDataSource(response.data as Response as any, internalForm),
        total: getTotal(response.data as Response as any) ?? 0,
      }
    },
    {
      fallbackData: {
        dataSource: [],
        total: 0,
      },
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      refreshInterval: shouldPoll.current ? refreshInterval : 0,
      onSuccess(listData) {
        shouldPoll.current = true
        afterSuccess?.(listAction.current, listData)
      },
      onError() {
        shouldPoll.current = false
      },
    },
  )

  const onConfirm = async () => {
    listAction.current = QueryListAction.Confirm
    setPayload(action, { page: 1, formValues: internalForm.getFieldsValue() })

    try {
      await internalForm.validateFields()
      updateSwrKey(action)
    } catch (error) {
      updateSwrKey(action, null)
    }
  }

  const onReset = async () => {
    listAction.current = QueryListAction.Reset
    internalForm.resetFields()
    setPayload(action, { page: 1, formValues: internalForm.getFieldsValue() })

    try {
      await internalForm.validateFields({ validateOnly: true })
      updateSwrKey(action)
    } catch (error) {
      updateSwrKey(action, null)
    }
  }

  useEffect(() => {
    setProps(action, internalProps)

    return () => {
      // 组件卸载时清除缓存
      removeFromStore(action)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      if (accessible) {
        setPayload(action, { page: 1, size: defaultSize, formValues: internalForm.getFieldsValue() })
        await internalForm.validateFields({ validateOnly: true })
        updateSwrKey(action)
      }
    }

    init()
  }, [accessible])

  useImperativeHandle(ref, () => ({
    data,
    originalData: originalData.current,
    internalForm,
  }))

  if (isLoading) {
    return (
      <Spin
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 300,
        }}
      />
    )
  }

  if (!accessible) {
    return <Result status={403} subTitle={t('global.noEntitlement')} />
  }

  const formRenderer =
    typeof renderForm !== 'undefined' ? (
      <FilterFormWrapper
        buttonsAlign={buttonsAlign}
        isConfirming={isValidating}
        onReset={onReset}
        onConfirm={onConfirm}
      >
        {renderForm(internalForm)}
      </FilterFormWrapper>
    ) : (
      // 实例创建后不传给组件会触发 Antd Form 的警告。
      <Form form={internalForm} />
    )

  const pagination = !onePage && {
    showSizeChanger: true,
    showQuickJumper: true,
    current: getPayload(action)?.page,
    pageSize: getPayload(action)?.size ?? defaultSize,
    total: data.total,
    onChange: async (currentPage: number, currentSize: number) => {
      listAction.current = QueryListAction.Jump
      setPayload(action, { page: currentPage, size: currentSize })
      updateSwrKey(action)
    },
  }

  return (
    <div>
      {formRenderer}
      {extra && <div className="mt-2 mb-4">{extra({ form: internalForm, data: originalData.current })}</div>}
      <Table {...tableProps} dataSource={data.dataSource} loading={isValidating} pagination={pagination} />
    </div>
  )
}

const QueryList = forwardRef(InternalQueryList) as <
  Item extends AnyObject = AnyObject,
  Values extends object | undefined = undefined,
  Response = ListResponse<Item>,
>(
  props: QueryListProps<Item, Values, Response> & { ref?: Ref<QueryListRef<Item, Values, Response>> },
) => ReactElement

export default QueryList
