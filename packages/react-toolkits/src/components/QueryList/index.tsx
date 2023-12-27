/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormInstance } from 'antd'
import { Form, Result, Spin, Table } from 'antd'
import type { TableProps } from 'antd/es/table'
import { isEqual } from 'lodash-es'
import qs from 'query-string'
import type { ReactElement, ReactNode, Ref } from 'react'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
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

interface QueryListDataType<Item> {
  dataSource: Item[]
  total: number
}

export interface QueryListRef<Item = any, Values = any> {
  data: QueryListDataType<Item>
  form: FormInstance<Values>
}

export interface QueryListProps<Item = any, Values = any, Response = any>
  extends Pick<TableProps<Item>, 'columns' | 'rowKey' | 'tableLayout' | 'expandable' | 'rowSelection' | 'bordered'> {
  renderForm?: (form: FormInstance<Values>) => ReactNode
  code?: string
  isGlobalNS?: boolean
  extra?: (form: FormInstance<Values>) => ReactNode
  onTableChange?: TableProps<Item>['onChange']
  action: string
  method?: string
  headers?: RequestOptions['headers'] | ((payload: QueryListPayload) => RequestOptions['headers'])
  body?: RequestOptions['body'] | ((payload: QueryListPayload) => RequestOptions['body'])
  params?: RequestOptions['params'] | ((payload: QueryListPayload) => RequestOptions['params'])
  afterSuccess?: (action: QueryListAction, data: QueryListDataType<Item>) => void
  // 无分页
  onePage?: boolean
  defaultSize?: number
  // 默认的接口返回类型为 ListResponse<Item>，当符合时无需设置 getTotal、getDataSource 就可以让组件正确获取 total 与 dataSource。
  getTotal?: (response: Response) => number
  getDataSource?: (response: Response) => Item[]
}

const InternalQueryList = <Item extends object, Values extends object | undefined, Response = ListResponse<Item>>(
  props: QueryListProps<Item, Values, Response>,
  ref: Ref<QueryListRef<Item, Values>>,
) => {
  const {
    action,
    code,
    headers,
    isGlobalNS,
    onePage,
    method = 'GET',
    body,
    params,
    defaultSize = 10,
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
  const { accessible, isLoading } = usePermission(code, isGlobalNS)
  const { payloadMap, keyMap, setPayload } = useQueryListStore()
  const payload = payloadMap.get(action)
  const { refreshInterval } = useSWRConfig()
  const listAction = useRef<QueryListAction>(QueryListAction.Init)
  const createBoundAction = <T extends any[], R>(actionFn: (action: string, ...args: T) => R): ((...args: T) => R) => {
    return (...args: T) => actionFn(action, ...args)
  }

  const _setPayload = createBoundAction(setPayload)
  const [swrKey, setSwrKey] = useState<string | null>(null)

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
        isGlobalNS,
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
      onSuccess(listData) {
        afterSuccess?.(listAction.current, listData)
      },
    },
  )

  const fetchData = async () => {
    const values = form.getFieldsValue()

    try {
      await form.validateFields({ validateOnly: true })
      // 当前值与上次值相同时，swr 不会触发请求，需要使用 mutate 手动触发。
      if (isEqual(payload, { ...payload, page: 1, arg: values })) {
        await mutate(undefined, { revalidate: true })
      } else {
        _setPayload({ page: 1, arg: values })
      }
    } catch (_) {
      await mutate(undefined, { revalidate: false })
      _setPayload({ page: 1, arg: values })
    }
  }

  const onConfirm = () => {
    listAction.current = QueryListAction.Confirm
    fetchData()
  }

  const onReset = () => {
    listAction.current = QueryListAction.Reset
    form.resetFields()
    fetchData()
  }

  useEffect(() => {
    if (accessible) {
      listAction.current = QueryListAction.Init
      fetchData()
    }
  }, [accessible])

  useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => {
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
        const key = queryString ? `${url}?${queryString}` : url
        setSwrKey(key)
        keyMap.set(action, key)
      })
      .catch(() => {
        setSwrKey(null)
        keyMap.set(action, null)
      })
  }, [payloadMap])

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
        <Form form={form} />
      )}
      {extra && <div className="mt-2 mb-4">{extra(form)}</div>}
      <Table
        {...tableProps}
        dataSource={data.dataSource}
        loading={refreshInterval === 0 && isDataLoading}
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
>(
  props: QueryListProps<Item, Values, Response> & { ref?: Ref<QueryListRef<Item, Values>> },
) => ReactElement

export default QueryList
