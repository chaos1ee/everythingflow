/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormInstance } from 'antd'
import { Form, Result, Spin, Table } from 'antd'
import type { TableProps } from 'antd/es/table'
import type { ReactElement, ReactNode, Ref } from 'react'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import useSWR from 'swr'
import { useTranslation } from '../../hooks/i18n'
import { usePermission } from '../../hooks/permission'
import type { QueryListPayload } from '../../stores/queryList'
import { useQueryListStore } from '../../stores/queryList'
import type { ListResponse } from '../../types'
import { deserialize, genSwrKey } from '../../utils/queryList'
import type { RequestOptions } from '../../utils/request'
import { request } from '../../utils/request'
import FilterFormWrapper from '../FilterFormWrapper'

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

export interface QueryListRef<Item = any, Values = any> {
  data: QueryListDataType<Item>
  form: FormInstance<Values>
}

export interface QueryListProps<Item = any, Values = any, Response = any, Arg extends Values = Values>
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
  headers?: RequestOptions['headers'] | ((payload: QueryListPayload<Arg> | undefined) => RequestOptions['headers'])
  getBody?: (payload: QueryListPayload<Arg>) => RequestOptions['body']
  getParams?: (payload: QueryListPayload<Arg>) => RequestOptions['params']
  renderForm?: (form: FormInstance<Values>) => ReactNode
  extra?: (form: FormInstance<Values>) => ReactNode
  onTableChange?: TableProps<Item>['onChange']
  afterSuccess?: (action: QueryListAction, data: QueryListDataType<Item>) => void
  // 默认的接口返回类型为 ListResponse<Item>，当符合时无需设置 getTotal、getDataSource 就可以让组件正确获取 total 与 dataSource。
  getTotal?: (response: Response) => number
  getDataSource?: (response: Response) => Item[]
}

const defaultProps = {
  method: 'GET',
  defaultSize: 10,
  refreshInterval: 0,
  getTotal: (response: any) => response.total,
  getDataSource: (response: any) => response.list,
}

const InternalQueryList = <
  Item extends object,
  Values extends object | undefined,
  Response = ListResponse<Item>,
  Arg extends Values = Values,
>(
  props: QueryListProps<Item, Values, Response, Arg>,
  ref: Ref<QueryListRef<Item, Values>>,
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

  const { payloadMap, swrKeyMap, propsMap, setPayload, remove } = useQueryListStore()
  propsMap.set(action, internalProps)

  const t = useTranslation()
  const [form] = Form.useForm<Values>()
  const { accessible, isLoading } = usePermission(code, isGlobal)
  const payload = payloadMap.get(action)
  const listAction = useRef<QueryListAction>(QueryListAction.Init)

  const createBoundFn = <T extends any[], R>(fn: (fn: string, ...args: T) => R): ((...args: T) => R) => {
    return (...args: T) => fn(action, ...args)
  }

  const _setPayload = createBoundFn(setPayload)

  const [swrKey, setSwrKey] = useState<string | null>(null)
  const shouldPoll = useRef(false)

  const {
    data,
    isLoading: isDataLoading,
    mutate,
  } = useSWR(
    swrKey,
    async key => {
      const { url, params, body } = deserialize(key)
      const response = await request<Response>(url, {
        method,
        body,
        params,
        isGlobal,
        headers: typeof headers === 'function' ? headers(payload) : headers,
      })

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

  const fetchFirstPage = async () => {
    const values = form.getFieldsValue()
    _setPayload({ page: 1, formValues: values }, true)
  }

  const clearPageContent = async () => {
    await mutate(undefined, { revalidate: false })
    _setPayload({ page: 1, formValues: form.getFieldsValue() })
  }

  const onConfirm = async () => {
    listAction.current = QueryListAction.Confirm

    try {
      await form.validateFields()
      await fetchFirstPage()
    } catch (_) {
      await clearPageContent()
    }
  }

  const onReset = async () => {
    listAction.current = QueryListAction.Reset
    form.resetFields()

    try {
      await form.validateFields({ validateOnly: true })
      await fetchFirstPage()
    } catch (_) {
      await clearPageContent()
    }
  }

  useEffect(() => {
    if (accessible) {
      form
        .validateFields({ validateOnly: true })
        .then(() => {
          const key = genSwrKey(internalProps, payload)
          setSwrKey(key)
          swrKeyMap.set(action, key)
        })
        .catch(() => {
          setSwrKey(null)
          swrKeyMap.set(action, null)
        })
    }
  }, [accessible, internalProps, payloadMap])

  useEffect(() => {
    return () => {
      remove(action)
    }
  }, [])

  useImperativeHandle(ref, () => ({
    data,
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
                current: payload?.page,
                pageSize: payload?.size ?? defaultSize,
                total: data.total,
                onChange: async (currentPage: number, currentSize: number) => {
                  listAction.current = QueryListAction.Jump
                  _setPayload({
                    page: currentPage,
                    size: currentSize,
                  })
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
  Arg extends Values = Values,
>(
  props: QueryListProps<Item, Values, Response, Arg> & { ref?: Ref<QueryListRef<Item, Values>> },
) => ReactElement

export default QueryList
