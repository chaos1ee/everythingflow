/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormInstance } from 'antd'
import { Form, Result, Spin, Table } from 'antd'
import type { TableProps } from 'antd/es/table'
import { isEqual } from 'lodash-es'
import qs from 'query-string'
import type { ReactElement, ReactNode, Ref } from 'react'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import useSWR from 'swr'
import { useTranslation } from '../../hooks/i18n'
import { usePermission } from '../../hooks/permission'
import type { QueryListPayload } from '../../stores/queryList'
import { useQueryListStore } from '../../stores/queryList'
import type { ListResponse } from '../../types'
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

// 生成 SWR 的 key，用于缓存请求结果。
export function getSwrKey(
  action: string,
  payload?: QueryListPayload,
  params?: RequestOptions['params'] | ((payload: QueryListPayload) => RequestOptions['params']),
  onePage?: boolean,
  defaultSize = 10,
) {
  const { url, query } = qs.parseUrl(action)
  const { page = 1, size = defaultSize, arg = {} } = payload ?? {}
  const queryParams = Object.assign(
    query,
    typeof params === 'function'
      ? params?.({ page, size, arg })
      : onePage
        ? params
        : {
            ...arg,
            page,
            size,
          },
  )
  const queryString = qs.stringify(queryParams)
  return queryString ? `${url}?${queryString}` : url
}

export interface QueryListProps<Item = any, Values = any, Response = any, Arg extends Values = Values>
  extends Pick<TableProps<Item>, 'columns' | 'rowKey' | 'tableLayout' | 'expandable' | 'rowSelection' | 'bordered'> {
  code?: string
  isGlobal?: boolean
  action: string
  method?: string
  refreshInterval?: number
  // 无分页
  onePage?: boolean
  defaultSize?: number
  headers?: RequestOptions['headers'] | ((payload: QueryListPayload<Arg>) => RequestOptions['headers'])
  body?: RequestOptions['body'] | ((payload: QueryListPayload<Arg>) => RequestOptions['body'])
  params?: RequestOptions['params'] | ((payload: QueryListPayload<Arg>) => RequestOptions['params'])
  renderForm?: (form: FormInstance<Values>) => ReactNode
  extra?: (form: FormInstance<Values>) => ReactNode
  onTableChange?: TableProps<Item>['onChange']
  afterSuccess?: (action: QueryListAction, data: QueryListDataType<Item>) => void
  // 默认的接口返回类型为 ListResponse<Item>，当符合时无需设置 getTotal、getDataSource 就可以让组件正确获取 total 与 dataSource。
  getTotal?: (response: Response) => number
  getDataSource?: (response: Response) => Item[]
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
  const {
    action,
    code,
    headers,
    isGlobal,
    onePage,
    method = 'GET',
    body,
    params,
    defaultSize = 10,
    refreshInterval = 0,
    extra,
    renderForm,
    afterSuccess,
    getTotal = response => (response as ListResponse<Item>).total,
    getDataSource = response => (response as ListResponse<Item>).list,
    onTableChange,
    ...tableProps
  } = props
  const t = useTranslation()
  const [form] = Form.useForm<Values>()
  const { accessible, isLoading } = usePermission(code, isGlobal)
  const { payloadMap, keyMap, propsMap, setPayload } = useQueryListStore()
  propsMap.set(action, props)
  const payload = payloadMap.get(action)
  const listAction = useRef<QueryListAction>(QueryListAction.Init)
  const createBoundAction = <T extends any[], R>(actionFn: (action: string, ...args: T) => R): ((...args: T) => R) => {
    return (...args: T) => actionFn(action, ...args)
  }

  const _setPayload = createBoundAction(setPayload)
  const [swrKey, setSwrKey] = useState<string | null>(null)

  const shouldPoll = useRef(false)

  const {
    data,
    isLoading: isDataLoading,
    mutate,
  } = useSWR(
    swrKey,
    async key => {
      const { page = 1, size = defaultSize, arg = {} } = payload ?? {}
      const response = await request<Response>(key, {
        method,
        headers: typeof headers === 'function' ? headers({ page, size, arg }) : headers,
        body: typeof body === 'function' ? body({ page, size, arg }) : body,
        isGlobal,
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
    // 当前值与上次值相同时，swr 不会触发请求，需要使用 mutate 手动触发。
    if (isEqual(payload, { ...payload, page: 1, arg: values })) {
      await mutate(undefined, { revalidate: true })
    } else {
      _setPayload({ page: 1, arg: values })
    }
  }

  const clearPageContent = async () => {
    await mutate(undefined, { revalidate: false })
    _setPayload({ page: 1, arg: form.getFieldsValue() })
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
          const key = getSwrKey(action, payload, params, onePage, defaultSize)
          setSwrKey(key)
          keyMap.set(action, key)
        })
        .catch(() => {
          setSwrKey(null)
          keyMap.set(action, null)
        })
    }
  }, [accessible, payloadMap, params, action, onePage, defaultSize])

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
