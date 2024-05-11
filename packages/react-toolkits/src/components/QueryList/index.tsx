/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormInstance } from 'antd'
import { Form, Result, Spin, Table } from 'antd'
import type { TableProps } from 'antd/es/table'
import type { ReactElement, ReactNode, Ref } from 'react'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import useSWR from 'swr'
import { useTranslation } from '../../hooks/i18n'
import { usePermission } from '../../hooks/permission'
import type { RequestOptions } from '../../hooks/request'
import { useRequest } from '../../hooks/request'
import type { QueryListPayload } from '../../stores/queryList'
import { useQueryListStore } from '../../stores/queryList'
import type { ListResponse } from '../../types'
import FilterFormWrapper from '../FilterFormWrapper'
import { defaultProps } from './constants'
import { deserialize } from './utils'

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

export interface QueryListRef<Item = any, Values = any, Response = any> {
  data: QueryListDataType<Item>
  internalForm: FormInstance<Values>
  originalData: Response | undefined
}

export interface QueryListProps<Item = any, Values = any, Response = any>
  extends Pick<
    TableProps<Item>,
    'columns' | 'rowKey' | 'tableLayout' | 'expandable' | 'rowSelection' | 'bordered' | 'components'
  > {
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
  getBody?: (payload: QueryListPayload<Values>) => RequestOptions['body']
  getParams?: (payload: QueryListPayload<Values>) => RequestOptions['params']
  renderForm?: (internalForm: FormInstance<Values>) => ReactNode
  extra?: (internalForm: FormInstance<Values>) => ReactNode
  onTableChange?: TableProps<Item>['onChange']
  afterSuccess?: (action: QueryListAction, data: QueryListDataType<Item>) => void
  // 默认的接口返回类型为 ListResponse<Item>，当符合时无需设置 getTotal、getDataSource 就可以让组件正确获取 total 与 dataSource。
  getTotal?: (response: Response) => number
  getDataSource?: (response: Response) => Item[]
}

const InternalQueryList = <Item extends object, Values extends object | undefined, Response = ListResponse<Item>>(
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
    getBody,
    getParams,
    defaultSize,
    refreshInterval,
    extra,
    renderForm,
    afterSuccess,
    getTotal,
    getDataSource,
    onTableChange,
    ...tableProps
  } = internalProps

  const t = useTranslation()
  let [internalForm] = Form.useForm<Values>()
  internalForm = form || internalForm
  const { accessible, isLoading } = usePermission(code, isGlobal)
  const listAction = useRef<QueryListAction>(QueryListAction.Init)
  const { propsMap, getPayload, setPayload, getSwrkKey, updateSwrKey } = useQueryListStore()
  propsMap.set(action, internalProps)
  const shouldPoll = useRef(false)
  const [originalData, setOriginalData] = useState<Response>()
  const request = useRequest()

  const { data, isValidating } = useSWR(
    getSwrkKey(action),
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

      setOriginalData(response.data)

      return {
        dataSource: getDataSource(response.data),
        total: getTotal(response.data) ?? 0,
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
    originalData,
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

  const formRender = renderForm ? (
    <FilterFormWrapper isConfirming={isValidating} onReset={onReset} onConfirm={onConfirm}>
      {renderForm(internalForm)}
    </FilterFormWrapper>
  ) : (
    // 消除 Antd 的警告
    <Form form={internalForm} />
  )

  return (
    <div>
      {formRender}
      {extra && <div className="mt-2 mb-4">{extra(internalForm)}</div>}
      <Table
        {...tableProps}
        dataSource={data.dataSource}
        loading={isValidating}
        pagination={
          onePage
            ? false
            : {
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
        }
        onChange={onTableChange}
      />
    </div>
  )
}

const QueryList = forwardRef(InternalQueryList) as <
  Item extends object,
  Values extends object | undefined,
  Response = ListResponse<Item>,
>(
  props: QueryListProps<Item, Values, Response> & { ref?: Ref<QueryListRef<Item, Values, Response>> },
) => ReactElement

export default QueryList
