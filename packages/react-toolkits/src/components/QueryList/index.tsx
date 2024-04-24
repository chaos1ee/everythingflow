/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormInstance } from 'antd'
import { Form, Result, Spin, Table } from 'antd'
import type { TableProps } from 'antd/es/table'
import type { ReactElement, ReactNode, Ref } from 'react'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
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
  form: FormInstance<Values>
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
  getBody?: (payload: QueryListPayload<Values>) => RequestOptions['body']
  getParams?: (payload: QueryListPayload<Values>) => RequestOptions['params']
  renderForm?: (form: FormInstance<Values>) => ReactNode
  extra?: (form: FormInstance<Values>) => ReactNode
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
  const [form] = Form.useForm<Values>()
  const { accessible, isLoading } = usePermission(code, isGlobal)
  const listAction = useRef<QueryListAction>(QueryListAction.Init)
  const { propsMap, getPayload, setPayload, getSwrkKey, updateSwrKey } = useQueryListStore()
  propsMap.set(action, internalProps)
  const shouldPoll = useRef(false)
  const originalData = useRef<Response>()
  const request = useRequest()

  const { data, isLoading: isDataLoading } = useSWR(
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

      originalData.current = response.data

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
    setPayload(action, { page: 1, formValues: form.getFieldsValue() })

    try {
      await form.validateFields()
      updateSwrKey(action)
    } catch (error) {
      updateSwrKey(action, null)
    }
  }

  const onReset = async () => {
    listAction.current = QueryListAction.Reset
    form.resetFields()
    setPayload(action, { page: 1, formValues: form.getFieldsValue() })

    try {
      await form.validateFields({ validateOnly: true })
      updateSwrKey(action)
    } catch (error) {
      updateSwrKey(action, null)
    }
  }

  useEffect(() => {
    const init = async () => {
      if (accessible) {
        setPayload(action, { page: 1, size: defaultSize, formValues: form.getFieldsValue() })

        try {
          await form.validateFields({ validateOnly: true })
          updateSwrKey(action)
        } catch (error) {
          updateSwrKey(action, null)
        }
      }
    }

    init()
  }, [accessible, action, defaultSize, form, updateSwrKey])

  useImperativeHandle(ref, () => ({
    data,
    originalData: originalData.current,
    form,
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

  return (
    <div>
      {renderForm ? (
        <FilterFormWrapper isConfirming={isDataLoading} onReset={onReset} onConfirm={onConfirm}>
          {renderForm(form)}
        </FilterFormWrapper>
      ) : (
        // 消除 Antd 的警告
        <Form form={form} />
      )}
      {extra && <div className="mt-2 mb-4">{extra(form)}</div>}
      <Table
        {...tableProps}
        dataSource={data.dataSource}
        loading={isDataLoading}
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
